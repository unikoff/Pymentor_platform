"""Telegram notifications for booking events, isolated from mentoring leads."""

from __future__ import annotations

import asyncio
import json
import logging
import math
import os
import re
from datetime import date, datetime, time, timedelta, timezone
from urllib import error, request
from urllib.parse import urlencode


logger = logging.getLogger(__name__)
MOSCOW_TZ = timezone(timedelta(hours=3))
_MARKDOWN_V2_SPECIAL_CHARS = re.compile(r"([_\*\[\]\(\)~`>#+\-=|{}.!\\])")
_PLATFORM_BOT_TOKEN_ENV = "PYMENTOR_PLATFORM_TELEGRAM_BOT_TOKEN"
_PLATFORM_CHAT_ID_ENV = "PYMENTOR_PLATFORM_TELEGRAM_CHAT_ID"


class TelegramDeliveryError(RuntimeError):
    """A Telegram rejection with retry information safe to persist in logs."""

    def __init__(
        self,
        message: str,
        *,
        retryable: bool,
        retry_after_seconds: int | None = None,
    ) -> None:
        super().__init__(message[:500])
        self.retryable = retryable
        self.retry_after_seconds = retry_after_seconds


def _get_telegram_credentials() -> tuple[str, str] | None:
    token = os.getenv(_PLATFORM_BOT_TOKEN_ENV, "").strip()
    chat_id = os.getenv(_PLATFORM_CHAT_ID_ENV, "").strip()
    if not token or not chat_id:
        return None
    return token, chat_id


def has_landing_bot_credentials() -> bool:
    try:
        values = json.loads(os.getenv("PYMENTOR_LANDING_BOT_CREDENTIALS", "{}"))
    except (json.JSONDecodeError, TypeError):
        return False
    return isinstance(values, dict) and any(
        isinstance(value, str) and bool(value.strip()) for value in values.values()
    )


def _get_landing_bot_token(secret_ref: str) -> str:
    try:
        values = json.loads(os.getenv("PYMENTOR_LANDING_BOT_CREDENTIALS", "{}"))
    except (json.JSONDecodeError, TypeError):
        values = {}
    token = values.get(secret_ref) if isinstance(values, dict) else None
    if not isinstance(token, str) or not token.strip() or len(token) > 512:
        raise TelegramDeliveryError("Telegram destination secret is unavailable", retryable=False)
    return token.strip()


def _escape_markdown_v2(value: str) -> str:
    return _MARKDOWN_V2_SPECIAL_CHARS.sub(r"\\\1", value)


def _booking_start(slot_date: date, start_time: str) -> datetime:
    hours, minutes = (int(part) for part in start_time.split(":", 1))
    return datetime.combine(slot_date, time(hours, minutes), tzinfo=MOSCOW_TZ)


def _relative_booking_time(slot_date: date, start_time: str, *, now: datetime | None = None) -> str:
    current_time = now or datetime.now(MOSCOW_TZ)
    if current_time.tzinfo is None:
        current_time = current_time.replace(tzinfo=MOSCOW_TZ)
    else:
        current_time = current_time.astimezone(MOSCOW_TZ)

    hours_until = math.ceil((_booking_start(slot_date, start_time) - current_time).total_seconds() / 3600)
    if hours_until <= 0:
        return "уже началось"
    if hours_until % 10 == 1 and hours_until % 100 != 11:
        unit = "час"
    elif hours_until % 10 in {2, 3, 4} and hours_until % 100 not in {12, 13, 14}:
        unit = "часа"
    else:
        unit = "часов"
    return f"через {hours_until} {unit}"


def _format_booking_message(
    *,
    username: str,
    email: str,
    slot_date: date,
    start_time: str,
    now: datetime | None = None,
) -> str:
    return _format_booking_event_message(
        title="Новая запись на занятие",
        icon="🔔",
        username=username,
        email=email,
        slot_date=slot_date,
        start_time=start_time,
        now=now,
    )


