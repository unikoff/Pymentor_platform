"""Migration creates only the replay-protection table, preserving existing users."""
import importlib.util
from pathlib import Path

from alembic.migration import MigrationContext
from alembic.operations import Operations
from sqlalchemy import inspect, text
from contextlib import contextmanager
from uuid import uuid4
from pg_business_support import runtime_db


@contextmanager
def isolated_migration_connection(sessions):
    # runtime_db already verifies the exact disposable loopback database and user.
    schema = "email_migration_" + uuid4().hex
    with sessions.kw["bind"].connect() as connection:
        transaction = connection.begin()
        try:
            connection.exec_driver_sql(f'CREATE SCHEMA "{schema}"')
            connection.exec_driver_sql(f'SET LOCAL search_path TO "{schema}"')
            yield connection
        finally:
            transaction.rollback()  # PostgreSQL rolls back the schema and all test DDL.


def test_migration_on_existing_data(monkeypatch, runtime_db):
    path = Path(__file__).resolve().parents[2] / "migrations" / "versions" / "c502_email_change.py"
    spec = importlib.util.spec_from_file_location("email_change_migration", path)
    migration = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(migration)
    with isolated_migration_connection(runtime_db) as connection:
        connection.execute(text("CREATE TABLE users (id INTEGER PRIMARY KEY, email VARCHAR(100))"))
        connection.execute(text("INSERT INTO users VALUES (1, 'person@example.test')"))
        monkeypatch.setattr(migration, "op", Operations(MigrationContext.configure(connection)))
        migration.upgrade()
        assert inspect(connection).has_table("consumed_email_changes")
        assert connection.execute(text("SELECT email FROM users WHERE id=1")).scalar_one() == "person@example.test"
    assert migration.down_revision == "c501_verified"


def test_dual_confirmation_migration_preserves_existing_data(monkeypatch, runtime_db):
    path = Path(__file__).resolve().parents[2] / "migrations" / "versions" / "c503_dual_email_change.py"
    spec = importlib.util.spec_from_file_location("dual_email_change_migration", path)
    migration = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(migration)
    with isolated_migration_connection(runtime_db) as connection:
        connection.execute(text("CREATE TABLE users (id INTEGER PRIMARY KEY, email VARCHAR(100))"))
        connection.execute(text("INSERT INTO users VALUES (1, 'person@example.test')"))
        monkeypatch.setattr(migration, "op", Operations(MigrationContext.configure(connection)))
        migration.upgrade()
        assert inspect(connection).has_table("email_change_requests")
        assert connection.execute(text("SELECT email FROM users WHERE id=1")).scalar_one() == "person@example.test"
    assert migration.down_revision == "c502_email_change"
