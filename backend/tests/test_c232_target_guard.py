"""Fake-only tests for the C232 read-only target preflight."""
from __future__ import annotations

from contextlib import asynccontextmanager
import importlib.util
from pathlib import Path
import sys

import pytest

_spec = importlib.util.spec_from_file_location(
    'c232_target_guard', Path(__file__).resolve().parents[2] / 'scripts' / 'c232_target_guard.py'
)
guard = importlib.util.module_from_spec(_spec)
sys.modules[_spec.name] = guard
_spec.loader.exec_module(guard)

RUN_ID = "c232-012345abcdef"


class FakeConnection:
    def __init__(self, *, tables=None, nonempty=None, revision="c426_deletion_outbox", identity=None, kinds=None):
        self.tables = set(tables if tables is not None else guard.EXPECTED_TABLES | guard.EXTRA_TABLES)
        self.nonempty = nonempty
        self.revision = revision
        self.identity = identity or {"db": "pymentor_test", "role": "pymentor_test", "addr": "127.0.0.1", "port": 5432}
        self.kinds = kinds or {"p", "f", "u"}
        self.readonly = None
        self.closed = False

    @asynccontextmanager
    async def transaction(self, *, isolation, readonly):
        assert isolation == "repeatable_read"
        self.readonly = readonly
        yield

    async def fetchrow(self, _query):
        return self.identity

    async def fetchval(self, query):
        if "alembic_version" in query:
            return self.revision
        table = query.split('public."', 1)[1].split('"', 1)[0]
        return table == self.nonempty

    async def fetch(self, query, *args):
        if "pg_tables" in query:
            return [{"tablename": name} for name in self.tables]
        # PostgreSQL's internal "char" is returned as bytes by asyncpg;
        # request text explicitly so this fake reflects the real driver.
        assert "c.contype::text AS contype" in query
        return [{"contype": kind} for kind in self.kinds]

    async def close(self):
        self.closed = True


def allow_lab(monkeypatch, directory: Path | None = None):
    directory = directory or Path("fake-private-directory")
    names = guard.lab._names(RUN_ID)
    state = {"phase": "migrated", "run_id": RUN_ID, "names": names,
             "database": guard.lab.DATABASE, "migrator": guard.lab.MIGRATOR,
             "port": guard.lab.PORT, "image": guard.lab.IMAGE}
    monkeypatch.setattr(guard.lab, "_load", lambda _run: (directory, state))
    monkeypatch.setattr(guard.lab, "_assert_volume", lambda _name: None)
    monkeypatch.setattr(guard.lab, "_assert_container", lambda *a, **k: {})
    monkeypatch.setattr(guard.lab, "_resource_names", lambda _kind: set())
    monkeypatch.setattr(guard.lab, "_read_secret", lambda *_: "s" * 64)


@pytest.mark.parametrize("run_id", ["c232-ABCDEF012345", "c232-0123456789ab-extra", "x232-012345abcdef", "c232-012345abcde"])
def test_rejects_invalid_run_path_before_lab_access(monkeypatch, run_id):
    monkeypatch.setattr(guard.lab, "_load", lambda *_: pytest.fail("lab lookup must not run"))
    with pytest.raises(guard.TargetGuardError, match="run_id_invalid"):
        guard._check_lab(run_id)


@pytest.mark.parametrize("mutation,category", [
    ("labels", "lab_identity_unverified"),
    ("phase", "lab_phase_invalid"),
    ("foreign", "table_set_mismatch"),
    ("nonempty", "table_not_empty"),
    ("marker_nonempty", "table_not_empty"),
    ("login_nonempty", "table_not_empty"),
    ("lifecycle_nonempty", "table_not_empty"),
    ("booking_subject_nonempty", "table_not_empty"),
    ("deletion_event_nonempty", "table_not_empty"),
    ("deletion_key_nonempty", "table_not_empty"),
    ("schema", "revision_mismatch"),
    ("constraints", "constraints_missing"),
    ("identity", "database_identity_mismatch"),
    ("readonly", "database_check_failed"),
])
def test_fails_closed_categories(monkeypatch, mutation, category):
    allow_lab(monkeypatch)
    if mutation == "labels":
        monkeypatch.setattr(guard.lab, "_assert_container", lambda *a, **k: (_ for _ in ()).throw(ValueError("private")))
        with pytest.raises(guard.TargetGuardError, match=category):
            guard._check_lab(RUN_ID)
        return
    if mutation == "phase":
        load = guard.lab._load
        def wrong_phase(run_id):
            directory, state = load(run_id)
            return directory, {**state, "phase": "roles-created"}
        monkeypatch.setattr(guard.lab, "_load", wrong_phase)
        with pytest.raises(guard.TargetGuardError, match=category):
            guard._check_lab(RUN_ID)
        return
    connection = FakeConnection(
        tables=guard.EXPECTED_TABLES | guard.EXTRA_TABLES | ({"foreign_app_table"} if mutation == "foreign" else set()),
        nonempty="users" if mutation == "nonempty" else "session_import_markers" if mutation == "marker_nonempty" else "login_operations" if mutation == "login_nonempty" else "account_lifecycles" if mutation == "lifecycle_nonempty" else "booking_notification_subjects" if mutation == "booking_subject_nonempty" else "account_deletion_events" if mutation == "deletion_event_nonempty" else "account_deletion_redis_keys" if mutation == "deletion_key_nonempty" else None,
        revision="wrong" if mutation == "schema" else "c426_deletion_outbox",
        kinds={"p", "f"} if mutation == "constraints" else None,
        identity={"db": "foreign_db", "role": "pymentor_test", "addr": "127.0.0.1", "port": 5432} if mutation == "identity" else None,
    )
    if mutation == "readonly":
        @asynccontextmanager
        async def bad_transaction(*, isolation, readonly):
            assert isolation == "repeatable_read" and readonly is True
            raise RuntimeError("secret DSN must be hidden")
            yield
        connection.transaction = bad_transaction
    with pytest.raises(guard.TargetGuardError, match=category):
        import asyncio
        asyncio.run(guard._inspect_connection(connection))


def test_connect_uses_fixed_loopback_and_readonly_secret(monkeypatch, tmp_path):
    allow_lab(monkeypatch, tmp_path)
    connection = FakeConnection()
    received = {}

    async def connect(**kwargs):
        received.update(kwargs)
        return connection

    import asyncio
    report = asyncio.run(guard.inspect(RUN_ID, connect=connect))
    assert received == {"host": "127.0.0.1", "port": 57152, "database": "pymentor_test",
                        "user": "pymentor_test", "password": "s" * 64, "timeout": 5,
                        "server_settings": {"default_transaction_read_only": "on"}}
    assert connection.readonly is True and connection.closed
    assert report.writer_absence_proven is False and report.complete_constraints_verified is False
    assert report.import_recheck_required is True


def test_validates_expected_empty_schema_and_constraints():
    import asyncio
    connection = FakeConnection()
    report = asyncio.run(guard._inspect_connection(connection))
    assert report.table_count == 15
    assert report.revision == "c426_deletion_outbox"
    assert connection.readonly is True


def test_accepts_container_internal_address_when_binding_is_verified():
    import asyncio
    connection = FakeConnection(identity={"db": "pymentor_test", "role": "pymentor_test",
                                          "addr": "172.18.0.2", "port": 5432})
    assert asyncio.run(guard._inspect_connection(connection)).table_count == 15
