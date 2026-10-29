from __future__ import annotations

import os
import json
from unittest import TestCase
from unittest.mock import patch

from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from db import models
from db.engine import Base
from db.bootstrap import ensure_default_landing
from routers.landings import service


class LandingRegistryTests(TestCase):
    def setUp(self) -> None:
        self.engine = create_engine("sqlite://")
        Base.metadata.create_all(self.engine)
        self.sessions = sessionmaker(bind=self.engine)
        self.db = self.sessions()

    def tearDown(self) -> None:
        self.db.close()
        Base.metadata.drop_all(self.engine)
        self.engine.dispose()

    def test_two_landing_ids_can_be_enabled_independently(self) -> None:
        first = service.create_landing(
            self.db, slug="backend", title="Основной лендинг", description="Главная страница"
        )
        second = service.create_landing(
            self.db, slug="python-start", title="Старт в Python", description="Курс для новичков"
        )

        service.set_landing_enabled(self.db, first.id, enabled=False)
        self.db.refresh(first)
        self.db.refresh(second)

        self.assertNotEqual(first.id, second.id)
        self.assertFalse(first.is_active)
        self.assertTrue(second.is_active)

    def test_existing_backend_route_is_registered_idempotently(self) -> None:
        first = ensure_default_landing(self.sessions)
        second = ensure_default_landing(self.sessions)

        self.assertEqual(first.id, "pymentor-backend")
        self.assertEqual(first.id, second.id)
        self.assertEqual(first.slug, "backend")
        self.assertTrue(first.is_active)
        self.assertEqual(self.db.query(models.Landing).count(), 1)

    def test_bootstrap_keeps_an_existing_backend_landing_identity(self) -> None:
        existing = service.create_landing(
            self.db, slug="backend", title="Custom title", description="Already configured"
        )

        seeded = ensure_default_landing(self.sessions)

        self.assertEqual(seeded.id, existing.id)
        self.assertEqual(seeded.title, "Custom title")
        self.assertEqual(seeded.description, "Already configured")

    def test_duplicate_slug_is_rejected_without_creating_a_second_landing(self) -> None:
        service.create_landing(
            self.db, slug="backend", title="Первый", description=""
        )

        with self.assertRaises(HTTPException) as raised:
            service.create_landing(self.db, slug="backend", title="Дубликат", description="")

        self.assertEqual(raised.exception.status_code, 409)
        self.assertEqual(self.db.query(models.Landing).count(), 1)

    def test_replacing_telegram_destination_preserves_the_queued_recipient_version(self) -> None:
        landing = service.create_landing(
            self.db, slug="backend", title="Основной лендинг", description="Главная страница"
        )
        first = service.configure_landing_telegram(
            self.db,
            landing.id,
            secret_ref="backend-bot-v1",
            chat_id="chat-1",
            bot_username="first_bot",
        )
        event, duplicate = service.enqueue_landing_event(
            self.db,
            landing_id=landing.id,
            event_id="event-1",
            event_type="telegram_connection_test.v1",
            payload={},
        )

        second = service.configure_landing_telegram(
            self.db,
            landing.id,
            secret_ref="backend-bot-v2",
            chat_id="chat-2",
            bot_username="second_bot",
        )

        self.assertFalse(duplicate)
        self.assertNotEqual(first.id, second.id)
        self.assertEqual(event.destination_config_id, first.id)
        self.assertEqual(self.db.query(models.LandingTelegramConfig).count(), 2)
        self.assertEqual(second.version, first.version + 1)
        self.assertEqual(first.chat_id, "chat-1")

    def test_test_event_is_idempotent_and_rejects_payload_changes(self) -> None:
        landing = service.create_landing(
            self.db, slug="backend", title="Основной лендинг", description="Главная страница"
        )
        service.configure_landing_telegram(
            self.db,
            landing.id,
            secret_ref="backend-bot-v1",
            chat_id="chat-1",
            bot_username="test_bot",
        )

        first, duplicate = service.enqueue_landing_event(
            self.db,
            landing_id=landing.id,
            event_id="event-1",
            event_type="telegram_connection_test.v1",
            payload={},
        )
        repeated, was_duplicate = service.enqueue_landing_event(
            self.db,
            landing_id=landing.id,
            event_id="event-1",
            event_type="telegram_connection_test.v1",
            payload={},
        )

        self.assertFalse(duplicate)
        self.assertTrue(was_duplicate)
        self.assertEqual(first.id, repeated.id)
        self.assertEqual(self.db.query(models.LandingNotificationOutbox).count(), 1)

        with self.assertRaises(HTTPException) as raised:
            service.enqueue_landing_event(
                self.db,
                landing_id=landing.id,
                event_id="event-1",
                event_type="telegram_connection_test.v1",
                payload={"unexpected": "value"},
            )
        self.assertIn(raised.exception.status_code, {409, 422})

    def test_landing_bot_token_is_resolved_only_from_external_secret_mapping(self) -> None:
        with patch.dict(
            os.environ,
            {"PYMENTOR_LANDING_BOT_CREDENTIALS": json.dumps({"backend-bot-v1": "token-do-not-store"})},
        ):
            token = service.resolve_landing_bot_token("backend-bot-v1")

        self.assertEqual(token, "token-do-not-store")
        self.assertNotIn("token-do-not-store", {column.name for column in models.LandingTelegramConfig.__table__.columns})

    def test_manual_retry_is_limited_to_failed_events_and_three_attempts(self) -> None:
        landing = service.create_landing(
            self.db, slug="backend", title="Основной лендинг", description="Главная страница"
        )
        service.configure_landing_telegram(
            self.db,
            landing.id,
            secret_ref="backend-bot-v1",
            chat_id="chat-1",
            bot_username="test_bot",
        )
        event, _ = service.enqueue_landing_event(
            self.db,
            landing_id=landing.id,
            event_id="retry-event",
            event_type="telegram_connection_test.v1",
            payload={},
        )
        event.status = "failed"
        self.db.commit()

        for expected_retries in range(1, 4):
            retried = service.retry_landing_event(self.db, landing.id, event.event_id)
            self.assertEqual(retried.manual_retry_count, expected_retries)
            retried.status = "failed"
            self.db.commit()

        with self.assertRaises(HTTPException) as raised:
            service.retry_landing_event(self.db, landing.id, event.event_id)
        self.assertEqual(raised.exception.status_code, 409)
