"""Future one-shot standby SQL probe for a fresh synthetic C232 lab only.

Leaves the lab and volume quarantined. Client snapshots do not exclude an admin.
Authentication, Redis, cookies and security after lost HTTP are not tested.
"""

import argparse
import asyncio
from datetime import timedelta
from pathlib import Path
import sys

import tools.migration.c232_recovery_guard as recovery
import tools.migration.c232_target_guard as target
import tools.lab.c435_pending_sql_probe as pending
from tools.migration.c232_process_mutex import synthetic_lab_mutex

ROOT = Path(__file__).resolve().parents[4]
PHASE = "c435-standby-sql-quarantined"
USER = 435
SESSIONS = tuple(c * 64 for c in "def")
OP = "a" * 64
DIGEST = "b" * 64


class ProbeError(Exception):
    pass


def check_lab(run_id, phase):
    if not isinstance(run_id, str) or not target.RUN_ID.fullmatch(run_id):
        raise ProbeError("run_id_invalid")
    directory = target.lab._root() / run_id
    if not recovery._check_private_acl(directory):
        raise ProbeError("acl_invalid")
    checked, state = target.lab._load(run_id)
    names = target.lab._names(run_id)
    if (
        checked != directory
        or state.get("phase") != phase
        or state.get("run_id") != run_id
        or state.get("names") != names
        or state.get("database") != target.lab.DATABASE
        or state.get("migrator") != target.lab.MIGRATOR
        or state.get("app_role") != target.lab.APP_ROLE
        or state.get("port") != target.lab.PORT
        or state.get("image") != target.lab.IMAGE
    ):
        raise ProbeError("journal_invalid")
    target.lab._assert_volume(names["source_volume"])
    target.lab._assert_container(
        names["source_container"],
        names["source_volume"],
        directory,
        require_running=True,
    )
    if names["restore_container"] in target.lab._resource_names("container") or names[
        "restore_volume"
    ] in target.lab._resource_names("volume"):
        raise ProbeError("restore_present")
    return directory, state


async def identity_and_clients(conn):
    identity = tuple(
        await conn.fetchrow(
            "SELECT current_database(), current_user, inet_server_port()"
        )
    )
    if identity != (target.lab.DATABASE, target.lab.ADMIN_ROLE, 5432):
        raise ProbeError("identity_invalid")
    if await conn.fetchval(
        "SELECT EXISTS(SELECT 1 FROM pg_catalog.pg_stat_activity WHERE datname=current_database() AND backend_type='client backend' AND pid<>pg_backend_pid())"
    ):
        raise ProbeError("other_clients_present")


async def role_guard(admin):
    roles = await admin.fetchrow("""SELECT
        (SELECT rolcanlogin AND NOT (rolsuper OR rolcreatedb OR rolcreaterole OR rolreplication OR rolbypassrls) AND rolconnlimit=1 FROM pg_catalog.pg_roles WHERE rolname='pymentor_app'),
        (SELECT NOT rolcanlogin FROM pg_catalog.pg_roles WHERE rolname='pymentor_test'),
        pg_has_role('pymentor_app','pymentor_test','MEMBER'),
        has_schema_privilege('pymentor_app','public','CREATE'),
        has_schema_privilege('pymentor_app','c435_lab','CREATE'),
        has_schema_privilege('pymentor_app','public','USAGE'),
        has_schema_privilege('pymentor_app','c435_lab','USAGE')""")
    if tuple(roles) != (True, True, False, False, False, True, True):
        raise ProbeError("role_invalid")
    await pending.verify_privileges(admin)


async def provision(admin):
    async with admin.transaction():
        await admin.execute("""CREATE TABLE c435_lab.standby_operations (
            operation_id text PRIMARY KEY, user_id integer NOT NULL,
            digest text UNIQUE NOT NULL CHECK (digest ~ '^[0-9a-f]{64}$'),
            generation bigint NOT NULL, deadline timestamptz NOT NULL,
            status text NOT NULL CHECK (status IN ('switched','aborted','invalidated')),
            standby_id integer, standby_created_at timestamptz,
            standby_digest text CHECK (standby_digest ~ '^[0-9a-f]{64}$'),
            CHECK ((standby_id IS NULL AND standby_created_at IS NULL AND standby_digest IS NULL)
                OR (standby_id IS NOT NULL AND standby_created_at IS NOT NULL AND standby_digest IS NOT NULL)))""")
        await admin.execute(
            "CREATE UNIQUE INDEX ON c435_lab.standby_operations (user_id) WHERE status='switched'"
        )
        await admin.execute(
            "GRANT SELECT, INSERT ON c435_lab.standby_operations TO pymentor_app"
        )
        await admin.execute(
            "GRANT UPDATE (status) ON c435_lab.standby_operations TO pymentor_app"
        )
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
        if (
            tuple(rights) != (True, True, False, False, False, False, False)
            or {r[0] for r in cols if r[1]} != {"status"}
            or any(r[2] for r in cols)
        ):
            raise ProbeError("standby_privileges_invalid")


