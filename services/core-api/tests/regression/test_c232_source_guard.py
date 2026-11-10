"""Local-only tests using temporary synthetic SQLite databases."""

from __future__ import annotations

import hashlib
import importlib.util
import json
import os
import sqlite3
import tempfile
import sys
from pathlib import Path

import pytest

_spec = importlib.util.spec_from_file_location(
    'c232_source_guard', (Path(__file__).resolve().parents[4] / 'services/core-api/tools/migration/c232_source_guard.py')
)
guard = importlib.util.module_from_spec(_spec)
sys.modules[_spec.name] = guard
_spec.loader.exec_module(guard)


@pytest.fixture
def temp_root():
    project_root = Path(__file__).resolve().parents[4]
    path = Path(tempfile.mkdtemp(prefix=".c232-synthetic-test-", dir=project_root))
    try:
        yield path
    finally:
        if path.parent == project_root and path.name.startswith(".c232-synthetic-test-"):
            for name in (
                guard.SNAPSHOT_NAME,
                guard.MANIFEST_NAME,
                *(f"{guard.SNAPSHOT_NAME}{suffix}" for suffix in guard.SIDECAR_SUFFIXES),
                "outside.sqlite3",
                "sandbox-link",
            ):
                (path / name).unlink(missing_ok=True)
            path.rmdir()


def _make_sandbox(root: Path, *, bad_identity: bool = False, bad_fk: bool = False) -> str:
    if not root.exists():
        root.mkdir()
    database = root / guard.SNAPSHOT_NAME
    connection = sqlite3.connect(database)
    try:
        for table in sorted(guard.EXPECTED_TABLES):
            if table == "users":
                connection.execute(
                    "CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT NOT NULL, email TEXT NOT NULL)"
                )
            elif table == "admins":
                connection.execute(
                    "CREATE TABLE admins (id INTEGER PRIMARY KEY, username TEXT NOT NULL, email TEXT NOT NULL)"
                )
            elif table == "sessions":
                connection.execute(
                    "CREATE TABLE sessions (id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), "
                    "session_token TEXT NOT NULL)"
                )
            else:
                connection.execute(f'CREATE TABLE "{table}" (id INTEGER PRIMARY KEY)')
        user_email = "person@real-domain.example" if bad_identity else "c232-student@example.test"
        username = "ordinary user" if bad_identity else "c232-synthetic-student"
        connection.execute("INSERT INTO users(id, username, email) VALUES (1, ?, ?)", (username, user_email))
        connection.execute(
            "INSERT INTO admins(id, username, email) VALUES (1, 'c232-synthetic-admin', 'c232-admin@example.test')"
        )
        session_user = 999 if bad_fk else 1
        connection.execute(
            "INSERT INTO sessions(id, user_id, session_token) VALUES (1, ?, '00000000-0000-4000-8000-000000000301')",
            (session_user,),
        )
        connection.commit()
    finally:
        connection.close()
    digest = hashlib.sha256(database.read_bytes()).hexdigest()
    (root / guard.MANIFEST_NAME).write_text(
        json.dumps(_manifest(digest)), encoding="utf-8"
    )
    return digest


def _manifest(digest):
    return {"marker": guard.MANIFEST_MARKER, "sha256": digest,
            "fixture_schema_version": 1, "database_file": guard.SNAPSHOT_NAME,
            "synthetic_content_verification_required": True}


def _validate(root: Path, digest: str) -> guard.ValidatedSnapshot:
    return guard._validate_snapshot(root, expected_sha256=digest)


def test_valid_snapshot_returns_same_live_read_only_connection_and_only_aggregates(temp_root: Path):
    digest = _make_sandbox(temp_root)

    with _validate(temp_root, digest) as result:
        assert result.aggregates == {
            "table_count": 15,
            "user_count": 1,
            "admin_count": 1,
            "session_count": 1,
            "foreign_key_violation_count": 0,
        }
        assert "00000000-0000" not in repr(result)
        assert result.connection.execute("SELECT COUNT(*) FROM users").fetchone()[0] == 1
        with pytest.raises(sqlite3.OperationalError):
            result.connection.execute("DELETE FROM users")
    assert result._closed


def test_validated_memory_snapshot_is_not_changed_by_later_source_mutation(temp_root: Path):
    digest = _make_sandbox(temp_root)
    with _validate(temp_root, digest) as result:
        connection = sqlite3.connect(temp_root / guard.SNAPSHOT_NAME)
        try:
            connection.execute("DELETE FROM users")
            connection.commit()
        finally:
            connection.close()
        assert result.connection.execute("SELECT COUNT(*) FROM users").fetchone()[0] == 1
        with pytest.raises(sqlite3.OperationalError):
            result.connection.execute("DELETE FROM users")


def test_symlink_source_is_rejected_before_sqlite_open(temp_root: Path):
    outside = temp_root / "outside.sqlite3"
    outside.write_bytes(b"synthetic test bytes")
    root = temp_root
    (root / guard.MANIFEST_NAME).write_text("{}", encoding="utf-8")
    try:
        os.symlink(outside, root / guard.SNAPSHOT_NAME)
    except (OSError, NotImplementedError) as exc:
        pytest.skip(f"symlinks unavailable on this host: {type(exc).__name__}")

    with pytest.raises(guard.SourceGuardError) as error:
        _validate(root, "0" * 64)
    assert error.value.category == "path_link_rejected"


