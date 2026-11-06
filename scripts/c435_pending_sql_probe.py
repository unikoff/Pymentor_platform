"""One-shot SQL-helper probe for a fresh, private C232 synthetic lab only.

This leaves the lab quarantined on success and failure. Client snapshots do not
isolate the lab from an administrator. Redis, cookies, concurrent writers and
long-term tombstone retention are not tested.
"""
import argparse
import asyncio
from datetime import timedelta
from pathlib import Path
import re
import sys

import c232_recovery_guard as recovery
import c232_target_guard as target
from c232_process_mutex import synthetic_lab_mutex

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'backend'))

USER_ID = 435
DIGESTS = tuple(c * 64 for c in '1234567')
PHASE = 'c435-pending-sql-quarantined'


class ProbeError(Exception):
    pass


class Trace:
    """Fail before a helper write if its SQL or clock ordering is unsafe."""
    def __init__(self, operation):
        self.operation = operation
        self.clocks = 0
        self.sessions_locked = False
        self.clock_after_sessions = False
        self.row_locks = set()

    def statement(self, sql):
        s = ' '.join(sql.lower().split())
        if re.search(r'\b(?:from|join|into|update|delete\s+from)\s+(?:"?users"?|"?sessions"?)(?:\s|$|\()', s):
            raise ProbeError('unqualified_public_table')
        if s.startswith('select ') and 'for update' in s:
            for table in ('public.users', 'c435_lab.owner_generation', 'c435_lab.pending'):
                if 'from ' + table in s:
                    self.row_locks.add(table)
            if re.search(r'\bfrom\s+public\."?sessions"?\b', s):
                self.sessions_locked = True
        if re.match(r'^(insert|update|delete)\b', s):
            if self.operation == 'retry':
                raise ProbeError('retry_write_attempted')
            if self.clocks < 1 or (self.operation == 'activate' and (self.clocks < 2 or not self.clock_after_sessions)):
                raise ProbeError('clock_order_invalid')

    async def clock(self, db):
        from sqlalchemy import text
        if self.row_locks != {'public.users', 'c435_lab.owner_generation', 'c435_lab.pending'}:
            raise ProbeError('clock_before_row_locks')
        now = (await db.execute(text('SELECT clock_timestamp()'))).scalar_one()
        self.clocks += 1
        if self.sessions_locked:
            self.clock_after_sessions = True
        return now


async def snapshot(db):
    from sqlalchemy import text
    sessions = (await db.execute(text('SELECT id, user_id, session_token, created_at FROM public.sessions ORDER BY session_token'))).all()
    pending = (await db.execute(text('SELECT digest, user_id, generation, expires_at, status FROM c435_lab.pending ORDER BY digest'))).all()
    users = (await db.execute(text('SELECT id, username, email, password_hash, is_admin FROM public.users'))).all()
    generations = (await db.execute(text('SELECT user_id, generation FROM c435_lab.owner_generation'))).all()
    return tuple(map(tuple, sessions)), tuple(map(tuple, pending)), tuple(map(tuple, users)), tuple(map(tuple, generations))


def expect_initial(state, expiry, prepared=False):
    sessions, pending, users, generations = state
    if (len(sessions) != 3 or tuple(row[2] for row in sessions) != DIGESTS[:3]
            or any(row[1] != USER_ID for row in sessions)
            or not sessions[0][3] < sessions[1][3] < sessions[2][3]
            or users != ((USER_ID, 'c435_synthetic', 'c435@example.invalid', '!synthetic-disabled!', False),)
            or generations != ((USER_ID, 0),)):
        raise ProbeError('initial_state_invalid')
    expected = tuple((d, USER_ID, 0, expiry, 'active') for d in DIGESTS[:3])
    if prepared:
        expected += ((DIGESTS[3], USER_ID, 0, expiry, 'pending'),)
    if pending != expected:
        raise ProbeError('initial_pending_invalid')


async def coordinate_expiry(activation, observe, release, timeout):
    """Observe a live block through expiry; always join the task before release on failure."""
    task = asyncio.create_task(activation)
    released = False
    observed_before_expiry = False
    try:
        async with asyncio.timeout(timeout):
            while True:
                await asyncio.sleep(0.05)
                if task.done():
                    await task
                    raise ProbeError('activation_finished_before_expiry')
                blocked, expired = await observe()
                if blocked and not expired:
                    observed_before_expiry = True
                if expired and not observed_before_expiry:
                    raise ProbeError('block_not_observed_before_expiry')
                if blocked and expired and observed_before_expiry:
                    await release()
                    released = True
                    return await task
    finally:
        if not task.done():
            task.cancel()
        try:
            await asyncio.gather(task, return_exceptions=True)
        finally:
            if not released:
                await release()


