"""Synthetic SQLite recovery scenario for PYM-426; this is not production protection."""

import pytest
from sqlalchemy import create_engine, text

from db import models  # noqa: F401 - register mapped tables
from db.engine import Base
from db.sqlite_account_lifecycles import ensure_sqlite_account_lifecycles


class RestoreBlocked(RuntimeError):
    """Independent deletion evidence is required before applying a restore filter."""


def _bootstrap(engine):
    Base.metadata.create_all(engine)
    ensure_sqlite_account_lifecycles(engine)


def _copy_database(source_engine, destination_engine):
    source = source_engine.raw_connection()
    destination = destination_engine.raw_connection()
    try:
        source.driver_connection.backup(destination.driver_connection)
    finally:
        source.close()
        destination.close()


def _apply_deletion_journal(snapshot_engine, deletion_events):
    if not deletion_events:
        raise RestoreBlocked("independent deletion journal is absent or empty")

    with snapshot_engine.begin() as connection:
        connection.execute(
            text("""
                DELETE FROM users
                WHERE id IN (
                    SELECT lifecycle.user_id
                    FROM account_lifecycles AS lifecycle
                    WHERE lifecycle.lifecycle_id = :lifecycle_id
                )
            """),
            [{"lifecycle_id": event["lifecycle_id"]} for event in deletion_events],
        )


def test_synthetic_restore_uses_independent_lifecycle_deletion_journal():
    # Exactly two isolated synthetic SQLite databases: post-delete source and snapshot.
    source_engine = create_engine("sqlite:///:memory:")
    snapshot_engine = create_engine("sqlite:///:memory:")
    try:
        _bootstrap(source_engine)
        with source_engine.begin() as connection:
            connection.execute(
                text("INSERT INTO users (id, username, email, password_hash, is_admin) "
                     "VALUES (41, 'old-user', 'old@example.test', 'synthetic-hash', 0)")
            )
            old_lifecycle = connection.scalar(
                text("SELECT lifecycle_id FROM account_lifecycles WHERE user_id = 41")
            )

        # Snapshot the first SQLite before source deletion; clone schema and rows exactly.
        _copy_database(source_engine, snapshot_engine)
        _bootstrap(snapshot_engine)

        # Missing journal evidence explicitly blocks any restore filtering/action.
        with pytest.raises(RestoreBlocked, match="journal is absent or empty"):
            _apply_deletion_journal(snapshot_engine, [])
        with snapshot_engine.connect() as connection:
            assert connection.scalar(text("SELECT email FROM users WHERE id = 41")) == "old@example.test"

        # Source records deletion, then reuses the numeric ID for a new lifecycle.
        with source_engine.begin() as connection:
            connection.execute(text("DELETE FROM users WHERE id = 41"))
            connection.execute(
                text("INSERT INTO users (id, username, email, password_hash, is_admin) "
                     "VALUES (41, 'new-user', 'new@example.test', 'synthetic-hash', 0)")
            )
            new_lifecycle = connection.scalar(
                text("SELECT lifecycle_id FROM account_lifecycles WHERE user_id = 41")
            )
            events = [dict(row) for row in connection.execute(text(
                "SELECT lifecycle_id, user_id FROM account_deletion_events"
            )).mappings()]

        assert len(events) == 1
        assert events[0] == {"lifecycle_id": old_lifecycle, "user_id": 41}
        assert new_lifecycle != old_lifecycle

        # Filter the snapshot by the confirmed generation, never numeric ID alone.
        _apply_deletion_journal(snapshot_engine, events)
        with snapshot_engine.connect() as connection:
            assert connection.scalar(text("SELECT count(*) FROM users WHERE id = 41")) == 0
            assert connection.scalar(text(
                "SELECT count(*) FROM users JOIN account_lifecycles "
                "ON users.id = account_lifecycles.user_id"
            )) == 0
        # Applying the old generation's journal to a snapshot containing the
        # replacement must not delete that replacement, despite the reused id.
        _apply_deletion_journal(source_engine, events)
        with source_engine.connect() as connection:
            assert connection.scalar(text("SELECT email FROM users WHERE id = 41")) == "new@example.test"
            assert connection.scalar(text(
                "SELECT lifecycle_id FROM account_lifecycles WHERE user_id = 41"
            )) == new_lifecycle
    finally:
        snapshot_engine.dispose()
        source_engine.dispose()
