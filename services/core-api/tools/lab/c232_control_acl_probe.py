"""Test a synthetic control schema and its backup/restore ACL on a C232 lab.

This commits test DDL and consumes the lab's one-shot backup/restore workflow.
It is an experiment, not a migrator or production backup procedure.
"""

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import asyncpg
import tools.migration.c232_target_guard as guard


async def verify_app_cannot_write(directory):
    app = await asyncpg.connect(
        host="127.0.0.1",
        port=guard.lab.PORT,
        database=guard.lab.DATABASE,
        user=guard.lab.APP_ROLE,
        password=guard.lab._read_secret(directory, "app_password"),
        timeout=5,
    )
    try:
        if (
            await app.fetchval("SELECT count(*) FROM c232_lab_control.import_marker")
            != 1
        ):
            raise RuntimeError("marker_unreadable")
        if await app.fetchval(
            "SELECT pg_has_role(current_user, 'pymentor_test', 'MEMBER')"
        ):
            raise RuntimeError("app_is_migrator_member")
        for statement in (
            "INSERT INTO c232_lab_control.import_marker VALUES (false, 'synthetic')",
            "UPDATE c232_lab_control.import_marker SET snapshot_digest='synthetic2'",
            "DELETE FROM c232_lab_control.import_marker",
            "CREATE TABLE c232_lab_control.should_be_denied (id integer)",
            "SET ROLE pymentor_test",
        ):
            try:
                await app.execute(statement)
            except asyncpg.exceptions.InsufficientPrivilegeError:
                continue
            raise RuntimeError("unexpected_app_privilege")
    finally:
        await app.close()


async def create_control(run_id):
    await guard.inspect(run_id)
    directory, _ = guard._check_lab(run_id)
    common = dict(
        host="127.0.0.1", port=guard.lab.PORT, database=guard.lab.DATABASE, timeout=5
    )
    admin = await asyncpg.connect(
        **common,
        user=guard.lab.ADMIN_ROLE,
        password=guard.lab._read_secret(directory, "bootstrap_password"),
    )
    owner = await asyncpg.connect(
        **common,
        user=guard.lab.MIGRATOR,
        password=guard.lab._read_secret(directory, "migrator_password"),
    )
    try:
        # This C225 lab does not grant CREATE on the database. The probe
        # temporarily grants it only to this lab's migrator for bootstrap.
        await admin.execute("GRANT CREATE ON DATABASE pymentor_test TO pymentor_test")
        if await owner.fetchval(
            "SELECT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname='c232_lab_control')"
        ):
            raise RuntimeError("unexpected_control_schema")
        async with owner.transaction():
            await owner.execute("CREATE SCHEMA c232_lab_control")
            await owner.execute(
                "REVOKE ALL ON SCHEMA c232_lab_control FROM PUBLIC, pymentor_app"
            )
            await owner.execute("""CREATE TABLE c232_lab_control.import_marker (
                singleton boolean PRIMARY KEY CHECK (singleton), snapshot_digest text NOT NULL
            )""")
            await owner.execute(
                "INSERT INTO c232_lab_control.import_marker VALUES (true, 'synthetic')"
            )
            await owner.execute(
                "GRANT USAGE ON SCHEMA c232_lab_control TO pymentor_app"
            )
            await owner.execute(
                "GRANT SELECT ON c232_lab_control.import_marker TO pymentor_app"
            )
        await owner.execute(
            "GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO pymentor_app"
        )
        access = await owner.fetchrow("""SELECT
            has_schema_privilege('pymentor_app', 'c232_lab_control', 'USAGE') AS usage,
            has_table_privilege('pymentor_app', 'c232_lab_control.import_marker', 'SELECT') AS readable,
            has_table_privilege('pymentor_app', 'c232_lab_control.import_marker', 'UPDATE') AS writable""")
        if tuple(access) != (True, True, False):
            raise RuntimeError("source_acl_invalid")
        await verify_app_cannot_write(directory)
    finally:
        await owner.close()
        await admin.execute(
            "REVOKE CREATE ON DATABASE pymentor_test FROM pymentor_test"
        )
        await admin.close()


async def inspect_restore(run_id):
    directory, state = guard.lab._load(run_id)
    if state["phase"] != "restore-created":
        raise RuntimeError("restore_phase_invalid")
    guard.lab._assert_volume(state["names"]["restore_volume"])
    guard.lab._assert_container(
        state["names"]["restore_container"],
        state["names"]["restore_volume"],
        directory,
        require_running=True,
    )
    common = dict(
        host="127.0.0.1", port=guard.lab.PORT, database=guard.lab.DATABASE, timeout=5
    )
    admin = await asyncpg.connect(
        **common,
        user=guard.lab.ADMIN_ROLE,
        password=guard.lab._read_secret(directory, "bootstrap_password"),
    )
    owner = await asyncpg.connect(
        **common,
        user=guard.lab.MIGRATOR,
        password=guard.lab._read_secret(directory, "migrator_password"),
    )
    try:
        if (
            await owner.fetchval("SELECT count(*) FROM c232_lab_control.import_marker")
            != 1
        ):
            raise RuntimeError("marker_not_restored")
        before = await owner.fetchrow("""SELECT
            has_schema_privilege('pymentor_app', 'c232_lab_control', 'USAGE') AS usage,
            has_table_privilege('pymentor_app', 'c232_lab_control.import_marker', 'SELECT') AS readable,
            has_table_privilege('pymentor_app', 'c232_lab_control.import_marker', 'UPDATE') AS writable""")
        if tuple(before) != (False, False, False):
            raise RuntimeError("unexpected_restored_acl")
        await owner.execute("GRANT USAGE ON SCHEMA c232_lab_control TO pymentor_app")
        await owner.execute(
            "GRANT SELECT ON c232_lab_control.import_marker TO pymentor_app"
        )
        after = await owner.fetchrow("""SELECT
            has_schema_privilege('pymentor_app', 'c232_lab_control', 'USAGE') AS usage,
            has_table_privilege('pymentor_app', 'c232_lab_control.import_marker', 'SELECT') AS readable,
            has_table_privilege('pymentor_app', 'c232_lab_control.import_marker', 'UPDATE') AS writable""")
        if tuple(after) != (True, True, False):
            raise RuntimeError("restored_acl_invalid")
        await verify_app_cannot_write(directory)
    finally:
        await owner.close()
        await admin.execute(
            "REVOKE CREATE ON DATABASE pymentor_test FROM pymentor_test"
        )
        await admin.close()


def main(run_id):
    asyncio.run(create_control(run_id))
    guard.lab.backup(run_id)
    # The stock restore lacks database CREATE for the migrator. Extend only
    # this process's disposable restore bootstrap; never alter the lab helper.
    original_role_sql = guard.lab._role_sql
    guard.lab._role_sql = lambda directory: (
        original_role_sql(directory)
        + "\nGRANT CREATE ON DATABASE pymentor_test TO pymentor_test;\n"
    )
    guard.lab.restore(run_id)
    asyncio.run(inspect_restore(run_id))
    print(
        "PASS: synthetic control marker backed up and restored with temporary CREATE; read-only app grants reapplied"
    )


if __name__ == "__main__":
    try:
        main(sys.argv[1])
    except Exception:
        print("BLOCKED: control ACL/restore experiment failed; lab requires inspection")
        raise SystemExit(2)