async def experiment(engine, expiry, connect, directory):
    from sqlalchemy import event
    from sqlalchemy import text
    from sqlalchemy.ext.asyncio import AsyncSession
    from identity.c435_pending_sql import activate, activate_without_eviction, prepare

    current = [None]
    def observe(_conn, _cursor, statement, _params, _context, _many):
        if current[0] is not None:
            current[0].statement(statement)
    event.listen(engine.sync_engine, 'before_cursor_execute', observe)
    try:
        async with AsyncSession(engine, expire_on_commit=False) as db:
            async with db.begin():
                identity = (await db.execute(text('SELECT current_database(), current_user, inet_server_port()'))).one()
                if tuple(identity) != (target.lab.DATABASE, target.lab.APP_ROLE, 5432):
                    raise ProbeError('app_identity_invalid')
                others = (await db.execute(text("SELECT EXISTS(SELECT 1 FROM pg_catalog.pg_stat_activity WHERE datname=current_database() AND backend_type='client backend' AND pid<>pg_backend_pid())"))).scalar_one()
                if others:
                    raise ProbeError('other_clients_present')
                initial = await snapshot(db)
                expect_initial(initial, expiry)
            async with db.begin():
                trace = Trace('prepare')
                current[0] = trace
                try:
                    await prepare(db, USER_ID, DIGESTS[3], 0, expiry, trace.clock)
                finally:
                    current[0] = None
                if trace.clocks < 1:
                    raise ProbeError('prepare_clock_missing')
            async with db.begin():
                ready = await snapshot(db)
                expect_initial(ready, expiry, prepared=True)
                if ready[0] != initial[0]:
                    raise ProbeError('prepare_changed_sessions')
            # This is only a fail-closed guard while outcome is uncertain;
            # it does not replace the chosen oldest-session eviction policy.
            async with db.begin():
                trace = Trace('retry')
                current[0] = trace
                try:
                    capacity = await activate_without_eviction(db, USER_ID, DIGESTS[3], trace.clock)
                finally:
                    current[0] = None
                if capacity != 'at_capacity' or not trace.clock_after_sessions:
                    raise ProbeError('capacity_guard_invalid')
            async with db.begin():
                if await snapshot(db) != ready:
                    raise ProbeError('capacity_guard_changed_state')
            transaction = await db.begin()
            try:
                trace = Trace('activate')
                current[0] = trace
                try:
                    activated = await activate(db, USER_ID, DIGESTS[3], trace.clock)
                finally:
                    current[0] = None
                if activated is not True or not trace.clock_after_sessions or trace.clocks < 2:
                    raise ProbeError('activation_clock_invalid')
            finally:
                await transaction.rollback()
            async with db.begin():
                if await snapshot(db) != ready:
                    raise ProbeError('rollback_changed_state')
            async with db.begin():
                trace = Trace('activate')
                current[0] = trace
                try:
                    activated = await activate(db, USER_ID, DIGESTS[3], trace.clock)
                finally:
                    current[0] = None
                if activated is not True or not trace.clock_after_sessions or trace.clocks < 2:
                    raise ProbeError('activation_clock_invalid')
            async with db.begin():
                done = await snapshot(db)
                sessions, pending, users, generations = done
                if (len(sessions) != 3 or sessions[:2] != ready[0][1:]
                        or sessions[2][1:3] != (USER_ID, DIGESTS[3])
                        or sessions[2][0] in {row[0] for row in ready[0]}
                        or sessions[2][3] <= ready[0][-1][3]
                        or pending != ready[1][:-1] + (ready[1][-1][:-1] + ('active',),)
                        or users != ready[2] or generations != ready[3]):
                    raise ProbeError('committed_state_invalid')
            async with db.begin():
                trace = Trace('retry')
                current[0] = trace
                try:
                    result = await activate(db, USER_ID, DIGESTS[3], trace.clock)
                finally:
                    current[0] = None
                if result is not False:
                    raise ProbeError('retry_not_noop')
            async with db.begin():
                if await snapshot(db) != done:
                    raise ProbeError('retry_changed_state')
            await expiry_experiment(db, done, connect, directory, current)
            await logout_experiment(db, engine, current)
    finally:
        event.remove(engine.sync_engine, 'before_cursor_execute', observe)


