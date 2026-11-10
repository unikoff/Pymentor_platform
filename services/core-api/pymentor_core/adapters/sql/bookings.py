"""SQL-backed booking operations; transaction boundaries match the legacy service."""

from __future__ import annotations
from datetime import date
from datetime import datetime
from uuid import uuid4
from sqlalchemy import or_
from sqlalchemy import text
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from pymentor_core.adapters.sql import models
from pymentor_core.shared.ports import Clock
from pymentor_core.shared.ports import UnitOfWork
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
from pymentor_core.modules.bookings.policy import quota_status


def _start_write_transaction(db: Session) -> None:
    """Acquire SQLite's write lock before checking quotas or overlapping slots."""
    if db.bind is not None and db.bind.dialect.name == "sqlite":
        # The auth dependency has already performed a read on this Session.
        # It leaves SQLite in a deferred transaction, which cannot be upgraded
        # with BEGIN IMMEDIATE. That read has no pending writes, so reset it.
        if db.in_transaction():
            db.rollback()
        db.execute(text("BEGIN IMMEDIATE"))


def _require_postgres_read_committed(db: Session) -> None:
    if (
        db.execute(text("SHOW transaction_isolation")).scalar_one().lower()
        != "read committed"
    ):
        raise RuntimeError("PostgreSQL booking writes require READ COMMITTED isolation")


def _lock_postgres_user(db: Session, user_id: int) -> None:
    """Serialize quota changes, booking and cancellation for one user on PostgreSQL."""
    if db.bind is not None and db.bind.dialect.name == "postgresql":
        _require_postgres_read_committed(db)
        user = (
            db.query(models.User.id)
            .filter(models.User.id == user_id)
            .with_for_update()
            .first()
        )
        if user is None:
            raise BookingError(status_code=404, detail="User not found")


def _add_linked_notification(
    db: Session, user_id: int, event: models.BookingNotificationOutbox
) -> None:
    """Record the verified owner in the same transaction as the notification."""
    try:
        if db.bind is not None and db.bind.dialect.name == "postgresql":
            db.execute(
                text("""
                INSERT INTO account_lifecycles(user_id, lifecycle_id)
                SELECT id, :ref FROM users WHERE id = :uid
                ON CONFLICT (user_id) DO NOTHING
            """),
                {"uid": user_id, "ref": str(uuid4())},
            )
        ref = db.scalar(
            text("SELECT lifecycle_id FROM account_lifecycles WHERE user_id=:uid"),
            {"uid": user_id},
        )
        if ref is None:
            raise BookingError(status_code=503, detail="Account identity unavailable")
        db.add(event)
        db.flush()
        db.execute(
            text("""
            INSERT INTO booking_notification_subjects(outbox_id, lifecycle_id) VALUES (:id, :ref)
        """),
            {"id": event.id, "ref": ref},
        )
    except Exception:
        db.rollback()
        raise


def _lock_postgres_slot_date(db: Session, slot_date: date) -> None:
    """Serialize interval checks even when no row exists yet for this date."""
    if db.bind is not None and db.bind.dialect.name == "postgresql":
        _require_postgres_read_committed(db)
        db.execute(
            text(
                "SELECT pg_advisory_xact_lock(CAST(:namespace AS INTEGER), CAST(:day AS INTEGER))"
            ),
            {"namespace": 5265741, "day": slot_date.toordinal()},
        )


def get_quota(
    user_id: int,
    year: int,
    month: int,
    db: Session | None,
    *,
    uow: UnitOfWork | None = None,
) -> int:
    if uow is not None:
        row = uow.repository(models.BookingQuota).find_one(
            user_id=user_id, year=year, month=month
        )
        return row.granted_slots if row else 0
    if db is None:
        raise ValueError("db is required when no unit of work is supplied")
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
    _lock_postgres_user(db, user_id)
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
        row = models.BookingQuota(
            user_id=user_id, year=year, month=month, granted_slots=0
        )
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


def get_quota_status(
    user_id: int,
    year: int,
    month: int,
    db: Session,
    *,
    uow: UnitOfWork | None = None,
) -> dict:
    granted = (
        get_quota(user_id, year, month, db, uow=uow)
        if uow is not None
        else get_quota(user_id, year, month, db)
    )
    used = count_bookings_in_month(user_id, year, month, db)
    return quota_status(granted, used)


def create_slot(
    slot_date: date,
    start_time: str,
    duration_minutes: int,
    db: Session,
    *,
    now: datetime | None = None,
) -> models.BookingSlot:
    if duration_minutes not in {60, 90, 120}:
        raise BookingError(
            status_code=422, detail="Длительность слота: 60, 90 или 120 минут"
        )
    if _slot_time_is_past(slot_date, start_time, now=now):
        raise BookingError(
            status_code=400, detail="Нельзя создать слот в уже прошедшее время"
        )

    _start_write_transaction(db)
    _lock_postgres_slot_date(db, slot_date)
    # Проверяем, что новый слот не пересекается по времени с существующими в этот день.
    same_day = (
        db.query(models.BookingSlot)
        .filter(models.BookingSlot.slot_date == slot_date)
        .with_for_update()
        .all()
    )
    for existing in same_day:
        if _slots_overlap(
            start_time, duration_minutes, existing.start_time, existing.duration_minutes
        ):
            db.rollback()
            raise BookingError(
                status_code=409,
                detail=f"Пересекается со слотом {existing.start_time} ({existing.duration_minutes} мин)",
            )

    slot = models.BookingSlot(
        slot_date=slot_date, start_time=start_time, duration_minutes=duration_minutes
    )
    db.add(slot)
    try:
        db.commit()
    except BookingError:
        db.rollback()
        raise
    except IntegrityError:
        db.rollback()
        raise BookingError(status_code=409, detail="Слот на это время уже существует")
    db.refresh(slot)
    return slot


