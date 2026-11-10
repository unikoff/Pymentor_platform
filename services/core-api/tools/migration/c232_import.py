"""Offline C2.3.2 importer restricted to a disposable local PostgreSQL lab.

SQL rows and markers are imported together. Redis session projection and outbox
delivery reconciliation are intentionally unfinished; this is not a release tool.
"""

import argparse
import asyncio
import hashlib
import json
import os
import subprocess
import sys
from collections import defaultdict
from datetime import timedelta
from pathlib import Path
from uuid import uuid4

import tools.lab.c232_commit_probe as old
import tools.migration.c232_dry_run as dry_run
import tools.migration.c232_recovery_guard as recovery
import tools.migration.c232_source_reader as source_reader
from tools.migration.c232_import_transaction import import_transaction
from tools.migration.c232_process_mutex import synthetic_lab_mutex
from tools.lab.storage.c232_import_types import to_timestamp
from tools.lab.storage.c232_outbox_audit import audit_outboxes
from tools.lab.storage.c232_snapshot import read_local_snapshot
from pymentor_core.adapters.redis.sessions import RedisSessionStore
from pymentor_core.adapters.postgres.async_database import AsyncDatabase
from pymentor_core.adapters.postgres.identity_sessions import AsyncIdentitySessions
from pymentor_core.adapters.postgres.identity_sessions import SESSION_TTL_SECONDS
from pymentor_core.adapters.postgres.legacy_sessions import LegacySession
from tools.migration.c232_session_importer import verify_redis_expiries
from tools.lab.c232_sessions_e2e_probe import verify_redis
from sqlalchemy.engine import URL

PHASE = "c232-import-quarantined"
SAFE_ERRORS = frozenset(
    {
        "source_outside_synthetic_area",
        "source_identity_not_synthetic",
        "source_missing",
        "schema_invalid",
        "schema_type_invalid",
        "schema_nullability_invalid",
        "foreign_key_schema_invalid",
        "foreign_key_invalid",
        "row_limit_exceeded",
        "row_invalid",
        "duplicate_key",
        "snapshot_invalid",
        "snapshot_unreadable",
        "target_not_empty",
        "marker_mismatch",
        "session_markers_mismatch",
        "outbox_review_mismatch",
        "review_arguments_invalid",
        "review_record_missing",
        "outbox_record_missing",
        "review_conflict",
        "outbox_status_changed",
        "session_projection_incomplete",
        "review_limit_exceeded",
        "sessions_incompatible",
        "outbox_invalid",
        "target_check_failed",
        "source_check_failed",
        "local_copy_required",
        "local_copy_directory_unverified",
        "local_copy_not_standalone",
        "utc_mode_requires_local_copy",
        "source_table_set_invalid",
        "source_table_rows_invalid",
        "source_row_limit_exceeded",
        "source_value_invalid",
        "source_duplicate_key",
        "source_foreign_key_invalid",
        "table_set_invalid",
        "table_rows_invalid",
        "Invalid table set",
        "Invalid table rows",
        "Table row limit exceeded",
        "Invalid row",
        "Duplicate key",
        "Foreign key violation",
    }
)


def checked_lab(run_id):
    lab = old.guard.lab
    if not old.guard.RUN_ID.fullmatch(run_id):
        raise ValueError("run_id_invalid")
    expected = lab._root() / run_id
    if not recovery._check_private_acl(expected):
        raise ValueError("journal_acl_unverified")
    directory, state = lab._load(run_id)
    names = lab._names(run_id)
    if (
        directory != expected
        or state.get("phase") != PHASE
        or state.get("run_id") != run_id
        or state.get("names") != names
        or state.get("database") != lab.DATABASE
        or state.get("migrator") != lab.MIGRATOR
        or state.get("port") != lab.PORT
        or state.get("image") != lab.IMAGE
    ):
        raise ValueError("lab_identity_invalid")
    lab._assert_volume(names["source_volume"])
    lab._assert_container(
        names["source_container"],
        names["source_volume"],
        directory,
        require_running=True,
    )
    if names["restore_container"] in lab._resource_names("container") or names[
        "restore_volume"
    ] in lab._resource_names("volume"):
        raise ValueError("restore_present")
    return directory


