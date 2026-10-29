"""Booking operations, quotas and transactional notification events."""

from fastapi import HTTPException, status
from sqlalchemy import or_, text
from datetime import date, datetime, time, timedelta, timezone
from calendar import monthrange
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from db import models

MOSCOW_TZ = timezone(timedelta(hours=3))
CANCELLATION_DEADLINE = timedelta(hours=36)

def _month_bounds(year: int, month: int) -> tuple[date, date]:
    last_day = monthrange(year, month)[1]
    return date(year, month, 1), date(year, month, last_day)


def _now_moscow(now: datetime | None = None) -> datetime:
    current = now or datetime.now(MOSCOW_TZ)
    if current.tzinfo is None:
        return current.replace(tzinfo=MOSCOW_TZ)
    return current.astimezone(MOSCOW_TZ)


def _slot_starts_at(slot_date: date, start_time: str) -> datetime:
    hours, minutes = start_time.split(":")
    return datetime.combine(slot_date, time(int(hours), int(minutes)), tzinfo=MOSCOW_TZ)


def _slot_time_is_past(slot_date: date, start_time: str, *, now: datetime | None = None) -> bool:
    return _slot_starts_at(slot_date, start_time) <= _now_moscow(now)


def _slot_is_past(slot: models.BookingSlot, *, now: datetime | None = None) -> bool:
    return _slot_time_is_past(slot.slot_date, slot.start_time, now=now)


def _slot_has_ended(slot: models.BookingSlot, *, now: datetime | None = None) -> bool:
    slot_end = _slot_starts_at(slot.slot_date, slot.start_time) + timedelta(minutes=slot.duration_minutes)
    return slot_end <= _now_moscow(now)


def _can_cancel_booking(slot: models.BookingSlot, *, now: datetime | None = None) -> bool:
    """Return whether the student can cancel this slot under the 36-hour policy."""
    return _slot_starts_at(slot.slot_date, slot.start_time) - _now_moscow(now) >= CANCELLATION_DEADLINE


def _time_to_minutes(hhmm: str) -> int:
    hours, minutes = hhmm.split(":")
    return int(hours) * 60 + int(minutes)


def _slots_overlap(start_a: str, dur_a: int, start_b: str, dur_b: int) -> bool:
    a0 = _time_to_minutes(start_a)
    b0 = _time_to_minutes(start_b)
    return a0 < b0 + dur_b and b0 < a0 + dur_a


def _start_write_transaction(db: Session) -> None:
    """Acquire SQLite's write lock before checking quotas or overlapping slots."""
    if db.bind is not None and db.bind.dialect.name == "sqlite":
        # The auth dependency has already performed a read on this Session.
        # It leaves SQLite in a deferred transaction, which cannot be upgraded
        # with BEGIN IMMEDIATE. That read has no pending writes, so reset it.
        if db.in_transaction():
            db.rollback()
        db.execute(text("BEGIN IMMEDIATE"))


def get_quota(user_id: int, year: int, month: int, db: Session) -> int:
    row = (
        db.query(models.BookingQuota)
        .filter(
            models.BookingQuota.user_id == user_id,
            models.BookingQuota.year == year,
            models.BookingQuota.month == month,
        )
        .first()
    )
    return row.granted_slots if row else 0


def add_quota(user_id: int, year: int, month: int, amount: int, db: Session) -> int:
    row = (
        db.query(models.BookingQuota)
        .filter(
            models.BookingQuota.user_id == user_id,
            models.BookingQuota.year == year,
            models.BookingQuota.month == month,
        )
        .first()
    )
    if row is None:
        row = models.BookingQuota(user_id=user_id, year=year, month=month, granted_slots=0)
        db.add(row)
    row.granted_slots = max(0, row.granted_slots + amount)
    db.commit()
    db.refresh(row)
    return row.granted_slots


def count_bookings_in_month(user_id: int, year: int, month: int, db: Session) -> int:
    start_date, end_date = _month_bounds(year, month)
    return (
        db.query(models.BookingSlot)
        .filter(
            models.BookingSlot.student_id == user_id,
            models.BookingSlot.slot_date >= start_date,
            models.BookingSlot.slot_date <= end_date,
        )
        .count()
    )


def get_quota_status(user_id: int, year: int, month: int, db: Session) -> dict:
    granted = get_quota(user_id, year, month, db)
    used = count_bookings_in_month(user_id, year, month, db)
    return {"granted": granted, "used": used, "remaining": max(0, granted - used)}


def serialize_slot_admin(slot: models.BookingSlot, student: models.User | None, *, now: datetime | None = None) -> dict:
    return {
        "id": slot.id,
        "date": slot.slot_date.isoformat(),
        "start_time": slot.start_time,
        "duration_minutes": slot.duration_minutes,
        "is_past": _slot_is_past(slot, now=now),
        "student": {"id": student.id, "username": student.username, "email": student.email} if student else None,
    }


def serialize_slot_student(slot: models.BookingSlot, viewer_id: int, *, now: datetime | None = None) -> dict:
    return {
        "id": slot.id,
        "date": slot.slot_date.isoformat(),
        "start_time": slot.start_time,
        "duration_minutes": slot.duration_minutes,
        "status": "mine" if slot.student_id == viewer_id else "free",
        "can_cancel": slot.student_id == viewer_id and _can_cancel_booking(slot, now=now),
        "is_completed": slot.student_id == viewer_id and _slot_has_ended(slot, now=now),
    }


