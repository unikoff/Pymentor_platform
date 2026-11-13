"""Migration creates only the replay-protection table, preserving existing users."""
import importlib.util
from pathlib import Path

from alembic.migration import MigrationContext
from alembic.operations import Operations
from sqlalchemy import create_engine, inspect, text


def test_migration_on_existing_data(monkeypatch):
    path = Path(__file__).resolve().parents[2] / "migrations" / "versions" / "c502_email_change.py"
    spec = importlib.util.spec_from_file_location("email_change_migration", path)
    migration = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(migration)
    engine = create_engine("sqlite://")
    with engine.begin() as connection:
        connection.execute(text("CREATE TABLE users (id INTEGER PRIMARY KEY, email VARCHAR(100))"))
        connection.execute(text("INSERT INTO users VALUES (1, 'person@example.test')"))
        monkeypatch.setattr(migration, "op", Operations(MigrationContext.configure(connection)))
        migration.upgrade()
        assert inspect(connection).has_table("consumed_email_changes")
        assert connection.execute(text("SELECT email FROM users WHERE id=1")).scalar_one() == "person@example.test"
    assert migration.down_revision == "c501_verified"


def test_dual_confirmation_migration_preserves_existing_data(monkeypatch):
    path = Path(__file__).resolve().parents[2] / "migrations" / "versions" / "c503_dual_email_change.py"
    spec = importlib.util.spec_from_file_location("dual_email_change_migration", path)
    migration = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(migration)
    engine = create_engine("sqlite://")
    with engine.begin() as connection:
        connection.execute(text("CREATE TABLE users (id INTEGER PRIMARY KEY, email VARCHAR(100))"))
        connection.execute(text("INSERT INTO users VALUES (1, 'person@example.test')"))
        monkeypatch.setattr(migration, "op", Operations(MigrationContext.configure(connection)))
        migration.upgrade()
        assert inspect(connection).has_table("email_change_requests")
        assert connection.execute(text("SELECT email FROM users WHERE id=1")).scalar_one() == "person@example.test"
    assert migration.down_revision == "c502_email_change"