async def logout_experiment(db, engine, current):
    """Exercise operation-marker replay and rollback with fake identities only."""
    from sqlalchemy import event, text
    from identity.c435_pending_sql import activate, logout_all, prepare, revoke

    op_first, op_second = 'a' * 64, 'b' * 64

    async def operations():
        rows = (await db.execute(text('SELECT operation_id, user_id, generation_before, generation_after FROM c435_lab.logout_operations ORDER BY operation_id'))).all()
        return tuple(map(tuple, rows))

    async with db.begin():
        if await logout_all(db, USER_ID, op_first) is not True:
            raise ProbeError('logout_first_invalid')
    async with db.begin():
        logged_out = await snapshot(db)
        if (logged_out[0] or any(row[4] != 'revoked' for row in logged_out[1])
                or logged_out[3] != ((USER_ID, 1),)
                or await operations() != ((op_first, USER_ID, 0, 1),)):
            raise ProbeError('logout_state_invalid')
    # A newly created session after a successful logout must survive a retry
    # of that original operation after its response was hypothetically lost.
    async with db.begin():
        now = (await db.execute(text('SELECT clock_timestamp()'))).scalar_one()
        trace = Trace('prepare')
        current[0] = trace
        try:
            await prepare(db, USER_ID, DIGESTS[5], 1, now + timedelta(hours=1), trace.clock)
        finally:
            current[0] = None
    async with db.begin():
        trace = Trace('activate')
        current[0] = trace
        try:
            if await activate(db, USER_ID, DIGESTS[5], trace.clock) is not True:
                raise ProbeError('new_session_invalid')
        finally:
            current[0] = None
    async with db.begin():
        before_retry = await snapshot(db)
        before_operations = await operations()
        if len(before_retry[0]) != 1 or before_retry[0][0][2] != DIGESTS[5]:
            raise ProbeError('new_session_invalid')

    def inject_marker_failure(_conn, _cursor, statement, _params, _context, _many):
        if statement.lstrip().lower().startswith('insert into c435_lab.logout_operations'):
            raise ProbeError('synthetic_marker_failure')

    event.listen(engine.sync_engine, 'before_cursor_execute', inject_marker_failure)
    try:
        try:
            async with db.begin():
                await logout_all(db, USER_ID, op_second)
        except ProbeError as exc:
            if str(exc) != 'synthetic_marker_failure':
                raise
        else:
            raise ProbeError('rollback_fault_missing')
    finally:
        event.remove(engine.sync_engine, 'before_cursor_execute', inject_marker_failure)
    async with db.begin():
        if await snapshot(db) != before_retry or await operations() != before_operations:
            raise ProbeError('logout_rollback_invalid')
        if await logout_all(db, USER_ID, op_first) is not False:
            raise ProbeError('logout_retry_invalid')
    async with db.begin():
        if await snapshot(db) != before_retry or await operations() != before_operations:
            raise ProbeError('logout_retry_changed_state')
    async with db.begin():
        trace = Trace('revoke')
        current[0] = trace
        try:
            await revoke(db, USER_ID, DIGESTS[5], trace.clock)
        finally:
            current[0] = None
    async with db.begin():
        revoked = await snapshot(db)
        if revoked[0] or revoked[1][-1][4] != 'revoked':
            raise ProbeError('revoke_state_invalid')
    async with db.begin():
        trace = Trace('revoke')
        current[0] = trace
        try:
            await revoke(db, USER_ID, DIGESTS[5], trace.clock)
        finally:
            current[0] = None
    async with db.begin():
        if await snapshot(db) != revoked:
            raise ProbeError('revoke_retry_changed_state')
        if await logout_all(db, USER_ID, op_second) is not True:
            raise ProbeError('second_logout_invalid')
    async with db.begin():
        final = await snapshot(db)
        if (final[0] or any(row[4] != 'revoked' for row in final[1]) or final[3] != ((USER_ID, 2),)
                or await operations() != ((op_first, USER_ID, 0, 1), (op_second, USER_ID, 1, 2))):
            raise ProbeError('second_logout_state_invalid')


