from __future__ import annotations

import json
import os
from unittest import TestCase
from unittest.mock import patch

from notifications import telegram


class _TelegramResponse:
    def __init__(self, body: dict) -> None:
        self.body = json.dumps(body).encode("utf-8")

    def __enter__(self):
        return self

    def __exit__(self, *_args):
        return False

    def read(self, _limit: int) -> bytes:
        return self.body


class LandingTelegramTests(TestCase):
    def test_runtime_worker_detects_external_landing_bot_credentials(self) -> None:
        with patch.dict(
            os.environ,
            {"PYMENTOR_LANDING_BOT_CREDENTIALS": json.dumps({"backend-bot-v1": "secret-value"})},
        ):
            self.assertTrue(telegram.has_landing_bot_credentials())

        with patch.dict(os.environ, {"PYMENTOR_LANDING_BOT_CREDENTIALS": "{}"}):
            self.assertFalse(telegram.has_landing_bot_credentials())

    def test_connection_verification_checks_bot_and_chat_without_returning_token(self) -> None:
        responses = [
            _TelegramResponse({"ok": True, "result": {"is_bot": True, "username": "lesson_bot"}}),
            _TelegramResponse({"ok": True, "result": {"id": 41, "type": "private"}}),
        ]
        with patch("notifications.telegram.request.urlopen", side_effect=responses) as open_url:
            username = telegram.verify_telegram_destination("secret-token", "41")

        self.assertEqual(username, "lesson_bot")
        self.assertEqual(open_url.call_count, 2)

    def test_connection_verification_redacts_token_from_telegram_errors(self) -> None:
        with patch(
            "notifications.telegram.request.urlopen",
            return_value=_TelegramResponse(
                {"ok": False, "error_code": 401, "description": "bad secret-token credential"}
            ),
        ):
            with self.assertRaises(telegram.TelegramDeliveryError) as raised:
                telegram.verify_telegram_destination("secret-token", "41")

        self.assertNotIn("secret-token", str(raised.exception))
        self.assertFalse(raised.exception.retryable)

    def test_connection_test_event_sends_only_fixed_non_personal_content(self) -> None:
        with patch("notifications.telegram._send_telegram_message") as send:
            telegram.send_landing_notification(
                token="secret-token",
                chat_id="41",
                landing_slug="backend",
                event_id="event-123",
                event_type="telegram_connection_test.v1",
                payload={},
            )

        send.assert_called_once()
        message = send.call_args.kwargs["text"]
        self.assertIn("backend", message)
        self.assertIn(r"event\-123", message)
        self.assertNotIn("secret-token", message)

    def test_unknown_landing_event_is_not_delivered(self) -> None:
        with patch("notifications.telegram._send_telegram_message") as send:
            with self.assertRaises(telegram.TelegramDeliveryError):
                telegram.send_landing_notification(
                    token="secret-token",
                    chat_id="41",
                    landing_slug="backend",
                    event_id="event-123",
                    event_type="arbitrary.v1",
                    payload={"email": "student@example.test"},
                )

        send.assert_not_called()
