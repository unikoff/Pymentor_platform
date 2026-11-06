"""Fail-closed, read-only validation for the pinned PYM-191 synthetic SQLite snapshot.

The CLI has no path arguments: it can inspect only the snapshot and manifest in
the repository's fixed C2.3.2 sandbox. Tests use the explicitly private helper
with a temporary root and a temporary expected digest.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import sqlite3
import stat
import sys
from uuid import UUID
from dataclasses import dataclass, field
from pathlib import Path


MANIFEST_MARKER = "pymentor-pym-190-synthetic-fixture"
PINNED_SYNTHETIC_SHA256 = "5d1ccb135a6fd253f29eaa454c28ccfe106fa1c80f0bb524e2c11c5150f7fcae"
SNAPSHOT_NAME = "fixture.sqlite3"
MANIFEST_NAME = "manifest.json"
CLI_SANDBOX = Path(__file__).absolute().parent.parent / "output" / "c232-synthetic-sandbox"

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
RESERVED_EMAIL_DOMAINS = frozenset(
    {"example.test", "example.invalid", "example.com", "example.org", "example.net"}
)
SIDECAR_SUFFIXES = ("-wal", "-shm", "-journal")


class SourceGuardError(Exception):
    """A safe, category-only validation error; never includes source values."""

    def __init__(self, category: str):
        self.category = category
        super().__init__(category)


class _SafeArgumentParser(argparse.ArgumentParser):
    def error(self, message: str) -> None:
        print(json.dumps({"status": "rejected", "category": "cli_arguments_invalid"}))
        raise SystemExit(2)


@dataclass(repr=False)
class ValidatedSnapshot:
    """An isolated, validated in-memory copy for the caller's loader."""

    connection: sqlite3.Connection = field(repr=False)
    aggregates: dict[str, int]
    _closed: bool = field(default=False, init=False, repr=False)

    def __enter__(self) -> "ValidatedSnapshot":
        if self._closed:
            raise SourceGuardError("connection_closed")
        return self

    def __exit__(self, exc_type: object, exc: object, traceback: object) -> None:
        self.close()

    def close(self) -> None:
        if not self._closed:
            self.connection.close()
            self._closed = True


def _has_reparse_or_symlink(path: Path) -> bool:
    """Reject links/junctions in every existing path component, on Windows too."""
    absolute = Path(os.path.abspath(path))
    current = Path(absolute.anchor)
    for part in absolute.parts[1:]:
        current = current / part
        try:
            metadata = current.lstat()
        except FileNotFoundError:
            return False
        except OSError as exc:
            raise SourceGuardError("path_unavailable") from None
        if stat.S_ISLNK(metadata.st_mode):
            return True
        attributes = getattr(metadata, "st_file_attributes", 0)
        reparse_flag = getattr(stat, "FILE_ATTRIBUTE_REPARSE_POINT", 0x400)
        if attributes & reparse_flag:
            return True
    return False


def _regular_file(path: Path) -> bool:
    try:
        return stat.S_ISREG(path.lstat().st_mode)
    except OSError:
        return False


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    try:
        with path.open("rb") as stream:
            for block in iter(lambda: stream.read(1024 * 1024), b""):
                digest.update(block)
    except OSError:
        raise SourceGuardError("source_unavailable") from None
    return digest.hexdigest()


def _check_layout(root: Path) -> tuple[Path, Path]:
    root = Path(os.path.abspath(root))
    if _has_reparse_or_symlink(root):
        raise SourceGuardError("path_link_rejected")
    if not root.is_dir():
        raise SourceGuardError("sandbox_missing")
    database = root / SNAPSHOT_NAME
    manifest = root / MANIFEST_NAME
    for target in (database, manifest):
        if _has_reparse_or_symlink(target):
            raise SourceGuardError("path_link_rejected")
    if not _regular_file(database) or not _regular_file(manifest):
        raise SourceGuardError("source_or_manifest_missing")
    for suffix in SIDECAR_SUFFIXES:
        sidecar = Path(str(database) + suffix)
        if sidecar.exists() or sidecar.is_symlink():
            raise SourceGuardError("sqlite_sidecar_present")
    return database, manifest


def _read_manifest(path: Path, expected_sha256: str) -> None:
    try:
        raw = path.read_text(encoding="utf-8")
        document = json.loads(raw)
    except (OSError, UnicodeError, json.JSONDecodeError):
        raise SourceGuardError("manifest_invalid") from None
    if (
        not isinstance(document, dict)
        or document.get("marker") != MANIFEST_MARKER
        or document.get("fixture_schema_version") != 1
        or document.get("database_file") != SNAPSHOT_NAME
        or document.get("sha256") != expected_sha256
        or document.get("synthetic_content_verification_required") is not True
    ):
        raise SourceGuardError("manifest_not_pinned")


