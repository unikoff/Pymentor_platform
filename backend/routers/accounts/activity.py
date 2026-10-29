"""Visit recording and activity calendar calculations."""

from datetime import date, datetime, timedelta, timezone
from calendar import monthrange
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from db import models

MOSCOW_TZ = timezone(timedelta(hours=3))

def record_activity_day(
    user_id: int,
    activity_date: date,
    db: Session,
    visited_at: datetime | None = None,
) -> models.UserActivityDay:
    existing_day = (
        db.query(models.UserActivityDay)
        .filter(models.UserActivityDay.user_id == user_id, models.UserActivityDay.activity_date == activity_date)
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
            .filter(models.UserActivityDay.user_id == user_id, models.UserActivityDay.activity_date == activity_date)
            .first()
        )
        if existing_day is not None:
            return existing_day
        raise

    db.refresh(activity_day)
    return activity_day


def serialize_activity_timestamp(value: datetime | None) -> str | None:
    if value is None:
        return None
    normalized = value if value.tzinfo else value.replace(tzinfo=timezone.utc)
    return normalized.astimezone(timezone.utc).isoformat()


def get_activity_records(user_id: int, year: int, month: int, db: Session) -> list[models.UserActivityDay]:
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
    return rows


def get_activity_summary(user_id: int, db: Session) -> dict[str, int | bool | list[dict[str, str | bool | int]]]:
    today = datetime.now(MOSCOW_TZ).date()
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
    visited_today = today in activity_dates
    current_day = today if visited_today else today - timedelta(days=1)
    current_streak = 0
    while current_day in activity_dates:
        current_streak += 1
        current_day -= timedelta(days=1)
    period_start = today - timedelta(days=6)
    period_end = today + timedelta(days=1)
    period_start_utc = datetime.combine(period_start, datetime.min.time(), tzinfo=MOSCOW_TZ).astimezone(timezone.utc)
    period_end_utc = datetime.combine(period_end, datetime.min.time(), tzinfo=MOSCOW_TZ).astimezone(timezone.utc)
    lessons_by_date = {period_start + timedelta(days=day_offset): 0 for day_offset in range(7)}
    lesson_completion_rows = (
        db.query(models.UserLessonProgress.completed_at)
        .filter(
            models.UserLessonProgress.user_id == user_id,
            models.UserLessonProgress.completed_at >= period_start_utc,
            models.UserLessonProgress.completed_at < period_end_utc,
        )
        .all()
    )
    for (completed_at,) in lesson_completion_rows:
        normalized_at = completed_at if completed_at.tzinfo else completed_at.replace(tzinfo=timezone.utc)
        completed_date = normalized_at.astimezone(MOSCOW_TZ).date()
        if completed_date in lessons_by_date:
            lessons_by_date[completed_date] += 1
    return {
        "current_streak": current_streak,
        "visited_today": visited_today,
        "total_active_days": len(activity_dates),
        "weekly_activity": [
            {
                "activity_date": (period_start + timedelta(days=day_offset)).isoformat(),
                "active": period_start + timedelta(days=day_offset) in activity_dates,
            }
            for day_offset in range(7)
        ],
        "weekly_lessons_completed": [
            {
                "activity_date": day.isoformat(),
                "lessons_completed": lessons_by_date[day],
            }
            for day in (period_start + timedelta(days=day_offset) for day_offset in range(7))
        ],
    }
