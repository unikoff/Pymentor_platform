"""Structural checks for the PostgreSQL-only PYM-426 deletion outbox migration.

Alembic operations are captured in memory; these tests never connect to a database.
"""

from importlib.util import module_from_spec
from importlib.util import spec_from_file_location
from pathlib import Path
from types import SimpleNamespace

import pytest
import sqlalchemy as sa


MIGRATION_PATH = (
    Path(__file__).resolve().parents[2] / "migrations"
    / "versions"
    / "c426_deletion_outbox.py"
)


def _load_migration():
    assert MIGRATION_PATH.is_file(), "the c426 deletion outbox migration is missing"
    spec = spec_from_file_location("c426_deletion_outbox", MIGRATION_PATH)
    assert spec is not None and spec.loader is not None
    migration = module_from_spec(spec)
    spec.loader.exec_module(migration)
    return migration


def _capture_upgrade(monkeypatch, *, dialect="postgresql"):
    migration = _load_migration()
    tables = {}
    indexes = []

    def create_table(name, *elements, **kwargs):
        tables[name] = sa.Table(name, sa.MetaData(), *elements, **kwargs)

    def create_index(name, table_name, columns, **kwargs):
        indexes.append((name, table_name, tuple(columns), kwargs))

    monkeypatch.setattr(
        migration,
        "context",
        SimpleNamespace(
            is_offline_mode=lambda: False,
            get_context=lambda: SimpleNamespace(
                dialect=SimpleNamespace(name=dialect)
            ),
        ),
    )
    monkeypatch.setattr(
        migration,
        "op",
        SimpleNamespace(
            create_table=create_table,
            create_index=create_index,
            execute=lambda statement: None,
        ),
    )
    migration.upgrade()
    return migration, tables, indexes


def test_deletion_outbox_schema_has_only_safe_fields_and_required_constraints(monkeypatch):
    migration, tables, indexes = _capture_upgrade(monkeypatch)

    assert migration.revision == "c426_deletion_outbox"
    assert migration.down_revision == "c435_login_operations"

    events = tables["account_deletion_events"]
    assert tuple(events.columns.keys()) == ("lifecycle_id", "user_id", "deleted_at")
    lifecycle_id = events.c.lifecycle_id
    assert isinstance(lifecycle_id.type, sa.String)
    assert lifecycle_id.type.length == 36
    assert lifecycle_id.primary_key and not lifecycle_id.nullable
    assert not events.c.user_id.nullable
    assert not events.c.user_id.foreign_keys
    deleted_at = events.c.deleted_at
    assert isinstance(deleted_at.type, sa.DateTime)
    assert deleted_at.type.timezone and not deleted_at.nullable
    assert str(deleted_at.server_default.arg) == "now()"
    event_checks = {
        constraint.name: str(constraint.sqltext)
        for constraint in events.constraints
        if isinstance(constraint, sa.CheckConstraint)
    }
    assert event_checks["ck_account_deletion_events_lifecycle_id_uuid"] == (
        "lifecycle_id ~ "
        "'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'"
    )

    keys = tables["account_deletion_redis_keys"]
    assert tuple(keys.columns.keys()) == (
        "lifecycle_id",
        "token_digest",
        "expires_at",
        "next_attempt_at",
        "attempts",
    )
    assert tuple(column.name for column in keys.primary_key.columns) == (
        "lifecycle_id",
        "token_digest",
    )
    owner = next(iter(keys.c.lifecycle_id.foreign_keys))
    assert owner.target_fullname == "account_deletion_events.lifecycle_id"
    assert owner.ondelete == "CASCADE"
    digest = keys.c.token_digest
    assert isinstance(digest.type, sa.String) and digest.type.length == 64
    assert not digest.nullable
    key_checks = {
        constraint.name: str(constraint.sqltext)
        for constraint in keys.constraints
        if isinstance(constraint, sa.CheckConstraint)
    }
    assert key_checks["ck_account_deletion_redis_keys_token_digest_hex"] == (
        "token_digest ~ '^[0-9a-f]{64}$'"
    )
    expires_at = keys.c.expires_at
    assert isinstance(expires_at.type, sa.DateTime)
    assert expires_at.type.timezone and not expires_at.nullable
    next_attempt_at = keys.c.next_attempt_at
    assert isinstance(next_attempt_at.type, sa.DateTime)
    assert next_attempt_at.type.timezone and not next_attempt_at.nullable
    assert str(next_attempt_at.server_default.arg) == "now()"
    attempts = keys.c.attempts
    assert isinstance(attempts.type, sa.Integer) and not attempts.nullable
    assert str(attempts.server_default.arg) == "0"
    assert key_checks["ck_account_deletion_redis_keys_attempts_nonnegative"] == (
        "attempts >= 0"
    )
    assert (
        "ix_account_deletion_redis_keys_next_attempt_expiry",
        "account_deletion_redis_keys",
        ("next_attempt_at", "expires_at"),
        {},
    ) in indexes


