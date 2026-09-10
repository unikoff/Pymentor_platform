"""Telegram notifications for important booking events."""

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


def _get_telegram_credentials() -> tuple[str, str] | None:
    token = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
    chat_id = os.getenv("TELEGRAM_CHAT_ID", "").strip()
    if not token or not chat_id:
        return None
    return token, chat_id


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
    with request.urlopen(telegram_request, timeout=10) as response:
        response_data = json.loads(response.read().decode("utf-8"))
    if not response_data.get("ok"):
        description = response_data.get("description", "неизвестная ошибка")
        raise RuntimeError(f"Telegram API отклонил сообщение: {description}")


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

    credentials = _get_telegram_credentials()
    if credentials is None:
        logger.info("Telegram booking notification skipped: credentials are not configured")
        return False

    token, chat_id = credentials
    text = _format_booking_message(
        username=username,
        email=email,
        slot_date=slot_date,
        start_time=start_time,
        now=now,
    )

    try:
        await asyncio.to_thread(_send_telegram_message, token=token, chat_id=chat_id, text=text)
    except (OSError, ValueError, RuntimeError, error.URLError) as exc:
        logger.warning("Telegram booking notification failed: %s", exc)
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

    credentials = _get_telegram_credentials()
    if credentials is None:
        logger.info("Telegram cancellation notification skipped: credentials are not configured")
        return False

    token, chat_id = credentials
    text = _format_booking_cancelled_message(
        username=username,
        email=email,
        slot_date=slot_date,
        start_time=start_time,
        now=now,
    )

    try:
        await asyncio.to_thread(_send_telegram_message, token=token, chat_id=chat_id, text=text)
    except (OSError, ValueError, RuntimeError, error.URLError) as exc:
        logger.warning("Telegram cancellation notification failed: %s", exc)
        return False

    return True
