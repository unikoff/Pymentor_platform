"""Read-only identity and schema preflight for a new resumable C232 lab.

This snapshot does not prove writer exclusion, source or data correctness,
TTL, or sequence safety. The ACL check is point-in-time and cannot prevent a
later change. The importer must check state under its own locks.
"""
from __future__ import annotations

import importlib.util
import os
import re
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any

_spec = importlib.util.spec_from_file_location("c232_recovery_target", Path(__file__).with_name("c232_target_guard.py"))
target = importlib.util.module_from_spec(_spec)
sys.modules[_spec.name] = target
_spec.loader.exec_module(target)

lab = target.lab
PREFIX = re.compile(r"pymentor-c216-test:[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}:\Z", re.ASCII)
CONTROL_SCHEMA = "c232_lab_control"
CONTROL_TABLES = frozenset({"import_marker", "session_operations"})


class RecoveryGuardError(Exception):
    """A category only, with no driver details, SQL or secrets."""

    def __init__(self, category: str):
        self.category = category
        super().__init__(category)


@dataclass(frozen=True)
class RecoveryReport:
    table_count: int = 15
    revision: str = target.EXPECTED_REVISION
    writers_proven: bool = False
    source_proven: bool = False
    data_proven: bool = False
    ttl_proven: bool = False
    sequence_proven: bool = False
    journal_acl_proven: bool = True
    import_lock_and_state_check_required: bool = True


def _check_private_acl(directory: Path) -> bool:
    """Snapshot-check Windows ACLs without printing paths, principals or secrets."""
    if os.name != 'nt':
        return False
    executable = Path(os.environ.get('SystemRoot', r'C:\Windows')) / 'System32' / 'WindowsPowerShell' / 'v1.0' / 'powershell.exe'
    script = Path(__file__).resolve().with_name('c232_private_acl.ps1')
    env = os.environ.copy()
    # Avoid loading PowerShell 7 modules into Windows PowerShell 5.1.
    env['PSModulePath'] = str(executable.parent / 'Modules')
    try:
        result = subprocess.run(
            [str(executable), '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass',
             '-File', str(script), '-LiteralDirectory', str(directory)],
            capture_output=True, text=True, timeout=10, creationflags=subprocess.CREATE_NO_WINDOW, env=env,
        )
        return result.returncode == 0 and result.stdout.strip() == 'OK'
    except (OSError, subprocess.SubprocessError):
        return False


def _check_lab(run_id: str) -> tuple[Any, Any]:
    if not isinstance(run_id, str) or not target.RUN_ID.fullmatch(run_id):
        raise RecoveryGuardError("run_id_invalid")
    try:
        expected_directory = lab._root() / run_id
        if not _check_private_acl(expected_directory):
            raise RecoveryGuardError('journal_acl_unverified')
        directory, state = lab._load(run_id)
        if directory != expected_directory:
            raise RecoveryGuardError('journal_identity_invalid')
        if state.get("phase") != "c232-resumable-quarantined":
            raise RecoveryGuardError("lab_phase_invalid")
        names = lab._names(run_id)
        if (state.get("run_id") != run_id or state.get("names") != names
                or state.get("database") != lab.DATABASE or state.get("migrator") != lab.MIGRATOR
                or state.get("port") != lab.PORT or state.get("image") != lab.IMAGE):
            raise RecoveryGuardError("journal_identity_invalid")
        prefix = state.get("redis_prefix")
        if not isinstance(prefix, str) or not PREFIX.fullmatch(prefix):
            raise RecoveryGuardError("redis_prefix_invalid")
        lab._assert_volume(names["source_volume"])
        lab._assert_container(names["source_container"], names["source_volume"], directory, require_running=True)
        if names["restore_container"] in lab._resource_names("container"):
            raise RecoveryGuardError("unexpected_restore_container")
        if names["restore_volume"] in lab._resource_names("volume"):
            raise RecoveryGuardError("unexpected_restore_volume")
        return directory, state
    except RecoveryGuardError:
        raise
    except Exception:
        raise RecoveryGuardError("lab_identity_unverified") from None