@pytest.mark.parametrize("direction", ["upgrade", "downgrade"])
def test_deletion_outbox_migration_refuses_non_postgresql(monkeypatch, direction):
    migration = _load_migration()
    operations = []
    monkeypatch.setattr(
        migration,
        "context",
        SimpleNamespace(
            is_offline_mode=lambda: False,
            get_context=lambda: SimpleNamespace(
                dialect=SimpleNamespace(name="sqlite")
            ),
        ),
    )
    monkeypatch.setattr(
        migration,
        "op",
        SimpleNamespace(
            create_table=lambda *args, **kwargs: operations.append(args),
            create_index=lambda *args, **kwargs: operations.append(args),
            get_bind=lambda: pytest.fail("non-PostgreSQL downgrade must not access a database"),
        ),
    )

    with pytest.raises(RuntimeError, match="PostgreSQL"):
        getattr(migration, direction)()
    assert operations == []


def test_deletion_outbox_downgrade_locks_both_tables_and_refuses_rows(monkeypatch):
    migration = _load_migration()
    statements = []
    dropped_tables = []

    class Result:
        def scalar(self):
            return True

    class Connection:
        def execute(self, statement):
            statements.append(str(statement))
            return Result()

    monkeypatch.setattr(
        migration,
        "context",
        SimpleNamespace(
            is_offline_mode=lambda: False,
            get_context=lambda: SimpleNamespace(
                dialect=SimpleNamespace(name="postgresql")
            ),
        ),
    )
    monkeypatch.setattr(
        migration,
        "op",
        SimpleNamespace(
            get_bind=lambda: Connection(),
            drop_table=lambda name: dropped_tables.append(name),
        ),
    )

    with pytest.raises(RuntimeError, match="deletion outbox is not empty"):
        migration.downgrade()

    assert statements[0] == (
        'LOCK TABLE "account_deletion_events", "account_deletion_redis_keys" '
        "IN ACCESS EXCLUSIVE MODE"
    )
    assert "account_deletion_events" in statements[1]
    assert "account_deletion_redis_keys" in statements[1]
    assert dropped_tables == []


def test_deletion_outbox_downgrade_refuses_offline_without_database_access(monkeypatch):
    migration = _load_migration()
    monkeypatch.setattr(
        migration, "context", SimpleNamespace(is_offline_mode=lambda: True)
    )

    def unexpected_database_access(*args, **kwargs):
        pytest.fail("offline downgrade must not inspect or drop database objects")

    monkeypatch.setattr(
        migration,
        "op",
        SimpleNamespace(
            get_bind=unexpected_database_access,
            drop_table=unexpected_database_access,
        ),
    )

    with pytest.raises(RuntimeError, match="offline downgrade"):
        migration.downgrade()


def test_deletion_outbox_downgrade_drops_empty_tables_child_first(monkeypatch):
    migration = _load_migration()
    statements = []
    dropped_tables = []

    class Result:
        def scalar(self):
            return False

    class Connection:
        def execute(self, statement):
            statements.append(str(statement))
            return Result()

    monkeypatch.setattr(
        migration,
        "context",
        SimpleNamespace(
            is_offline_mode=lambda: False,
            get_context=lambda: SimpleNamespace(
                dialect=SimpleNamespace(name="postgresql")
            ),
        ),
    )
    monkeypatch.setattr(
        migration,
        "op",
        SimpleNamespace(
            get_bind=lambda: Connection(),
            drop_table=lambda name: dropped_tables.append(name),
            execute=lambda statement: None,
        ),
    )

    migration.downgrade()

    assert len(statements) == 2
    assert dropped_tables == [
        "account_deletion_redis_keys",
        "account_deletion_events",
    ]
