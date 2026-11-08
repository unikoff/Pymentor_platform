"""One-shot synthetic commit/reconciliation experiment for a disposable C232 lab.

No runtime imports this file. It deliberately excludes sessions, does not run
workers and is not an importer or release procedure. It commits test data and
must leave the target quarantined. The owner must validate lab/source first.
"""

import asyncio
from copy import deepcopy
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
import tools.migration.c232_source_guard as source_guard
import tools.migration.c232_target_guard as guard
from tools.lab.storage.c232_compare import compare_rows
from tools.lab.storage.c232_mapping import TABLE_MAPPINGS
from tools.lab.storage.c232_mapping import TABLE_ORDER
from tools.lab.storage.c232_mapping import convert_row
from tools.lab.storage.c232_preflight import MAX_ROWS_PER_TABLE
from tools.lab.storage.c232_preflight import preflight
from tools.lab.storage.c232_sequence_plan import next_restart_value

MARKER_SCHEMA = "c232_lab_control"
MARKER_TABLE = "c232_lab_control.import_marker"
MARKER_DIGEST = source_guard.PINNED_SYNTHETIC_SHA256
MARKER_VERSION = "synthetic_without_sessions_v1"
DATA_TABLES = tuple(
    sorted(
        (
            *TABLE_ORDER,
            "session_import_markers",
            "login_operations",
            "account_lifecycles",
            "booking_notification_subjects",
            "account_deletion_events",
            "account_deletion_redis_keys",
        )
    )
)


def marker_identity(digest, version):
    """Validate a lab marker identity without establishing source provenance."""
    digest = MARKER_DIGEST if digest is None else digest
    version = MARKER_VERSION if version is None else version
    if (
        type(digest) is not str
        or re.fullmatch(r"[0-9a-f]{64}", digest) is None
        or type(version) is not str
        or re.fullmatch(r"[a-z0-9_]{1,80}", version) is None
    ):
        raise ValueError("marker_identity_invalid")
    return digest, version


class InjectedBeforeCommit(Exception):
    pass


class SimulatedLostAcknowledgement(Exception):
    pass


class CommitConnectionLost(Exception):
    def __init__(self, backend_pid, driver_result):
        self.backend_pid = backend_pid
        self.driver_result = driver_result
        super().__init__("commit_connection_lost")


class DropConnectionAtCommit:
    """Terminate while the client commit task is pending; send is unobserved."""

    def __init__(self, connection, backend_pid):
        self.connection = connection
        self.backend_pid = backend_pid
        self.transaction = connection.transaction()

    async def __aenter__(self):
        return await self.transaction.__aenter__()

    async def __aexit__(self, exc_type, exc, tb):
        if exc_type is not None:
            return await self.transaction.__aexit__(exc_type, exc, tb)
        task = asyncio.create_task(self.transaction.__aexit__(None, None, None))
        await asyncio.sleep(0)
        if task.done():
            await task
            raise RuntimeError("commit_completed_before_injection")
        self.connection.terminate()
        try:
            await asyncio.wait_for(task, 5)
        except TimeoutError:
            raise RuntimeError("commit_task_timeout") from None
        except Exception:
            driver_result = "driver_error"
        else:
            driver_result = "driver_success"
        raise CommitConnectionLost(self.backend_pid, driver_result)


async def connect(directory, role, secret):
    import asyncpg

    return await asyncpg.connect(
        host="127.0.0.1",
        port=guard.lab.PORT,
        database=guard.lab.DATABASE,
        user=role,
        password=guard.lab._read_secret(directory, secret),
        timeout=5,
    )


