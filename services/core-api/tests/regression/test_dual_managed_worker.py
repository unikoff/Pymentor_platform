"""Managed mode must never bootstrap notification tables behind Alembic's back."""

import pytest
from sqlalchemy import create_engine
from sqlalchemy import event
from sqlalchemy import inspect

from pymentor_core.app.database import Base
from pymentor_core.adapters.sql import notification_outbox as delivery


def test_managed_worker_refuses_missing_schema_without_creating_tables(monkeypatch):
    engine = create_engine("sqlite:///:memory:")
    monkeypatch.setattr(delivery, "engine", engine)
    monkeypatch.setenv("PYMENTOR_SCHEMA_MODE", "managed")
    try:
        with pytest.raises(RuntimeError, match="migration"):
            delivery._ensure_outbox_table()
        assert inspect(engine).get_table_names() == []
    finally:
        engine.dispose()


def test_managed_worker_accepts_existing_tables_without_ddl(monkeypatch):
    engine = create_engine("sqlite:///:memory:")
    monkeypatch.setattr(delivery, "engine", engine)
    monkeypatch.setenv("PYMENTOR_SCHEMA_MODE", "managed")
    statements = []
    try:
        Base.metadata.create_all(engine)
        def record(conn, cursor, statement, params, context, executemany):
            if statement.lstrip().upper().startswith(("CREATE ", "ALTER ", "DROP ")):
                statements.append(statement)
        event.listen(engine, "before_cursor_execute", record)
        delivery._ensure_outbox_table()
        assert statements == []
    finally:
        engine.dispose()


def test_legacy_sqlite_worker_keeps_existing_bootstrap_behavior(monkeypatch):
    engine = create_engine("sqlite:///:memory:")
    monkeypatch.setattr(delivery, "engine", engine)
    monkeypatch.delenv("PYMENTOR_SCHEMA_MODE", raising=False)
    try:
        delivery._ensure_outbox_table()
        assert "booking_notification_outbox" in inspect(engine).get_table_names()
        assert "landing_notification_outbox" in inspect(engine).get_table_names()
    finally:
        engine.dispose()
