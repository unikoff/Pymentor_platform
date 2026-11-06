"""Add stable account-generation identifiers to legacy SQLite databases."""

from sqlalchemy import text


# Each component is evaluated for every inserted user. SQLite's randomblob()
# supplies the random bits; the version and variant bits are set explicitly.
_UUID4 = """lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) ||
    '-4' || substr(lower(hex(randomblob(2))), 2) || '-' ||
    substr('89ab', (random() & 3) + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' ||
    lower(hex(randomblob(6)))"""


def ensure_sqlite_account_lifecycles(engine) -> None:
    """Install additive safeguards and backfill existing users transactionally.

    Older writers need not know about the new table. Nothing is removed from
    existing user or progress rows; SQLite foreign_keys may be disabled.
    """
    if engine.dialect.name != "sqlite":
        return
    with engine.begin() as connection:
        # Python's SQLite driver may otherwise auto-commit DDL before the first
        # write, leaving a partially installed table/trigger on failure.
        connection.exec_driver_sql("BEGIN IMMEDIATE")
        connection.execute(text("""
            CREATE TABLE IF NOT EXISTS account_lifecycles (
                user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                lifecycle_id TEXT NOT NULL UNIQUE,
                CHECK (length(lifecycle_id) = 36 AND substr(lifecycle_id, 15, 1) = '4'
                       AND substr(lifecycle_id, 20, 1) IN ('8','9','a','b'))
            )
        """))
        connection.execute(text("""
            CREATE TABLE IF NOT EXISTS account_deletion_events (
                lifecycle_id TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                deleted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """))
        connection.execute(text("""
            CREATE TRIGGER IF NOT EXISTS pymentor_account_deletion_event_v1
            BEFORE DELETE ON users BEGIN
                INSERT INTO account_deletion_events(lifecycle_id, user_id)
                SELECT lifecycle_id, OLD.id FROM account_lifecycles WHERE user_id = OLD.id;
            END
        """))
        connection.execute(text("""
            CREATE TABLE IF NOT EXISTS booking_notification_subjects (
                outbox_id INTEGER PRIMARY KEY REFERENCES booking_notification_outbox(id) ON DELETE CASCADE,
                lifecycle_id TEXT NOT NULL
            )
        """))
        connection.execute(text("""
            CREATE INDEX IF NOT EXISTS ix_booking_notification_subject_lifecycle
            ON booking_notification_subjects(lifecycle_id)
        """))
        connection.execute(text("""
            CREATE TRIGGER IF NOT EXISTS pymentor_booking_subject_outbox_delete_v1
            AFTER DELETE ON booking_notification_outbox BEGIN
                DELETE FROM booking_notification_subjects WHERE outbox_id = OLD.id;
            END
        """))
        connection.execute(text("""
            CREATE TRIGGER IF NOT EXISTS pymentor_user_booking_subject_delete_v1
            BEFORE DELETE ON users BEGIN
                SELECT CASE WHEN EXISTS (
                    SELECT 1 FROM booking_notification_outbox AS event
                    JOIN booking_notification_subjects AS subject ON subject.outbox_id = event.id
                    JOIN account_lifecycles AS owner ON owner.lifecycle_id = subject.lifecycle_id
                    WHERE owner.user_id = OLD.id AND event.status = 'processing'
                ) THEN RAISE(ABORT, 'notification_delivery_active') END;
                DELETE FROM booking_notification_outbox WHERE id IN (
                    SELECT subject.outbox_id FROM booking_notification_subjects AS subject
                    JOIN account_lifecycles AS owner ON owner.lifecycle_id = subject.lifecycle_id
                    WHERE owner.user_id = OLD.id
                );
            END
        """))
        connection.execute(text(f"""
            CREATE TRIGGER IF NOT EXISTS pymentor_account_lifecycle_insert_v1
            AFTER INSERT ON users BEGIN
                INSERT INTO account_lifecycles(user_id, lifecycle_id) VALUES (NEW.id, {_UUID4});
            END
        """))
        connection.execute(text("""
            CREATE TRIGGER IF NOT EXISTS pymentor_account_lifecycle_delete_v1
            AFTER DELETE ON users BEGIN
                DELETE FROM account_lifecycles WHERE user_id = OLD.id;
            END
        """))
        connection.execute(text(f"""
            INSERT INTO account_lifecycles(user_id, lifecycle_id)
            SELECT users.id, {_UUID4} FROM users
            WHERE NOT EXISTS (SELECT 1 FROM account_lifecycles WHERE user_id = users.id)
        """))