def _format_booking_event_message(
    *,
    title: str,
    icon: str,
    username: str,
    email: str,
    slot_date: date,
    start_time: str,
    now: datetime | None = None,
) -> str:
    relative_time = _relative_booking_time(slot_date, start_time, now=now)
    return (
        f"{icon} *{_escape_markdown_v2(title)}*\n\n"
        f"👤 *Ученик:* {_escape_markdown_v2(username)} \\({_escape_markdown_v2(email)}\\)\n"
        f"🗓 *Дата:* {_escape_markdown_v2(slot_date.strftime('%d.%m'))} "
        f"{_escape_markdown_v2(start_time)} \\({_escape_markdown_v2(relative_time)}\\)"
    )


def _format_booking_cancelled_message(
    *,
    username: str,
    email: str,
    slot_date: date,
    start_time: str,
    now: datetime | None = None,
) -> str:
    return _format_booking_event_message(
        title="Запись отменена",
        icon="❌",
        username=username,
        email=email,
        slot_date=slot_date,
        start_time=start_time,
        now=now,
    )


def _send_telegram_message(
    *,
    token: str,
    chat_id: str,
    text: str,
) -> None:
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = urlencode({"chat_id": chat_id, "text": text, "parse_mode": "MarkdownV2"}).encode("utf-8")
    telegram_request = request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )
    try:
        with request.urlopen(telegram_request, timeout=10) as response:
            response_data = json.loads(response.read(65_536).decode("utf-8"))
    except error.HTTPError as exc:
        try:
            response_data = json.loads(exc.read(16_384).decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            response_data = {}
        finally:
            exc.close()
        _raise_telegram_error(response_data, fallback_code=exc.code, secret=token)
    if not response_data.get("ok"):
        _raise_telegram_error(response_data, fallback_code=200, secret=token)


def _raise_telegram_error(response_data: dict, *, fallback_code: int, secret: str | None = None) -> None:
    error_code = response_data.get("error_code", fallback_code)
    try:
        error_code = int(error_code)
    except (TypeError, ValueError):
        error_code = fallback_code
    description = str(response_data.get("description", "неизвестная ошибка"))[:350]
    parameters = response_data.get("parameters") or {}
    retry_after = parameters.get("retry_after") if isinstance(parameters, dict) else None
    try:
        retry_after = max(1, int(retry_after)) if retry_after is not None else None
    except (TypeError, ValueError):
        retry_after = None
    if error_code == 429 and retry_after is None:
        retry_after = 60
    retryable = error_code == 429 or error_code >= 500
    if secret:
        description = description.replace(secret, "[redacted]")
    raise TelegramDeliveryError(
        f"Telegram error {error_code}: {description}",
        retryable=retryable,
        retry_after_seconds=retry_after,
    )


def _telegram_api_get(*, token: str, method: str, params: dict[str, str] | None = None) -> dict:
    query = f"?{urlencode(params)}" if params else ""
    telegram_request = request.Request(
        f"https://api.telegram.org/bot{token}/{method}{query}",
        headers={"Accept": "application/json"},
        method="GET",
    )
    try:
        with request.urlopen(telegram_request, timeout=10) as response:
            response_data = json.loads(response.read(16_384).decode("utf-8"))
    except error.HTTPError as exc:
        try:
            response_data = json.loads(exc.read(16_384).decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            response_data = {}
        finally:
            exc.close()
        _raise_telegram_error(response_data, fallback_code=exc.code, secret=token)
    except (error.URLError, OSError, TimeoutError, UnicodeDecodeError, json.JSONDecodeError):
        raise TelegramDeliveryError("Telegram connection check failed", retryable=True) from None

    if not isinstance(response_data, dict):
        raise TelegramDeliveryError("Telegram returned an invalid response", retryable=False)
    if not response_data.get("ok"):
        _raise_telegram_error(response_data, fallback_code=200, secret=token)
    result = response_data.get("result")
    if not isinstance(result, dict):
        raise TelegramDeliveryError("Telegram returned an invalid response", retryable=False)
    return result


def verify_telegram_destination(token: str, chat_id: str) -> str:
    """Validate the bot token and its access to a chat without sending a message."""
    bot = _telegram_api_get(token=token, method="getMe")
    if bot.get("is_bot") is not True:
        raise TelegramDeliveryError("Telegram credential is not a bot token", retryable=False)
    chat = _telegram_api_get(token=token, method="getChat", params={"chat_id": chat_id})
    if str(chat.get("id", "")) != str(chat_id):
        raise TelegramDeliveryError("Telegram chat could not be verified", retryable=False)
    return str(bot.get("username") or bot.get("first_name") or "")[:64]


def send_landing_notification(
    *,
    token: str,
    chat_id: str,
    landing_slug: str,
    event_id: str,
    event_type: str,
    payload: dict,
) -> None:
    """Send the only enabled v1 landing event: an admin-requested connection test."""
    if event_type != "telegram_connection_test.v1" or payload != {}:
        raise TelegramDeliveryError("Unknown landing notification event", retryable=False)
    message = (
        "🧪 *Проверка подключения Telegram*\n\n"
        f"Лендинг: *{_escape_markdown_v2(landing_slug)}*\n"
        f"Событие: `{_escape_markdown_v2(event_id)}`"
    )
    _send_telegram_message(token=token, chat_id=chat_id, text=message)


def send_booking_created_notification(
    *, username: str, email: str, slot_date: date, start_time: str, now: datetime | None = None
) -> None:
    credentials = _get_telegram_credentials()
    if credentials is None:
        raise TelegramDeliveryError("Telegram credentials are not configured", retryable=False)
    token, chat_id = credentials
    _send_telegram_message(
        token=token,
        chat_id=chat_id,
        text=_format_booking_message(
            username=username, email=email, slot_date=slot_date, start_time=start_time, now=now
        ),
    )


def send_booking_cancelled_notification(
    *, username: str, email: str, slot_date: date, start_time: str, now: datetime | None = None
) -> None:
    credentials = _get_telegram_credentials()
    if credentials is None:
        raise TelegramDeliveryError("Telegram credentials are not configured", retryable=False)
    token, chat_id = credentials
    _send_telegram_message(
        token=token,
        chat_id=chat_id,
        text=_format_booking_cancelled_message(
            username=username, email=email, slot_date=slot_date, start_time=start_time, now=now
        ),
    )


async def notify_booking_created(
    *,
    username: str,
    email: str,
    slot_date: date,
    start_time: str,
    now: datetime | None = None,
) -> bool:
    """Send a booking notification without making the booking request fail.

    Telegram is an external side effect. The booking is committed before this
    function is called, so a temporary Telegram outage is logged and reported
    to the caller as ``False`` instead of rolling back a valid booking.
    """

    if _get_telegram_credentials() is None:
        logger.info("Telegram booking notification skipped: credentials are not configured")
        return False

    try:
        await asyncio.to_thread(
            send_booking_created_notification,
            username=username,
            email=email,
            slot_date=slot_date,
            start_time=start_time,
            now=now,
        )
    except (OSError, ValueError, RuntimeError, error.URLError) as exc:
        logger.warning("Telegram booking notification failed (%s)", type(exc).__name__)
        return False

    return True


async def notify_booking_cancelled(
    *,
    username: str,
    email: str,
    slot_date: date,
    start_time: str,
    now: datetime | None = None,
) -> bool:
    """Notify the administrator after a student cancels a booking."""

    if _get_telegram_credentials() is None:
        logger.info("Telegram cancellation notification skipped: credentials are not configured")
        return False

    try:
        await asyncio.to_thread(
            send_booking_cancelled_notification,
            username=username,
            email=email,
            slot_date=slot_date,
            start_time=start_time,
            now=now,
        )
    except (OSError, ValueError, RuntimeError, error.URLError) as exc:
        logger.warning("Telegram cancellation notification failed (%s)", type(exc).__name__)
        return False

    return True
