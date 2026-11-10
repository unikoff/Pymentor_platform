"""Activity calendar and timezone policies, independent of persistence."""

from calendar import monthrange
from datetime import date
from datetime import datetime
from datetime import timedelta
from datetime import timezone

MOSCOW_TZ = timezone(timedelta(hours=3))


def serialize_activity_timestamp(value: datetime | None) -> str | None:
    if value is None:
        return None
    normalized = value if value.tzinfo else value.replace(tzinfo=timezone.utc)
    return normalized.astimezone(timezone.utc).isoformat()


def activity_month_bounds(year, month):
    return date(year, month, 1), date(year, month, monthrange(year, month)[1])


def activity_today(clock=None):
    current_time = clock.now() if clock is not None else datetime.now(MOSCOW_TZ)
    return current_time.astimezone(MOSCOW_TZ).date()


def activity_period_utc(today):
    period_start = today - timedelta(days=6)
    period_end = today + timedelta(days=1)
    return (
        datetime.combine(
            period_start, datetime.min.time(), tzinfo=MOSCOW_TZ
        ).astimezone(timezone.utc),
        datetime.combine(period_end, datetime.min.time(), tzinfo=MOSCOW_TZ).astimezone(
            timezone.utc
        ),
    )


def summarize_activity(today, activity_dates, lesson_completion_rows):
    visited_today = today in activity_dates
    current_day = today if visited_today else today - timedelta(days=1)
    current_streak = 0
    while current_day in activity_dates:
        current_streak += 1
        current_day -= timedelta(days=1)
    period_start = today - timedelta(days=6)
    lessons_by_date = {
        period_start + timedelta(days=day_offset): 0 for day_offset in range(7)
    }
    for (completed_at,) in lesson_completion_rows:
        normalized_at = (
            completed_at
            if completed_at.tzinfo
            else completed_at.replace(tzinfo=timezone.utc)
        )
        completed_date = normalized_at.astimezone(MOSCOW_TZ).date()
        if completed_date in lessons_by_date:
            lessons_by_date[completed_date] += 1
    return {
        "current_streak": current_streak,
        "visited_today": visited_today,
        "total_active_days": len(activity_dates),
        "weekly_activity": [
            {
                "activity_date": (
                    period_start + timedelta(days=day_offset)
                ).isoformat(),
                "active": period_start + timedelta(days=day_offset) in activity_dates,
            }
            for day_offset in range(7)
        ],
        "weekly_lessons_completed": [
            {
                "activity_date": day.isoformat(),
                "lessons_completed": lessons_by_date[day],
            }
            for day in (
                period_start + timedelta(days=day_offset) for day_offset in range(7)
            )
        ],
    }