def delete_slot(slot_id: int, db: Session) -> None:
    slot = db.query(models.BookingSlot).filter(models.BookingSlot.id == slot_id).first()
    if slot is None:
        raise BookingError(status_code=404, detail="Слот не найден")
    db.delete(slot)
    db.commit()


def list_slots_for_month_admin(
    year: int,
    month: int,
    db: Session,
    *,
    now: datetime | None = None,
    include_past: bool = False,
) -> list[dict]:
    current_time = _now_moscow(now)
    start_date, end_date = _month_bounds(year, month)
    slots = (
        db.query(models.BookingSlot)
        .filter(
            models.BookingSlot.slot_date >= start_date,
            models.BookingSlot.slot_date <= end_date,
        )
        .order_by(
            models.BookingSlot.slot_date.asc(), models.BookingSlot.start_time.asc()
        )
        .all()
    )
    visible_slots = (
        slots
        if include_past
        else [slot for slot in slots if not _slot_is_past(slot, now=current_time)]
    )
    student_ids = {
        slot.student_id for slot in visible_slots if slot.student_id is not None
    }
    students = {}
    if student_ids:
        rows = db.query(models.User).filter(models.User.id.in_(student_ids)).all()
        students = {user.id: user for user in rows}
    return [
        serialize_slot_admin(slot, students.get(slot.student_id), now=current_time)
        for slot in visible_slots
    ]


def list_bookable_slots(
    year: int,
    month: int,
    user_id: int,
    db: Session,
    *,
    now: datetime | None = None,
    clock: Clock | None = None,
) -> list[dict]:
    """Будущие свободные слоты и будущие собственные брони студента за месяц."""
    current_time = _now_moscow(now, clock=clock)
    start_date, end_date = _month_bounds(year, month)
    slots = (
        db.query(models.BookingSlot)
        .filter(
            models.BookingSlot.slot_date >= start_date,
            models.BookingSlot.slot_date <= end_date,
            or_(
                models.BookingSlot.student_id.is_(None),
                models.BookingSlot.student_id == user_id,
            ),
        )
        .order_by(
            models.BookingSlot.slot_date.asc(), models.BookingSlot.start_time.asc()
        )
        .all()
    )
    visible = [slot for slot in slots if not _slot_is_past(slot, now=current_time)]
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
    _lock_postgres_user(db, user_id)
    slot = (
        db.query(models.BookingSlot)
        .filter(models.BookingSlot.id == slot_id)
        .with_for_update()
        .first()
    )
    if slot is None:
        raise BookingError(status_code=404, detail="Слот не найден")
    if _slot_is_past(slot):
        raise BookingError(status_code=400, detail="Это время уже прошло")

    # Проверяем месячный лимит занятий (квоту, выданную админом).
    status_info = get_quota_status(
        user_id, slot.slot_date.year, slot.slot_date.month, db
    )
    if status_info["remaining"] <= 0:
        detail = (
            "Исчерпан лимит занятий на этот месяц. Обратитесь к преподавателю."
            if status_info["granted"] > 0
            else "На этот месяц вам ещё не выданы занятия. Обратитесь к преподавателю."
        )
        raise BookingError(status_code=403, detail=detail)

    # Атомарно занимаем слот только если он ещё свободен — защита от гонки.
    updated = (
        db.query(models.BookingSlot)
        .filter(
            models.BookingSlot.id == slot_id, models.BookingSlot.student_id.is_(None)
        )
        .update({models.BookingSlot.student_id: user_id})
    )
    if not updated:
        db.rollback()
        raise BookingError(status_code=409, detail="Это окно уже занято")
    _add_linked_notification(
        db,
        user_id,
        models.BookingNotificationOutbox(
            event_type="booking_created",
            slot_id=slot.id,
            username=notification_username,
            email=notification_email,
            slot_date=slot.slot_date,
            start_time=slot.start_time,
        ),
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
    _lock_postgres_user(db, user_id)
    slot = (
        db.query(models.BookingSlot)
        .filter(models.BookingSlot.id == slot_id)
        .with_for_update()
        .first()
    )
    if slot is None:
        raise BookingError(status_code=404, detail="Слот не найден")
    if slot.student_id != user_id:
        raise BookingError(status_code=403, detail="Это не ваша запись")
    if not _can_cancel_booking(slot):
        db.rollback()
        raise BookingError(
            status_code=409,
            detail="Занятие нельзя отменить менее чем за 36 часов до начала.",
        )
    slot.student_id = None
    _add_linked_notification(
        db,
        user_id,
        models.BookingNotificationOutbox(
            event_type="booking_cancelled",
            slot_id=slot.id,
            username=notification_username,
            email=notification_email,
            slot_date=slot.slot_date,
            start_time=slot.start_time,
        ),
    )
    db.commit()
    db.refresh(slot)
    return slot