async def snapshot(db):
    from sqlalchemy import text

    sessions = (
        await db.execute(text("SELECT * FROM public.sessions ORDER BY id"))
    ).all()
    ops = (
        await db.execute(
            text(
                "SELECT operation_id,user_id,digest,generation,deadline,status,standby_id,standby_created_at,standby_digest FROM c435_lab.standby_operations ORDER BY operation_id"
            )
        )
    ).all()
    return tuple(map(tuple, sessions)), tuple(map(tuple, ops))


async def experiment(engine):
    from sqlalchemy import text
    from sqlalchemy.ext.asyncio import AsyncSession
    from tools.lab.session_models.c435_standby_sql import LabInvariantError
    from tools.lab.session_models.c435_standby_sql import switch_to_standby
    from tools.lab.session_models.c435_standby_sql import abort_unconfirmed
    from tools.lab.session_models.c435_standby_sql import invalidate_unrestorable
    from tools.lab.session_models.c435_standby_sql import sql_eligible
    from tools.lab.session_models.c435_pending_sql import logout_all

    async with AsyncSession(engine, expire_on_commit=False) as db:
        async with db.begin():
            ident = tuple(
                (
                    await db.execute(
                        text(
                            "SELECT current_database(), current_user, inet_server_port()"
                        )
                    )
                ).one()
            )
            others = (
                await db.execute(
                    text(
                        "SELECT EXISTS(SELECT 1 FROM pg_catalog.pg_stat_activity WHERE datname=current_database() AND backend_type='client backend' AND pid<>pg_backend_pid())"
                    )
                )
            ).scalar_one()
            users = (
                await db.execute(
                    text(
                        "SELECT id,username,email,password_hash,is_admin FROM public.users"
                    )
                )
            ).all()
            gen = (
                await db.execute(
                    text("SELECT user_id,generation FROM c435_lab.owner_generation")
                )
            ).all()
            if (
                ident != (target.lab.DATABASE, target.lab.APP_ROLE, 5432)
                or others
                or list(map(tuple, users))
                != [
                    (
                        USER,
                        "c435_synthetic",
                        "c435@example.invalid",
                        "!synthetic-disabled!",
                        False,
                    )
                ]
                or list(map(tuple, gen)) != [(USER, 2)]
                or await snapshot(db) != ((), ())
            ):
                raise ProbeError("initial_state_invalid")
            now = (await db.execute(text("SELECT clock_timestamp()"))).scalar_one()
            for i, digest in enumerate(SESSIONS):
                await db.execute(
                    text(
                        "INSERT INTO public.sessions (user_id,session_token,created_at) VALUES (:u,:d,:t)"
                    ),
                    {
                        "u": USER,
                        "d": digest,
                        "t": now - timedelta(minutes=2 if i < 2 else 1),
                    },
                )
                # Keep active markers for every digest, as the SQL experiment
                # requires; none reuse the revoked values from earlier probes.
                await db.execute(
                    text(
                        "INSERT INTO c435_lab.pending (digest,user_id,generation,expires_at,status) VALUES (:d,:u,2,:expiry,'active')"
                    ),
                    {"d": digest, "u": USER, "expiry": now + timedelta(hours=1)},
                )
            deadline = now + timedelta(minutes=5)
            # Each laboratory switch must refer to a real, unrevoked pending
            # candidate owned by this user and generation.
            for candidate in (DIGEST, "8" * 64, "9" * 64):
                await db.execute(
                    text(
                        "INSERT INTO c435_lab.pending (digest,user_id,generation,expires_at,status) VALUES (:d,:u,2,:expiry,'pending')"
                    ),
                    {"d": candidate, "u": USER, "expiry": deadline},
                )
        async with db.begin():
            before = await snapshot(db)
            rows = (
                await db.execute(
                    text(
                        "SELECT id,created_at,session_token FROM public.sessions ORDER BY created_at,id"
                    )
                )
            ).all()
            if (
                len(rows) != 3
                or rows[0][1] != rows[1][1]
                or rows[1][1] >= rows[2][1]
                or rows[0][0] >= rows[1][0]
                or tuple(r[2] for r in rows) != SESSIONS
            ):
                raise ProbeError("fixture_invalid")
            oldest = tuple(rows[0])
            if await sql_eligible(db, USER, oldest[2], 2) is not True:
                raise ProbeError("initial_eligibility_invalid")
            await switch_to_standby(db, USER, OP, DIGEST, 2, deadline)
        async with db.begin():
            switched = await snapshot(db)
            if switched != (
                before[0],
                ((OP, USER, DIGEST, 2, deadline, "switched", *oldest),),
            ):
                raise ProbeError("switch_invalid")
            if await sql_eligible(db, USER, oldest[2], 2) is not False:
                raise ProbeError("switched_eligibility_invalid")
        try:
            async with db.begin():
                await switch_to_standby(db, USER, OP, DIGEST, 2, deadline)
        except LabInvariantError as exc:
            if str(exc) != "operation or digest already used":
                raise ProbeError("switch_retry_unexpected_failure") from None
        else:
            raise ProbeError("switch_retry_accepted")
        async with db.begin():
            if await snapshot(db) != switched:
                raise ProbeError("switch_retry_changed_state")
        # Mismatches are introduced only inside rolled-back transactions.
        for mode in ("generation", "digest", "missing"):
            try:
                async with db.begin():
                    if mode != "generation":
                        await db.execute(
                            text(
                                "DELETE FROM public.sessions WHERE id=:id AND user_id=:u"
                            ),
                            {"id": oldest[0], "u": USER},
                        )
                        if mode == "digest":
                            await db.execute(
                                text(
                                    "INSERT INTO public.sessions (id,user_id,session_token,created_at) VALUES (:id,:u,:d,:t)"
                                ),
                                {
                                    "id": oldest[0],
                                    "u": USER,
                                    "d": "9" * 64,
                                    "t": oldest[1],
                                },
                            )
                    await abort_unconfirmed(
                        db, USER, OP, 3 if mode == "generation" else 2
                    )
                    raise ProbeError("mismatch_accepted")
            except LabInvariantError as exc:
                expected = (
                    "generation unavailable"
                    if mode == "generation"
                    else "standby unavailable"
                )
                if str(exc) != expected:
                    raise ProbeError("mismatch_unexpected_failure") from None
            async with db.begin():
                if await snapshot(db) != switched:
                    raise ProbeError("mismatch_changed_state")
        async with db.begin():
            if await abort_unconfirmed(db, USER, OP, 2) is not True:
                raise ProbeError("abort_invalid")
        async with db.begin():
            aborted = await snapshot(db)
            if aborted != (
                before[0],
                (switched[1][0][:5] + ("aborted",) + switched[1][0][6:],),
            ):
                raise ProbeError("abort_state_invalid")
            if await sql_eligible(db, USER, oldest[2], 2) is not True:
                raise ProbeError("aborted_eligibility_invalid")
            if await abort_unconfirmed(db, USER, OP, 2) is not False:
                raise ProbeError("abort_retry_invalid")
        async with db.begin():
            if await snapshot(db) != aborted:
                raise ProbeError("abort_retry_changed_state")
        # A removed synthetic standby must be terminally invalidated without
        # creating or restoring a session. It is not an authorization test.
        op_missing, candidate = "c" * 64, "8" * 64
        async with db.begin():
            await switch_to_standby(db, USER, op_missing, candidate, 2, deadline)
        async with db.begin():
            switched_missing = await snapshot(db)
            if switched_missing[0] != before[0] or not any(
                row[0] == op_missing and row[5] == "switched"
                for row in switched_missing[1]
            ):
                raise ProbeError("second_switch_invalid")
            deleted = await db.execute(
                text("DELETE FROM public.sessions WHERE id=:id AND user_id=:u"),
                {"id": oldest[0], "u": USER},
            )
            if deleted.rowcount != 1:
                raise ProbeError("synthetic_delete_invalid")
        async with db.begin():
            missing = await snapshot(db)
            if len(missing[0]) != 2 or not any(
                row[0] == op_missing and row[5] == "switched" for row in missing[1]
            ):
                raise ProbeError("missing_state_invalid")
            if await invalidate_unrestorable(db, USER, op_missing, 2) is not True:
                raise ProbeError("invalidation_invalid")
        async with db.begin():
            invalidated = await snapshot(db)
            if (
                invalidated[0] != missing[0]
                or not any(
                    row[0] == op_missing and row[5] == "invalidated"
                    for row in invalidated[1]
                )
                or await invalidate_unrestorable(db, USER, op_missing, 2) is not False
            ):
                raise ProbeError("invalidation_retry_invalid")
        # Refill the fake set, then simulate a changed generation while the
        # prior standby row still exists: it must stay SQL-ineligible and must
        # not count as a live candidate for the next replacement.
        refill = "0" * 64
        async with db.begin():
            now = (await db.execute(text("SELECT clock_timestamp()"))).scalar_one()
            await db.execute(
                text(
                    "INSERT INTO public.sessions (user_id,session_token,created_at) VALUES (:u,:d,:t)"
                ),
                {"u": USER, "d": refill, "t": now},
            )
            await db.execute(
                text(
                    "INSERT INTO c435_lab.pending (digest,user_id,generation,expires_at,status) VALUES (:d,:u,2,:expiry,'active')"
                ),
                {"d": refill, "u": USER, "expiry": deadline},
            )
        op_stale, next_digest = "d" * 64, "9" * 64
        async with db.begin():
            await switch_to_standby(db, USER, op_stale, next_digest, 2, deadline)
        async with db.begin():
            stale_state = await snapshot(db)
            stale_row = next(row for row in stale_state[1] if row[0] == op_stale)
            if stale_row[6] is None:
                raise ProbeError("stale_standby_missing")
            await db.execute(
                text(
                    "UPDATE c435_lab.owner_generation SET generation=3 WHERE user_id=:u AND generation=2"
                ),
                {"u": USER},
            )
            if await invalidate_unrestorable(db, USER, op_stale, 3) is not True:
                raise ProbeError("stale_invalidation_invalid")
            if await sql_eligible(db, USER, stale_row[8], 3) is not False:
                raise ProbeError("invalidated_eligibility_invalid")
        # Two eligible sessions remain, despite three physical rows.
        op_new, digest_new = "7a" * 32, "8a" * 32
        async with db.begin():
            await db.execute(
                text(
                    "INSERT INTO c435_lab.pending (digest,user_id,generation,expires_at,status) VALUES (:d,:u,3,:expiry,'pending')"
                ),
                {"d": digest_new, "u": USER, "expiry": deadline},
            )
            await switch_to_standby(db, USER, op_new, digest_new, 3, deadline)
        async with db.begin():
            new_state = await snapshot(db)
            new_row = next(row for row in new_state[1] if row[0] == op_new)
            if new_row[6] is not None:
                raise ProbeError("invalidated_counted_as_active")
            if await logout_all(db, USER, "e" * 64) is not True:
                raise ProbeError("synthetic_logout_invalid")
        async with db.begin():
            if await invalidate_unrestorable(db, USER, op_new, 4) is not True:
                raise ProbeError("stale_invalidation_invalid")
        async with db.begin():
            final = await snapshot(db)
            if (
                final[0]
                or not any(
                    row[0] == op_stale and row[5] == "invalidated" for row in final[1]
                )
                or not any(
                    row[0] == op_new and row[5] == "invalidated" for row in final[1]
                )
            ):
                raise ProbeError("stale_invalidation_changed_sessions")


