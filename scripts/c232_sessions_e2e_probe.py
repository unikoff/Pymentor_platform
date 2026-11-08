"""One-shot all-table + session experiment on dedicated synthetic services.

This is not an importer, does not run workers, and has no production path.
The C232 database lab is quarantined afterwards. Redis keys use an isolated
random test prefix and only the keys created for this fixture are cleaned up.
"""
import asyncio
from datetime import timedelta
import json
import sys
from pathlib import Path
from uuid import uuid4

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'backend'))
sys.path.insert(0, str(ROOT / 'scripts'))

import c232_commit_probe as commit_probe
from identity.async_sessions import AsyncIdentitySessions, InvalidSession
from identity.c232_session_compatibility import require_compatible_legacy_sessions
from identity.c232_explicit_session_ids import assign_fixture_ids
from identity.legacy_session_import import LegacySession, import_legacy_sessions
from identity.async_sessions import IdentityUnavailable
from infrastructure.c232_import_types import to_timestamp
from infrastructure.dual_async_pg import AsyncDatabase
from infrastructure.redis_sessions import RedisSessionStore
from infrastructure.c232_sequence_plan import next_restart_value
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from c232_session_runner import operation_id as session_operation_id, read_session_state

REDIS_NAME = 'pymentor-c226-redis-ee79851b03cf'
REDIS_OWNER = 'ee79851b03cf'
REDIS_IMAGE_ID = 'sha256:8da19c7399dca900c6822a1cf30f9d2285585e2c4b457ff4095b0f4500054d3f'


async def commit_with_synthetic_marker(session, commit, user_id, operation_id, state, fault_mode,
                                       *, source_max_id=None):
    if fault_mode not in (None, 'after_commit', 'before_commit', 'disconnect'):
        raise ValueError('unsupported_fault_mode')
    await session.execute(text('''INSERT INTO c232_lab_control.session_operations
        (user_id, snapshot_id, operation_id) VALUES (:uid, :snapshot, :operation)'''),
        {'uid': user_id, 'snapshot': commit_probe.MARKER_DIGEST, 'operation': operation_id})
    if source_max_id is not None:
        # Both explicit source IDs and this sequence restart belong to the same
        # synthetic SQL transaction. This avoids nextval consumption on rollback.
        sequence = await session.scalar(text("SELECT pg_get_serial_sequence('public.sessions', 'id')"))
        if sequence != 'public.sessions_id_seq':
            raise ValueError('fixture_session_sequence_unsupported')
        meta = (await session.execute(text('''SELECT sequenceowner, min_value, max_value,
            increment_by, cycle, cache_size FROM pg_catalog.pg_sequences
            WHERE schemaname='public' AND sequencename='sessions_id_seq' '''))).mappings().one()
        if meta['sequenceowner'] != commit_probe.guard.lab.MIGRATOR:
            raise ValueError('fixture_session_sequence_unsupported')
        current = (await session.execute(text('SELECT last_value, is_called FROM public.sessions_id_seq'))).mappings().one()
        next_id = next_restart_value(last_value=current['last_value'], is_called=current['is_called'],
            max_id=source_max_id, increment=meta['increment_by'], minimum=meta['min_value'],
            maximum=meta['max_value'], cache=meta['cache_size'], cycle=meta['cycle'])
        await session.execute(text(f'ALTER SEQUENCE public.sessions_id_seq RESTART WITH {next_id}'))
    if fault_mode == 'before_commit':
        state['injected'] = True
        raise SQLAlchemyError('synthetic failure before commit')
    if fault_mode == 'disconnect':
        connection = await session.connection()
        raw = await connection.get_raw_connection()
        driver = raw.driver_connection
        state['backend_pid'] = driver.get_server_pid()
        task = asyncio.create_task(commit())
        await asyncio.sleep(0)
        if task.done():
            await task
            raise RuntimeError('commit_completed_before_injection')
        driver.terminate()
        try:
            await asyncio.wait_for(task, 5)
        except TimeoutError:
            raise RuntimeError('commit_task_timeout') from None
        except Exception:
            state['driver_result'] = 'driver_error'
        else:
            state['driver_result'] = 'driver_success'
        state['injected'] = True
        raise SQLAlchemyError('synthetic connection termination')
    await commit()
    if fault_mode == 'after_commit':
        # Only a returned successful commit permits this synthetic fault label.
        state['injected'] = True
        raise SQLAlchemyError('synthetic commit acknowledgment lost')


