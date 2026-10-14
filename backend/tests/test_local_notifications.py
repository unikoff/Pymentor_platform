from datetime import date
from pathlib import Path
import tempfile
import threading
import time
from unittest import TestCase
from unittest.mock import patch

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from DataBase.engine import Base
from DataBase.model import BookingNotificationOutbox
from services.local_notifications import LocalNotificationDispatcher


class LocalNotificationTests(TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="pymentor-local-notifications-")
        self.engine = create_engine(f"sqlite:///{Path(self.temp.name).as_posix()}/queue.db")
        Base.metadata.create_all(self.engine)
        self.sessions = sessionmaker(bind=self.engine)
        self.lock_patch = patch("services.notification_worker.LOCK_PATH", Path(self.temp.name) / "worker.lock")
        self.lock_patch.start()

    def tearDown(self):
        self.lock_patch.stop()
        self.engine.dispose()
        self.temp.cleanup()

    def enqueue(self, slot_id):
        with self.sessions() as session:
            row = BookingNotificationOutbox(
                event_type="booking_created", slot_id=slot_id,
                username="Test", email="test@example.com", slot_date=date.today(), start_time="18:00",
            )
            session.add(row)
            session.commit()
            return row.id

    def status(self, row_id):
        with self.sessions() as session:
            return session.get(BookingNotificationOutbox, row_id).status

    def test_delivers_existing_and_new_events_automatically(self):
        existing = self.enqueue(1)
        delivered = threading.Event()
        dispatcher = LocalNotificationDispatcher(
            session_factory=self.sessions, send=lambda event: delivered.set(), poll_seconds=0.03,
        )
        with patch("services.local_notifications._get_telegram_credentials", return_value=("test", "test")):
            dispatcher.start()
            try:
                self.assertTrue(delivered.wait(3))
                deadline = time.monotonic() + 3
                while self.status(existing) != "sent" and time.monotonic() < deadline:
                    time.sleep(0.01)
                self.assertEqual(self.status(existing), "sent")
                delivered.clear()
                new = self.enqueue(2)
                self.assertTrue(delivered.wait(3))
            finally:
                dispatcher.stop()
        self.assertEqual(self.status(new), "sent")
        self.assertFalse(dispatcher.thread.is_alive())

    def test_shutdown_finishes_current_delivery_and_leaves_next_event_pending(self):
        first = self.enqueue(1)
        second = self.enqueue(2)
        started = threading.Event()
        release = threading.Event()

        def send(event):
            started.set()
            if not release.wait(3):
                raise RuntimeError("test delivery blocked")

        dispatcher = LocalNotificationDispatcher(session_factory=self.sessions, send=send, poll_seconds=0.03)
        with patch("services.local_notifications._get_telegram_credentials", return_value=("test", "test")):
            dispatcher.start()
            try:
                self.assertTrue(started.wait(3))
                dispatcher.stop_event.set()
            finally:
                release.set()
                dispatcher.stop()
        self.assertEqual(self.status(first), "sent")
        self.assertEqual(self.status(second), "pending")

    def test_missing_credentials_preserve_queue(self):
        row = self.enqueue(1)
        dispatcher = LocalNotificationDispatcher(session_factory=self.sessions, poll_seconds=0.03)
        with patch("services.local_notifications._get_telegram_credentials", return_value=None):
            dispatcher.start()
            try:
                time.sleep(0.1)
            finally:
                dispatcher.stop()
        self.assertEqual(self.status(row), "pending")
