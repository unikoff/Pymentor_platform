"""Automatically drain the durable outbox while a local ASGI server is running."""

import logging
import threading

from DataBase.engine import SessionLocal
from services.notification_worker import (
    _release_worker_lock,
    _send_notification,
    _worker_lock,
    drain_notifications,
)
from services.telegram import _get_telegram_credentials


logger = logging.getLogger("pymentor.notifications.local")
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(name)s %(message)s"))
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)
    logger.propagate = False


class LocalNotificationDispatcher:
    def __init__(self, *, session_factory=SessionLocal, send=_send_notification, poll_seconds=1.0):
        self.session_factory = session_factory
        self.send = send
        self.poll_seconds = poll_seconds
        self.stop_event = threading.Event()
        self.thread = threading.Thread(target=self._run, name="booking-notifications", daemon=True)

    def start(self) -> None:
        self.thread.start()
        logger.info("local_notification_worker_started")

    def stop(self) -> None:
        self.stop_event.set()
        # Let the current delivery finish and release its DB lease/process lock.
        self.thread.join()
        logger.info("local_notification_worker_stopped")

    def _run(self) -> None:
        missing_credentials_logged = False
        while not self.stop_event.is_set():
            try:
                if _get_telegram_credentials() is None:
                    if not missing_credentials_logged:
                        logger.error("telegram_credentials_missing queue_preserved=true")
                        missing_credentials_logged = True
                else:
                    missing_credentials_logged = False
                    lock = _worker_lock()
                    if lock is not None:
                        try:
                            counts = drain_notifications(
                                session_factory=self.session_factory,
                                send=self.send,
                                budget_seconds=2.0,
                                stop_event=self.stop_event,
                            )
                            if any(counts.values()):
                                logger.info("local_delivery_result %s", counts)
                        finally:
                            _release_worker_lock(lock)
            except Exception as exc:
                logger.error("local_notification_worker_error error_type=%s", type(exc).__name__)
            self.stop_event.wait(self.poll_seconds)