def private_copy_acl(directory, source):
    if os.name != "nt":
        return False
    executable = (
        Path(os.environ.get("SystemRoot", r"C:\Windows"))
        / "System32"
        / "WindowsPowerShell"
        / "v1.0"
        / "powershell.exe"
    )
    environment = os.environ.copy()
    environment["PSModulePath"] = str(executable.parent / "Modules")
    try:
        result = subprocess.run(
            [
                str(executable),
                "-NoProfile",
                "-NonInteractive",
                "-ExecutionPolicy",
                "Bypass",
                "-File",
                str(Path(__file__).with_name("c232_copy_acl.ps1")),
                "-Directory",
                str(directory),
                "-Source",
                str(source),
            ],
            capture_output=True,
            text=True,
            timeout=10,
            env=environment,
            creationflags=subprocess.CREATE_NO_WINDOW,
        )
        return result.returncode == 0 and result.stdout.strip() == "OK"
    except (OSError, subprocess.SubprocessError):
        return False


def load_source(source_path, *, allow_local_copy=False, assume_naive_utc=False):
    if assume_naive_utc and not allow_local_copy:
        raise ValueError("utc_mode_requires_local_copy")
    if source_path is None:
        if allow_local_copy:
            raise ValueError("local_copy_required")
        with old.source_guard.open_synthetic_snapshot() as snapshot:
            tables = source_reader.read_snapshot(snapshot.connection)
        return tables, old.source_guard.PINNED_SYNTHETIC_SHA256
    # A user copy must be separately prepared in an ACL-protected directory.
    # Never accept the live SQLite path or a link to it.
    root = (
        old.ROOT / "output" / "c232-local-copy-sandbox" / "inputs"
        if allow_local_copy
        else old.source_guard.CLI_SANDBOX / "inputs"
    )
    candidate = Path(source_path)
    if (
        not candidate.is_absolute()
        or old.source_guard._has_reparse_or_symlink(candidate)
        or not candidate.resolve().is_relative_to(root.resolve())
    ):
        raise ValueError("source_outside_synthetic_area")
    if allow_local_copy:
        if not private_copy_acl(root, candidate):
            raise ValueError("local_copy_directory_unverified")
        if os.stat(candidate, follow_symlinks=False).st_nlink != 1:
            raise ValueError("local_copy_not_standalone")
        if any(
            Path(str(candidate) + suffix).exists()
            for suffix in ("-wal", "-shm", "-journal")
        ):
            raise ValueError("local_copy_not_standalone")
    snapshot = read_local_snapshot(candidate, assume_naive_utc=assume_naive_utc)
    if not allow_local_copy:
        for row in snapshot.tables["users"] + snapshot.tables["admins"]:
            username, email = row["username"], row["email"]
            if (
                "synthetic" not in username.casefold()
                or "@" not in email
                or email.rsplit("@", 1)[1].casefold()
                not in old.source_guard.RESERVED_EMAIL_DOMAINS
            ):
                raise ValueError("source_identity_not_synthetic")
    digest = snapshot.identity
    if assume_naive_utc:
        digest = hashlib.sha256(
            bytes.fromhex(digest) + b":legacy-naive-utc-v1"
        ).hexdigest()
    return snapshot.tables, digest


async def inspect_selected(
    run_id, source_path, *, allow_local_copy=False, assume_naive_utc=False
):
    tables, _ = load_source(
        source_path,
        allow_local_copy=allow_local_copy,
        assume_naive_utc=assume_naive_utc,
    )
    target, now = await dry_run.inspect_target(run_id)
    outbox, session_count = dry_run.audit_source(tables, now)
    return {
        "status": "read_only_rehearsal",
        "source_table_count": len(tables),
        "source_row_count": sum(len(rows) for rows in tables.values()),
        "target_table_count": target.table_count,
        "session_count": session_count,
        "timestamp_policy": "legacy_naive_as_utc"
        if assume_naive_utc
        else "explicit_offsets_required",
        "outbox": outbox,
        "limitations": [
            "local_prepared_copy_only"
            if allow_local_copy
            else "synthetic_fixture_only",
            "target_requires_recheck_under_import_locks",
            "not_release_ready",
        ],
    }