class FixtureIdUnitOfWork:
    """Inject explicit pinned fixture IDs without modifying the real importer."""
    def __init__(self, inner, source_ids, user_id):
        self.inner = inner
        self.source_ids = source_ids
        self.user_id = user_id

    async def __aenter__(self):
        uow = await self.inner.__aenter__()
        add_all = uow.session.add_all

        def add_fixture_records(records):
            assign_fixture_ids(records, self.source_ids, user_id=self.user_id)
            return add_all(records)

        uow.session.add_all = add_fixture_records
        return uow

    async def __aexit__(self, exc_type, exc, tb):
        return await self.inner.__aexit__(exc_type, exc, tb)


def verify_redis():
    data = json.loads(commit_probe.guard.lab._docker('inspect', REDIS_NAME))
    if len(data) != 1:
        raise RuntimeError('redis_identity_invalid')
    item = data[0]
    ports = item['NetworkSettings']['Ports']['6379/tcp']
    if (not item['State']['Running']
            or item['Config']['Labels'].get('pymentor.test-owner') != REDIS_OWNER
            or item['Image'] != REDIS_IMAGE_ID or item['Config']['Image'] != REDIS_IMAGE_ID
            or item['HostConfig']['NetworkMode'] != 'bridge'
            or item['HostConfig']['RestartPolicy']['Name'] != 'no'
            or item['HostConfig']['PortBindings'] != {'6379/tcp': [{'HostIp': '127.0.0.1', 'HostPort': '57146'}]}
            or item['NetworkSettings']['Ports'] != {'6379/tcp': ports}
            or ports != [{'HostIp': '127.0.0.1', 'HostPort': '57146'}]
            or len(item['Mounts']) != 1 or item['Mounts'][0]['Type'] != 'volume'
            or item['Mounts'][0]['Destination'] != '/data'
            or item['Config']['Cmd'] != ['redis-server', '--save', '', '--appendonly', 'no']):
        raise RuntimeError('redis_identity_invalid')