async def expiry_experiment(db, done, connect, directory, current):
    from sqlalchemy import text
    from identity.c435_pending_sql import activate, prepare

    admin = None
    lock = None
    try:
        admin = await connect(host='127.0.0.1', port=target.lab.PORT, database=target.lab.DATABASE,
            user=target.lab.ADMIN_ROLE, password=target.lab._read_secret(directory, 'bootstrap_password'),
            timeout=5, command_timeout=16, server_settings={'lock_timeout': '12s', 'statement_timeout': '15s'})
        async with db.begin():
            app_identity = tuple((await db.execute(text('SELECT current_database(), current_user, inet_server_port(), pg_backend_pid()'))).one())
            admin_identity = tuple(await admin.fetchrow('SELECT current_database(), current_user, inet_server_port(), pg_backend_pid()'))
            if (app_identity[:3] != (target.lab.DATABASE, target.lab.APP_ROLE, 5432)
                    or admin_identity[:3] != (target.lab.DATABASE, target.lab.ADMIN_ROLE, 5432)
                    or app_identity[3] == admin_identity[3]):
                raise ProbeError('expiry_identity_invalid')
            roles = await admin.fetchrow("""SELECT
                (SELECT rolcanlogin AND NOT (rolsuper OR rolcreatedb OR rolcreaterole OR rolreplication OR rolbypassrls) AND rolconnlimit=1 FROM pg_catalog.pg_roles WHERE rolname='pymentor_app'),
                (SELECT NOT rolcanlogin FROM pg_catalog.pg_roles WHERE rolname='pymentor_test'),
                pg_has_role('pymentor_app', 'pymentor_test', 'MEMBER'),
                has_schema_privilege('pymentor_app', 'public', 'CREATE'),
                has_schema_privilege('pymentor_app', 'c435_lab', 'CREATE'),
                has_schema_privilege('pymentor_app', 'public', 'USAGE'),
                has_schema_privilege('pymentor_app', 'c435_lab', 'USAGE')""")
            if tuple(roles) != (True, True, False, False, False, True, True):
                raise ProbeError('role_isolation_invalid')
            await verify_privileges(admin)
            if await admin.fetchval("SELECT EXISTS(SELECT 1 FROM pg_catalog.pg_stat_activity WHERE datname=current_database() AND backend_type='client backend' AND pid <> ALL($1::int[]))", [app_identity[3], admin_identity[3]]):
                raise ProbeError('other_clients_present')
            if await snapshot(db) != done:
                raise ProbeError('expiry_initial_state_invalid')
            now = (await db.execute(text('SELECT clock_timestamp()'))).scalar_one()
            short_expiry = now + timedelta(seconds=4)
            trace = Trace('prepare')
            current[0] = trace
            try:
                await prepare(db, USER_ID, DIGESTS[4], 0, short_expiry, trace.clock)
            finally:
                current[0] = None
            if trace.clocks < 1:
                raise ProbeError('prepare_clock_missing')
        async with db.begin():
            ready = await snapshot(db)
            if ready != (done[0], done[1] + ((DIGESTS[4], USER_ID, 0, short_expiry, 'pending'),), done[2], done[3]):
                raise ProbeError('expiry_pending_invalid')
        lock = admin.transaction()
        await lock.start()
        row = await admin.fetchrow('SELECT id, user_id, session_token, created_at FROM public.sessions WHERE id=$1 AND user_id=$2 AND session_token=$3 FOR UPDATE', done[0][0][0], USER_ID, done[0][0][2])
        if row is None or tuple(row) != done[0][0]:
            raise ProbeError('expiry_lock_target_invalid')

        activation_pid = None

        async def activate_task():
            nonlocal activation_pid
            async with db.begin():
                identity = tuple((await db.execute(text('SELECT current_database(), current_user, inet_server_port(), pg_backend_pid()'))).one())
                if (identity[:3] != (target.lab.DATABASE, target.lab.APP_ROLE, 5432)
                        or identity[3] == admin_identity[3]):
                    raise ProbeError('expiry_identity_invalid')
                # NullPool can create a different backend for each transaction.
                activation_pid = identity[3]
                trace = Trace('activate')
                current[0] = trace
                try:
                    result = await activate(db, USER_ID, DIGESTS[4], trace.clock)
                finally:
                    current[0] = None
                if result is not False or trace.clocks < 2 or not trace.clock_after_sessions:
                    raise ProbeError('expiry_activation_invalid')
                return result

        async def observe():
            if activation_pid is None:
                return False, await admin.fetchval('SELECT clock_timestamp() >= $1', short_expiry)
            row = await admin.fetchrow('SELECT $1 = ANY(pg_catalog.pg_blocking_pids($2)), clock_timestamp() >= $3', admin_identity[3], activation_pid, short_expiry)
            return tuple(row)

        async def release():
            nonlocal lock
            if lock is not None:
                await lock.rollback()
                lock = None

        await coordinate_expiry(activate_task(), observe, release, 8)
        async with db.begin():
            if await snapshot(db) != ready:
                raise ProbeError('expiry_changed_state')
    finally:
        try:
            if lock is not None:
                await lock.rollback()
        finally:
            if admin is not None:
                try:
                    await admin.close(timeout=5)
                except BaseException:
                    admin.terminate()
                    raise


