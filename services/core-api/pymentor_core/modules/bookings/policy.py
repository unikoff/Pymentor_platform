"""Pure booking calendar, quota and response policy."""

from __future__ import annotations
from datetime import date
from datetime import datetime
from datetime import time
from datetime import timedelta
from datetime import timezone
from calendar import monthrange

MOSCOW_TZ = timezone(timedelta(hours=3))
CANCELLATION_DEADLINE = timedelta(hours=36)


def _month_bounds(year: int, month: int) -> tuple[date, date]:
    last_day = monthrange(year, month)[1]
    return date(year, month, 1), date(year, month, last_day)


def _now_moscow(now: datetime | None = None, *, clock: Clock | None = None) -> datetime:
    current = (
        now
        if now is not None
        else clock.now()
        if clock is not None
        else datetime.now(MOSCOW_TZ)
    )
    if current.tzinfo is None:
        return current.replace(tzinfo=MOSCOW_TZ)
    return current.astimezone(MOSCOW_TZ)


def _slot_starts_at(slot_date: date, start_time: str) -> datetime:
    hours, minutes = start_time.split(":")
    return datetime.combine(slot_date, time(int(hours), int(minutes)), tzinfo=MOSCOW_TZ)


def _slot_time_is_past(
    slot_date: date, start_time: str, *, now: datetime | None = None
) -> bool:
    return _slot_starts_at(slot_date, start_time) <= _now_moscow(now)


def _slot_is_past(slot: object, *, now: datetime | None = None) -> bool:
    return _slot_time_is_past(slot.slot_date, slot.start_time, now=now)


def _slot_has_ended(slot: object, *, now: datetime | None = None) -> bool:
    slot_end = _slot_starts_at(slot.slot_date, slot.start_time) + timedelta(
        minutes=slot.duration_minutes
    )
    return slot_end <= _now_moscow(now)


def _can_cancel_booking(slot: object, *, now: datetime | None = None) -> bool:
    """Return whether the student can cancel this slot under the 36-hour policy."""
    return (
        _slot_starts_at(slot.slot_date, slot.start_time) - _now_moscow(now)
        >= CANCELLATION_DEADLINE
    )


def _time_to_minutes(hhmm: str) -> int:
    hours, minutes = hhmm.split(":")
    return int(hours) * 60 + int(minutes)


def _slots_overlap(start_a: str, dur_a: int, start_b: str, dur_b: int) -> bool:
    a0 = _time_to_minutes(start_a)
    b0 = _time_to_minutes(start_b)
    return a0 < b0 + dur_b and b0 < a0 + dur_a


def serialize_slot_admin(
    slot: object, student: object | None, *, now: datetime | None = None
) -> dict:
    return {
        "id": slot.id,
        "date": slot.slot_date.isoformat(),
        "start_time": slot.start_time,
        "duration_minutes": slot.duration_minutes,
        "is_past": _slot_is_past(slot, now=now),
        "student": {
            "id": student.id,
            "username": student.username,
            "email": student.email,
        }
        if student
        else None,
    }


def serialize_slot_student(
    slot: object, viewer_id: int, *, now: datetime | None = None
) -> dict:
    return {
        "id": slot.id,
        "date": slot.slot_date.isoformat(),
        "start_time": slot.start_time,
        "duration_minutes": slot.duration_minutes,
        "status": "mine" if slot.student_id == viewer_id else "free",
        "can_cancel": slot.student_id == viewer_id
        and _can_cancel_booking(slot, now=now),
        "is_completed": slot.student_id == viewer_id and _slot_has_ended(slot, now=now),
    }


def quota_status(granted: int, used: int) -> dict:
    return {"granted": granted, "used": used, "remaining": max(0, granted - used)}


now_moscow = _now_moscow
slot_has_ended = _slot_has_ended
