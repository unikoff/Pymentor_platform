"""Read-only target preflight for a disposable C232 PostgreSQL lab.

This guard validates the target snapshot only. It cannot establish writer
quiescence; repeat checks under the actual import transaction's locks.
"""

from __future__ import annotations

import argparse
import asyncio
import importlib.util
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any

_lab_spec = importlib.util.spec_from_file_location(
    "c225_local_pg_lab",
    Path(__file__).resolve().parent.parent / "lab" / "c225_local_pg_lab.py",
)
lab = importlib.util.module_from_spec(_lab_spec)
_lab_spec.loader.exec_module(lab)

RUN_ID = re.compile(r"c232-[0-9a-f]{12}\Z", re.ASCII)
EXPECTED_REVISION = "c426_deletion_outbox"
EXPECTED_TABLES = frozenset(
    {
        "admins",
        "booking_notification_delivery_state",
        "booking_notification_outbox",
        "booking_quotas",
        "booking_reminders",
        "booking_slots",
        "landing_notification_delivery_state",
        "landing_notification_outbox",
        "landing_telegram_configs",
        "landings",
        "sessions",
        "user_activity_days",
        "user_lesson_progress",
        "user_task_progress",
        "users",
    }
)
EXTRA_TABLES = {
    "session_import_markers",
    "login_operations",
    "account_lifecycles",
    "booking_notification_subjects",
    "account_deletion_events",
    "account_deletion_redis_keys",
    "alembic_version",
}


class TargetGuardError(Exception):
    """Safe category-only failure; never embeds driver or database details."""

    def __init__(self, category: str):
        self.category = category
        super().__init__(category)


@dataclass(frozen=True, repr=False)
class TargetReport:
    table_count: int
    revision: str
    complete_constraints_verified: bool = False
    writer_absence_proven: bool = False
    import_recheck_required: bool = True


def _check_lab(run_id: str) -> tuple[Any, Any]:
    if not isinstance(run_id, str) or not RUN_ID.fullmatch(run_id):
        raise TargetGuardError("run_id_invalid")
    try:
        directory, state = lab._load(run_id)
        if state.get("phase") != "migrated":
            raise TargetGuardError("lab_phase_invalid")
        names = lab._names(run_id)
        if state.get("names") != names or state.get("run_id") != run_id:
            raise TargetGuardError("journal_identity_invalid")
        if (
            state.get("database") != lab.DATABASE
            or state.get("migrator") != lab.MIGRATOR
        ):
            raise TargetGuardError("journal_identity_invalid")
        if state.get("port") != lab.PORT or state.get("image") != lab.IMAGE:
            raise TargetGuardError("journal_identity_invalid")
        lab._assert_volume(names["source_volume"])
        container = lab._assert_container(
            names["source_container"],
            names["source_volume"],
            directory,
            require_running=True,
        )
        if names["restore_container"] in lab._resource_names("container"):
            raise TargetGuardError("unexpected_restore_container")
        if names["restore_volume"] in lab._resource_names("volume"):
            raise TargetGuardError("unexpected_restore_volume")
        return directory, state
    except TargetGuardError:
        raise
    except Exception:
        raise TargetGuardError("lab_identity_unverified") from None


async def _inspect_connection(connection: Any) -> TargetReport:
    try:
        async with connection.transaction(isolation="repeatable_read", readonly=True):
            # Docker validates the host binding separately; PostgreSQL sees its
            # container address, which is not generally the host's loopback IP.
            identity = await connection.fetchrow(
                "SELECT current_database() AS db, current_user AS role, inet_server_port() AS port"
            )
            if (identity["db"], identity["role"], identity["port"]) != (
                lab.DATABASE,
                lab.MIGRATOR,
                5432,
            ):
                raise TargetGuardError("database_identity_mismatch")
            revision = await connection.fetchval(
                "SELECT version_num FROM public.alembic_version"
            )
            if revision != EXPECTED_REVISION:
                raise TargetGuardError("revision_mismatch")
            rows = await connection.fetch(
                "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'"
            )
            tables = {row["tablename"] for row in rows}
            if tables != set(EXPECTED_TABLES) | EXTRA_TABLES:
                raise TargetGuardError("table_set_mismatch")
            for table in sorted(
                set(EXPECTED_TABLES) | (EXTRA_TABLES - {"alembic_version"})
            ):
                # Names come only from fixed constants, never caller input.
                if await connection.fetchval(
                    f'SELECT EXISTS (SELECT 1 FROM public."{table}" LIMIT 1)'
                ):
                    raise TargetGuardError("table_not_empty")
            constraints = await connection.fetch(
                """
                SELECT c.contype::text AS contype FROM pg_catalog.pg_constraint c
                JOIN pg_catalog.pg_class t ON t.oid = c.conrelid
                JOIN pg_catalog.pg_namespace n ON n.oid = t.relnamespace
                WHERE n.nspname = 'public' AND t.relname = ANY($1::text[])
            """,
                sorted(set(EXPECTED_TABLES) | {"session_import_markers"}),
            )
            kinds = {row["contype"] for row in constraints}
            if not {"p", "f", "u"}.issubset(kinds):
                raise TargetGuardError("constraints_missing")
            return TargetReport(len(EXPECTED_TABLES), revision)
    except TargetGuardError:
        raise
    except Exception:
        raise TargetGuardError("database_check_failed") from None


async def inspect(run_id: str, *, connect=None) -> TargetReport:
    directory, _state = _check_lab(run_id)
    try:
        password = lab._read_secret(directory, "migrator_password")
    except Exception:
        raise TargetGuardError("private_secret_unavailable") from None
    try:
        if connect is None:
            import asyncpg

            connect = asyncpg.connect
        connection = await connect(
            host="127.0.0.1",
            port=lab.PORT,
            database=lab.DATABASE,
            user=lab.MIGRATOR,
            password=password,
            timeout=5,
            server_settings={"default_transaction_read_only": "on"},
        )
    except Exception:
        raise TargetGuardError("database_connect_failed") from None
    try:
        return await _inspect_connection(connection)
    finally:
        try:
            await connection.close()
        except Exception:
            pass


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("run_id")
    args = parser.parse_args(argv)
    try:
        report = asyncio.run(inspect(args.run_id))
        print(
            f"PASS: target snapshot checked; {report.table_count} expected tables empty; revision {report.revision}."
        )
        print(
            "LIMITATION: per-table constraints, writer absence and import exclusion are not fully verified; recheck under actual import locks."
        )
        return 0
    except TargetGuardError as exc:
        print(f"BLOCKED: {exc.category}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