async def verify_privileges(admin):
    """Check effective privileges, including PUBLIC, memberships and columns."""
    tables = await admin.fetch("""SELECT n.nspname, c.relname,
        has_table_privilege('pymentor_app', c.oid, 'SELECT'),
        has_table_privilege('pymentor_app', c.oid, 'INSERT'),
        has_table_privilege('pymentor_app', c.oid, 'UPDATE'),
        has_table_privilege('pymentor_app', c.oid, 'DELETE'),
        has_table_privilege('pymentor_app', c.oid, 'TRUNCATE'),
        has_table_privilege('pymentor_app', c.oid, 'REFERENCES'),
        has_table_privilege('pymentor_app', c.oid, 'TRIGGER')
        FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
        WHERE n.nspname IN ('public', 'c435_lab') AND c.relkind IN ('r','p','v','m','f')""")
    expected = {('public', 'users'): (True, False, False, False, False, False, False),
                ('public', 'sessions'): (True, True, False, True, False, False, False),
                ('c435_lab', 'pending'): (True, True, False, False, False, False, False),
                ('c435_lab', 'owner_generation'): (True, False, False, False, False, False, False),
                ('c435_lab', 'logout_operations'): (True, True, False, False, False, False, False)}
    seen = set()
    for row in tables:
        schema, name, *privileges = row
        key = (schema, name)
        seen.add(key)
        if tuple(privileges) != expected.get(key, (False,) * 7):
            raise ProbeError('table_privileges_invalid')
    if not expected.keys() <= seen or ('public', 'admins') not in seen:
        raise ProbeError('privilege_objects_missing')
    columns = await admin.fetch("""SELECT n.nspname, c.relname, a.attname,
        has_column_privilege('pymentor_app', c.oid, a.attnum, 'SELECT'),
        has_column_privilege('pymentor_app', c.oid, a.attnum, 'INSERT'),
        has_column_privilege('pymentor_app', c.oid, a.attnum, 'UPDATE'),
        has_column_privilege('pymentor_app', c.oid, a.attnum, 'REFERENCES')
        FROM pg_catalog.pg_attribute a JOIN pg_catalog.pg_class c ON c.oid=a.attrelid
        JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
        WHERE n.nspname IN ('public', 'c435_lab') AND c.relkind IN ('r','p','v','m','f')
          AND a.attnum > 0 AND NOT a.attisdropped""")
    updates = {('public', 'users', 'id'), ('public', 'sessions', 'id'),
               ('c435_lab', 'pending', 'status'), ('c435_lab', 'owner_generation', 'generation')}
    seen_updates = set()
    for schema, table, column, select, insert, update, references in columns:
        key = (schema, table)
        column_key = (schema, table, column)
        table_rights = expected.get(key, (False,) * 7)
        if (select, insert, update, references) != (table_rights[0], table_rights[1], column_key in updates, False):
            raise ProbeError('column_privileges_invalid')
        if column_key in updates:
            seen_updates.add(column_key)
    if seen_updates != updates:
        raise ProbeError('privilege_columns_missing')
    sequences = await admin.fetch("""SELECT c.relname,
        has_sequence_privilege('pymentor_app', c.oid, 'USAGE'),
        has_sequence_privilege('pymentor_app', c.oid, 'SELECT'),
        has_sequence_privilege('pymentor_app', c.oid, 'UPDATE')
        FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
        WHERE n.nspname='public' AND c.relkind='S'""")
    if not any(row[0] == 'sessions_id_seq' for row in sequences):
        raise ProbeError('privilege_sequence_missing')
    for name, usage, select, update in sequences:
        if (usage, select, update) != ((True, True, False) if name == 'sessions_id_seq' else (False, False, False)):
            raise ProbeError('sequence_privileges_invalid')