def test_escape_via_linked_sandbox_root_is_rejected(temp_root: Path):
    outside = temp_root
    root = temp_root / "sandbox-link"
    try:
        os.symlink(outside, root, target_is_directory=True)
    except (OSError, NotImplementedError) as exc:
        pytest.skip(f"symlinks unavailable on this host: {type(exc).__name__}")

    with pytest.raises(guard.SourceGuardError) as error:
        _validate(root, "0" * 64)
    assert error.value.category == "path_link_rejected"


@pytest.mark.parametrize(
    "manifest_override",
    [
        {**_manifest("0" * 64), "marker": "untrusted-marker"},
        _manifest("0" * 64),
    ],
)
def test_manifest_marker_and_hash_must_be_pinned(temp_root: Path, manifest_override: dict[str, str]):
    root = temp_root
    _make_sandbox(root)
    (root / guard.MANIFEST_NAME).write_text(json.dumps(manifest_override), encoding="utf-8")

    with pytest.raises(guard.SourceGuardError) as error:
        _validate(root, "f" * 64)
    assert error.value.category == "manifest_not_pinned"


def test_manifest_hash_must_match_source_bytes(temp_root: Path):
    root = temp_root
    digest = _make_sandbox(root)
    with (root / guard.SNAPSHOT_NAME).open("ab") as stream:
        stream.write(b"changed")

    with pytest.raises(guard.SourceGuardError) as error:
        _validate(root, digest)
    assert error.value.category == "source_hash_mismatch"


@pytest.mark.parametrize("suffix", ["-wal", "-journal", "-shm"])
def test_sqlite_sidecar_is_rejected(temp_root: Path, suffix: str):
    root = temp_root
    digest = _make_sandbox(root)
    (root / f"{guard.SNAPSHOT_NAME}{suffix}").write_bytes(b"synthetic sidecar")

    with pytest.raises(guard.SourceGuardError) as error:
        _validate(root, digest)
    assert error.value.category == "sqlite_sidecar_present"


@pytest.mark.parametrize("mutation", ["missing", "extra"])
def test_non_exact_table_set_is_rejected(temp_root: Path, mutation: str):
    root = temp_root
    digest = _make_sandbox(root)
    connection = sqlite3.connect(root / guard.SNAPSHOT_NAME)
    try:
        if mutation == "missing":
            connection.execute("DROP TABLE booking_reminders")
        else:
            connection.execute("CREATE TABLE extra_table (id INTEGER)")
        connection.commit()
    finally:
        connection.close()
    digest = hashlib.sha256((root / guard.SNAPSHOT_NAME).read_bytes()).hexdigest()
    (root / guard.MANIFEST_NAME).write_text(
        json.dumps(_manifest(digest)), encoding="utf-8"
    )

    with pytest.raises(guard.SourceGuardError) as error:
        _validate(root, digest)
    assert error.value.category == "table_set_mismatch"


def test_real_identity_category_is_rejected_without_echoing_values(temp_root: Path):
    root = temp_root
    digest = _make_sandbox(root, bad_identity=True)

    with pytest.raises(guard.SourceGuardError) as error:
        _validate(root, digest)
    assert error.value.category == "identity_not_synthetic"
    assert "person@real-domain.example" not in str(error.value)


def test_foreign_key_violation_is_rejected(temp_root: Path):
    root = temp_root
    digest = _make_sandbox(root, bad_fk=True)

    with pytest.raises(guard.SourceGuardError) as error:
        _validate(root, digest)
    assert error.value.category == "foreign_key_failed"


def test_integrity_failure_is_rejected(temp_root: Path, monkeypatch: pytest.MonkeyPatch):
    root = temp_root
    digest = _make_sandbox(root)
    real_connect = sqlite3.connect

    class IntegrityFailureConnection:
        def __init__(self, connection: sqlite3.Connection):
            self._connection = connection

        def execute(self, statement: str, *parameters: object):
            if statement == "PRAGMA integrity_check":
                return type("SyntheticResult", (), {"fetchall": lambda _self: [("synthetic integrity failure",)]})()
            return self._connection.execute(statement, *parameters)

        def backup(self, target):
            self._connection.backup(target._connection)

        def close(self) -> None:
            self._connection.close()

    monkeypatch.setattr(guard.sqlite3, "connect", lambda *args, **kwargs: IntegrityFailureConnection(real_connect(*args, **kwargs)))

    with pytest.raises(guard.SourceGuardError) as error:
        _validate(root, digest)
    assert error.value.category == "integrity_failed"


def test_cli_requires_flag_and_does_not_echo_a_source_path(capsys: pytest.CaptureFixture[str]):
    with pytest.raises(SystemExit) as missing_flag:
        guard._main([])
    assert missing_flag.value.code == 2
    capsys.readouterr()
    unsafe_path = "C:/untrusted/private.db"
    with pytest.raises(SystemExit) as source_path:
        guard._main(["--synthetic-only", unsafe_path])
    assert source_path.value.code == 2
    assert unsafe_path not in capsys.readouterr().out
