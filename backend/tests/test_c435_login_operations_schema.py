"""Structural checks for the PostgreSQL-only PYM-435 schema migration.

These tests capture Alembic operations in memory and never connect to a database.
"""

from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
from types import SimpleNamespace

import pytest
import sqlalchemy as sa


MIGRATION_PATH = (
    Path(__file__).parents[1]
    / "migrations"
    / "versions"
    / "c435_login_operations.py"
)


def _load_migration():
    assert MIGRATION_PATH.is_file(), "the c435 login operations migration is missing"
    spec = spec_from_file_location("c435_login_operations", MIGRATION_PATH)
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
        SimpleNamespace(create_table=create_table, create_index=create_index, execute=lambda _sql: None),
    )
    migration.upgrade()
    return migration, tables, indexes


def test_login_operations_schema_has_required_columns_constraints_and_index(monkeypatch):
    migration, tables, indexes = _capture_upgrade(monkeypatch)
    from core.schema_policy import DUAL_LOCAL_SCHEMA_REVISION

    assert migration.revision == "c435_login_operations"
    assert migration.down_revision == "c216_import_marker"
    assert DUAL_LOCAL_SCHEMA_REVISION == migration.revision
    lifecycle = tables["account_lifecycles"]
    assert lifecycle.c.user_id.primary_key
    owner = next(iter(lifecycle.c.user_id.foreign_keys))
    assert owner.target_fullname == "users.id" and owner.ondelete == "CASCADE"
    assert not lifecycle.c.lifecycle_id.nullable
    assert any(isinstance(item, sa.UniqueConstraint)
               and tuple(column.name for column in item.columns) == ("lifecycle_id",)
               for item in lifecycle.constraints)
    subjects = tables["booking_notification_subjects"]
    assert subjects.c.outbox_id.primary_key
    assert next(iter(subjects.c.outbox_id.foreign_keys)).target_fullname == "booking_notification_outbox.id"
    assert not subjects.c.lifecycle_id.nullable
    table = tables["login_operations"]
    assert tuple(table.columns.keys()) == (
        "operation_id",
        "user_id",
        "token_digest",
        "status",
        "pending_expires_at",
        "created_at",
        "session_id",
        "committed_at",
        "key_version",
    )

    operation_id = table.c.operation_id
    assert isinstance(operation_id.type, sa.String)
    assert operation_id.type.length == 36
    assert operation_id.primary_key and not operation_id.nullable

    user_id_fk = next(iter(table.c.user_id.foreign_keys))
    assert user_id_fk.target_fullname == "users.id"
    assert user_id_fk.ondelete == "CASCADE"
    assert not table.c.user_id.nullable

    token_digest = table.c.token_digest
    assert isinstance(token_digest.type, sa.String)
    assert token_digest.type.length == 64
    assert not token_digest.nullable
    assert any(
        isinstance(constraint, sa.UniqueConstraint)
        and tuple(column.name for column in constraint.columns) == ("token_digest",)
        for constraint in table.constraints
    )

    pending_expires_at = table.c.pending_expires_at
    created_at = table.c.created_at
    committed_at = table.c.committed_at
    assert isinstance(pending_expires_at.type, sa.DateTime)
    assert pending_expires_at.type.timezone and not pending_expires_at.nullable
    assert isinstance(created_at.type, sa.DateTime)
    assert created_at.type.timezone and not created_at.nullable
    assert str(created_at.server_default.arg) == "now()"
    assert isinstance(committed_at.type, sa.DateTime)
    assert committed_at.type.timezone and committed_at.nullable

    session_id_fk = next(iter(table.c.session_id.foreign_keys))
    assert session_id_fk.target_fullname == "sessions.id"
    assert session_id_fk.ondelete == "SET NULL"
    assert table.c.session_id.nullable
    assert isinstance(table.c.key_version.type, sa.SmallInteger)
    assert not table.c.key_version.nullable

    checks = {
        constraint.name: str(constraint.sqltext)
        for constraint in table.constraints
        if isinstance(constraint, sa.CheckConstraint)
    }
    assert checks["ck_login_operations_operation_id_canonical"] == (
        "operation_id ~ "
        "'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'"
    )
    assert checks["ck_login_operations_token_digest_hex"] == (
        "token_digest ~ '^[0-9a-f]{64}$'"
    )
    assert checks["ck_login_operations_status"] == (
        "status IN ('pending', 'committed', 'revoked')"
    )
    assert checks["ck_login_operations_state"] == (
        "(status IN ('pending', 'revoked') AND session_id IS NULL AND committed_at IS NULL) "
        "OR (status = 'committed' AND committed_at IS NOT NULL)"
    )
    assert (
        "ix_login_operations_user_id",
        "login_operations",
        ("user_id",),
        {},
    ) in indexes


@pytest.mark.parametrize("direction", ["upgrade", "downgrade"])
def test_login_operations_migration_refuses_non_postgresql_schema(monkeypatch, direction):
    migration = _load_migration()
    operations = []
    monkeypatch.setattr(
        migration,
        "context",
        SimpleNamespace(
            is_offline_mode=lambda: False,
            get_context=lambda: SimpleNamespace(
                dialect=SimpleNamespace(name="sqlite")
            )
        ),
    )
    monkeypatch.setattr(
        migration,
        "op",
        SimpleNamespace(
            create_table=lambda *args, **kwargs: operations.append(args),
            create_index=lambda *args, **kwargs: operations.append(args),
        ),
    )

    with pytest.raises(RuntimeError, match="PostgreSQL"):
        getattr(migration, direction)()
    assert operations == []


def test_login_operations_downgrade_refuses_when_rows_exist(monkeypatch):
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

    with pytest.raises(RuntimeError, match="login operations are not empty"):
        migration.downgrade()

    assert statements == [
        'LOCK TABLE "account_lifecycles", "booking_notification_subjects", "login_operations" IN ACCESS EXCLUSIVE MODE',
        'SELECT EXISTS (SELECT 1 FROM "login_operations" LIMIT 1) OR EXISTS (SELECT 1 FROM "account_lifecycles" LIMIT 1) OR EXISTS (SELECT 1 FROM "booking_notification_subjects" LIMIT 1)',
    ]
    assert dropped_tables == []


def test_login_operations_downgrade_refuses_offline_without_database_access(monkeypatch):
    migration = _load_migration()
    monkeypatch.setattr(
        migration, "context", SimpleNamespace(is_offline_mode=lambda: True)
    )

    def unexpected_database_access():
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