async def _probe(run_id, connect):
    from sqlalchemy.engine import URL
    from sqlalchemy.ext.asyncio import create_async_engine
    from sqlalchemy.pool import NullPool
    from c435_concurrency_pg_probe import check_target

    admin = None
    preflight = None
    engine = None
    try:
        if not isinstance(run_id, str) or not target.RUN_ID.fullmatch(run_id):
            raise ProbeError('run_id_invalid')
        directory = target.lab._root() / run_id
        if not recovery._check_private_acl(directory):
            raise ProbeError('journal_acl_unverified')
        checked, state = target._check_lab(run_id)
        if checked != directory:
            raise ProbeError('lab_identity_invalid')
        # The target guard validates the fresh public schema using the migrator.
        preflight = await connect(host='127.0.0.1', port=target.lab.PORT, database=target.lab.DATABASE,
            user=target.lab.MIGRATOR, password=target.lab._read_secret(directory, 'migrator_password'),
            timeout=5, command_timeout=8, server_settings={'default_transaction_read_only': 'on'})
        await target._inspect_connection(preflight)
        await preflight.close(timeout=5)
        preflight = None
        admin = await connect(host='127.0.0.1', port=target.lab.PORT, database=target.lab.DATABASE,
            user=target.lab.ADMIN_ROLE, password=target.lab._read_secret(directory, 'bootstrap_password'),
            timeout=5, command_timeout=8, server_settings={'lock_timeout': '5s', 'statement_timeout': '8s'})
        await check_target(admin)
        if await admin.fetchval("SELECT EXISTS(SELECT 1 FROM pg_catalog.pg_namespace WHERE nspname='c435_lab')"):
            raise ProbeError('schema_exists')
        if await admin.fetchval("SELECT EXISTS(SELECT 1 FROM pg_catalog.pg_stat_activity WHERE datname=current_database() AND backend_type='client backend' AND pid<>pg_backend_pid())"):
            raise ProbeError('other_clients_present')
        target.lab._state_update(directory, state, PHASE)
        if not recovery._check_private_acl(directory):
            raise ProbeError('journal_acl_unverified')
        checked, journal = target.lab._load(run_id)
        names = target.lab._names(run_id)
        if (checked != directory or journal.get('phase') != PHASE or journal.get('run_id') != run_id
                or journal.get('names') != names or journal.get('database') != target.lab.DATABASE
                or journal.get('migrator') != target.lab.MIGRATOR or journal.get('port') != target.lab.PORT
                or journal.get('image') != target.lab.IMAGE):
            raise ProbeError('quarantine_unverified')
        target.lab._assert_volume(names['source_volume'])
        target.lab._assert_container(names['source_container'], names['source_volume'], directory, require_running=True)
        if (names['restore_container'] in target.lab._resource_names('container')
                or names['restore_volume'] in target.lab._resource_names('volume')):
            raise ProbeError('unexpected_restore')
        if await admin.fetchval("SELECT EXISTS(SELECT 1 FROM pg_catalog.pg_stat_activity WHERE datname=current_database() AND backend_type='client backend' AND pid<>pg_backend_pid())"):
            raise ProbeError('other_clients_present')
        async with admin.transaction():
            await admin.execute('ALTER ROLE pymentor_test NOLOGIN')
            await admin.execute('ALTER ROLE pymentor_app LOGIN CONNECTION LIMIT 1')
            await admin.execute('REVOKE ALL ON ALL TABLES IN SCHEMA public FROM pymentor_app')
            await admin.execute('REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM pymentor_app')
            await admin.execute('GRANT SELECT ON public.users, public.sessions TO pymentor_app')
            await admin.execute('GRANT UPDATE (id) ON public.users, public.sessions TO pymentor_app')
            await admin.execute('GRANT INSERT, DELETE ON public.sessions TO pymentor_app')
            await admin.execute('GRANT USAGE, SELECT ON public.sessions_id_seq TO pymentor_app')
            await admin.execute('CREATE SCHEMA c435_lab')
            await admin.execute('REVOKE ALL ON SCHEMA c435_lab FROM PUBLIC')
            await admin.execute('CREATE TABLE c435_lab.owner_generation (user_id integer PRIMARY KEY, generation bigint NOT NULL)')
            await admin.execute("CREATE TABLE c435_lab.pending (digest text UNIQUE NOT NULL, user_id integer NOT NULL, generation bigint NOT NULL, expires_at timestamptz NOT NULL, status text NOT NULL CHECK (status IN ('pending','active','revoked')))")
            await admin.execute('CREATE TABLE c435_lab.logout_operations (operation_id text PRIMARY KEY, user_id integer NOT NULL, generation_before bigint NOT NULL, generation_after bigint NOT NULL)')
            await admin.execute('GRANT USAGE ON SCHEMA c435_lab TO pymentor_app')
            await admin.execute('GRANT SELECT ON c435_lab.owner_generation TO pymentor_app')
            await admin.execute('GRANT UPDATE (generation) ON c435_lab.owner_generation TO pymentor_app')
            await admin.execute('GRANT SELECT, INSERT ON c435_lab.pending TO pymentor_app')
            await admin.execute('GRANT UPDATE (status) ON c435_lab.pending TO pymentor_app')
            await admin.execute('GRANT SELECT, INSERT ON c435_lab.logout_operations TO pymentor_app')
            roles = await admin.fetchrow("""SELECT
                (SELECT rolcanlogin AND NOT (rolsuper OR rolcreatedb OR rolcreaterole OR rolreplication OR rolbypassrls) AND rolconnlimit = 1 FROM pg_catalog.pg_roles WHERE rolname='pymentor_app'),
                (SELECT NOT rolcanlogin FROM pg_catalog.pg_roles WHERE rolname='pymentor_test'),
                pg_has_role('pymentor_app', 'pymentor_test', 'MEMBER'),
                has_schema_privilege('pymentor_app', 'public', 'CREATE'),
                has_schema_privilege('pymentor_app', 'c435_lab', 'CREATE'),
                has_schema_privilege('pymentor_app', 'public', 'USAGE'),
                has_schema_privilege('pymentor_app', 'c435_lab', 'USAGE')""")
            if tuple(roles) != (True, True, False, False, False, True, True):
                raise ProbeError('role_isolation_invalid')
            await verify_privileges(admin)
            now = await admin.fetchval('SELECT clock_timestamp()')
            expiry = now + timedelta(hours=1)
            await admin.execute("INSERT INTO public.users (id, username, email, password_hash, is_admin) VALUES ($1, 'c435_synthetic', 'c435@example.invalid', '!synthetic-disabled!', false)", USER_ID)
            await admin.execute('INSERT INTO c435_lab.owner_generation VALUES ($1, 0)', USER_ID)
            for i, digest in enumerate(DIGESTS[:3]):
                await admin.execute('INSERT INTO public.sessions (user_id, session_token, created_at) VALUES ($1, $2, $3)', USER_ID, digest, now - timedelta(minutes=3-i))
                await admin.execute("INSERT INTO c435_lab.pending VALUES ($1, $2, 0, $3, 'active')", digest, USER_ID, expiry)
        await admin.close(timeout=5)
        admin = None
        url = URL.create('postgresql+asyncpg', username=target.lab.APP_ROLE,
            password=target.lab._read_secret(directory, 'app_password'), host='127.0.0.1',
            port=target.lab.PORT, database=target.lab.DATABASE)
        engine = create_async_engine(url, poolclass=NullPool, hide_parameters=True,
            connect_args={'timeout': 5, 'command_timeout': 16,
                          'server_settings': {'lock_timeout': '12s', 'statement_timeout': '15s'}})
        await experiment(engine, expiry, connect, directory)
    finally:
        try:
            if engine is not None:
                await engine.dispose()
        finally:
            close_failed = False
            for conn in (admin, preflight):
                if conn is not None:
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
            await asyncio.wait_for(_probe(run_id, connect), timeout=90)
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
        print('BLOCKED: synthetic probe failed or cancelled; preserve quarantine', file=sys.stderr)
        return 2
    print('PASS: synthetic prepare, activation, expiry during lock wait, logout replay/rollback and revoke verified; lab quarantined.')
    print('LIMITATION: client snapshots do not isolate against admin; Redis, cookies, concurrent writers and long-term tombstones are not proven.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