async def apply(
    run_id, source_path=None, *, allow_local_copy=False, assume_naive_utc=False
):
    lab = old.guard.lab
    tables, snapshot_digest = load_source(
        source_path,
        allow_local_copy=allow_local_copy,
        assume_naive_utc=assume_naive_utc,
    )
    if not old.guard.RUN_ID.fullmatch(run_id):
        raise ValueError("run_id_invalid")
    expected = lab._root() / run_id
    if not recovery._check_private_acl(expected):
        raise ValueError("journal_acl_unverified")
    directory, state = lab._load(run_id)
    if state.get("phase") == "migrated":
        await old.guard.inspect(run_id)
        directory, state = old.guard._check_lab(run_id)
        lab._state_update(
            directory, state, PHASE, redis_prefix=f"pymentor-c216-test:{uuid4()}:"
        )
        await old.bootstrap(directory)
    directory = checked_lab(run_id)
    connection = await old.connect(directory, lab.MIGRATOR, "migrator_password")
    try:
        result = await import_transaction(connection, tables, snapshot_digest)
    finally:
        await connection.close()
    _, state = lab._load(run_id)
    prefix = state.get("redis_prefix")
    if not isinstance(prefix, str) or not recovery.PREFIX.fullmatch(prefix):
        raise ValueError("redis_prefix_invalid")
    await project_sessions(directory, tables["sessions"], prefix)
    lab._state_update(directory, state, PHASE, sessions_projected=True)
    return {
        "status": result,
        "tables": len(tables),
        "rows": sum(len(rows) for rows in tables.values()),
        "timestamp_policy": "legacy_naive_as_utc"
        if assume_naive_utc
        else "explicit_offsets_required",
        "outbox": audit_outboxes(
            {
                name: tables[name]
                for name in (
                    "booking_notification_outbox",
                    "landing_notification_outbox",
                )
            }
        ),
        "limitations": [
            "local_prepared_copy_only"
            if allow_local_copy
            else "synthetic_fixture_only",
            "outbox_reconciliation_pending",
            "not_release_ready",
        ],
    }


async def project_sessions(directory, rows, prefix):
    """Restore the isolated test projection only while app writers are disabled."""
    if not rows:
        return
    verify_redis()
    grouped = defaultdict(list)
    for row in rows:
        grouped[row["user_id"]].append(
            LegacySession(row["session_token"], to_timestamp(row["created_at"]))
        )
    store = RedisSessionStore(
        "redis://127.0.0.1:57146/0", prefix=prefix, socket_timeout=2
    )
    lab = old.guard.lab
    password = lab._read_secret(directory, "migrator_password")
    url = URL.create(
        "postgresql+asyncpg",
        username=lab.MIGRATOR,
        password=password,
        host="127.0.0.1",
        port=lab.PORT,
        database=lab.DATABASE,
    )
    database = AsyncDatabase(
        url,
        pool_size=1,
        max_overflow=0,
        pool_timeout=3,
        connect_timeout=3,
        command_timeout=5,
    )
    try:
        service = AsyncIdentitySessions(database, store)
        for user_id, candidates in sorted(grouped.items()):
            projection = [
                (
                    item.token,
                    int(
                        (
                            item.created_at + timedelta(seconds=SESSION_TTL_SECONDS)
                        ).timestamp()
                        * 1000
                    ),
                )
                for item in candidates
            ]
            await store.add_user_sessions(user_id, projection)
            for candidate in candidates:
                if (await service.authenticate(candidate.token)).user_id != user_id:
                    raise ValueError("session_authentication_mismatch")
            await verify_redis_expiries(store, candidates)
    finally:
        await store.close()
        await database.dispose()


