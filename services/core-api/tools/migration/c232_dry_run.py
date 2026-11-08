"""Read-only rehearsal for the pinned synthetic source and fresh C232 lab.

This snapshot cannot prove writer freeze and does not authorize migration or
production use. No sessions, outbox records, or markers are written.
"""

from __future__ import annotations

import argparse
import asyncio
from collections import defaultdict
from datetime import datetime
from datetime import timedelta
from datetime import timezone
import json
from pathlib import Path
import sys

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[4]
import tools.migration.c232_recovery_guard as recovery_guard
import tools.migration.c232_source_reader as source_reader
import tools.migration.c232_target_guard as target_guard
from tools.lab.session_models.c232_session_compatibility import (
    require_compatible_legacy_sessions,
)
from pymentor_core.adapters.postgres.legacy_sessions import LegacySession
from tools.lab.storage.c232_import_types import to_timestamp
from tools.lab.storage.c232_outbox_audit import audit_outboxes


class DryRunError(Exception):
    """Fixed category only, without paths, row values, or credentials."""


async def inspect_target(run_id: str):
    """Check private ACL before the fresh-lab guard reads its journal."""
    try:
        if not isinstance(run_id, str) or not target_guard.RUN_ID.fullmatch(run_id):
            raise DryRunError("run_id_invalid")
        lab = target_guard.lab
        directory = lab._root() / run_id
        if not recovery_guard._check_private_acl(directory):
            raise DryRunError("journal_acl_unverified")
        checked_directory, _ = target_guard._check_lab(run_id)
        if checked_directory != directory:
            raise DryRunError("journal_identity_invalid")
        password = lab._read_secret(directory, "migrator_password")
        import asyncpg

        connection = await asyncpg.connect(
            host="127.0.0.1",
            port=lab.PORT,
            database=lab.DATABASE,
            user=lab.MIGRATOR,
            password=password,
            timeout=5,
            command_timeout=5,
            server_settings={
                "default_transaction_read_only": "on",
                "lock_timeout": "3s",
                "statement_timeout": "5s",
            },
        )
        try:
            target = await target_guard._inspect_connection(connection)
            async with connection.transaction(
                isolation="repeatable_read", readonly=True
            ):
                now = await connection.fetchval("SELECT clock_timestamp()")
        finally:
            await connection.close()
        if (
            type(now) is not datetime
            or now.tzinfo is None
            or now.utcoffset() != timedelta(0)
        ):
            raise DryRunError("sql_time_invalid")
        return target, now.astimezone(timezone.utc)
    except DryRunError:
        raise
    except Exception:
        raise DryRunError("target_check_failed") from None


def audit_source(tables, now):
    try:
        outboxes = audit_outboxes(
            {
                name: tables[name]
                for name in (
                    "booking_notification_outbox",
                    "landing_notification_outbox",
                )
            }
        )
    except Exception:
        raise DryRunError("outbox_invalid") from None
    try:
        groups = defaultdict(list)
        tokens = set()
        for row in tables["sessions"]:
            token = row["session_token"]
            if token in tokens:
                raise ValueError("duplicate")
            tokens.add(token)
            groups[row["user_id"]].append(
                LegacySession(token, to_timestamp(row["created_at"]))
            )
        # Validate SQL reference even when the fixture has no sessions.
        require_compatible_legacy_sessions([], as_of=now)
        for sessions in groups.values():
            require_compatible_legacy_sessions(sessions, as_of=now)
    except Exception:
        raise DryRunError("sessions_incompatible") from None
    return outboxes, sum(map(len, groups.values()))


async def inspect(run_id: str) -> dict:
    try:
        target, now = await inspect_target(run_id)
        tables = source_reader.load_pinned_source()
        outboxes, sessions = audit_source(tables, now)
        return {
            "status": "read_only_rehearsal",
            "source_table_count": len(tables),
            "source_row_count": sum(len(rows) for rows in tables.values()),
            "target_table_count": target.table_count,
            "session_count": sessions,
            "outbox": outboxes,
            "limitations": [
                "writers_not_proven_stopped",
                "target_requires_recheck_under_import_locks",
                "not_authorization_for_migration_or_production",
                "target_constraints_not_fully_verified",
                "outbox_sent_does_not_prove_delivery",
                "outbox_delivery_not_authorized",
                "session_compatibility_is_point_in_time",
                "docker_checks_not_time_bounded_by_this_script",
            ],
        }
    except DryRunError:
        raise
    except source_reader.SourceReadError as exc:
        known = frozenset(source_reader._PREFLIGHT_CATEGORIES.values())
        raise DryRunError(
            str(exc) if str(exc) in known else "source_check_failed"
        ) from None
    except Exception:
        raise DryRunError("source_check_failed") from None


class SafeArgumentParser(argparse.ArgumentParser):
    def error(self, message):
        print(json.dumps({"status": "rejected", "category": "cli_arguments_invalid"}))
        raise SystemExit(2)


def main(argv: list[str] | None = None) -> int:
    parser = SafeArgumentParser(description=__doc__)
    parser.add_argument("--synthetic-only", action="store_true", required=True)
    parser.add_argument("run_id")
    args = parser.parse_args(argv)
    try:
        result = asyncio.run(inspect(args.run_id))
    except DryRunError as exc:
        # Only categories created in this module reach this point.
        print(json.dumps({"status": "rejected", "category": str(exc)}, sort_keys=True))
        return 2
    except Exception:
        print(json.dumps({"status": "rejected", "category": "preflight_failed"}))
        return 2
    print(json.dumps(result, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
