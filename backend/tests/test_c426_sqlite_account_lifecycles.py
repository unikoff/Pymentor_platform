"""Generation identities on disposable SQLite, including legacy writers."""

from types import SimpleNamespace
from uuid import UUID

import pytest
from sqlalchemy import create_engine, event, text

from db import models  # register mapped tables
from db.engine import Base
from db.sqlite_account_lifecycles import ensure_sqlite_account_lifecycles


def test_existing_and_future_users_get_stable_generation_and_id_reuse_gets_new_generation():
    engine = create_engine("sqlite:///:memory:")
    try:
        Base.metadata.create_all(engine)
        with engine.begin() as connection:
            assert connection.scalar(text("PRAGMA foreign_keys")) == 0
            connection.execute(text("INSERT INTO users (id, username, email, password_hash, is_admin) "
                                    "VALUES (1, 'old', 'old@example.test', 'hash', 0)"))
        ensure_sqlite_account_lifecycles(engine)
        ensure_sqlite_account_lifecycles(engine)
        with engine.begin() as connection:
            old = connection.scalar(text("SELECT lifecycle_id FROM account_lifecycles WHERE user_id=1"))
            assert str(UUID(old)) == old and UUID(old).version == 4
            assert connection.scalar(text("SELECT email FROM users WHERE id=1")) == "old@example.test"
            # A legacy writer that knows nothing about generations is supported.
            connection.execute(text("DELETE FROM users WHERE id=1"))
            assert connection.scalar(text("SELECT count(*) FROM account_lifecycles WHERE user_id=1")) == 0
            connection.execute(text("INSERT INTO users (id, username, email, password_hash, is_admin) "
                                    "VALUES (1, 'new', 'new@example.test', 'hash', 0)"))
            new = connection.scalar(text("SELECT lifecycle_id FROM account_lifecycles WHERE user_id=1"))
            assert str(UUID(new)) == new and UUID(new).version == 4 and new != old
        ensure_sqlite_account_lifecycles(engine)
        with engine.connect() as connection:
            assert connection.scalar(text("SELECT lifecycle_id FROM account_lifecycles WHERE user_id=1")) == new
    finally:
        engine.dispose()


def test_rollback_restores_original_generation():
    engine = create_engine("sqlite:///:memory:")
    try:
        Base.metadata.create_all(engine)
        ensure_sqlite_account_lifecycles(engine)
        with engine.begin() as connection:
            connection.execute(text("INSERT INTO users (id, username, email, password_hash, is_admin) "
                                    "VALUES (1, 'old', 'old@example.test', 'hash', 0)"))
            old = connection.scalar(text("SELECT lifecycle_id FROM account_lifecycles WHERE user_id=1"))
        with engine.connect() as connection:
            transaction = connection.begin()
            connection.execute(text("DELETE FROM users WHERE id=1"))
            connection.execute(text("INSERT INTO users (id, username, email, password_hash, is_admin) "
                                    "VALUES (1, 'new', 'new@example.test', 'hash', 0)"))
            assert connection.scalar(text("SELECT lifecycle_id FROM account_lifecycles WHERE user_id=1")) != old
            transaction.rollback()
        with engine.connect() as connection:
            assert connection.scalar(text("SELECT lifecycle_id FROM account_lifecycles WHERE user_id=1")) == old
            assert connection.scalar(text("SELECT email FROM users WHERE id=1")) == "old@example.test"
    finally:
        engine.dispose()


def test_other_dialects_are_not_modified():
    ensure_sqlite_account_lifecycles(SimpleNamespace(dialect=SimpleNamespace(name="postgresql")))


def test_failed_installation_rolls_back_table_and_trigger():
    engine = create_engine("sqlite:///:memory:")
    try:
        Base.metadata.create_all(engine)

        def fail_before_delete_trigger(_conn, _cursor, statement, _params, _context, _many):
            if "CREATE TRIGGER IF NOT EXISTS pymentor_account_lifecycle_delete_v1" in statement:
                raise RuntimeError("synthetic installation failure")

        event.listen(engine, "before_cursor_execute", fail_before_delete_trigger)
        with pytest.raises(RuntimeError, match="synthetic installation failure"):
            ensure_sqlite_account_lifecycles(engine)
        event.remove(engine, "before_cursor_execute", fail_before_delete_trigger)
        with engine.connect() as connection:
            assert connection.scalar(text("SELECT count(*) FROM sqlite_master WHERE name IN "
                                          "('account_lifecycles', 'pymentor_account_lifecycle_insert_v1')")) == 0
    finally:
        engine.dispose()