async def inspect_outbox(run_id, *, include_records=False):
    """Report imported queue states; this never authorizes starting a worker."""
    lab = old.guard.lab
    directory = checked_lab(run_id)
    connection = await old.connect(directory, lab.MIGRATOR, "migrator_password")
    try:
        async with connection.transaction(readonly=True):
            identity = await connection.fetchrow(
                "SELECT current_database(), current_user"
            )
            app_login = await connection.fetchval(
                "SELECT rolcanlogin FROM pg_roles WHERE rolname='pymentor_app'"
            )
            if (
                tuple(identity) != (lab.DATABASE, lab.MIGRATOR)
                or app_login is not False
            ):
                raise ValueError("lab_identity_invalid")
            queues = {}
            for table in ("booking_notification_outbox", "landing_notification_outbox"):
                rows = await connection.fetch(
                    f'SELECT status FROM public."{table}" LIMIT 10001'
                )
                queues[table] = [dict(row) for row in rows]
            counts = audit_outboxes(queues)
            rows = await connection.fetch("""SELECT review.queue, review.row_id, review.reviewed, review.decision,
                    CASE review.queue WHEN 'booking_notification_outbox' THEN booking.status
                         WHEN 'landing_notification_outbox' THEN landing.status END AS status
                    FROM c232_lab_control.outbox_review AS review
                    LEFT JOIN public.booking_notification_outbox AS booking
                        ON review.queue='booking_notification_outbox' AND booking.id=review.row_id
                    LEFT JOIN public.landing_notification_outbox AS landing
                        ON review.queue='landing_notification_outbox' AND landing.id=review.row_id
                    ORDER BY review.queue, review.row_id LIMIT 20001""")
            if len(rows) > 20000:
                raise ValueError("review_limit_exceeded")
            reviews = [dict(row) for row in rows]
    finally:
        await connection.close()
    unresolved = sum(
        not row["reviewed"]
        or row["status"] in ("pending", "processing")
        or (row["reviewed"] and row["decision"] == "suppress" and row["status"] is None)
        or (
            row["status"] is not None
            and row["reviewed"]
            and row["status"]
            != ("sent" if row["decision"] == "delivered" else "failed")
        )
        for row in reviews
    )
    result = {
        "status": "review_required" if unresolved else "no_unreviewed_records",
        "outbox": {
            "sent_records": counts["sent_records"],
            "non_sent_records": counts["requires_review"],
        },
        "unresolved_review_count": unresolved,
        "worker_start_authorized": False,
    }
    if include_records:
        result["review_records"] = reviews
    return result


