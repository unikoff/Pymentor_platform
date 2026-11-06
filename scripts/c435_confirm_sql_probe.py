"""One-shot confirm probe for a fresh synthetic C232 PostgreSQL lab.

The existing lab must already be running. The probe leaves it quarantined;
it does not establish authentication, Redis, cookie or commit-time guarantees.
"""
import argparse
import asyncio
from datetime import timedelta
import sys

import c435_pending_sql_probe as pending
import c435_standby_sql_probe as standby
from c232_process_mutex import synthetic_lab_mutex

target = standby.target
ProbeError = standby.ProbeError
PHASE = 'c435-confirm-sql-quarantined'
USER = standby.USER
SESSIONS = standby.SESSIONS
OP = standby.OP
DIGEST = standby.DIGEST


async def provision(admin):
    async with admin.transaction():
        await admin.execute("""CREATE TABLE c435_lab.standby_operations (
            operation_id text PRIMARY KEY, user_id integer NOT NULL,
            digest text UNIQUE NOT NULL CHECK (digest ~ '^[0-9a-f]{64}$'),
            generation bigint NOT NULL, deadline timestamptz NOT NULL,
            status text NOT NULL CHECK (status IN ('switched','confirmed','aborted','invalidated')),
            standby_id integer, standby_created_at timestamptz,
            standby_digest text CHECK (standby_digest ~ '^[0-9a-f]{64}$'),
            candidate_id integer, candidate_created_at timestamptz,
            CHECK ((standby_id IS NULL AND standby_created_at IS NULL AND standby_digest IS NULL)
                OR (standby_id IS NOT NULL AND standby_created_at IS NOT NULL AND standby_digest IS NOT NULL)),
            CHECK ((candidate_id IS NULL AND candidate_created_at IS NULL)
                OR (candidate_id IS NOT NULL AND candidate_created_at IS NOT NULL)))""")
        await admin.execute("CREATE UNIQUE INDEX ON c435_lab.standby_operations (user_id) WHERE status='switched'")
        await admin.execute('GRANT SELECT, INSERT ON c435_lab.standby_operations TO pymentor_app')
        await admin.execute('GRANT UPDATE (status, candidate_id, candidate_created_at) ON c435_lab.standby_operations TO pymentor_app')
        rights = await admin.fetchrow("""SELECT
            has_table_privilege('pymentor_app','c435_lab.standby_operations','SELECT'),
            has_table_privilege('pymentor_app','c435_lab.standby_operations','INSERT'),
            has_table_privilege('pymentor_app','c435_lab.standby_operations','UPDATE'),
            has_table_privilege('pymentor_app','c435_lab.standby_operations','DELETE'),
            has_table_privilege('pymentor_app','c435_lab.standby_operations','TRUNCATE'),
            has_table_privilege('pymentor_app','c435_lab.standby_operations','REFERENCES'),
            has_table_privilege('pymentor_app','c435_lab.standby_operations','TRIGGER')""")
        cols = await admin.fetch("""SELECT a.attname, has_column_privilege('pymentor_app', c.oid, a.attnum, 'UPDATE'),
            has_column_privilege('pymentor_app', c.oid, a.attnum, 'REFERENCES')
            FROM pg_catalog.pg_attribute a JOIN pg_catalog.pg_class c ON c.oid=a.attrelid
            JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
            WHERE n.nspname='c435_lab' AND c.relname='standby_operations' AND a.attnum>0 AND NOT a.attisdropped""")
        if (tuple(rights) != (True, True, False, False, False, False, False)
                or {r[0] for r in cols if r[1]} != {'status', 'candidate_id', 'candidate_created_at'}
                or any(r[2] for r in cols)):
            raise ProbeError('confirm_privileges_invalid')


async def snapshot(db):
    from sqlalchemy import text
    queries = (
        'SELECT * FROM public.sessions ORDER BY id',
        'SELECT * FROM c435_lab.pending ORDER BY digest',
        'SELECT * FROM c435_lab.standby_operations ORDER BY operation_id',
        'SELECT * FROM c435_lab.owner_generation ORDER BY user_id',
    )
    result = []
    for query in queries:
        result.append(tuple(map(tuple, (await db.execute(text(query))).all())))
    return tuple(result)


class InjectedFailure(Exception):
    pass


