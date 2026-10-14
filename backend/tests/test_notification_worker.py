from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
import json
import os
from pathlib import Path
import subprocess
import sqlite3
import sys
import tempfile
from unittest import TestCase
from unittest.mock import Mock, patch

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from DataBase.engine import Base
from DataBase import model as models
from routers.user import crud
from services.notification_worker import (
    MAX_ATTEMPTS,
    _claim_next,
    drain_notifications,
    retry_failed,
    _worker_lock,
    _release_worker_lock,
)
from services.telegram import TelegramDeliveryError


class NotificationOutboxTests(TestCase):
    @staticmethod
    def utcnow() -> datetime:
        return datetime.now(timezone.utc)

    @staticmethod
    def as_utc(value: datetime) -> datetime:
        if value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value.astimezone(timezone.utc)

    def setUp(self) -> None:
        self.engine = create_engine("sqlite://")
        Base.metadata.create_all(self.engine)
        self.sessions = sessionmaker(bind=self.engine)
        self.db = self.sessions()
        self.user = models.User(
            username="Никита",
            email="student@example.com",
            _password_hash="test-hash",
        )
        self.db.add(self.user)
        self.db.flush()
        self.slot_date = date.today() + timedelta(days=10)
        self.slot = models.BookingSlot(
            slot_date=self.slot_date,
            start_time="18:00",
            duration_minutes=60,
        )
        self.db.add(self.slot)
        self.db.add(
            models.BookingQuota(
                user_id=self.user.id,
                year=self.slot_date.year,
                month=self.slot_date.month,
                granted_slots=1,
            )
        )
        self.db.commit()
        self.db.refresh(self.slot)

    def tearDown(self) -> None:
        self.db.close()
        Base.metadata.drop_all(self.engine)
        self.engine.dispose()

    def _enqueue(self, event_type: str = "booking_created", *, slot_id: int | None = None):
        event = models.BookingNotificationOutbox(
            event_type=event_type,
            slot_id=slot_id or self.slot.id,
            username="Никита",
            email="student@example.com",
            slot_date=self.slot_date,
            start_time="18:00",
        )
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        return event

    def _reload_event(self, event_id: int):
        self.db.expire_all()
        return self.db.get(models.BookingNotificationOutbox, event_id)

    def test_booking_and_notification_are_committed_together(self) -> None:
        booked = crud.book_slot(
            self.slot.id,
            self.user.id,
            self.db,
            notification_username=self.user.username,
            notification_email=self.user.email,
        )
        event = self.db.query(models.BookingNotificationOutbox).one()

        self.assertEqual(booked.student_id, self.user.id)
        self.assertEqual(event.event_type, "booking_created")
        self.assertEqual(event.status, "pending")
        self.assertEqual(event.slot_id, booked.id)

    def test_failed_booking_commit_does_not_leave_slot_or_notification(self) -> None:
        with patch.object(self.db, "commit", side_effect=RuntimeError("commit failed")):
            with self.assertRaisesRegex(RuntimeError, "commit failed"):
                crud.book_slot(
                    self.slot.id,
                    self.user.id,
                    self.db,
                    notification_username=self.user.username,
                    notification_email=self.user.email,
                )
        self.db.rollback()
        self.assertIsNone(self.db.get(models.BookingSlot, self.slot.id).student_id)
        self.assertEqual(self.db.query(models.BookingNotificationOutbox).count(), 0)

    def test_cancellation_adds_ordered_notification_in_the_same_transaction(self) -> None:
        crud.book_slot(
            self.slot.id,
            self.user.id,
            self.db,
            notification_username=self.user.username,
            notification_email=self.user.email,
        )
        cancelled = crud.cancel_booking(
            self.slot.id,
            self.user.id,
            self.db,
            notification_username=self.user.username,
            notification_email=self.user.email,
        )
        events = (
            self.db.query(models.BookingNotificationOutbox)
            .order_by(models.BookingNotificationOutbox.id)
            .all()
        )

        self.assertIsNone(cancelled.student_id)
        self.assertEqual([event.event_type for event in events], ["booking_created", "booking_cancelled"])

    def test_worker_sends_and_marks_success(self) -> None:
        event = self._enqueue()
        sender = Mock()

        counts = drain_notifications(session_factory=self.sessions, send=sender, budget_seconds=5)

        self.assertEqual(counts["sent"], 1)
        sender.assert_called_once()
        saved = self._reload_event(event.id)
        self.assertEqual(saved.status, "sent")
        self.assertIsNotNone(saved.sent_at)
        self.assertEqual(saved.attempts, 1)

    def test_transient_failure_is_scheduled_for_retry(self) -> None:
        event = self._enqueue()
        sender = Mock(side_effect=OSError("network failed"))

        counts = drain_notifications(session_factory=self.sessions, send=sender, budget_seconds=5)

        saved = self._reload_event(event.id)
        self.assertEqual(counts["retry"], 1)
        self.assertEqual(saved.status, "pending")
        self.assertEqual(saved.attempts, 1)
        self.assertGreater(self.as_utc(saved.next_attempt_at), self.utcnow())
        self.assertNotIn("network failed", saved.last_error)

    def test_permanent_failure_is_marked_failed(self) -> None:
        event = self._enqueue()
        sender = Mock(side_effect=TelegramDeliveryError("Telegram error 403", retryable=False))

        counts = drain_notifications(session_factory=self.sessions, send=sender, budget_seconds=5)

        saved = self._reload_event(event.id)
        self.assertEqual(counts["failed"], 1)
        self.assertEqual(saved.status, "failed")
        self.assertEqual(saved.last_error, "Telegram error 403")

    def test_telegram_retry_after_is_used_for_rate_limit(self) -> None:
        event = self._enqueue()
        sender = Mock(
            side_effect=TelegramDeliveryError(
                "Telegram error 429", retryable=True, retry_after_seconds=120
            )
        )

        with patch("services.notification_worker.random.randint", return_value=0):
            drain_notifications(session_factory=self.sessions, send=sender, budget_seconds=5)

        saved = self._reload_event(event.id)
        self.assertGreaterEqual(self.as_utc(saved.next_attempt_at), self.utcnow() + timedelta(seconds=119))

    def test_older_event_blocks_later_event_for_same_slot(self) -> None:
        older = self._enqueue()
        older.next_attempt_at = self.utcnow() + timedelta(minutes=10)
        newer = models.BookingNotificationOutbox(
            event_type="booking_cancelled",
            slot_id=self.slot.id,
            username="Никита",
            email="student@example.com",
            slot_date=self.slot_date,
            start_time="18:00",
        )
        self.db.add(newer)
        self.db.commit()

        claim_session = self.sessions()
        try:
            claimed = _claim_next(claim_session, self.utcnow() + timedelta(minutes=1))
        finally:
            claim_session.close()

        self.assertIsNone(claimed)
        self.assertEqual(self._reload_event(older.id).status, "pending")
        self.assertEqual(self._reload_event(newer.id).status, "pending")

    def test_expired_worker_lease_can_be_recovered(self) -> None:
        event = self._enqueue()
        event.status = "processing"
        event.attempts = 1
        event.lock_token = "old-lock"
        event.locked_until = self.utcnow() - timedelta(seconds=1)
        self.db.commit()

        claim_session = self.sessions()
        try:
            claimed = _claim_next(claim_session)
        finally:
            claim_session.close()

        self.assertIsNotNone(claimed)
        self.assertEqual(claimed.id, event.id)
        self.assertNotEqual(claimed.lock_token, "old-lock")
        self.assertEqual(self._reload_event(event.id).attempts, 2)

    def test_exhausted_expired_lease_moves_to_failed(self) -> None:
        event = self._enqueue()
        event.status = "processing"
        event.attempts = MAX_ATTEMPTS
        event.locked_until = self.utcnow() - timedelta(seconds=1)
        event.lock_token = "lost-worker"
        self.db.commit()

        claim_session = self.sessions()
        try:
            claimed = _claim_next(claim_session)
        finally:
            claim_session.close()

        self.assertIsNone(claimed)
        saved = self._reload_event(event.id)
        self.assertEqual(saved.status, "failed")
        self.assertIsNone(saved.locked_until)

    def test_old_sent_events_are_pruned(self) -> None:
        event = self._enqueue()
        event_id = event.id
        event.status = "sent"
        event.sent_at = self.utcnow() - timedelta(days=31)
        self.db.commit()

        drain_notifications(session_factory=self.sessions, budget_seconds=5)

        self.assertIsNone(self._reload_event(event_id))

    def test_rate_limit_pauses_new_events_for_other_slots(self) -> None:
        self._enqueue()
        sender = Mock(side_effect=TelegramDeliveryError("rate limit", retryable=True, retry_after_seconds=120))
        drain_notifications(session_factory=self.sessions, send=sender)
        self._enqueue(slot_id=999)
        claim_session = self.sessions()
        try:
            self.assertIsNone(_claim_next(claim_session, self.utcnow() + timedelta(seconds=30)))
        finally:
            claim_session.close()

    def test_retry_does_not_resend_old_booking_after_sent_cancellation(self) -> None:
        older = self._enqueue()
        older.status = "failed"
        self.db.commit()
        newer = self._enqueue("booking_cancelled")
        newer.status = "sent"
        self.db.commit()
        self.assertEqual(retry_failed(self.sessions), 0)
        self.assertEqual(self._reload_event(older.id).status, "failed")