async def probe(run_id, *, fault_mode='after_commit', test_gate_recovery=False):
    if fault_mode not in ('after_commit', 'before_commit', 'disconnect'):
        raise ValueError('unsupported_fault_mode')
    with commit_probe.source_guard.open_synthetic_snapshot() as snapshot:
        source = {}
        for table in commit_probe.TABLE_ORDER:
            cursor = snapshot.connection.execute(f'SELECT * FROM "{table}" LIMIT ?',
                                                 (commit_probe.MAX_ROWS_PER_TABLE + 1,))
            columns = [column[0] for column in cursor.description]
            source[table] = [dict(zip(columns, row)) for row in cursor.fetchall()]
        if sum(commit_probe.preflight(source).values()) != 21 or len(source['sessions']) != 2:
            raise RuntimeError('fixture_invalid')
    await commit_probe.guard.inspect(run_id)
    directory, state = commit_probe.guard._check_lab(run_id)
    verify_redis()
    prefix = f'pymentor-c216-test:{uuid4()}:'
    store = RedisSessionStore('redis://127.0.0.1:57146/0', prefix=prefix, socket_timeout=2)
    grouped = {}
    rows = sorted(source['sessions'], key=lambda row: row['id'])
    if [row['id'] for row in rows] != list(range(1, len(rows) + 1)):
        raise RuntimeError('fixture_session_ids_unsupported')
    if [row['user_id'] for row in rows] != sorted(row['user_id'] for row in rows):
        raise RuntimeError('fixture_session_order_unsupported')
    for row in rows:
        grouped.setdefault(row['user_id'], []).append(LegacySession(row['session_token'],
                                                                    to_timestamp(row['created_at'])))
    if any(len(candidates) != 1 for candidates in grouped.values()):
        raise RuntimeError('fixture_session_group_unsupported')
    database = None
    disconnect_observation = None
    rollback_observed = False
    retry_count = 0
    gate_recovered = False
    try:
        if len(await store._client.client_list()) != 1:
            raise RuntimeError('other_redis_clients_active')
        connection = await commit_probe.connect(directory, commit_probe.guard.lab.MIGRATOR, 'migrator_password')
        try:
            now = await connection.fetchval('SELECT clock_timestamp()')
            if await connection.fetchval("SELECT pg_get_serial_sequence('public.sessions', 'id')") != 'public.sessions_id_seq':
                raise RuntimeError('fixture_session_sequence_unsupported')
            sequence = await connection.fetchrow('SELECT last_value, is_called FROM public.sessions_id_seq')
            if tuple(sequence) != (1, False):
                raise RuntimeError('fixture_session_sequence_unsupported')
            for candidates in grouped.values():
                # Require a safety margin for this short experiment, not a
                # product policy or a guarantee against later clock changes.
                require_compatible_legacy_sessions(candidates, as_of=now + timedelta(minutes=5))
        finally:
            await connection.close()
        # Persist the random namespace and quarantine phase before the first
        # write. Standard create/migrate/backup/restore paths reject this phase.
        commit_probe.guard.lab._state_update(directory, state, 'c232-e2e-quarantined', redis_prefix=prefix)
        await commit_probe.bootstrap(directory)
        without_sessions = dict(source, sessions=[])
        if await commit_probe.insert_and_commit(directory, without_sessions) != 'committed':
            raise RuntimeError('fixture_import_invalid')
        connection = await commit_probe.connect(directory, commit_probe.guard.lab.MIGRATOR, 'migrator_password')
        try:
            await connection.execute('''CREATE TABLE c232_lab_control.session_operations (
                user_id integer PRIMARY KEY, snapshot_id text NOT NULL, operation_id text NOT NULL
            )''')
            marker_acl = await connection.fetchrow("""SELECT
                has_table_privilege('pymentor_app', 'c232_lab_control.session_operations', 'INSERT'),
                has_table_privilege('pymentor_app', 'c232_lab_control.session_operations', 'UPDATE'),
                has_table_privilege('pymentor_app', 'c232_lab_control.session_operations', 'DELETE')""")
            if tuple(marker_acl) != (False, False, False):
                raise RuntimeError('session_marker_acl_invalid')
        finally:
            await connection.close()
        password = commit_probe.guard.lab._read_secret(directory, 'migrator_password')
        url = f'postgresql+asyncpg://{commit_probe.guard.lab.MIGRATOR}:{password}@127.0.0.1:57152/pymentor_test'
        database = AsyncDatabase(url, pool_size=1, max_overflow=0, pool_timeout=3,
                                 connect_timeout=3, command_timeout=5)
        service = AsyncIdentitySessions(database, store)
        for user_id, candidates in sorted(grouped.items()):
            operation_id = session_operation_id(user_id)
            expected = [dict(row, created_at=to_timestamp(row['created_at']))
                        for row in rows if row['user_id'] == user_id]
            source_ids = [{key: row[key] for key in ('id', 'user_id', 'session_token')}
                          for row in expected]

            async def classify():
                return await read_session_state(database, user_id, expected)

            async with database.unit_of_work() as uow:
                now = await uow.session.scalar(text('SELECT clock_timestamp()'))
                sequence_before = tuple((await uow.session.execute(
                    text('SELECT last_value, is_called FROM public.sessions_id_seq'))).one())
            require_compatible_legacy_sessions(candidates, as_of=now)
            if await classify() != 'new':
                raise RuntimeError('session_initial_state_invalid')
            original_uow = database.unit_of_work
            fault_state = {'injected': False}
            injection_mode = fault_mode if user_id == min(grouped) else None

            def marked_uow():
                uow = original_uow()
                commit = uow.commit

                async def commit_with_marker():
                    await commit_with_synthetic_marker(uow.session, commit, user_id, operation_id,
                        fault_state, injection_mode, source_max_id=max(row['id'] for row in source_ids))

                uow.commit = commit_with_marker
                return FixtureIdUnitOfWork(uow, source_ids, user_id)

            database.unit_of_work = marked_uow
            try:
                try:
                    count = await import_legacy_sessions(service, user_id, candidates, require_all=True)
                except IdentityUnavailable:
                    if user_id != min(grouped) or not fault_state['injected']:
                        raise
                else:
                    if user_id == min(grouped) or count != len(candidates):
                        raise RuntimeError('session_fault_not_observed')
            finally:
                database.unit_of_work = original_uow
            # The marker and every row must match before recognizing commit;
            # no retry or write is performed based on the exception alone.
            if fault_mode == 'disconnect' and user_id == min(grouped):
                from c232_disconnect_probe import wait_for_backend_to_exit
                await wait_for_backend_to_exit(directory, fault_state['backend_pid'])
            observed = await classify()
            if fault_mode == 'disconnect' and user_id == min(grouped):
                disconnect_observation = (fault_state['driver_result'], observed)
            if observed == 'new':
                if user_id != min(grouped) or fault_mode not in ('before_commit', 'disconnect'):
                    raise RuntimeError('unexpected_session_rollback')
                rollback_observed = True
                # Explicit IDs avoid nextval; the sequence restart must have
                # rolled back too, otherwise the outcome is not safe to retry.
                async with database.unit_of_work() as uow:
                    sequence_after = tuple((await uow.session.execute(
                        text('SELECT last_value, is_called FROM public.sessions_id_seq'))).one())
                if sequence_after != sequence_before:
                    raise RuntimeError('session_retry_sequence_mismatch')
                injection_mode = None
                database.unit_of_work = marked_uow
                try:
                    if await import_legacy_sessions(service, user_id, candidates, require_all=True) != len(candidates):
                        raise RuntimeError('session_retry_count_invalid')
                    retry_count += 1
                finally:
                    database.unit_of_work = original_uow
                observed = await classify()
            if observed != 'complete':
                raise RuntimeError('session_commit_not_reconciled')
            if test_gate_recovery and user_id == min(grouped):
                # Test-only: the isolated migration lab has no app logins or
                # workers. General Redis-only revocation semantics are not
                # inferred from this controlled projection-loss experiment.
                candidate = candidates[0]
                key = f'{prefix}token:{store._digest(candidate.token)}'
                if await store._client.delete(key) != 1:
                    raise RuntimeError('fixture_gate_not_present_before_eviction')
                try:
                    await service.authenticate(candidate.token)
                except InvalidSession:
                    pass
                else:
                    raise RuntimeError('missing_gate_not_detected')
                if await classify() != 'complete':
                    raise RuntimeError('session_changed_before_recovery')
                await service.reconcile_user(user_id)
                if await classify() != 'complete':
                    raise RuntimeError('session_changed_during_recovery')
                if (await service.authenticate(candidate.token)).user_id != user_id:
                    raise RuntimeError('fixture_gate_recovery_failed')
                gate_recovered = True
            for candidate in candidates:
                if (await service.authenticate(candidate.token)).user_id != user_id:
                    raise RuntimeError('session_auth_mismatch')
        await database.dispose()
        connection = await commit_probe.connect(directory, commit_probe.guard.lab.MIGRATOR, 'migrator_password')
        try:
            async with connection.transaction():
                await commit_probe.lock_and_check(connection)
                commit_probe.compare_rows(source, await commit_probe.fetch_target(connection))
                if await connection.fetchval('SELECT count(*) FROM public.session_import_markers') != len(grouped):
                    raise RuntimeError('session_markers_mismatch')
                if await connection.fetchval('SELECT count(*) FROM c232_lab_control.session_operations') != len(grouped):
                    raise RuntimeError('session_operations_mismatch')
        finally:
            await connection.close()
    finally:
        keys = [f'{prefix}user:{user_id}' for user_id in grouped]
        for candidates in grouped.values():
            for candidate in candidates:
                digest = store._digest(candidate.token)
                keys.extend((f'{prefix}token:{digest}', f'{prefix}token:prepared:{digest}'))
        try:
            if keys:
                await store._client.delete(*keys)
                if await store._client.exists(*keys):
                    raise RuntimeError('redis_cleanup_unverified')
        finally:
            await store.close()
            if database is not None:
                await database.dispose()
    if test_gate_recovery and not gate_recovered:
        raise RuntimeError('fixture_gate_recovery_not_observed')
    if fault_mode == 'disconnect':
        driver_result, sql_state = disconnect_observation
        print('PASS: 21 synthetic rows compared; connection terminated with commit task pending; '
              f'{driver_result}, SQL state {sql_state}; COMMIT send not observed; Redis keys removed')
    elif fault_mode == 'before_commit':
        if not rollback_observed or retry_count != 1:
            raise RuntimeError('session_rollback_not_observed')
        print('PASS: 21 synthetic rows compared; session rollback and explicit-ID retry verified; Redis keys removed')
    elif test_gate_recovery:
        print('PASS: 21 synthetic rows compared; frozen-lab Redis gate recovered; own Redis keys removed')
    else:
        print('PASS: 21 synthetic rows compared, session commit acknowledgment loss simulated, Redis keys removed')


if __name__ == '__main__':
    try:
        asyncio.run(probe(sys.argv[1]))
    except Exception:
        print('BLOCKED: session end-to-end probe failed or ambiguous; quarantine lab')
        raise SystemExit(2)
