from __future__ import annotations

import json
from unittest import TestCase

from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from unittest.mock import patch

from db import models
from db.engine import Base
from notifications.telegram import send_landing_notification
from routers.landings import service


class LandingConsultationEventTests(TestCase):
    def setUp(self) -> None:
        self.engine = create_engine("sqlite://")
        Base.metadata.create_all(self.engine)
        self.sessions = sessionmaker(bind=self.engine)
        self.db = self.sessions()
        self.landing = service.create_landing(
            self.db,
            slug="backend",
            title="Pymentor",
            description="Основной лендинг",
        )
        self.config = service.configure_landing_telegram(
            self.db,
            self.landing.id,
            secret_ref="backend-bot-v1",
            chat_id="12345",
            bot_username="pymentor_bot",
        )

    def tearDown(self) -> None:
        self.db.close()
        Base.metadata.drop_all(self.engine)
        self.engine.dispose()

    def test_consultation_request_event_is_allowlisted_and_idempotent(self) -> None:
        payload = {
            "name": "Анна",
            "contact": "@anna",
            "goal": "Начать учить Python",
            "consented_at": "2026-10-29T12:00:00+00:00",
            "consent_version": "consultation-v1",
        }

        event, duplicate = service.enqueue_landing_event(
            self.db,
            landing_id=self.landing.id,
            event_id="123e4567-e89b-12d3-a456-426614174000",
            event_type="consultation_request.v1",
            payload=payload,
        )
        repeated, was_duplicate = service.enqueue_landing_event(
            self.db,
            landing_id=self.landing.id,
            event_id="123e4567-e89b-12d3-a456-426614174000",
            event_type="consultation_request.v1",
            payload=payload,
        )

        self.assertFalse(duplicate)
        self.assertTrue(was_duplicate)
        self.assertEqual(event.id, repeated.id)
        self.assertEqual(event.status, "pending")
        self.assertEqual(event.destination_config_id, self.config.id)
        self.assertEqual(json.loads(event.payload_json), payload)

    def test_consultation_event_rejects_unexpected_personal_data(self) -> None:
        with self.assertRaises(HTTPException) as error:
            service.enqueue_landing_event(
                self.db,
                landing_id=self.landing.id,
                event_id="123e4567-e89b-12d3-a456-426614174001",
                event_type="consultation_request.v1",
                payload={
                    "name": "Анна",
                    "contact": "@anna",
                    "goal": "Начать Python",
                    "consented_at": "2026-10-29T12:00:00+00:00",
                    "consent_version": "consultation-v1",
                    "password": "must-not-be-accepted",
                },
            )
        self.assertEqual(error.exception.status_code, 422)


class LandingConsultationTelegramTests(TestCase):
    def test_consultation_message_escapes_user_content_and_uses_configured_bot(self) -> None:
        payload = {
            "name": "Анна_1",
            "contact": "@anna.test",
            "goal": "Хочу понять [API]",
            "consented_at": "2026-10-29T12:00:00+00:00",
            "consent_version": "consultation-v1",
        }
        with patch("notifications.telegram._send_telegram_message") as send:
            send_landing_notification(
                token="external-token",
                chat_id="12345",
                landing_slug="backend",
                event_id="event-1",
                event_type="consultation_request.v1",
                payload=payload,
            )

        message = send.call_args.kwargs["text"]
        self.assertIn("Анна\\_1", message)
        self.assertIn("\\[API\\]", message)
        self.assertIn("@anna\\.test", message)
        self.assertEqual(send.call_args.kwargs["token"], "external-token")