def _table_names(connection: sqlite3.Connection) -> frozenset[str]:
    try:
        objects = connection.execute(
            "SELECT type, name FROM sqlite_master "
            "WHERE name NOT LIKE 'sqlite_%' AND type IN ('table', 'view', 'trigger')"
        ).fetchall()
    except sqlite3.Error:
        raise SourceGuardError("sqlite_schema_unreadable") from None
    if any(kind != "table" for kind, _name in objects):
        raise SourceGuardError("schema_object_mismatch")
    return frozenset(name for _kind, name in objects)


def _synthetic_identity_counts(connection: sqlite3.Connection) -> tuple[int, int, int]:
    try:
        users = connection.execute("SELECT username, email FROM users").fetchall()
        admins = connection.execute("SELECT username, email FROM admins").fetchall()
        session_rows = connection.execute("SELECT user_id, session_token FROM sessions").fetchall()
        user_ids = {row[0] for row in connection.execute("SELECT id FROM users").fetchall()}
    except sqlite3.Error:
        raise SourceGuardError("identity_schema_invalid") from None

    for username, email in (*users, *admins):
        if not isinstance(username, str) or "synthetic" not in username.casefold():
            raise SourceGuardError("identity_not_synthetic")
        if not isinstance(email, str) or "@" not in email:
            raise SourceGuardError("identity_not_synthetic")
        if email.rsplit("@", 1)[1].casefold() not in RESERVED_EMAIL_DOMAINS:
            raise SourceGuardError("identity_not_synthetic")
    for user_id, token in session_rows:
        try:
            valid_token = isinstance(token, str) and str(UUID(token)) == token
        except (ValueError, AttributeError):
            valid_token = False
        if user_id not in user_ids or not valid_token:
            raise SourceGuardError("session_not_synthetic")
    return len(users), len(admins), len(session_rows)


def _validate_snapshot(
    sandbox_root: Path,
    *,
    expected_sha256: str,
) -> ValidatedSnapshot:
    """Internal seam for pytest: fixed filenames/marker, injected temporary root and digest."""
    root = Path(os.path.abspath(sandbox_root))
    database, manifest_path = _check_layout(root)
    _read_manifest(manifest_path, expected_sha256)

    before = _sha256(database)
    if before != expected_sha256:
        raise SourceGuardError("source_hash_mismatch")

    source = None
    connection = None
    try:
        uri = database.as_uri() + "?mode=ro&immutable=1"
        source = sqlite3.connect(uri, uri=True)
        connection = sqlite3.connect(":memory:")
        source.backup(connection)
        source.close()
        source = None
        connection.execute("PRAGMA query_only=ON")
    except (OSError, sqlite3.Error, ValueError):
        if source is not None:
            source.close()
        if connection is not None:
            connection.close()
        raise SourceGuardError("sqlite_open_failed") from None

    try:
        if _has_reparse_or_symlink(database) or _sha256(database) != expected_sha256:
            raise SourceGuardError("source_changed_during_open")
        table_names = _table_names(connection)
        if table_names != EXPECTED_TABLES:
            raise SourceGuardError("table_set_mismatch")
        try:
            integrity_rows = connection.execute("PRAGMA integrity_check").fetchall()
            fk_rows = connection.execute("PRAGMA foreign_key_check").fetchall()
        except sqlite3.Error:
            raise SourceGuardError("sqlite_check_failed") from None
        if len(integrity_rows) != 1 or integrity_rows[0][0] != "ok":
            raise SourceGuardError("integrity_failed")
        if fk_rows:
            raise SourceGuardError("foreign_key_failed")
        user_count, admin_count, session_count = _synthetic_identity_counts(connection)
        after = _sha256(database)
        if after != before:
            raise SourceGuardError("source_changed_during_validation")
        return ValidatedSnapshot(
            connection=connection,
            aggregates={
                "table_count": len(table_names),
                "user_count": user_count,
                "admin_count": admin_count,
                "session_count": session_count,
                "foreign_key_violation_count": 0,
            },
        )
    except Exception:
        connection.close()
        raise


def open_synthetic_snapshot() -> ValidatedSnapshot:
    """Return the already validated read-only connection for the fixed CLI sandbox."""
    return _validate_snapshot(CLI_SANDBOX, expected_sha256=PINNED_SYNTHETIC_SHA256)


def _main(argv: list[str] | None = None) -> int:
    parser = _SafeArgumentParser(description=__doc__)
    parser.add_argument(
        "--synthetic-only",
        action="store_true",
        required=True,
        help="required acknowledgment; the source path is fixed by this script",
    )
    args = parser.parse_args(argv)
    if not args.synthetic_only:
        parser.error("--synthetic-only is required")
    try:
        with open_synthetic_snapshot() as snapshot:
            output = {"status": "validated", "aggregates": snapshot.aggregates}
    except SourceGuardError as exc:
        output = {"status": "rejected", "category": exc.category}
        print(json.dumps(output, sort_keys=True))
        return 2
    except Exception:
        output = {"status": "rejected", "category": "validation_failed"}
        print(json.dumps(output, sort_keys=True))
        return 2
    print(json.dumps(output, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(_main())
