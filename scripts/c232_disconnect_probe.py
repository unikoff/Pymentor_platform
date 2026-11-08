"""Fault-inject a lost PostgreSQL connection during synthetic commit.

The target is a newly verified disposable C232 lab. Sessions and workers are
excluded. Do not use this experiment for user data or deployment decisions.
"""
import asyncio
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'backend'))
sys.path.insert(0, str(ROOT / 'scripts'))

import c232_commit_probe as commit_probe


async def wait_for_backend_to_exit(directory, backend_pid):
    admin = await commit_probe.connect(directory, commit_probe.guard.lab.ADMIN_ROLE, 'bootstrap_password')
    try:
        async with asyncio.timeout(10):
            while await admin.fetchval('SELECT EXISTS (SELECT 1 FROM pg_stat_activity WHERE pid=$1)', backend_pid):
                await asyncio.sleep(0.1)
    finally:
        await asyncio.wait_for(admin.close(), 5)


async def classify(directory, source, original_sequences):
    connection = await commit_probe.connect(directory, commit_probe.guard.lab.MIGRATOR, 'migrator_password')
    try:
        async with connection.transaction():
            await commit_probe.lock_and_check(connection)
            marker = await connection.fetch(
                f'SELECT singleton, snapshot_digest, transform_version FROM {commit_probe.MARKER_TABLE}')
            if marker:
                if len(marker) != 1 or tuple(marker[0]) != (True, commit_probe.MARKER_DIGEST,
                                                           commit_probe.MARKER_VERSION):
                    raise RuntimeError('marker_mismatch')
                commit_probe.compare_rows(source, await commit_probe.fetch_target(connection))
                if await connection.fetchval('SELECT EXISTS (SELECT 1 FROM public.session_import_markers)'):
                    raise RuntimeError('session_marker_not_empty')
                await commit_probe.sequence_states(connection, source, restart=False)
                return 'committed'
            for table in commit_probe.DATA_TABLES:
                if await connection.fetchval(f'SELECT EXISTS (SELECT 1 FROM public."{table}")'):
                    raise RuntimeError('partial_target')
            if await commit_probe.capture_sequences(connection) != original_sequences:
                raise RuntimeError('partial_sequences')
            return 'rolled_back'
    finally:
        await connection.close()


async def probe(run_id):
    with commit_probe.source_guard.open_synthetic_snapshot() as snapshot:
        source = {}
        for table in commit_probe.TABLE_ORDER:
            cursor = snapshot.connection.execute(f'SELECT * FROM "{table}" LIMIT ?',
                                                 (commit_probe.MAX_ROWS_PER_TABLE + 1,))
            columns = [column[0] for column in cursor.description]
            source[table] = [dict(zip(columns, row)) for row in cursor.fetchall()]
        if commit_probe.preflight(source)['sessions'] != 2:
            raise RuntimeError('synthetic_fixture_mismatch')
        source['sessions'] = []
        if sum(commit_probe.preflight(source).values()) != 19:
            raise RuntimeError('synthetic_fixture_mismatch')
    await commit_probe.guard.inspect(run_id)
    directory, _ = commit_probe.guard._check_lab(run_id)
    await commit_probe.bootstrap(directory)
    connection = await commit_probe.connect(directory, commit_probe.guard.lab.MIGRATOR, 'migrator_password')
    try:
        async with connection.transaction():
            await commit_probe.lock_and_check(connection)
            original_sequences = await commit_probe.capture_sequences(connection)
    finally:
        await connection.close()
    try:
        await commit_probe.insert_and_commit(directory, source, inject='connection_drop')
    except commit_probe.CommitConnectionLost as exc:
        driver_result = exc.driver_result
        await wait_for_backend_to_exit(directory, exc.backend_pid)
    else:
        raise RuntimeError('connection_fault_not_observed')
    # No retry until the prior backend is gone and every state is classified.
    outcome = await classify(directory, source, original_sequences)
    expected = 'already_complete' if outcome == 'committed' else 'committed'
    if await commit_probe.insert_and_commit(directory, source) != expected:
        raise RuntimeError('retry_result_mismatch')
    await commit_probe.reconcile(directory, source)
    print(f'PASS: connection terminated with client commit task pending; {driver_result}; '
          f'server outcome classified {outcome}; retry reconciled; send not observed; sessions excluded')


if __name__ == '__main__':
    try:
        asyncio.run(probe(sys.argv[1]))
    except Exception:
        print('BLOCKED: disconnect experiment failed or ambiguous; quarantine lab')
        raise SystemExit(2)