class InterceptDB:
    def __init__(self, db, mode):
        self.db, self.mode, self.fired = db, mode, False

    async def execute(self, statement, params=None):
        from sqlalchemy import text
        result = await self.db.execute(statement, params or {})
        sql = str(statement)
        if self.mode == 'delete' and sql.startswith('DELETE FROM public.sessions'):
            if result.rowcount != 1:
                raise ProbeError('injected_delete_invalid')
            self.fired = True
            raise InjectedFailure()
        if self.mode == 'expiry' and sql.startswith('UPDATE c435_lab.standby_operations SET status ='):
            self.fired = True
            await self.db.execute(text('SELECT pg_sleep(5)'))
        return result


async def experiment(engine):
    from sqlalchemy import text
    from sqlalchemy.ext.asyncio import AsyncSession
    from identity.c435_pending_sql import prepare, revoke
    from identity.c435_standby_sql import LabInvariantError, switch_to_standby, confirm_switch

    async def clock(db):
        return (await db.execute(text('SELECT clock_timestamp()'))).scalar_one()

    async with AsyncSession(engine, expire_on_commit=False) as db:
        async with db.begin():
            ident = tuple((await db.execute(text('SELECT current_database(), current_user, inet_server_port()'))).one())
            others = (await db.execute(text("SELECT EXISTS(SELECT 1 FROM pg_catalog.pg_stat_activity WHERE datname=current_database() AND backend_type='client backend' AND pid<>pg_backend_pid())"))).scalar_one()
            users = (await db.execute(text('SELECT id,username,email,password_hash,is_admin FROM public.users'))).all()
            generations = (await db.execute(text('SELECT user_id,generation FROM c435_lab.owner_generation'))).all()
            initial = await snapshot(db)
            if (ident != (target.lab.DATABASE, target.lab.APP_ROLE, 5432) or others
                    or list(map(tuple, users)) != [(USER, 'c435_synthetic', 'c435@example.invalid', '!synthetic-disabled!', False)]
                    or list(map(tuple, generations)) != [(USER, 2)] or initial[0] or initial[2]):
                raise ProbeError('initial_state_invalid')
            now = await clock(db)
            for i, digest in enumerate(SESSIONS):
                await db.execute(text('INSERT INTO public.sessions (user_id,session_token,created_at) VALUES (:u,:d,:t)'),
                                 {'u': USER, 'd': digest, 't': now - timedelta(minutes=2 if i < 2 else 1)})
                await db.execute(text("INSERT INTO c435_lab.pending (digest,user_id,generation,expires_at,status) VALUES (:d,:u,2,:expiry,'active')"),
                                 {'d': digest, 'u': USER, 'expiry': now + timedelta(hours=1)})
            rows = (await db.execute(text('SELECT id,created_at,session_token FROM public.sessions ORDER BY created_at,id'))).all()
            if (len(rows) != 3 or rows[0][1] != rows[1][1] or rows[0][0] >= rows[1][0]
                    or rows[1][1] >= rows[2][1] or tuple(r[2] for r in rows) != SESSIONS):
                raise ProbeError('fixture_invalid')
            oldest = tuple(rows[0])
        async with db.begin():
            fixture = await snapshot(db)

        # This scenario rolls back its short-lived marker as well as all writes.
        delayed = InterceptDB(db, 'expiry')
        expiry_ok = False
        try:
            async with db.begin():
                short_deadline = await clock(db) + timedelta(seconds=4)
                await prepare(db, USER, DIGEST, 2, short_deadline, clock)
                await switch_to_standby(db, USER, OP, DIGEST, 2, short_deadline)
                await confirm_switch(delayed, USER, OP, DIGEST, 2)
                raise InjectedFailure('expiry accepted')
        except LabInvariantError as exc:
            expiry_ok = delayed.fired and str(exc) == 'deadline or pending expired; rollback required'
        except Exception:
            pass
        async with db.begin():
            if await snapshot(db) != fixture:
                raise ProbeError('expiry_rollback_invalid')
            deadline = await clock(db) + timedelta(minutes=5)
            await prepare(db, USER, DIGEST, 2, deadline, clock)
            await switch_to_standby(db, USER, OP, DIGEST, 2, deadline)
        async with db.begin():
            switched = await snapshot(db)
            op = switched[2][0]
            if (len(switched[0]) != 3 or len(switched[2]) != 1
                    or op[:6] != (OP, USER, DIGEST, 2, deadline, 'switched')
                    or op[6:9] != oldest or op[9:] != (None, None)):
                raise ProbeError('switch_invalid')

        injected = InterceptDB(db, 'delete')
        try:
            async with db.begin():
                await confirm_switch(injected, USER, OP, DIGEST, 2)
        except InjectedFailure:
            pass
        else:
            raise ProbeError('failure_not_injected')
        async with db.begin():
            if not injected.fired or await snapshot(db) != switched:
                raise ProbeError('delete_rollback_invalid')

        # Changes in these negative cases are themselves rolled back.
        for mode in ('revoke', 'stale'):
            try:
                async with db.begin():
                    if mode == 'revoke':
                        await revoke(db, USER, DIGEST, clock)
                    else:
                        await db.execute(text('UPDATE c435_lab.owner_generation SET generation=3 WHERE user_id=:u'), {'u': USER})
                    await confirm_switch(db, USER, OP, DIGEST, 2)
                    raise InjectedFailure('negative case accepted')
            except LabInvariantError as exc:
                expected = 'pending unavailable' if mode == 'revoke' else 'generation unavailable'
                if str(exc) != expected:
                    raise ProbeError('negative_case_wrong_error') from None
            except InjectedFailure:
                raise ProbeError('negative_case_accepted')
            async with db.begin():
                if await snapshot(db) != switched:
                    raise ProbeError('negative_case_changed_state')

        async with db.begin():
            if await confirm_switch(db, USER, OP, DIGEST, 2) != 'confirmed':
                raise ProbeError('confirm_result_invalid')
        async with db.begin():
            confirmed = await snapshot(db)
            new_op = confirmed[2][0]
            candidate = [row for row in confirmed[0] if row[2] == DIGEST]
            expected_pending = tuple(row[:4] + ('active',) if row[0] == DIGEST else row for row in switched[1])
            if (len(confirmed[0]) != 3 or len(candidate) != 1
                    or candidate[0][1] != USER
                    or any(row[0] == oldest[0] for row in confirmed[0])
                    or tuple(row for row in confirmed[0] if row[0] != candidate[0][0]) != switched[0][1:]
                    or new_op[:5] != op[:5] or new_op[5] != 'confirmed' or new_op[6:9] != oldest
                    or new_op[9:] != (candidate[0][0], candidate[0][3])
                    or confirmed[1] != expected_pending or confirmed[3] != switched[3]):
                raise ProbeError('confirmed_state_invalid')
            if await confirm_switch(db, USER, OP, DIGEST, 2) != 'already_confirmed':
                raise ProbeError('retry_result_invalid')
        async with db.begin():
            if await snapshot(db) != confirmed:
                raise ProbeError('retry_changed_state')
        print('PASS: synthetic confirm, retry, delete rollback, revoke and stale generation.')
        if not expiry_ok:
            print('NOT VERIFIED: post-write expiry rollback scenario.', file=sys.stderr)
            raise ProbeError('expiry_case_not_verified')


