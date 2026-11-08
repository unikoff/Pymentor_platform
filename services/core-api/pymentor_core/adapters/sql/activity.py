"""SQL activity persistence; calendar decisions live in identity policy."""

from datetime import date
from datetime import datetime
from datetime import timezone
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from pymentor_core.shared.ports import Clock
from pymentor_core.shared.ports import UnitOfWork
from pymentor_core.adapters.sql import models
from pymentor_core.modules.identity.activity_policy import activity_month_bounds
from pymentor_core.modules.identity.activity_policy import activity_today
from pymentor_core.modules.identity.activity_policy import activity_period_utc
from pymentor_core.modules.identity.activity_policy import summarize_activity


def record_activity_day(
    user_id: int,
    activity_date: date,
    db: Session | None,
    visited_at: datetime | None = None,
    *,
    uow: UnitOfWork | None = None,
    clock: Clock | None = None,
) -> models.UserActivityDay:
    if uow is not None:
        repository = uow.repository(models.UserActivityDay)
        timestamp = visited_at or (
            clock.now() if clock is not None else datetime.now(timezone.utc)
        )
        existing_day = repository.find_one(user_id=user_id, activity_date=activity_date)
        if existing_day is not None:
            if existing_day.visited_at is None:
                existing_day.visited_at = timestamp
                uow.commit()
                uow.refresh(existing_day)
            return existing_day

        activity_day = models.UserActivityDay(
            user_id=user_id,
            activity_date=activity_date,
            visited_at=timestamp,
        )
        repository.add(activity_day)
        try:
            uow.commit()
        except IntegrityError:
            uow.rollback()
            existing_day = repository.find_one(
                user_id=user_id, activity_date=activity_date
            )
            if existing_day is not None:
                return existing_day
            raise
        uow.refresh(activity_day)
        return activity_day

    if db is None:
        raise ValueError("db is required when no unit of work is supplied")
    existing_day = (
        db.query(models.UserActivityDay)
        .filter(
            models.UserActivityDay.user_id == user_id,
            models.UserActivityDay.activity_date == activity_date,
        )
        .first()
    )
    if existing_day is not None:
        if existing_day.visited_at is None:
            existing_day.visited_at = visited_at or datetime.now(timezone.utc)
            db.commit()
            db.refresh(existing_day)
        return existing_day

    activity_day = models.UserActivityDay(
        user_id=user_id,
        activity_date=activity_date,
        visited_at=visited_at or datetime.now(timezone.utc),
    )
    db.add(activity_day)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        existing_day = (
            db.query(models.UserActivityDay)
            .filter(
                models.UserActivityDay.user_id == user_id,
                models.UserActivityDay.activity_date == activity_date,
            )
            .first()
        )
        if existing_day is not None:
            return existing_day
        raise

    db.refresh(activity_day)
    return activity_day


def get_activity_records(
    user_id: int, year: int, month: int, db: Session
) -> list[models.UserActivityDay]:
    start_date, end_date = activity_month_bounds(year, month)

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
    return rows


def get_activity_summary(user_id: int, db: Session, *, clock: Clock | None = None):
    today = activity_today(clock)
    activity_dates = {
        row.activity_date
        for row in (
            db.query(models.UserActivityDay.activity_date)
            .filter(
                models.UserActivityDay.user_id == user_id,
                models.UserActivityDay.activity_date <= today,
            )
            .order_by(models.UserActivityDay.activity_date.desc())
            .all()
        )
    }
    period_start_utc, period_end_utc = activity_period_utc(today)
    lesson_completion_rows = (
        db.query(models.UserLessonProgress.completed_at)
        .filter(
            models.UserLessonProgress.user_id == user_id,
            models.UserLessonProgress.completed_at >= period_start_utc,
            models.UserLessonProgress.completed_at < period_end_utc,
        )
        .all()
    )
    return summarize_activity(today, activity_dates, lesson_completion_rows)