async def resolve_outbox(
    run_id,
    source_path,
    queue,
    row_id,
    decision,
    *,
    allow_local_copy=False,
    assume_naive_utc=False,
):
    """Record an explicit human decision; never send or retry a notification."""
    if (
        queue not in ("booking_notification_outbox", "landing_notification_outbox")
        or type(row_id) is not int
        or row_id < 1
        or decision not in ("delivered", "suppress")
    ):
        raise ValueError("review_arguments_invalid")
    _, digest = load_source(
        source_path,
        allow_local_copy=allow_local_copy,
        assume_naive_utc=assume_naive_utc,
    )
    directory = checked_lab(run_id)
    _, state = old.guard.lab._load(run_id)
    if state.get("sessions_projected") is not True:
        raise ValueError("session_projection_incomplete")
    connection = await old.connect(
        directory, old.guard.lab.MIGRATOR, "migrator_password"
    )
    try:
        async with connection.transaction():
            await old.lock_and_check(connection)
            marker = await connection.fetch(
                f"SELECT singleton, snapshot_digest, transform_version FROM {old.MARKER_TABLE}"
            )
            if len(marker) != 1 or tuple(marker[0]) != (
                True,
                digest,
                "offline_all_tables_v1",
            ):
                raise ValueError("marker_mismatch")
            review = await connection.fetchrow(
                "SELECT reviewed, decision FROM c232_lab_control.outbox_review "
                "WHERE queue=$1 AND row_id=$2 FOR UPDATE",
                queue,
                row_id,
            )
            if review is None:
                raise ValueError("review_record_missing")
            row = await connection.fetchrow(
                f'SELECT status FROM public."{queue}" WHERE id=$1 FOR UPDATE', row_id
            )
            if row is None:
                raise ValueError("outbox_record_missing")
            desired = "sent" if decision == "delivered" else "failed"
            if review["reviewed"]:
                if review["decision"] != decision or row["status"] != desired:
                    raise ValueError("review_conflict")
                return {
                    "status": "already_reviewed",
                    "queue": queue,
                    "row_id": row_id,
                    "decision": decision,
                }
            if row["status"] not in ("pending", "processing", "failed"):
                raise ValueError("outbox_status_changed")
            result = await connection.execute(
                f'UPDATE public."{queue}" SET status=$1, locked_until=NULL, '
                "lock_token=NULL WHERE id=$2",
                desired,
                row_id,
            )
            if result != "UPDATE 1":
                raise ValueError("outbox_update_failed")
            result = await connection.execute(
                "UPDATE c232_lab_control.outbox_review "
                "SET reviewed=true, decision=$1, reviewed_at=clock_timestamp() "
                "WHERE queue=$2 AND row_id=$3 AND NOT reviewed",
                decision,
                queue,
                row_id,
            )
            if result != "UPDATE 1":
                raise ValueError("review_update_failed")
    finally:
        await connection.close()
    return {
        "status": "reviewed",
        "queue": queue,
        "row_id": row_id,
        "decision": decision,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    source_mode = parser.add_mutually_exclusive_group(required=True)
    source_mode.add_argument("--synthetic-only", action="store_true")
    source_mode.add_argument("--local-copy", action="store_true")
    parser.add_argument(
        "--legacy-naive-utc",
        action="store_true",
        help="explicitly interpret timezone-less legacy timestamps as UTC",
    )
    parser.add_argument(
        "--source",
        help="explicit prepared SQLite copy inside its designated input directory",
    )
    parser.add_argument(
        "--queue",
        choices=("booking_notification_outbox", "landing_notification_outbox"),
    )
    parser.add_argument("--row-id", type=int)
    parser.add_argument("--decision", choices=("delivered", "suppress"))
    parser.add_argument(
        "action",
        choices=("dry-run", "apply", "check-outbox", "list-outbox", "resolve-outbox"),
    )
    parser.add_argument("run_id")
    args = parser.parse_args()
    try:
        if args.legacy_naive_utc and not args.local_copy:
            raise ValueError("utc_mode_requires_local_copy")
        with synthetic_lab_mutex(args.run_id):
            operation = (
                inspect_selected(
                    args.run_id,
                    args.source,
                    allow_local_copy=args.local_copy,
                    assume_naive_utc=args.legacy_naive_utc,
                )
                if args.action == "dry-run"
                else inspect_outbox(
                    args.run_id, include_records=args.action == "list-outbox"
                )
                if args.action in ("check-outbox", "list-outbox")
                else resolve_outbox(
                    args.run_id,
                    args.source,
                    args.queue,
                    args.row_id,
                    args.decision,
                    allow_local_copy=args.local_copy,
                    assume_naive_utc=args.legacy_naive_utc,
                )
                if args.action == "resolve-outbox"
                else apply(
                    args.run_id,
                    args.source,
                    allow_local_copy=args.local_copy,
                    assume_naive_utc=args.legacy_naive_utc,
                )
            )
            result = asyncio.run(operation)
    except Exception as error:
        # Exceptions may contain source values, SQL or credentials. Only this
        # closed list is safe to expose to the operator.
        message = str(error)
        category = message if message in SAFE_ERRORS else "import_unavailable"
        print(json.dumps({"status": "rejected", "category": category}))
        return 1
    print(json.dumps(result, sort_keys=True))
    return 1 if result["status"] == "review_required" else 0


if __name__ == "__main__":
    raise SystemExit(main())