def create_slot(
    slot_date: date,
    start_time: str,
    duration_minutes: int,
    db: Session,
    *,
    now: datetime | None = None,
) -> models.BookingSlot:
    if duration_minutes not in {60, 90, 120}:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="Длительность слота: 60, 90 или 120 минут")
    if _slot_time_is_past(slot_date, start_time, now=now):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Нельзя создать слот в уже прошедшее время")

    _start_write_transaction(db)
    # Проверяем, что новый слот не пересекается по времени с существующими в этот день.
    same_day = (
        db.query(models.BookingSlot)
        .filter(models.BookingSlot.slot_date == slot_date)
        .with_for_update()
        .all()
    )
    for existing in same_day:
        if _slots_overlap(start_time, duration_minutes, existing.start_time, existing.duration_minutes):
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Пересекается со слотом {existing.start_time} ({existing.duration_minutes} мин)",
            )

    slot = models.BookingSlot(slot_date=slot_date, start_time=start_time, duration_minutes=duration_minutes)
    db.add(slot)
    try:
        db.commit()
    except HTTPException:
        db.rollback()
        raise
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Слот на это время уже существует")
    db.refresh(slot)
    return slot


def delete_slot(slot_id: int, db: Session) -> None:
    slot = db.query(models.BookingSlot).filter(models.BookingSlot.id == slot_id).first()
    if slot is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Слот не найден")
    db.delete(slot)
    db.commit()


def list_slots_for_month_admin(year: int, month: int, db: Session, *, now: datetime | None = None, include_past: bool = False) -> list[dict]:
    current_time = _now_moscow(now)
    start_date, end_date = _month_bounds(year, month)
    slots = (
        db.query(models.BookingSlot)
        .filter(models.BookingSlot.slot_date >= start_date, models.BookingSlot.slot_date <= end_date)
        .order_by(models.BookingSlot.slot_date.asc(), models.BookingSlot.start_time.asc())
        .all()
    )
    visible_slots = slots if include_past else [slot for slot in slots if not _slot_is_past(slot, now=current_time)]
    student_ids = {slot.student_id for slot in visible_slots if slot.student_id is not None}
    students = {}
    if student_ids:
        rows = db.query(models.User).filter(models.User.id.in_(student_ids)).all()
        students = {user.id: user for user in rows}
    return [serialize_slot_admin(slot, students.get(slot.student_id), now=current_time) for slot in visible_slots]


def list_bookable_slots(year: int, month: int, user_id: int, db: Session, *, now: datetime | None = None) -> list[dict]:
    """Будущие свободные слоты и будущие собственные брони студента за месяц."""
    current_time = _now_moscow(now)
    start_date, end_date = _month_bounds(year, month)
    slots = (
        db.query(models.BookingSlot)
        .filter(
            models.BookingSlot.slot_date >= start_date,
            models.BookingSlot.slot_date <= end_date,
            or_(models.BookingSlot.student_id.is_(None), models.BookingSlot.student_id == user_id),
        )
        .order_by(models.BookingSlot.slot_date.asc(), models.BookingSlot.start_time.asc())
        .all()
    )
    visible = [
        slot for slot in slots
        if slot.student_id == user_id or not _slot_is_past(slot, now=current_time)
    ]
    return [serialize_slot_student(slot, user_id, now=current_time) for slot in visible]


def book_slot(
    slot_id: int,
    user_id: int,
    db: Session,
    *,
    notification_username: str,
    notification_email: str,
) -> models.BookingSlot:
    _start_write_transaction(db)
    slot = db.query(models.BookingSlot).filter(models.BookingSlot.id == slot_id).with_for_update().first()
    if slot is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Слот не найден")
    if _slot_is_past(slot):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Это время уже прошло")

    # Проверяем месячный лимит занятий (квоту, выданную админом).
    status_info = get_quota_status(user_id, slot.slot_date.year, slot.slot_date.month, db)
    if status_info["remaining"] <= 0:
        detail = (
            "Исчерпан лимит занятий на этот месяц. Обратитесь к преподавателю."
            if status_info["granted"] > 0
            else "На этот месяц вам ещё не выданы занятия. Обратитесь к преподавателю."
        )
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=detail)

    # Атомарно занимаем слот только если он ещё свободен — защита от гонки.
    updated = (
        db.query(models.BookingSlot)
        .filter(models.BookingSlot.id == slot_id, models.BookingSlot.student_id.is_(None))
        .update({models.BookingSlot.student_id: user_id})
    )
    if not updated:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Это окно уже занято")
    db.add(
        models.BookingNotificationOutbox(
            event_type="booking_created",
            slot_id=slot.id,
            username=notification_username,
            email=notification_email,
            slot_date=slot.slot_date,
            start_time=slot.start_time,
        )
    )
    db.commit()
    db.refresh(slot)
    return slot


def cancel_booking(
    slot_id: int,
    user_id: int,
    db: Session,
    *,
    notification_username: str,
    notification_email: str,
) -> models.BookingSlot:
    _start_write_transaction(db)
    slot = db.query(models.BookingSlot).filter(models.BookingSlot.id == slot_id).with_for_update().first()
    if slot is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Слот не найден")
    if slot.student_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Это не ваша запись")
    if not _can_cancel_booking(slot):
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Занятие нельзя отменить менее чем за 36 часов до начала.",
        )
    slot.student_id = None
    db.add(
        models.BookingNotificationOutbox(
            event_type="booking_cancelled",
            slot_id=slot.id,
            username=notification_username,
            email=notification_email,
            slot_date=slot.slot_date,
            start_time=slot.start_time,
        )
    )
    db.commit()
    db.refresh(slot)
    return slot
