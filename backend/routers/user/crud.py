
import uuid
from calendar import monthrange
from datetime import date, datetime, timedelta, timezone
from fastapi import HTTPException, status, Response, Request
from sqlalchemy import or_, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from DataBase.engine import SessionLocal
from DataBase import model as models
from .schemas import UserCreate, UserLogin


def get_db():
    return SessionLocal()


def _normalize_datetime(value: datetime | None) -> datetime | None:
    if value is None:
        return None
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def has_active_subscription(user_db: models.User) -> bool:
    subscription_until = _normalize_datetime(user_db.subscription_until)
    return subscription_until is not None and subscription_until > datetime.now(timezone.utc)


def _serialize_user(user_db: models.User) -> dict[str, object]:
    subscription_until = _normalize_datetime(user_db.subscription_until)
    return {
        "id": user_db.id,
        "username": user_db.username,
        "email": user_db.email,
        "subscription_until": subscription_until.isoformat() if subscription_until else None,
        "has_active_subscription": has_active_subscription(user_db),
        "is_admin": bool(user_db.is_admin),
    }


def record_activity_day(user_id: int, activity_date: date, db: Session) -> models.UserActivityDay:
    existing_day = (
        db.query(models.UserActivityDay)
        .filter(models.UserActivityDay.user_id == user_id, models.UserActivityDay.activity_date == activity_date)
        .first()
    )
    if existing_day is not None:
        return existing_day

    activity_day = models.UserActivityDay(user_id=user_id, activity_date=activity_date)
    db.add(activity_day)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        existing_day = (
            db.query(models.UserActivityDay)
            .filter(models.UserActivityDay.user_id == user_id, models.UserActivityDay.activity_date == activity_date)
            .first()
        )
        if existing_day is not None:
            return existing_day
        raise

    db.refresh(activity_day)
    return activity_day


def get_completed_lesson_ids(user_id: int, db: Session) -> set[str]:
    rows = db.query(models.UserLessonProgress.lesson_id).filter(models.UserLessonProgress.user_id == user_id).all()
    return {row.lesson_id for row in rows}


def mark_lesson_completed(user_id: int, lesson_id: str, db: Session) -> None:
    progress = models.UserLessonProgress(user_id=user_id, lesson_id=lesson_id)
    db.add(progress)
    try:
        db.commit()
    except IntegrityError:
        # Урок уже отмечен — повторная отметка не ошибка.
        db.rollback()


def get_activity_days(user_id: int, year: int, month: int, db: Session) -> list[date]:
    last_day = monthrange(year, month)[1]
    start_date = date(year, month, 1)
    end_date = date(year, month, last_day)

    rows = (
        db.query(models.UserActivityDay)
        .filter(
            models.UserActivityDay.user_id == user_id,
            models.UserActivityDay.activity_date >= start_date,
            models.UserActivityDay.activity_date <= end_date,
        )
        .order_by(models.UserActivityDay.activity_date.asc())
        .all()
    )
    return [row.activity_date for row in rows]


# ==================== Слоты записи на занятия ====================


def _month_bounds(year: int, month: int) -> tuple[date, date]:
    last_day = monthrange(year, month)[1]
    return date(year, month, 1), date(year, month, last_day)


def _slot_is_past(slot: models.BookingSlot) -> bool:
    now = datetime.now()
    today = now.date()
    if slot.slot_date < today:
        return True
    return slot.slot_date == today and slot.start_time <= now.strftime("%H:%M")


CANCELLATION_DEADLINE = timedelta(hours=36)


def _can_cancel_booking(slot: models.BookingSlot) -> bool:
    """Return whether the student can cancel this slot under the 36-hour policy."""
    start_at = datetime.combine(slot.slot_date, datetime.strptime(slot.start_time, "%H:%M").time())
    return start_at - datetime.now() >= CANCELLATION_DEADLINE


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


# ---- Квота занятий на месяц ----


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


def serialize_slot_admin(slot: models.BookingSlot, student: models.User | None) -> dict:
    return {
        "id": slot.id,
        "date": slot.slot_date.isoformat(),
        "start_time": slot.start_time,
        "duration_minutes": slot.duration_minutes,
        "is_past": _slot_is_past(slot),
        "student": {"id": student.id, "username": student.username, "email": student.email} if student else None,
    }