async def bootstrap(directory):
    admin = await connect(directory, guard.lab.ADMIN_ROLE, "bootstrap_password")
    try:
        other_clients = await admin.fetchval("""SELECT count(*) FROM pg_stat_activity
            WHERE datname=current_database() AND backend_type='client backend' AND pid<>pg_backend_pid()""")
        if other_clients:
            raise RuntimeError("other_clients_active")
        if await admin.fetchval(
            "SELECT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname=$1)", MARKER_SCHEMA
        ):
            raise RuntimeError("control_already_exists")
        # Only this disposable lab: disable the app login and limit migrator
        # to one connection before creating the marker schema. The lab is
        # quarantined after this one-shot experiment, even on failure.
        await admin.execute("ALTER ROLE pymentor_app NOLOGIN")
        await admin.execute("ALTER ROLE pymentor_test CONNECTION LIMIT 1")
        await admin.execute(
            "CREATE SCHEMA c232_lab_control AUTHORIZATION pymentor_test"
        )
        owner = await connect(directory, guard.lab.MIGRATOR, "migrator_password")
        try:
            async with owner.transaction():
                await owner.execute(
                    "REVOKE ALL ON SCHEMA c232_lab_control FROM PUBLIC, pymentor_app"
                )
                await owner.execute("""CREATE TABLE c232_lab_control.import_marker (
                    singleton boolean PRIMARY KEY CHECK (singleton),
                    snapshot_digest text NOT NULL, transform_version text NOT NULL
                )""")
                await owner.execute(
                    "GRANT USAGE ON SCHEMA c232_lab_control TO pymentor_app"
                )
                await owner.execute(
                    "GRANT SELECT ON c232_lab_control.import_marker TO pymentor_app"
                )
        finally:
            await owner.close()
    finally:
        await admin.close()


async def lock_and_check(connection):
    await connection.execute("SET LOCAL lock_timeout = '3s'")
    await connection.execute("SET LOCAL statement_timeout = '30s'")
    await connection.execute("SELECT pg_advisory_xact_lock($1)", 0x43323332)
    tables = ", ".join([f'public."{table}"' for table in DATA_TABLES] + [MARKER_TABLE])
    await connection.execute(f"LOCK TABLE {tables} IN SHARE ROW EXCLUSIVE MODE")
    identity = await connection.fetchrow("SELECT current_database(), current_user")
    if tuple(identity) != (guard.lab.DATABASE, guard.lab.MIGRATOR):
        raise RuntimeError("database_identity_mismatch")
    acl = await connection.fetchrow("""SELECT
        has_schema_privilege('pymentor_app', 'c232_lab_control', 'USAGE'),
        has_schema_privilege('pymentor_app', 'c232_lab_control', 'CREATE'),
        has_table_privilege('pymentor_app', 'c232_lab_control.import_marker', 'SELECT'),
        has_table_privilege('pymentor_app', 'c232_lab_control.import_marker', 'INSERT'),
        has_table_privilege('pymentor_app', 'c232_lab_control.import_marker', 'UPDATE'),
        has_table_privilege('pymentor_app', 'c232_lab_control.import_marker', 'DELETE'),
        pg_has_role('pymentor_app', 'pymentor_test', 'MEMBER')""")
    if tuple(acl) != (True, False, True, False, False, False, False):
        raise RuntimeError("marker_acl_invalid")
    roles = await connection.fetchrow("""SELECT
        (SELECT rolcanlogin FROM pg_roles WHERE rolname='pymentor_app'),
        (SELECT rolconnlimit FROM pg_roles WHERE rolname='pymentor_test')""")
    if tuple(roles) != (False, 1):
        raise RuntimeError("lab_exclusivity_invalid")


async def fetch_target(connection):
    result = {}
    for table in TABLE_ORDER:
        names = ", ".join(
            f'"{column.name}"' for column in TABLE_MAPPINGS[table].columns
        )
        rows = await connection.fetch(
            f'SELECT {names} FROM public."{table}" LIMIT $1', MAX_ROWS_PER_TABLE + 1
        )
        if len(rows) > MAX_ROWS_PER_TABLE:
            raise RuntimeError("target_table_too_large")
        result[table] = [dict(row) for row in rows]
    return result


async def sequence_states(connection, source, *, restart):
    for table in TABLE_ORDER:
        if not any(
            column.name == "id" and column.kind == "integer"
            for column in TABLE_MAPPINGS[table].columns
        ):
            continue
        sequence = f"{table}_id_seq"
        if (
            await connection.fetchval(
                "SELECT pg_get_serial_sequence($1, $2)", "public." + table, "id"
            )
            != "public." + sequence
        ):
            raise RuntimeError("sequence_identity_mismatch")
        metadata = await connection.fetchrow(
            """SELECT sequenceowner, min_value, max_value,
            increment_by, cycle, cache_size FROM pg_catalog.pg_sequences
            WHERE schemaname='public' AND sequencename=$1""",
            sequence,
        )
        if metadata is None or metadata["sequenceowner"] != guard.lab.MIGRATOR:
            raise RuntimeError("sequence_owner_mismatch")
        state = await connection.fetchrow(
            f'SELECT last_value, is_called FROM public."{sequence}"'
        )
        ids = [row["id"] for row in source[table]]
        max_id = max(ids) if ids else None
        candidate = next_restart_value(
            last_value=state["last_value"],
            is_called=state["is_called"],
            max_id=max_id,
            increment=metadata["increment_by"],
            minimum=metadata["min_value"],
            maximum=metadata["max_value"],
            cache=metadata["cache_size"],
            cycle=metadata["cycle"],
        )
        if restart:
            await connection.execute(
                f'ALTER SEQUENCE public."{sequence}" RESTART WITH {candidate}'
            )
        elif state["is_called"] or state["last_value"] != candidate:
            raise RuntimeError("sequence_state_mismatch")