class NotificationWorkerProcessTests(TestCase):
    def test_network_delivery_does_not_hold_sqlite_write_transaction(self) -> None:
        with tempfile.TemporaryDirectory(prefix="pymentor-outbox-transaction-") as directory:
            db_path = Path(directory) / "queue.sqlite3"
            engine = create_engine(f"sqlite:///{db_path.as_posix()}")
            sessions = sessionmaker(bind=engine)
            try:
                Base.metadata.create_all(engine)
                with sessions() as session:
                    session.add(models.BookingNotificationOutbox(
                        event_type="booking_created", slot_id=1, username="Test",
                        email="test@example.com", slot_date=date.today(), start_time="18:00",
                    ))
                    session.commit()

                def send(event):
                    connection = sqlite3.connect(db_path, timeout=0.2)
                    try:
                        connection.execute("CREATE TABLE api_write_during_delivery (value INTEGER)")
                        connection.execute("INSERT INTO api_write_during_delivery VALUES (1)")
                        connection.commit()
                    finally:
                        connection.close()

                counts = drain_notifications(session_factory=sessions, send=send)
                self.assertEqual(counts["sent"], 1)
                self.assertEqual(counts["retry"], 0)
            finally:
                engine.dispose()

    def test_cron_cli_initializes_schema_idempotently_on_isolated_database(self) -> None:
        with tempfile.TemporaryDirectory(prefix="pymentor-outbox-cli-") as directory:
            db_path = Path(directory) / "queue.sqlite3"
            with sqlite3.connect(db_path) as connection:
                connection.execute("CREATE TABLE existing_data (value TEXT)")
                connection.execute("INSERT INTO existing_data VALUES ('preserved')")
            connection.close()
            env = dict(os.environ, DATABASE_URL=f"sqlite:///{db_path.as_posix()}")
            backend = Path(__file__).resolve().parents[1]
            backup = Path(directory) / "before-migration.sqlite3"
            result = subprocess.run(
                [sys.executable, "-m", "services.notification_worker", "--backup-db", str(backup)],
                cwd=backend, env=env, capture_output=True, text=True, timeout=15,
            )
            self.assertEqual(result.returncode, 0, result.stderr)
            connection = sqlite3.connect(backup)
            try:
                self.assertEqual(connection.execute("SELECT value FROM existing_data").fetchone()[0], "preserved")
                self.assertIsNone(connection.execute("SELECT name FROM sqlite_master WHERE name='booking_notification_outbox'").fetchone())
            finally:
                connection.close()
            for _ in range(2):
                result = subprocess.run(
                    [sys.executable, "-m", "services.notification_worker", "--stats"],
                    cwd=backend, env=env, capture_output=True, text=True, timeout=15,
                )
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertEqual(json.loads(result.stdout)["counts"], {})
            with sqlite3.connect(db_path) as connection:
                self.assertEqual(connection.execute("SELECT value FROM existing_data").fetchone()[0], "preserved")
            connection.close()

    def test_worker_lock_excludes_another_process_and_recovers_after_release(self) -> None:
        with tempfile.TemporaryDirectory(prefix="pymentor-outbox-lock-") as directory:
            path = Path(directory) / "worker.lock"
            code = (
                "from pathlib import Path; import sys; from services import notification_worker as w; "
                "w.LOCK_PATH=Path(sys.argv[1]); handle=w._worker_lock(); "
                "print('busy' if handle is None else 'acquired'); "
                "w._release_worker_lock(handle) if handle is not None else None"
            )
            with patch("services.notification_worker.LOCK_PATH", path):
                lock = _worker_lock()
                self.assertIsNotNone(lock)
                try:
                    result = subprocess.run(
                        [sys.executable, "-c", code, str(path)],
                        cwd=Path(__file__).resolve().parents[1],
                        capture_output=True, text=True, timeout=15,
                    )
                    self.assertEqual(result.returncode, 0, result.stderr)
                    self.assertEqual(result.stdout.strip(), "busy")
                finally:
                    _release_worker_lock(lock)
                recovered = _worker_lock()
                self.assertIsNotNone(recovered)
                _release_worker_lock(recovered)


if __name__ == "__main__":
    import unittest

    unittest.main()
