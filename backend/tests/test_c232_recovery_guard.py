"""C232 recovery guard tests: synthetic state and connections only."""
import asyncio
import os
from contextlib import asynccontextmanager
import importlib.util
from pathlib import Path
import sys

import pytest

_spec = importlib.util.spec_from_file_location(
    "c232_recovery_guard", Path(__file__).resolve().parents[2] / "scripts" / "c232_recovery_guard.py")
guard = importlib.util.module_from_spec(_spec)
sys.modules[_spec.name] = guard
_spec.loader.exec_module(guard)

RUN = "c232-012345abcdef"
PREFIX = "pymentor-c216-test:12345678-1234-4123-8123-123456789abc:"
SECRET = "fake-secret-never-real"


class FakeConnection:
    def __init__(self):
        self.identity = {"db": "pymentor_test", "role": "pymentor_test", "port": 5432}
        self.revision = "c426_deletion_outbox"
        self.rows = [{"schemaname": "public", "tablename": name, "tableowner": "pymentor_test"}
                     for name in guard.target.EXPECTED_TABLES | guard.target.EXTRA_TABLES]
        self.rows += [{"schemaname": guard.CONTROL_SCHEMA, "tablename": name, "tableowner": "pymentor_test"}
                      for name in guard.CONTROL_TABLES]
        self.acl = {"schema_create": False, "marker_write": False, "operations_write": False,
                    "app_login": False, "migrator_limit": 1, "schema_owner": "pymentor_test",
                    "app_migrator_member": False, "app_superuser": False,
                    "marker_column_write": False, "operations_column_write": False}
        self.closed = False
        self.readonly = False

    @asynccontextmanager
    async def transaction(self, *, isolation, readonly):
        assert isolation == "repeatable_read" and readonly is True
        self.readonly = True
        yield

    async def fetchrow(self, query):
        if "current_database" in query:
            return self.identity
        assert 'INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER' in query
        return self.acl

    async def fetch(self, query):
        if "alembic_version" in query:
            return [{"version_num": value} for value in self.revision] if isinstance(self.revision, list) else [{"version_num": self.revision}]
        assert "pg_catalog.pg_tables" in query
        return self.rows

    async def close(self):
        self.closed = True


@pytest.fixture
def lab(monkeypatch):
    names = guard.lab._names(RUN)
    state = {"run_id": RUN, "names": names, "phase": "c232-resumable-quarantined",
             "redis_prefix": PREFIX, "database": guard.lab.DATABASE, "migrator": guard.lab.MIGRATOR,
             "port": guard.lab.PORT, "image": guard.lab.IMAGE}
    monkeypatch.setattr(guard.lab, "_root", lambda: Path('fake-root'))
    monkeypatch.setattr(guard.lab, "_load", lambda _: (Path('fake-root') / RUN, state))
    monkeypatch.setattr(guard.lab, "_assert_volume", lambda _: None)
    monkeypatch.setattr(guard.lab, "_assert_container", lambda *a, **kw: None)
    monkeypatch.setattr(guard.lab, "_resource_names", lambda _: set())
    monkeypatch.setattr(guard.lab, "_read_secret", lambda *a: SECRET)
    monkeypatch.setattr(guard, "_check_private_acl", lambda _: True)
    return state


def run(coro):
    return asyncio.run(coro)


def test_success_fixed_connection_readonly_closed_and_limitations(lab, monkeypatch):
    calls = []
    monkeypatch.setattr(guard.lab, "_assert_container", lambda *a, **kw: calls.append((a, kw)))
    conn = FakeConnection()
    async def connect(**kwargs):
        assert kwargs == {"host": "127.0.0.1", "port": 57152, "database": "pymentor_test",
                          "user": "pymentor_test", "password": SECRET, "timeout": 5,
                          "server_settings": {"default_transaction_read_only": "on"}}
        return conn
    report = run(guard.inspect(RUN, connect=connect))
    assert calls[0][1] == {"require_running": True}
    assert conn.readonly and conn.closed and report.table_count == 15
    assert not any((report.writers_proven, report.source_proven, report.data_proven,
                    report.ttl_proven, report.sequence_proven))
    assert report.import_lock_and_state_check_required
    assert report.journal_acl_proven is True
    assert SECRET not in repr(report)


@pytest.mark.parametrize("phase", ["migrated", "c232-e2e-quarantined", "", None])
def test_wrong_phase(lab, phase):
    lab["phase"] = phase
    with pytest.raises(guard.RecoveryGuardError, match="lab_phase_invalid"):
        guard._check_lab(RUN)


@pytest.mark.parametrize("prefix", ["", "pymentor-c216-test:all:", PREFIX[:-1],
                                   PREFIX.replace("-4123-", "-1123-"), PREFIX.upper()])
def test_unsafe_prefix(lab, prefix):
    lab["redis_prefix"] = prefix
    with pytest.raises(guard.RecoveryGuardError, match="redis_prefix_invalid"):
        guard._check_lab(RUN)


@pytest.mark.parametrize("mutation", ["run", "names", "image", "port", "db", "role"])
def test_bad_journal_identity(lab, mutation):
    key = {"run": "run_id", "names": "names", "image": "image", "port": "port",
           "db": "database", "role": "migrator"}[mutation]
    lab[key] = "foreign"
    with pytest.raises(guard.RecoveryGuardError, match="journal_identity_invalid"):
        guard._check_lab(RUN)


@pytest.mark.parametrize("run_id", ["c232-ABCDEF123456", "c232-012345abcdef-extra", "../c232-012345abcdef"])
def test_bad_run_id_before_load(monkeypatch, run_id):
    monkeypatch.setattr(guard.lab, "_load", lambda _: pytest.fail("unexpected load"))
    with pytest.raises(guard.RecoveryGuardError, match="run_id_invalid"):
        guard._check_lab(run_id)