async def capture_sequences(connection):
    result = {}
    for table in TABLE_ORDER:
        if any(
            column.name == "id" and column.kind == "integer"
            for column in TABLE_MAPPINGS[table].columns
        ):
            sequence = f"{table}_id_seq"
            result[sequence] = tuple(
                await connection.fetchrow(
                    f'SELECT last_value, is_called FROM public."{sequence}"'
                )
            )
    return result


async def insert_and_commit(
    directory, source, *, inject=None, marker_digest=None, marker_version=None
):
    marker_digest, marker_version = marker_identity(marker_digest, marker_version)
    if inject not in (None, "before_commit", "after_commit", "connection_drop"):
        raise ValueError("fault_mode_invalid")
    connection = await connect(directory, guard.lab.MIGRATOR, "migrator_password")
    try:
        backend_pid = await connection.fetchval("SELECT pg_backend_pid()")
        transaction = (
            DropConnectionAtCommit(connection, backend_pid)
            if inject == "connection_drop"
            else connection.transaction()
        )
        async with transaction:
            other_clients = await connection.fetchval("""SELECT count(*) FROM pg_stat_activity
                WHERE datname=current_database() AND backend_type='client backend' AND pid<>pg_backend_pid()""")
            if other_clients:
                raise RuntimeError("other_clients_active")
            await lock_and_check(connection)
            marker = await connection.fetch(
                f"SELECT singleton, snapshot_digest, transform_version FROM {MARKER_TABLE}"
            )
            if marker:
                if len(marker) != 1 or tuple(marker[0]) != (
                    True,
                    marker_digest,
                    marker_version,
                ):
                    raise RuntimeError("marker_mismatch")
                compare_rows(source, await fetch_target(connection))
                if await connection.fetchval(
                    "SELECT EXISTS (SELECT 1 FROM public.session_import_markers)"
                ):
                    raise RuntimeError("session_marker_not_empty")
                await sequence_states(connection, source, restart=False)
                return "already_complete"
            for table in DATA_TABLES:
                if await connection.fetchval(
                    f'SELECT EXISTS (SELECT 1 FROM public."{table}")'
                ):
                    raise RuntimeError("target_not_empty")
            for table in TABLE_ORDER:
                cols = [column.name for column in TABLE_MAPPINGS[table].columns]
                names = ", ".join(f'"{col}"' for col in cols)
                params = ", ".join(f"${index}" for index in range(1, len(cols) + 1))
                rows = [convert_row(table, row) for row in source[table]]
                if rows:
                    await connection.executemany(
                        f'INSERT INTO public."{table}" ({names}) VALUES ({params})',
                        [tuple(row[col] for col in cols) for row in rows],
                    )
            compare_rows(source, await fetch_target(connection))
            await sequence_states(connection, source, restart=True)
            await connection.execute(
                f"INSERT INTO {MARKER_TABLE} VALUES (true, $1, $2)",
                marker_digest,
                marker_version,
            )
            if inject == "before_commit":
                raise InjectedBeforeCommit()
        if inject == "after_commit":
            # The transaction did commit; the caller deliberately discards
            # that knowledge. This simulates, but does not produce, a network
            # failure or an actually uncertain PostgreSQL commit outcome.
            raise SimulatedLostAcknowledgement()
        return "committed"
    finally:
        await connection.close()