async def _probe(run_id, connect):
    from sqlalchemy.engine import URL
    from sqlalchemy.ext.asyncio import create_async_engine
    from sqlalchemy.pool import NullPool

    await pending._probe(run_id, connect)
    directory, state = standby.check_lab(run_id, pending.PHASE)
    admin = engine = None
    try:
        admin = await connect(host='127.0.0.1', port=target.lab.PORT, database=target.lab.DATABASE,
            user=target.lab.ADMIN_ROLE, password=target.lab._read_secret(directory, 'bootstrap_password'),
            timeout=5, command_timeout=8, server_settings={'lock_timeout': '5s', 'statement_timeout': '8s'})
        await standby.identity_and_clients(admin)
        await standby.role_guard(admin)
        target.lab._state_update(directory, state, PHASE)
        standby.check_lab(run_id, PHASE)
        await standby.identity_and_clients(admin)
        await provision(admin)
        await admin.close(timeout=5)
        admin = None
        url = URL.create('postgresql+asyncpg', username=target.lab.APP_ROLE,
            password=target.lab._read_secret(directory, 'app_password'), host='127.0.0.1',
            port=target.lab.PORT, database=target.lab.DATABASE)
        engine = create_async_engine(url, poolclass=NullPool, hide_parameters=True,
            connect_args={'timeout': 5, 'command_timeout': 8, 'server_settings': {'lock_timeout': '5s', 'statement_timeout': '8s'}})
        await experiment(engine)
    finally:
        try:
            if engine is not None:
                await engine.dispose()
        finally:
            if admin is not None:
                try:
                    await admin.close(timeout=5)
                except BaseException:
                    admin.terminate()
                    raise ProbeError('close_failed') from None


async def probe(run_id):
    try:
        import asyncpg
        with synthetic_lab_mutex(run_id):
            await asyncio.wait_for(_probe(run_id, asyncpg.connect), timeout=150)
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
    print('PASS: post-write expiry rollback; lab quarantined.')
    print('LIMITATION: auth, Redis, cookies, commit-time deadline and administrator isolation are not verified.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