async def _inspect_connection(connection: Any) -> RecoveryReport:
    try:
        async with connection.transaction(isolation="repeatable_read", readonly=True):
            identity = await connection.fetchrow("SELECT current_database() AS db, current_user AS role, inet_server_port() AS port")
            if (identity["db"], identity["role"], identity["port"]) != (lab.DATABASE, lab.MIGRATOR, 5432):
                raise RecoveryGuardError("database_identity_mismatch")
            revisions = await connection.fetch("SELECT version_num FROM public.alembic_version")
            if len(revisions) != 1 or revisions[0]["version_num"] != target.EXPECTED_REVISION:
                raise RecoveryGuardError("revision_mismatch")
            rows = await connection.fetch("""SELECT schemaname, tablename, tableowner
                FROM pg_catalog.pg_tables WHERE schemaname <> 'information_schema'
                AND schemaname NOT LIKE 'pg\\_%' ESCAPE '\\'""")
            public = {r["tablename"] for r in rows if r["schemaname"] == "public"}
            if public != target.EXPECTED_TABLES | target.EXTRA_TABLES:
                raise RecoveryGuardError("table_set_mismatch")
            others = [r for r in rows if r["schemaname"] != "public"]
            if (len(others) != 2 or {r["tablename"] for r in others} != CONTROL_TABLES
                    or any(r["schemaname"] != CONTROL_SCHEMA for r in others)):
                raise RecoveryGuardError("marker_schema_mismatch")
            if any(r["tableowner"] != lab.MIGRATOR for r in others):
                raise RecoveryGuardError("marker_owner_mismatch")
            acl = await connection.fetchrow("""SELECT
                has_schema_privilege('pymentor_app', 'c232_lab_control', 'CREATE') AS schema_create,
                has_table_privilege('pymentor_app', 'c232_lab_control.import_marker', 'INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER') AS marker_write,
                has_table_privilege('pymentor_app', 'c232_lab_control.session_operations', 'INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER') AS operations_write,
                has_any_column_privilege('pymentor_app', 'c232_lab_control.import_marker', 'INSERT,UPDATE,REFERENCES') AS marker_column_write,
                has_any_column_privilege('pymentor_app', 'c232_lab_control.session_operations', 'INSERT,UPDATE,REFERENCES') AS operations_column_write,
                pg_get_userbyid((SELECT nspowner FROM pg_catalog.pg_namespace WHERE nspname='c232_lab_control')) AS schema_owner,
                pg_has_role('pymentor_app', 'pymentor_test', 'MEMBER') AS app_migrator_member,
                (SELECT rolcanlogin FROM pg_catalog.pg_roles WHERE rolname='pymentor_app') AS app_login,
                (SELECT rolsuper FROM pg_catalog.pg_roles WHERE rolname='pymentor_app') AS app_superuser,
                (SELECT rolconnlimit FROM pg_catalog.pg_roles WHERE rolname='pymentor_test') AS migrator_limit""")
            if (acl["schema_create"] is not False or acl["marker_write"] is not False
                    or acl["operations_write"] is not False or acl["app_login"] is not False
                    or acl["migrator_limit"] != 1 or acl["schema_owner"] != lab.MIGRATOR
                    or acl["app_migrator_member"] is not False or acl["app_superuser"] is not False
                    or acl["marker_column_write"] is not False or acl["operations_column_write"] is not False):
                raise RecoveryGuardError("marker_acl_invalid")
            return RecoveryReport()
    except RecoveryGuardError:
        raise
    except Exception:
        raise RecoveryGuardError("database_check_failed") from None


async def inspect(run_id: str, *, connect=None) -> RecoveryReport:
    directory, _ = _check_lab(run_id)
    try:
        password = lab._read_secret(directory, "migrator_password")
    except Exception:
        raise RecoveryGuardError("private_secret_unavailable") from None
    try:
        if connect is None:
            import asyncpg
            connect = asyncpg.connect
        connection = await connect(host="127.0.0.1", port=lab.PORT, database=lab.DATABASE,
                                   user=lab.MIGRATOR, password=password, timeout=5,
                                   server_settings={"default_transaction_read_only": "on"})
    except Exception:
        raise RecoveryGuardError("database_connect_failed") from None
    try:
        return await _inspect_connection(connection)
    finally:
        try:
            await connection.close()
        except Exception:
            pass
