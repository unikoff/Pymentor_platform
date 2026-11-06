"""Resume only an already-quarantined, pinned, synthetic C232 laboratory.

Not a production importer. The caller must arrange a frozen disposable lab;
point-in-time identity/privilege checks and a cooperative same-machine mutex
do not exclude privileged or non-cooperating writers. No worker is started.
"""
import asyncio
from datetime import timedelta
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'backend'))
sys.path.insert(0, str(ROOT / 'scripts'))

import c232_commit_probe as commit
import c232_core_runner as core
import c232_recovery_guard as guard
import c232_source_reader as source_reader
import c232_sessions_e2e_probe as e2e
from c232_process_mutex import synthetic_lab_mutex
from c232_session_importer import ensure_user_sessions
from c232_session_runner import read_session_state
from identity.async_sessions import AsyncIdentitySessions, SESSION_TTL_SECONDS
from identity.c232_session_compatibility import require_compatible_legacy_sessions
from identity.legacy_session_import import LegacySession
from infrastructure.c232_compare import compare_rows
from infrastructure.c232_import_types import to_timestamp
from infrastructure.dual_async_pg import AsyncDatabase
from infrastructure.redis_sessions import RedisSessionStore


class SyntheticResumeError(Exception):
    """A redacted failure; the disposable lab stays quarantined."""


async def _check_session_inventory(connection, user_ids):
    """Reject unexpected users in any of the three session state tables."""
    for table in ('public.sessions', 'public.session_import_markers',
                  'c232_lab_control.session_operations'):
        rows = await connection.fetch(f'SELECT DISTINCT user_id FROM {table}')
        if any(row['user_id'] not in user_ids for row in rows):
            raise ValueError('unexpected_session_inventory')


async def _check_known_redis_state(store, rows):
    """Reject unexpected state at every fixture key and indexed member.

    This does not discover unreferenced keys elsewhere in the random prefix.
    """
    for row in rows:
        user = str(row['user_id'])
        digest = store._digest(row['session_token'])
        user_key = f"{store._prefix}user:{user}"
        token_key = f'{store._prefix}token:{digest}'
        prepared_key = f'{store._prefix}token:prepared:{digest}'
        client = store._client
        index_type = await client.type(user_key)
        if index_type == 'zset':
            seconds, micros = await client.time()
            index_ttl = await client.pttl(user_key)
            expiry = int((to_timestamp(row['created_at']) + timedelta(seconds=SESSION_TTL_SECONDS)).timestamp() * 1000)
            if (index_ttl <= 0 or seconds * 1000 + micros // 1000 + index_ttl > expiry + 2000
                    or await client.zrange(user_key, 0, -1) != [digest]):
                raise ValueError('redis_index_invalid')
        elif index_type != 'none':
            raise ValueError('redis_index_invalid')
        token_type = await client.type(token_key)
        if token_type == 'string':
            if await client.get(token_key) != user or await client.pttl(token_key) <= 0:
                raise ValueError('redis_gate_invalid')
        elif token_type != 'none':
            raise ValueError('redis_gate_invalid')
        if await client.type(prepared_key) != 'none':
            raise ValueError('redis_prepared_invalid')


async def _check_all_session_states(database, rows):
    for row in rows:
        expected = [dict(row, created_at=to_timestamp(row['created_at']))]
        if await read_session_state(database, row['user_id'], expected) not in ('new', 'complete'):
            raise ValueError('session_state_invalid')


