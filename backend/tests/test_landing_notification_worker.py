from __future__ import annotations

import json
import os
from datetime import date, datetime, timedelta, timezone
from unittest import TestCase
from unittest.mock import call, patch

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from db import models
from db.engine import Base
from notifications.delivery import drain_notifications, queue_stats, retry_failed
from notifications.telegram import TelegramDeliveryError
from routers.landings import service


class LandingNotificationWorkerTests(TestCase):
    def setUp(self) -> None:
        self.engine = create_engine("sqlite://")
        Base.metadata.create_all(self.engine)
        self.sessions = sessionmaker(bind=self.engine)
        self.db = self.sessions()
        self.landing = service.create_landing(
            self.db, slug="backend", title="Pymentor", description="Основной лендинг"
        )
        self.first_config = service.configure_landing_telegram(
            self.db,
            self.landing.id,
            secret_ref="backend-bot-v1",
            chat_id="chat-v1",
            bot_username="first_bot",
        )
        self.event, _ = service.enqueue_landing_event(
            self.db,
            landing_id=self.landing.id,
            event_id="event-worker-1",
            event_type="telegram_connection_test.v1",
            payload={},
        )

    def tearDown(self) -> None:
        self.db.close()
        Base.metadata.drop_all(self.engine)
        self.engine.dispose()

    def test_worker_sends_landing_event_to_its_original_config_version(self) -> None:
        service.configure_landing_telegram(
            self.db,
            self.landing.id,
            secret_ref="backend-bot-v2",
            chat_id="chat-v2",
            bot_username="second_bot",
        )
        service.disable_landing_telegram(self.db, self.landing.id)
        credentials = json.dumps({"backend-bot-v1": "first-secret", "backend-bot-v2": "second-secret"})
        with patch.dict(os.environ, {"PYMENTOR_LANDING_BOT_CREDENTIALS": credentials}), patch(
            "notifications.delivery.send_landing_notification"
        ) as send:
            counts = drain_notifications(session_factory=self.sessions, budget_seconds=5)

        self.assertEqual(counts["sent"], 1)
        send.assert_called_once_with(
            token="first-secret",
            chat_id="chat-v1",
            landing_slug="backend",
            event_id="event-worker-1",
            event_type="telegram_connection_test.v1",
            payload={},
        )
        self.db.expire_all()
        saved = self.db.get(models.LandingNotificationOutbox, self.event.id)
        self.assertEqual(saved.status, "sent")
        self.assertEqual(saved.destination_config_id, self.first_config.id)

    def test_worker_keeps_two_landing_destinations_isolated(self) -> None:
        second_landing = service.create_landing(
            self.db,
            slug="python-start",
            title="Старт в Python",
            description="Второй лендинг",
        )
        second_config = service.configure_landing_telegram(
            self.db,
            second_landing.id,
            secret_ref="python-start-bot-v1",
            chat_id="chat-python-start",
            bot_username="python_start_bot",
        )
        second_event, _ = service.enqueue_landing_event(
            self.db,
            landing_id=second_landing.id,
            event_id="event-python-start-1",
            event_type="telegram_connection_test.v1",
            payload={},
        )
        credentials = json.dumps(
            {
                "backend-bot-v1": "backend-secret",
                "python-start-bot-v1": "python-start-secret",
            }
        )

        with patch.dict(os.environ, {"PYMENTOR_LANDING_BOT_CREDENTIALS": credentials}), patch(
            "notifications.delivery.send_landing_notification"
        ) as send:
            counts = drain_notifications(session_factory=self.sessions, budget_seconds=5)

        self.assertEqual(counts["sent"], 2)
        self.assertEqual(
            send.call_args_list,
            [
                call(
                    token="backend-secret",
                    chat_id="chat-v1",
                    landing_slug="backend",
                    event_id="event-worker-1",
                    event_type="telegram_connection_test.v1",
                    payload={},
                ),
                call(
                    token="python-start-secret",
                    chat_id="chat-python-start",
                    landing_slug="python-start",
                    event_id="event-python-start-1",
                    event_type="telegram_connection_test.v1",
                    payload={},
                ),
            ],
        )
        self.db.expire_all()
        self.assertEqual(
            self.db.get(models.LandingNotificationOutbox, second_event.id).destination_config_id,
            second_config.id,
        )

    def test_worker_retries_failed_landing_delivery_without_logging_the_bot_token(self) -> None:
        secret = "secret-that-must-not-leak"
        credentials = json.dumps({"backend-bot-v1": secret})
        with self.assertLogs("booking_notification_worker", level="WARNING") as logs:
            with patch.dict(os.environ, {"PYMENTOR_LANDING_BOT_CREDENTIALS": credentials}), patch(
                "notifications.delivery.send_landing_notification",
                side_effect=OSError(f"transport failed for {secret}"),
            ):
                counts = drain_notifications(session_factory=self.sessions, budget_seconds=5)

        self.assertEqual(counts["retry"], 1)
        self.assertNotIn(secret, "\n".join(logs.output))
        self.db.expire_all()
        saved = self.db.get(models.LandingNotificationOutbox, self.event.id)
        self.assertEqual(saved.status, "pending")
        self.assertNotIn(secret, saved.last_error or "")

    def test_worker_marks_permanent_landing_failure_failed_and_invalidates_destination(self) -> None:
        credentials = json.dumps({"backend-bot-v1": "invalid-secret"})
        with patch.dict(os.environ, {"PYMENTOR_LANDING_BOT_CREDENTIALS": credentials}), patch(
            "notifications.delivery.send_landing_notification",
            side_effect=TelegramDeliveryError("Telegram error 403", retryable=False),
        ):
            counts = drain_notifications(session_factory=self.sessions, budget_seconds=5)

        self.assertEqual(counts["failed"], 1)
        self.db.expire_all()
        saved = self.db.get(models.LandingNotificationOutbox, self.event.id)
        config = self.db.get(models.LandingTelegramConfig, self.first_config.id)
        self.assertEqual(saved.status, "failed")
        self.assertEqual(config.status, "invalid")
        self.assertNotIn("invalid-secret", saved.last_error or "")

    def test_worker_may_redeliver_landing_event_after_ambiguous_timeout(self) -> None:
        credentials = json.dumps({"backend-bot-v1": "backend-secret"})
        with patch.dict(os.environ, {"PYMENTOR_LANDING_BOT_CREDENTIALS": credentials}), patch(
            "notifications.delivery.send_landing_notification",
            side_effect=[TimeoutError("response timed out after possible acceptance"), None],
        ) as send, patch("notifications.delivery.random.randint", return_value=0):
            first_counts = drain_notifications(session_factory=self.sessions, budget_seconds=5)
            self.event.next_attempt_at = datetime.now(timezone.utc) - timedelta(seconds=1)
            self.db.commit()
            second_counts = drain_notifications(session_factory=self.sessions, budget_seconds=5)

        self.assertEqual(first_counts["retry"], 1)
        self.assertEqual(second_counts["sent"], 1)
        self.assertEqual([entry.kwargs["event_id"] for entry in send.call_args_list], ["event-worker-1"] * 2)
        self.db.expire_all()
        saved = self.db.get(models.LandingNotificationOutbox, self.event.id)
        self.assertEqual(saved.status, "sent")
        self.assertEqual(saved.attempts, 2)

    def test_worker_recovers_an_expired_landing_lease(self) -> None:
        self.event.status = "processing"
        self.event.attempts = 1
        self.event.lock_token = "expired-lock"
        self.event.locked_until = datetime.now(timezone.utc) - timedelta(seconds=1)
        self.db.commit()
        credentials = json.dumps({"backend-bot-v1": "backend-secret"})

        with patch.dict(os.environ, {"PYMENTOR_LANDING_BOT_CREDENTIALS": credentials}), patch(
            "notifications.delivery.send_landing_notification"
        ) as send:
            counts = drain_notifications(session_factory=self.sessions, budget_seconds=5)

        self.assertEqual(counts["sent"], 1)
        send.assert_called_once()
        self.db.expire_all()
        saved = self.db.get(models.LandingNotificationOutbox, self.event.id)
        self.assertEqual(saved.status, "sent")
        self.assertEqual(saved.attempts, 2)
        self.assertIsNone(saved.lock_token)

    def test_shared_worker_alternates_landing_and_booking_queues(self) -> None:
        for index in range(2):
            service.enqueue_landing_event(
                self.db,
                landing_id=self.landing.id,
                event_id=f"event-worker-{index + 2}",
                event_type="telegram_connection_test.v1",
                payload={},
            )
        for index in range(4):
            self.db.add(
                models.BookingNotificationOutbox(
                    event_type="booking_created",
                    slot_id=index + 1,
                    username="Student",
                    email="student@example.test",
                    slot_date=date.today() + timedelta(days=2),
                    start_time="12:00",
                )
            )
        self.db.commit()
        sent_types: list[str] = []

        counts = drain_notifications(
            session_factory=self.sessions,
            limit=4,
            budget_seconds=5,
            send=lambda event: sent_types.append(type(event).__name__),
        )

        self.assertEqual(counts["sent"], 4)
        self.assertEqual(sent_types.count("ClaimedLandingNotification"), 2)
        self.assertEqual(sent_types.count("ClaimedNotification"), 2)

    def test_admin_queue_metrics_omit_event_payload_and_cli_retry_requeues_failed_landing(self) -> None:
        self.event.status = "failed"
        self.event.last_error = "Telegram connection failed"
        self.db.commit()

        metrics = queue_stats(self.sessions)
        retried_count = retry_failed(self.sessions)

        self.assertEqual(metrics["counts"]["failed"], 1)
        self.assertEqual(metrics["recent_failures"][0]["event_id"], self.event.event_id)
        self.assertNotIn("payload", metrics["recent_failures"][0])
        self.assertEqual(retried_count, 1)
        self.db.expire_all()
        saved = self.db.get(models.LandingNotificationOutbox, self.event.id)
        self.assertEqual(saved.status, "pending")
        self.assertEqual(saved.manual_retry_count, 1)