def serialize_slot_student(slot: models.BookingSlot, viewer_id: int) -> dict:
    return {
        "id": slot.id,
        "date": slot.slot_date.isoformat(),
        "start_time": slot.start_time,
        "duration_minutes": slot.duration_minutes,
        "status": "mine" if slot.student_id == viewer_id else "free",
        "can_cancel": slot.student_id == viewer_id and _can_cancel_booking(slot),
    }


def create_slot(slot_date: date, start_time: str, duration_minutes: int, db: Session) -> models.BookingSlot:
    if duration_minutes not in {60, 90, 120}:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="Длительность слота: 60, 90 или 120 минут")

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


def list_slots_for_month_admin(year: int, month: int, db: Session) -> list[dict]:
    start_date, end_date = _month_bounds(year, month)
    slots = (
        db.query(models.BookingSlot)
        .filter(models.BookingSlot.slot_date >= start_date, models.BookingSlot.slot_date <= end_date)
        .order_by(models.BookingSlot.slot_date.asc(), models.BookingSlot.start_time.asc())
        .all()
    )
    student_ids = {slot.student_id for slot in slots if slot.student_id is not None}
    students = {}
    if student_ids:
        rows = db.query(models.User).filter(models.User.id.in_(student_ids)).all()
        students = {user.id: user for user in rows}
    return [serialize_slot_admin(slot, students.get(slot.student_id)) for slot in slots]


def list_bookable_slots(year: int, month: int, user_id: int, db: Session) -> list[dict]:
    """Свободные будущие слоты + собственные брони студента за месяц."""
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
    # Свободные прошедшие окна студенту не показываем; свои брони — показываем всегда.
    visible = [slot for slot in slots if slot.student_id == user_id or not _slot_is_past(slot)]
    return [serialize_slot_student(slot, user_id) for slot in visible]


def book_slot(slot_id: int, user_id: int, db: Session) -> models.BookingSlot:
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
    db.commit()
    db.refresh(slot)
    return slot


def cancel_booking(slot_id: int, user_id: int, db: Session) -> models.BookingSlot:
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
    db.commit()
    db.refresh(slot)
    return slot


async def register_user(user: UserCreate, db: Session):
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists")

    new_user = models.User(username=user.username, email=user.email, password=user.password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


async def login_user(response: Response, user: UserLogin, db: Session):
    user_db = db.query(models.User).filter(models.User.email == user.email).first()

    if user_db is None or user_db.verify_password(user.password) is False:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    
    # Держим не больше 3 активных сессий: при входе с 4-го устройства
    # вытесняем самую старую вместо вечного 403 (раньше логин блокировался
    # навсегда, потому что сессии никогда не удалялись).
    MAX_SESSIONS = 3
    sessions = (
        db.query(models.Session)
        .filter(models.Session.user_id == user_db.id)
        .order_by(models.Session.created_at.asc())
        .all()
    )
    for stale_session in sessions[: max(0, len(sessions) - (MAX_SESSIONS - 1))]:
        db.delete(stale_session)

    session_token = str(uuid.uuid4())
    new_session = models.Session(user_id=user_db.id, session_token=session_token)
    db.add(new_session)
    db.commit()

    response.set_cookie(
        key="session",
        value=session_token,
        httponly=True,
        samesite="lax",
        max_age=30 * 24 * 3600,
    )
    return user_db


async def get_current_user(request: Request, db: Session):
    session_token = request.cookies.get("session")
    if not session_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No session token found")

    user_session = db.query(models.Session).filter(models.Session.session_token == session_token).first()
    if user_session is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session")

    user_db = db.query(models.User).filter(models.User.id == user_session.user_id).first()
    if user_db is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return user_db


async def logout_user(request: Request, response: Response, db: Session):
    session_token = request.cookies.get("session")
    if not session_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No session token found")

    db.query(models.Session).filter(models.Session.session_token == session_token).delete()
    db.commit()
    response.delete_cookie(key="session")

    return {"message": "Logout successful"}