@pytest.mark.parametrize("kind", ["container", "volume"])
def test_restore_resource_rejected(lab, monkeypatch, kind):
    monkeypatch.setattr(guard.lab, "_resource_names", lambda k: {lab["names"]["restore_" + k]} if k == kind else set())
    with pytest.raises(guard.RecoveryGuardError, match="unexpected_restore_" + kind):
        guard._check_lab(RUN)


@pytest.mark.parametrize("name", ["_assert_volume", "_assert_container"])
def test_foreign_labels_or_resources_hide_details(lab, monkeypatch, name):
    def fail(*args, **kwargs):
        raise ValueError(SECRET)
    monkeypatch.setattr(guard.lab, name, fail)
    with pytest.raises(guard.RecoveryGuardError, match="lab_identity_unverified") as error:
        guard._check_lab(RUN)
    assert SECRET not in str(error.value)


def test_unverified_private_acl_fails_closed(lab, monkeypatch):
    monkeypatch.setattr(guard, '_check_private_acl', lambda _: False)
    monkeypatch.setattr(guard.lab, '_load', lambda _: pytest.fail('journal read before ACL validation'))
    with pytest.raises(guard.RecoveryGuardError, match='journal_acl_unverified'):
        guard._check_lab(RUN)


@pytest.mark.skipif(os.name != 'nt', reason='Windows ACL probe')
@pytest.mark.parametrize('result,expected', [
    ((0, 'OK\n'), True), ((0, ''), False), ((2, 'OK\n'), False),
])
def test_acl_subprocess_requires_exact_success_without_shell(monkeypatch, result, expected):
    from types import SimpleNamespace
    calls = []

    def run_process(args, **kwargs):
        calls.append((args, kwargs))
        return SimpleNamespace(returncode=result[0], stdout=result[1])

    monkeypatch.setattr(guard.subprocess, 'run', run_process)
    assert guard._check_private_acl(Path('C:/synthetic/target')) is expected
    args, kwargs = calls[0]
    assert args[-2:] == ['-LiteralDirectory', 'C:\\synthetic\\target']
    assert 'shell' not in kwargs and kwargs['timeout'] == 10
    assert kwargs['env']['PSModulePath'].endswith('WindowsPowerShell\\v1.0\\Modules')


@pytest.mark.parametrize("mutation,category", [
    ("identity", "database_identity_mismatch"), ("revision", "revision_mismatch"),
    ("multiple_revisions", "revision_mismatch"),
    ("public_missing", "table_set_mismatch"), ("public_extra", "table_set_mismatch"),
    ("marker_missing", "marker_schema_mismatch"), ("marker_schema", "marker_schema_mismatch"),
    ("other_schema", "marker_schema_mismatch"), ("owner", "marker_owner_mismatch"),
    ("schema_create", "marker_acl_invalid"), ("marker_write", "marker_acl_invalid"),
    ("operations_write", "marker_acl_invalid"), ("app_login", "marker_acl_invalid"),
    ("migrator_limit", "marker_acl_invalid"), ("schema_owner", "marker_acl_invalid"),
    ("app_migrator_member", "marker_acl_invalid"), ("app_superuser", "marker_acl_invalid"),
    ("marker_column_write", "marker_acl_invalid"), ("operations_column_write", "marker_acl_invalid"),
])
def test_database_drift_closes_connection(lab, mutation, category):
    conn = FakeConnection()
    if mutation == "identity": conn.identity["port"] = 1234
    elif mutation == "revision": conn.revision = "wrong"
    elif mutation == "multiple_revisions": conn.revision = ["c426_deletion_outbox", "wrong"]
    elif mutation == "public_missing": conn.rows = [r for r in conn.rows if r["tablename"] != "users"]
    elif mutation == "public_extra": conn.rows.append({"schemaname": "public", "tablename": "extra"})
    elif mutation == "marker_missing": conn.rows = [r for r in conn.rows if r["tablename"] != "import_marker"]
    elif mutation == "marker_schema": next(r for r in conn.rows if r["tablename"] == "import_marker")["schemaname"] = "foreign"
    elif mutation == "other_schema": conn.rows.append({"schemaname": "foreign", "tablename": "extra"})
    elif mutation == "owner": next(r for r in conn.rows if r["tablename"] == "import_marker")["tableowner"] = "foreign"
    else: conn.acl[mutation] = ('foreign' if mutation == 'schema_owner' else
                                -1 if mutation == 'migrator_limit' else True)
    async def connect(**kwargs): return conn
    with pytest.raises(guard.RecoveryGuardError, match=category):
        run(guard.inspect(RUN, connect=connect))
    assert conn.closed and conn.readonly


def test_driver_error_does_not_leak_and_closes(lab):
    conn = FakeConnection()
    async def fail(query):
        raise RuntimeError(SECRET + " SELECT private")
    conn.fetchrow = fail
    async def connect(**kwargs): return conn
    with pytest.raises(guard.RecoveryGuardError, match="database_check_failed") as error:
        run(guard.inspect(RUN, connect=connect))
    assert SECRET not in str(error.value) and "SELECT" not in str(error.value)
    assert conn.closed


def test_connect_error_does_not_leak(lab):
    async def connect(**kwargs):
        raise RuntimeError(SECRET)
    with pytest.raises(guard.RecoveryGuardError, match="database_connect_failed") as error:
        run(guard.inspect(RUN, connect=connect))
    assert SECRET not in str(error.value)