async def _resume(run_id):
    # These checks are unconditional, including when a mutex was not marked
    # abandoned: the OS may have destroyed the mutex after a prior crash.
    source = source_reader.load_pinned_source()
    if len(source) != 15 or sum(map(len, source.values())) != 21:
        raise ValueError('fixture_invalid')
    rows = sorted(source['sessions'], key=lambda row: row['id'])
    if [row['id'] for row in rows] != [1, 2] or len({row['user_id'] for row in rows}) != 2:
        raise ValueError('fixture_sessions_invalid')
    await guard.inspect(run_id)
    directory, state = guard._check_lab(run_id)
    prefix = state['redis_prefix']
    e2e.verify_redis()
    store = RedisSessionStore('redis://127.0.0.1:57146/0', prefix=prefix, socket_timeout=2)
    database = None
    try:
        if len(await store._client.client_list()) != 1:
            raise ValueError('other_redis_clients_active')
        await _check_known_redis_state(store, rows)
        connection = await commit.connect(directory, commit.guard.lab.MIGRATOR, 'migrator_password')
        try:
            if await connection.fetchval('''SELECT count(*) FROM pg_stat_activity
                WHERE datname=current_database() AND backend_type='client backend'
                AND pid<>pg_backend_pid()'''):
                raise ValueError('other_database_clients_active')
            now = await connection.fetchval('SELECT clock_timestamp()')
            for row in rows:
                # A margin limits near-expiry races in this short lab only.
                require_compatible_legacy_sessions(
                    [LegacySession(row['session_token'], to_timestamp(row['created_at']))],
                    as_of=now + timedelta(minutes=5))
            state_name = await core.read_core_state(connection, source)
            await _check_session_inventory(connection, {row['user_id'] for row in rows})
        finally:
            await connection.close()
        if state_name == 'new':
            if await commit.insert_and_commit(directory, dict(source, sessions=[])) != 'committed':
                raise ValueError('core_write_unexpected')
        elif state_name != 'core_complete':
            raise ValueError('core_state_invalid')
        # Recheck core after every possible write before handling sessions.
        connection = await commit.connect(directory, commit.guard.lab.MIGRATOR, 'migrator_password')
        try:
            if await core.read_core_state(connection, source) != 'core_complete':
                raise ValueError('core_state_invalid')
            await _check_session_inventory(connection, {row['user_id'] for row in rows})
        finally:
            await connection.close()
        password = commit.guard.lab._read_secret(directory, 'migrator_password')
        url = f'postgresql+asyncpg://{commit.guard.lab.MIGRATOR}:{password}@127.0.0.1:57152/pymentor_test'
        database = AsyncDatabase(url, pool_size=1, max_overflow=0, pool_timeout=3,
                                 connect_timeout=3, command_timeout=5)
        service = AsyncIdentitySessions(database, store)
        # Classify every user before changing even the first user's sessions.
        await _check_all_session_states(database, rows)
        for row in rows:
            await ensure_user_sessions(database, service, row['user_id'], [row], frozen_lab_verified=True)
        for row in rows:
            expected = [dict(row, created_at=to_timestamp(row['created_at']))]
            if await read_session_state(database, row['user_id'], expected) != 'complete':
                raise ValueError('session_state_invalid')
        await database.dispose()
        database = None
        await _check_known_redis_state(store, rows)
        connection = await commit.connect(directory, commit.guard.lab.MIGRATOR, 'migrator_password')
        try:
            async with connection.transaction():
                await commit.lock_and_check(connection)
                compare_rows(source, await commit.fetch_target(connection))
                await _check_session_inventory(connection, {row['user_id'] for row in rows})
                await commit.sequence_states(connection, source, restart=False)
        finally:
            await connection.close()
        return {'tables': len(source), 'rows': sum(map(len, source.values())), 'sessions': len(rows)}
    finally:
        try:
            await store.close()
        finally:
            if database is not None:
                await database.dispose()


async def resume(run_id):
    try:
        # This covers every mutation and is keyed by the same validated run ID
        # used to derive both journal and Docker identity. It is not a security
        # boundary and must be held and released on this event-loop thread.
        with synthetic_lab_mutex(run_id):
            return await _resume(run_id)
    except Exception:
        raise SyntheticResumeError('synthetic_resume_unavailable') from None


if __name__ == '__main__':
    try:
        result = asyncio.run(resume(sys.argv[1]))
        print(f"PASS: synthetic lab verified: {result['tables']} tables, {result['rows']} rows, {result['sessions']} sessions")
    except Exception:
        print('BLOCKED: synthetic resume failed or ambiguous; leave lab quarantined')
        raise SystemExit(2)
