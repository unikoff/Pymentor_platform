import os
from io import BytesIO
import unittest
from datetime import date, datetime, timedelta, timezone
from urllib.parse import parse_qs
from urllib.error import HTTPError
from unittest.mock import MagicMock, patch

from services.telegram import (
    _format_booking_cancelled_message,
    _format_booking_message,
    _send_telegram_message,
    TelegramDeliveryError,
    notify_booking_cancelled,
    notify_booking_created,
)


class TelegramBookingNotificationTests(unittest.IsolatedAsyncioTestCase):
    def test_rate_limit_error_exposes_retry_after_without_bot_token(self) -> None:
        response = BytesIO(
            b'{"ok":false,"error_code":429,"description":"Too Many Requests",'
            b'"parameters":{"retry_after":17}}'
        )
        http_error = HTTPError(
            "https://api.telegram.org/botSECRET_TOKEN/sendMessage",
            429,
            "Too Many Requests",
            {},
            response,
        )
        with patch("services.telegram.request.urlopen", side_effect=http_error):
            with self.assertRaises(TelegramDeliveryError) as raised:
                _send_telegram_message(token="SECRET_TOKEN", chat_id="chat", text="message")

        self.assertTrue(raised.exception.retryable)
        self.assertEqual(raised.exception.retry_after_seconds, 17)
        self.assertNotIn("SECRET_TOKEN", str(raised.exception))

    def test_permanent_telegram_http_error_is_not_retryable(self) -> None:
        response = BytesIO(b'{"ok":false,"error_code":403,"description":"bot was blocked"}')
        http_error = HTTPError("https://api.telegram.org/botSECRET_TOKEN/sendMessage", 403, "Forbidden", {}, response)
        with patch("services.telegram.request.urlopen", side_effect=http_error):
            with self.assertRaises(TelegramDeliveryError) as raised:
                _send_telegram_message(token="SECRET_TOKEN", chat_id="chat", text="message")

        self.assertFalse(raised.exception.retryable)

    async def test_missing_credentials_skip_notification(self) -> None:
        with patch.dict(
            os.environ,
            {"PYMENTOR_PLATFORM_TELEGRAM_BOT_TOKEN": "", "PYMENTOR_PLATFORM_TELEGRAM_CHAT_ID": ""},
            clear=False,
        ), patch(
            "services.telegram._send_telegram_message"
        ) as send_message:
            sent = await notify_booking_created(
                username="Никита",
                email="student@example.com",
                slot_date=date(2026, 9, 15),
                start_time="18:00",
            )

        self.assertFalse(sent)
        send_message.assert_not_called()

    async def test_successful_notification_formats_booking_details(self) -> None:
        with patch.dict(
            os.environ,
            {"PYMENTOR_PLATFORM_TELEGRAM_BOT_TOKEN": "token", "PYMENTOR_PLATFORM_TELEGRAM_CHAT_ID": "chat"},
            clear=False,
        ), patch("services.telegram._send_telegram_message") as send_message:
            sent = await notify_booking_created(
                username="Никита",
                email="student@example.com",
                slot_date=date(2026, 9, 15),
                start_time="18:00",
                now=datetime(2026, 9, 15, 12, 0, tzinfo=timezone(timedelta(hours=3))),
            )

        self.assertTrue(sent)
        send_message.assert_called_once_with(
            token="token",
            chat_id="chat",
            text=(
                "🔔 *Новая запись на занятие*\n\n"
                "👤 *Ученик:* Никита \\(student@example\\.com\\)\n"
                "🗓 *Дата:* 15\\.09 18:00 \\(через 6 часов\\)"
            ),
        )

    async def test_telegram_failure_does_not_raise(self) -> None:
        with patch.dict(
            os.environ,
            {"PYMENTOR_PLATFORM_TELEGRAM_BOT_TOKEN": "token", "PYMENTOR_PLATFORM_TELEGRAM_CHAT_ID": "chat"},
            clear=False,
        ), patch(
            "services.telegram._send_telegram_message",
            side_effect=OSError("network unavailable"),
        ):
            sent = await notify_booking_created(
                username="Никита",
                email="student@example.com",
                slot_date=date(2026, 9, 15),
                start_time="18:00",
            )

        self.assertFalse(sent)

    async def test_cancelled_notification_uses_cancelled_title(self) -> None:
        with patch.dict(
            os.environ,
            {"PYMENTOR_PLATFORM_TELEGRAM_BOT_TOKEN": "token", "PYMENTOR_PLATFORM_TELEGRAM_CHAT_ID": "chat"},
            clear=False,
        ), patch("services.telegram._send_telegram_message") as send_message:
            sent = await notify_booking_cancelled(
                username="Никита",
                email="unikofpost@gmail.ru",
                slot_date=date(2026, 9, 11),
                start_time="18:00",
                now=datetime(2026, 9, 11, 12, 0, tzinfo=timezone(timedelta(hours=3))),
            )

        self.assertTrue(sent)
        send_message.assert_called_once_with(
            token="token",
            chat_id="chat",
            text=(
                "❌ *Запись отменена*\n\n"
                "👤 *Ученик:* Никита \\(unikofpost@gmail\\.ru\\)\n"
                "🗓 *Дата:* 11\\.09 18:00 \\(через 6 часов\\)"
            ),
        )

    async def test_shared_mentoring_credentials_are_not_a_booking_fallback(self) -> None:
        with patch.dict(
            os.environ,
            {
                "PYMENTOR_PLATFORM_TELEGRAM_BOT_TOKEN": "",
                "PYMENTOR_PLATFORM_TELEGRAM_CHAT_ID": "",
                "TELEGRAM_BOT_TOKEN": "mentoring-token",
                "TELEGRAM_CHAT_ID": "mentoring-chat",
            },
            clear=False,
        ), patch("services.telegram._send_telegram_message") as send_message:
            sent = await notify_booking_created(
                username="Никита",
                email="student@example.com",
                slot_date=date(2026, 9, 15),
                start_time="18:00",
            )

        self.assertFalse(sent)
        send_message.assert_not_called()

    def test_message_uses_requested_compact_format_and_escapes_markdown(self) -> None:
        message = _format_booking_message(
            username="Никита_1",
            email="unikofpost@gmail.ru",
            slot_date=date(2026, 9, 11),
            start_time="18:00",
            now=datetime(2026, 9, 11, 12, 0, tzinfo=timezone(timedelta(hours=3))),
        )

        self.assertEqual(
            message,
            "🔔 *Новая запись на занятие*\n\n"
            "👤 *Ученик:* Никита\\_1 \\(unikofpost@gmail\\.ru\\)\n"
            "🗓 *Дата:* 11\\.09 18:00 \\(через 6 часов\\)",
        )

    def test_cancelled_message_uses_same_details(self) -> None:
        message = _format_booking_cancelled_message(
            username="Никита",
            email="unikofpost@gmail.ru",
            slot_date=date(2026, 9, 11),
            start_time="18:00",
            now=datetime(2026, 9, 11, 12, 0, tzinfo=timezone(timedelta(hours=3))),
        )

        self.assertEqual(
            message,
            "❌ *Запись отменена*\n\n"
            "👤 *Ученик:* Никита \\(unikofpost@gmail\\.ru\\)\n"
            "🗓 *Дата:* 11\\.09 18:00 \\(через 6 часов\\)",
        )

    def test_send_telegram_message_uses_markdown_v2(self) -> None:
        response = MagicMock()
        response.read.return_value = b'{"ok":true}'
        response.__enter__.return_value = response

        with patch("services.telegram.request.urlopen", return_value=response) as urlopen:
            _send_telegram_message(token="token", chat_id="chat", text="*hello*")

        telegram_request = urlopen.call_args.args[0]
        self.assertEqual(telegram_request.method, "POST")
        self.assertEqual(
            parse_qs(telegram_request.data.decode("utf-8")),
            {"chat_id": ["chat"], "text": ["*hello*"], "parse_mode": ["MarkdownV2"]},
        )


if __name__ == "__main__":
    unittest.main()
