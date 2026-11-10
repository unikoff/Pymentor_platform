"""Booking API compatibility facade; storage is supplied by composition."""

from __future__ import annotations
from fastapi import HTTPException
from typing import Any
from datetime import date, datetime
from pymentor_core.shared.bindings import get_bindings
from pymentor_core.modules.bookings.contracts import BookingError
from pymentor_core.modules.bookings.policy import MOSCOW_TZ
from pymentor_core.modules.bookings.policy import CANCELLATION_DEADLINE
from pymentor_core.modules.bookings.policy import _month_bounds
from pymentor_core.modules.bookings.policy import _now_moscow
from pymentor_core.modules.bookings.policy import _slot_starts_at
from pymentor_core.modules.bookings.policy import _slot_time_is_past
from pymentor_core.modules.bookings.policy import _slot_is_past
from pymentor_core.modules.bookings.policy import _slot_has_ended
from pymentor_core.modules.bookings.policy import _can_cancel_booking
from pymentor_core.modules.bookings.policy import _time_to_minutes
from pymentor_core.modules.bookings.policy import _slots_overlap
from pymentor_core.modules.bookings.policy import serialize_slot_admin
from pymentor_core.modules.bookings.policy import serialize_slot_student
from pymentor_core.modules.bookings.policy import now_moscow
from pymentor_core.modules.bookings.policy import slot_has_ended


def _call(name, *args, **kwargs):
    try:
        return getattr(get_bindings().bookings, name)(*args, **kwargs)
    except BookingError as exc:
        raise HTTPException(
            status_code=exc.status_code, detail=exc.detail, headers=exc.headers
        ) from exc


def get_quota(user_id: int, year: int, month: int, db: Any, *, uow: Any = None) -> int:
    return _call("get_quota", user_id, year, month, db, uow=uow)


def add_quota(user_id: int, year: int, month: int, amount: int, db: Any) -> int:
    return _call("add_quota", user_id, year, month, amount, db)


def count_bookings_in_month(user_id: int, year: int, month: int, db: Any) -> int:
    return _call("count_bookings_in_month", user_id, year, month, db)


def get_quota_status(
    user_id: int, year: int, month: int, db: Any, *, uow: Any = None
) -> dict:
    return _call("get_quota_status", user_id, year, month, db, uow=uow)


def create_slot(
    slot_date: date,
    start_time: str,
    duration_minutes: int,
    db: Any,
    *,
    now: datetime | None = None,
) -> Any:
    return _call("create_slot", slot_date, start_time, duration_minutes, db, now=now)


def delete_slot(slot_id: int, db: Any) -> None:
    return _call("delete_slot", slot_id, db)


def list_slots_for_month_admin(
    year: int,
    month: int,
    db: Any,
    *,
    now: datetime | None = None,
    include_past: bool = False,
) -> list[dict]:
    return _call(
        "list_slots_for_month_admin",
        year,
        month,
        db,
        now=now,
        include_past=include_past,
    )


def list_bookable_slots(
    year: int,
    month: int,
    user_id: int,
    db: Any,
    *,
    now: datetime | None = None,
    clock: Any = None,
) -> list[dict]:
    return _call("list_bookable_slots", year, month, user_id, db, now=now, clock=clock)


def book_slot(
    slot_id: int,
    user_id: int,
    db: Any,
    *,
    notification_username: str,
    notification_email: str,
) -> Any:
    return _call(
        "book_slot",
        slot_id,
        user_id,
        db,
        notification_username=notification_username,
        notification_email=notification_email,
    )


def cancel_booking(
    slot_id: int,
    user_id: int,
    db: Any,
    *,
    notification_username: str,
    notification_email: str,
) -> Any:
    return _call(
        "cancel_booking",
        slot_id,
        user_id,
        db,
        notification_username=notification_username,
        notification_email=notification_email,
    )