async def reconcile(directory, source, *, marker_digest=None, marker_version=None):
    marker_digest, marker_version = marker_identity(marker_digest, marker_version)
    connection = await connect(directory, guard.lab.MIGRATOR, "migrator_password")
    try:
        async with connection.transaction():
            await lock_and_check(connection)
            marker = await connection.fetch(
                f"SELECT singleton, snapshot_digest, transform_version FROM {MARKER_TABLE}"
            )
            if len(marker) != 1 or tuple(marker[0]) != (
                True,
                marker_digest,
                marker_version,
            ):
                raise RuntimeError("marker_mismatch")
            compare_rows(source, await fetch_target(connection))
            if await connection.fetchval(
                "SELECT EXISTS (SELECT 1 FROM public.session_import_markers)"
            ):
                raise RuntimeError("session_marker_not_empty")
            await sequence_states(connection, source, restart=False)
    finally:
        await connection.close()


async def probe(run_id):
    with source_guard.open_synthetic_snapshot() as snapshot:
        source = {}
        for table in TABLE_ORDER:
            cursor = snapshot.connection.execute(
                f'SELECT * FROM "{table}" LIMIT ?', (MAX_ROWS_PER_TABLE + 1,)
            )
            columns = [column[0] for column in cursor.description]
            source[table] = [dict(zip(columns, row)) for row in cursor.fetchall()]
        if preflight(source)["sessions"] != 2:
            raise RuntimeError("synthetic_fixture_mismatch")
        source["sessions"] = []
        if sum(preflight(source).values()) != 19:
            raise RuntimeError("synthetic_fixture_mismatch")
    await guard.inspect(run_id)
    directory, _ = guard._check_lab(run_id)
    await bootstrap(directory)
    connection = await connect(directory, guard.lab.MIGRATOR, "migrator_password")
    try:
        async with connection.transaction():
            await lock_and_check(connection)
            original_sequences = await capture_sequences(connection)
    finally:
        await connection.close()
    try:
        await insert_and_commit(directory, source, inject="before_commit")
    except InjectedBeforeCommit:
        pass
    else:
        raise RuntimeError("fault_injection_failed")
    # A new connection checks the evidence of rollback before retrying.
    connection = await connect(directory, guard.lab.MIGRATOR, "migrator_password")
    try:
        async with connection.transaction():
            await lock_and_check(connection)
            if await connection.fetchval(
                f"SELECT EXISTS (SELECT 1 FROM {MARKER_TABLE})"
            ):
                raise RuntimeError("rollback_marker_not_empty")
            for table in DATA_TABLES:
                if await connection.fetchval(
                    f'SELECT EXISTS (SELECT 1 FROM public."{table}")'
                ):
                    raise RuntimeError("rollback_target_not_empty")
            if await capture_sequences(connection) != original_sequences:
                raise RuntimeError("rollback_sequences_changed")
    finally:
        await connection.close()
    try:
        await insert_and_commit(directory, source, inject="after_commit")
    except SimulatedLostAcknowledgement:
        pass
    else:
        raise RuntimeError("fault_injection_failed")
    # Reconcile the marker, all rows and sequence states before any retry.
    await reconcile(directory, source)
    if await insert_and_commit(directory, source) != "already_complete":
        raise RuntimeError("retry_did_not_recognize_commit")
    await reconcile(directory, source)
    altered_source = deepcopy(source)
    altered_source["users"][0]["username"] += "_different"
    try:
        await insert_and_commit(directory, altered_source)
    except ValueError:
        pass
    else:
        raise RuntimeError("altered_data_accepted")
    connection = await connect(directory, guard.lab.MIGRATOR, "migrator_password")
    try:
        await connection.execute(
            f"UPDATE {MARKER_TABLE} SET snapshot_digest='synthetic_mismatch'"
        )
    finally:
        await connection.close()
    try:
        try:
            await insert_and_commit(directory, source)
        except RuntimeError as exc:
            if str(exc) != "marker_mismatch":
                raise
        else:
            raise RuntimeError("altered_marker_accepted")
    finally:
        connection = await connect(directory, guard.lab.MIGRATOR, "migrator_password")
        try:
            await connection.execute(
                f"UPDATE {MARKER_TABLE} SET snapshot_digest=$1", MARKER_DIGEST
            )
        finally:
            await connection.close()
    await reconcile(directory, source)
    print(
        "PASS: rollback, simulated lost acknowledgment, idempotent retry and mismatch rejection; sessions excluded"
    )


if __name__ == "__main__":
    try:
        asyncio.run(probe(sys.argv[1]))
    except Exception:
        print(
            "BLOCKED: synthetic commit experiment failed or outcome unknown; quarantine lab"
        )
        raise SystemExit(2)