async def _probe(run_id, connect):
    from sqlalchemy.engine import URL
    from sqlalchemy.ext.asyncio import create_async_engine
    from sqlalchemy.pool import NullPool

    await pending._probe(run_id, connect)
    directory, state = check_lab(run_id, pending.PHASE)
    admin = None
    engine = None
    try:
        admin = await connect(
            host="127.0.0.1",
            port=target.lab.PORT,
            database=target.lab.DATABASE,
            user=target.lab.ADMIN_ROLE,
            password=target.lab._read_secret(directory, "bootstrap_password"),
            timeout=5,
            command_timeout=8,
            server_settings={"lock_timeout": "5s", "statement_timeout": "8s"},
        )
        await identity_and_clients(admin)
        await role_guard(admin)
        target.lab._state_update(directory, state, PHASE)
        check_lab(run_id, PHASE)
        await identity_and_clients(admin)
        await provision(admin)
        await admin.close(timeout=5)
        admin = None
        url = URL.create(
            "postgresql+asyncpg",
            username=target.lab.APP_ROLE,
            password=target.lab._read_secret(directory, "app_password"),
            host="127.0.0.1",
            port=target.lab.PORT,
            database=target.lab.DATABASE,
        )
        engine = create_async_engine(
            url,
            poolclass=NullPool,
            hide_parameters=True,
            connect_args={
                "timeout": 5,
                "command_timeout": 8,
                "server_settings": {"lock_timeout": "5s", "statement_timeout": "8s"},
            },
        )
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
                    raise ProbeError("close_failed") from None


async def probe(run_id):
    try:
        import asyncpg

        with synthetic_lab_mutex(run_id):
            await asyncio.wait_for(_probe(run_id, asyncpg.connect), timeout=150)
    except Exception:
        raise ProbeError("probe_failed") from None


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("run_id")
    args = parser.parse_args(argv)
    try:
        asyncio.run(probe(args.run_id))
    except (ProbeError, KeyboardInterrupt):
        print(
            "BLOCKED: synthetic probe failed or cancelled; preserve quarantine",
            file=sys.stderr,
        )
        return 2
    print(
        "PASS: synthetic standby switch, abort and unrestorable-state invalidation observed; lab quarantined."
    )
    print(
        "LIMITATION: auth, Redis, cookies, lost HTTP security and administrator isolation are not verified."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
