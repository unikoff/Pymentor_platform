"""Two-connection synthetic concurrency experiment; quarantines a fresh C232 lab."""
import argparse
import asyncio
import sys

import c232_target_guard as target
import c232_recovery_guard as recovery
from c232_process_mutex import synthetic_lab_mutex


class ProbeError(Exception):
    pass


SCENARIOS = (
    ('activate', 'activate', ('revoked', 'active', 'active', 'active'), 0),
    ('activate', 'revoke', ('revoked', 'active', 'active', 'revoked'), 0),
    ('revoke', 'activate', ('active', 'active', 'active', 'revoked'), 0),
    ('activate', 'all', ('revoked', 'revoked', 'revoked', 'revoked'), 1),
    ('all', 'activate', ('revoked', 'revoked', 'revoked', 'revoked'), 1),
)


async def check_target(conn):
    identity = await conn.fetchrow('SELECT current_database(), current_user, inet_server_port()')
    if tuple(identity) != (target.lab.DATABASE, target.lab.ADMIN_ROLE, 5432):
        raise ProbeError('admin_identity_invalid')
    revision = await conn.fetchval('SELECT version_num FROM public.alembic_version')
    rows = await conn.fetch("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'")
    if revision != target.EXPECTED_REVISION or {r['tablename'] for r in rows} != set(target.EXPECTED_TABLES) | target.EXTRA_TABLES:
        raise ProbeError('target_snapshot_invalid')
    for table in sorted(set(target.EXPECTED_TABLES) | {'session_import_markers'}):
        if await conn.fetchval(f'SELECT EXISTS (SELECT 1 FROM public."{table}" LIMIT 1)'):
            raise ProbeError('target_not_empty')
    kinds = await conn.fetch("""SELECT c.contype::text AS contype FROM pg_catalog.pg_constraint c
        JOIN pg_catalog.pg_class t ON t.oid=c.conrelid
        JOIN pg_catalog.pg_namespace n ON n.oid=t.relnamespace
        WHERE n.nspname='public' AND t.relname=ANY($1::text[])""",
        sorted(set(target.EXPECTED_TABLES) | {'session_import_markers'}))
    if not {'p', 'f', 'u'}.issubset({row['contype'] for row in kinds}):
        raise ProbeError('target_constraints_invalid')


async def apply_operation(conn, operation):
    generation = await conn.fetchval('SELECT generation FROM c435_lab.owner WHERE id=1 FOR UPDATE')
    if generation is None:
        raise ProbeError('owner_missing')
    now = await conn.fetchval('SELECT clock_timestamp()')
    row = await conn.fetchrow("SELECT state, generation, expires_at > $1 AS unexpired FROM c435_lab.synthetic_session WHERE owner_id=1 AND digest='pending'", now)
    if row is None:
        raise ProbeError('session_missing')
    if operation == 'activate':
        if row['state'] != 'pending' or row['generation'] != generation or not row['unexpired']:
            return
        live = await conn.fetchval("SELECT count(*) FROM c435_lab.synthetic_session WHERE owner_id=1 AND state='active' AND generation=$1 AND expires_at > $2", generation, now)
        if live == 3:
            result = await conn.fetchval("""UPDATE c435_lab.synthetic_session SET state='revoked'
                WHERE owner_id=1 AND digest=(SELECT digest FROM c435_lab.synthetic_session
                WHERE owner_id=1 AND state='active' AND generation=$1 AND expires_at > $2
                ORDER BY ordering, digest LIMIT 1) RETURNING digest""", generation, now)
            if result != 'oldest':
                raise ProbeError('eviction_invalid')
        elif live > 3:
            raise ProbeError('live_count_invalid')
        await conn.execute("UPDATE c435_lab.synthetic_session SET state='active' WHERE owner_id=1 AND digest='pending'")
    elif operation == 'revoke':
        await conn.execute("UPDATE c435_lab.synthetic_session SET state='revoked' WHERE owner_id=1 AND digest='pending'")
    elif operation == 'all':
        await conn.execute('UPDATE c435_lab.owner SET generation=generation+1 WHERE id=1')
        await conn.execute("UPDATE c435_lab.synthetic_session SET state='revoked' WHERE owner_id=1")
    else:
        raise ProbeError('operation_invalid')


async def setup_scenario(conn):
    async with conn.transaction():
        await conn.execute('DELETE FROM c435_lab.synthetic_session')
        await conn.execute('DELETE FROM c435_lab.owner')
        await conn.execute('INSERT INTO c435_lab.owner VALUES (1, 0)')
        await conn.execute("""INSERT INTO c435_lab.synthetic_session VALUES
            (1,'oldest','active',0,'2099-01-01 00:00:00+00',1),
            (1,'second','active',0,'2099-01-01 00:00:00+00',2),
            (1,'third','active',0,'2099-01-01 00:00:00+00',3),
            (1,'pending','pending',0,'2099-01-01 00:00:00+00',4)""")


