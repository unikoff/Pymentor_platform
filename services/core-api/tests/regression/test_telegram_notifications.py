import os
import socket
import ssl
from io import BytesIO
import unittest
from datetime import date
from datetime import datetime
from datetime import timedelta
from datetime import timezone
from urllib.parse import parse_qs
from urllib.error import HTTPError
from urllib.error import URLError
from unittest.mock import MagicMock
from unittest.mock import patch

from pymentor_core.adapters.telegram.transport import _IPv6ConnectionError
from pymentor_core.adapters.telegram.transport import _IPv6HTTPSConnection
from pymentor_core.adapters.telegram.transport import _IPv6HTTPSHandler
from pymentor_core.adapters.telegram.transport import _format_booking_cancelled_message
from pymentor_core.adapters.telegram.transport import _format_booking_message
from pymentor_core.adapters.telegram.transport import _send_telegram_message
from pymentor_core.adapters.telegram.transport import _telegram_api_get
from pymentor_core.adapters.telegram.transport import TelegramDeliveryError
from pymentor_core.adapters.telegram.transport import notify_booking_cancelled
from pymentor_core.adapters.telegram.transport import notify_booking_created


class TelegramBookingNotificationTests(unittest.IsolatedAsyncioTestCase):
    def test_ipv6_preference_applies_to_send_and_read_only_requests(self) -> None:
        response = MagicMock()
        response.read.return_value = b'{"ok":true,"result":{"id":123,"is_bot":true}}'
        response.__enter__.return_value = response
        opener = MagicMock()
        opener.open.return_value = response

        with patch.dict(os.environ, {"PYMENTOR_TELEGRAM_PREFER_IPV6": "1"}), patch(
            'pymentor_core.adapters.telegram.transport.request.getproxies', return_value={}
        ), patch('pymentor_core.adapters.telegram.transport.request.build_opener', return_value=opener), patch(
            'pymentor_core.adapters.telegram.transport.request.urlopen'
        ) as standard_urlopen:
            _send_telegram_message(token="token", chat_id="chat", text="message")
            result = _telegram_api_get(token="token", method="getMe")

        self.assertEqual(opener.open.call_count, 2)
        self.assertEqual(result["id"], 123)
        standard_urlopen.assert_not_called()

    def test_ipv6_connect_failure_falls_back_to_standard_urlopen(self) -> None:
        response = MagicMock()
        response.read.return_value = b'{"ok":true}'
        response.__enter__.return_value = response
        opener = MagicMock()
        opener.open.side_effect = URLError(_IPv6ConnectionError("connect failed"))

        with patch.dict(os.environ, {"PYMENTOR_TELEGRAM_PREFER_IPV6": "1"}), patch(
            'pymentor_core.adapters.telegram.transport.request.getproxies', return_value={}
        ), patch('pymentor_core.adapters.telegram.transport.request.build_opener', return_value=opener), patch(
            'pymentor_core.adapters.telegram.transport.request.urlopen', return_value=response
        ) as standard_urlopen:
            _send_telegram_message(token="token", chat_id="chat", text="message")

        standard_urlopen.assert_called_once()
        self.assertEqual(standard_urlopen.call_args.kwargs["timeout"], 10)

    def test_ipv6_http_failure_does_not_retry_request_on_standard_transport(self) -> None:
        opener = MagicMock()
        opener.open.side_effect = URLError(TimeoutError("response timed out"))

        with patch.dict(os.environ, {"PYMENTOR_TELEGRAM_PREFER_IPV6": "1"}), patch(
            'pymentor_core.adapters.telegram.transport.request.getproxies', return_value={}
        ), patch('pymentor_core.adapters.telegram.transport.request.build_opener', return_value=opener), patch(
            'pymentor_core.adapters.telegram.transport.request.urlopen'
        ) as standard_urlopen:
            with self.assertRaises(URLError):
                _send_telegram_message(token="token", chat_id="chat", text="message")

        standard_urlopen.assert_not_called()

    def test_ipv6_connection_uses_ipv6_and_hostname_verified_tls(self) -> None:
        raw_socket = MagicMock()
        tls_socket = MagicMock()
        context = MagicMock()
        context.wrap_socket.return_value = tls_socket
        ipv6_address = (socket.AF_INET6, socket.SOCK_STREAM, socket.IPPROTO_TCP, "", ("::1", 443, 0, 0))
        connection = _IPv6HTTPSConnection("api.telegram.org", context=ssl.create_default_context())
        connection._context = context

        with patch('pymentor_core.adapters.telegram.transport.socket.getaddrinfo', return_value=[ipv6_address]) as getaddrinfo, patch(
            'pymentor_core.adapters.telegram.transport.socket.socket', return_value=raw_socket
        ):
            connection.connect()

        getaddrinfo.assert_called_once_with("api.telegram.org", 443, socket.AF_INET6, socket.SOCK_STREAM)
        context.wrap_socket.assert_called_once_with(raw_socket, server_hostname="api.telegram.org")
        self.assertTrue(_IPv6HTTPSHandler()._context.check_hostname)
        self.assertEqual(_IPv6HTTPSHandler()._context.verify_mode, ssl.CERT_REQUIRED)

    def test_https_proxy_keeps_standard_urlopen_route(self) -> None:
        response = MagicMock()
        response.read.return_value = b'{"ok":true}'
        response.__enter__.return_value = response

        with patch.dict(os.environ, {"PYMENTOR_TELEGRAM_PREFER_IPV6": "1"}), patch(
            'pymentor_core.adapters.telegram.transport.request.getproxies', return_value={"https": "http://proxy"}
        ), patch('pymentor_core.adapters.telegram.transport.request.proxy_bypass', return_value=False), patch(
            'pymentor_core.adapters.telegram.transport.request.build_opener'
        ) as build_opener, patch(
            'pymentor_core.adapters.telegram.transport.request.urlopen', return_value=response
        ) as standard_urlopen:
            _send_telegram_message(token="token", chat_id="chat", text="message")

        build_opener.assert_not_called()
        standard_urlopen.assert_called_once()

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
        with patch('pymentor_core.adapters.telegram.transport.request.urlopen', side_effect=http_error):
            with self.assertRaises(TelegramDeliveryError) as raised:
                _send_telegram_message(token="SECRET_TOKEN", chat_id="chat", text="message")

        self.assertTrue(raised.exception.retryable)
        self.assertEqual(raised.exception.retry_after_seconds, 17)
        self.assertNotIn("SECRET_TOKEN", str(raised.exception))

    def test_permanent_telegram_http_error_is_not_retryable(self) -> None:
        response = BytesIO(b'{"ok":false,"error_code":403,"description":"bot was blocked"}')
        http_error = HTTPError("https://api.telegram.org/botSECRET_TOKEN/sendMessage", 403, "Forbidden", {}, response)
        with patch('pymentor_core.adapters.telegram.transport.request.urlopen', side_effect=http_error):
            with self.assertRaises(TelegramDeliveryError) as raised:
                _send_telegram_message(token="SECRET_TOKEN", chat_id="chat", text="message")

        self.assertFalse(raised.exception.retryable)

    async def test_missing_credentials_skip_notification(self) -> None:
        with patch.dict(
            os.environ,
            {"PYMENTOR_PLATFORM_TELEGRAM_BOT_TOKEN": "", "PYMENTOR_PLATFORM_TELEGRAM_CHAT_ID": ""},
            clear=False,
        ), patch(
            'pymentor_core.adapters.telegram.transport._send_telegram_message'
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
        ), patch('pymentor_core.adapters.telegram.transport._send_telegram_message') as send_message:
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
            'pymentor_core.adapters.telegram.transport._send_telegram_message',
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
        ), patch('pymentor_core.adapters.telegram.transport._send_telegram_message') as send_message:
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
        ), patch('pymentor_core.adapters.telegram.transport._send_telegram_message') as send_message:
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

        with patch('pymentor_core.adapters.telegram.transport.request.urlopen', return_value=response) as urlopen:
            _send_telegram_message(token="token", chat_id="chat", text="*hello*")

        telegram_request = urlopen.call_args.args[0]
        self.assertEqual(telegram_request.method, "POST")
        self.assertEqual(
            parse_qs(telegram_request.data.decode("utf-8")),
            {"chat_id": ["chat"], "text": ["*hello*"], "parse_mode": ["MarkdownV2"]},
        )


if __name__ == "__main__":
    unittest.main()