async def run_scenario(first, second, first_pid, second_pid, scenario):
    await setup_scenario(first)
    task = None
    try:
        async with first.transaction():
            await apply_operation(first, scenario[0])
            async def contender():
                async with second.transaction():
                    await apply_operation(second, scenario[1])
            task = asyncio.create_task(contender())
            # The first connection itself observes the wait while holding the row lock.
            async def wait_for_lock():
                while True:
                    if task.done():
                        raise ProbeError('lock_wait_not_observed')
                    if await first.fetchval('SELECT $1 = ANY(pg_blocking_pids($2))', first_pid, second_pid):
                        return
                    await asyncio.sleep(0.02)
            await asyncio.wait_for(wait_for_lock(), 3)
        await task
    except BaseException:
        if task is not None:
            task.cancel()
            await asyncio.gather(task, return_exceptions=True)
        raise
    rows = await first.fetch('SELECT state FROM c435_lab.synthetic_session ORDER BY ordering')
    generation = await first.fetchval('SELECT generation FROM c435_lab.owner WHERE id=1')
    if tuple(row['state'] for row in rows) != scenario[2] or generation != scenario[3]:
        raise ProbeError('scenario_result_invalid')


async def _probe(run_id, connect):
    connections = []
    close_failed = False
    try:
        if not isinstance(run_id, str) or not target.RUN_ID.fullmatch(run_id):
            raise ProbeError('run_id_invalid')
        directory = target.lab._root() / run_id
        if not recovery._check_private_acl(directory):
            raise ProbeError('journal_acl_unverified')
        checked, state = target._check_lab(run_id)
        if checked != directory:
            raise ProbeError('lab_identity_invalid')
        password = target.lab._read_secret(directory, 'bootstrap_password')
        for _ in range(2):
            conn = await connect(host='127.0.0.1', port=target.lab.PORT, database=target.lab.DATABASE,
                user=target.lab.ADMIN_ROLE, password=password, timeout=5, command_timeout=8,
                server_settings={'lock_timeout': '5s', 'statement_timeout': '8s'})
            connections.append(conn)
            identity = await conn.fetchrow('SELECT current_database(), current_user, inet_server_port()')
            if tuple(identity) != (target.lab.DATABASE, target.lab.ADMIN_ROLE, 5432):
                raise ProbeError('admin_identity_invalid')
        first, second = connections
        await check_target(first)
        pids = [await conn.fetchval('SELECT pg_backend_pid()') for conn in connections]
        if len(set(pids)) != 2:
            raise ProbeError('connection_identity_invalid')
        if await first.fetchval("SELECT EXISTS(SELECT 1 FROM pg_catalog.pg_namespace WHERE nspname='c435_lab')"):
            raise ProbeError('schema_exists')
        if await first.fetchval('SELECT EXISTS(SELECT 1 FROM pg_catalog.pg_stat_activity WHERE datname=current_database() AND pid <> ALL($1::int[]))', pids):
            raise ProbeError('other_clients_present')
        target.lab._state_update(directory, state, 'c435-concurrency-quarantined')
        if not recovery._check_private_acl(directory):
            raise ProbeError('journal_acl_unverified')
        # Recheck the quarantined journal, labeled volume and pinned container
        # and loopback port immediately before the first SQL write. Connections
        # are already established; a container replacement breaks them.
        checked, quarantined = target.lab._load(run_id)
        names = target.lab._names(run_id)
        if checked != directory or quarantined.get('phase') != 'c435-concurrency-quarantined':
            raise ProbeError('quarantine_unverified')
        target.lab._assert_volume(names['source_volume'])
        target.lab._assert_container(names['source_container'], names['source_volume'], directory, require_running=True)
        if await first.fetchval('SELECT EXISTS(SELECT 1 FROM pg_catalog.pg_stat_activity WHERE datname=current_database() AND pid <> ALL($1::int[]))', pids):
            raise ProbeError('other_clients_present')
        await first.execute('CREATE SCHEMA c435_lab')
        await first.execute('CREATE TABLE c435_lab.owner (id integer PRIMARY KEY, generation integer NOT NULL)')
        await first.execute('''CREATE TABLE c435_lab.synthetic_session (
            owner_id integer NOT NULL REFERENCES c435_lab.owner(id), digest text NOT NULL,
            state text NOT NULL, generation integer NOT NULL, expires_at timestamptz NOT NULL,
            ordering integer NOT NULL, PRIMARY KEY(owner_id,digest))''')
        for scenario in SCENARIOS:
            await run_scenario(first, second, *pids, scenario)
            await run_scenario(second, first, pids[1], pids[0], scenario)
    finally:
        for conn in reversed(connections):
            try:
                await conn.close(timeout=5)
            except BaseException:
                close_failed = True
                conn.terminate()
        if close_failed:
            raise ProbeError('connection_close_failed') from None


async def probe(run_id, *, connect=None):
    try:
        if connect is None:
            import asyncpg
            connect = asyncpg.connect
        with synthetic_lab_mutex(run_id):
            await asyncio.wait_for(_probe(run_id, connect), timeout=100)
    except ProbeError:
        raise
    except Exception:
        raise ProbeError('probe_failed') from None


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('run_id')
    args = parser.parse_args(argv)
    try:
        asyncio.run(probe(args.run_id))
    except (ProbeError, KeyboardInterrupt):
        print('BLOCKED: probe failed or cancelled; leave lab quarantined', file=sys.stderr)
        return 2
    print('PASS: all synthetic PostgreSQL concurrency scenarios completed and connections closed.')
    print('LIMITATION: pending TTL policy, Redis, cookies, production and real writers were not checked.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
