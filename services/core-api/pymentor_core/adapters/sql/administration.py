"""Core SQL report/command adapter. Caller must supply an already verified actor.

Account deletion keeps its original generation check, pending-send guard, exact
Redis-key journal capture, and transaction ordering. No raw HTTP request enters
this adapter; external messages are never sent here.
"""

from datetime import date
from datetime import datetime
from datetime import timedelta
from datetime import timezone
from typing import Literal
from sqlalchemy import and_
from sqlalchemy import case
from sqlalchemy import column
from sqlalchemy import func
from sqlalchemy import or_
from sqlalchemy import table
from sqlalchemy import text
from sqlalchemy.orm import Session
from pymentor_core.shared.ports import UnitOfWork
from pymentor_core.shared.errors import ApplicationError
from pymentor_core.modules.identity.principal import Principal
from pymentor_core.adapters.sql import models
from pymentor_core.adapters.sql import bookings as booking_storage
from pymentor_core.modules.identity import access as accounts
from pymentor_core.modules.identity import activity
from pymentor_core.modules.bookings import public as bookings
from pymentor_core.modules.learning import progress
from pymentor_core.modules.learning.catalog import find_track
from pymentor_core.modules.learning.catalog import get_tracks_summary
from pymentor_core.modules.bookings.api.schemas import SlotCreate
from pymentor_core.modules.administration.api.schemas import QuotaChange
from pymentor_core.modules.administration.api.schemas import SubscriptionChange


def _serialize_account(user: models.User, completed_lessons: int) -> dict:
    data = accounts.serialize_user(user)
    data["completed_lessons"] = completed_lessons
    return data


def _build_learning_progress(user_id: int, db: Session) -> tuple[list[dict], int]:
    """Собирает компактное дерево треков, блоков, уроков и заданий для админки."""
    completed_ids = progress.get_completed_lesson_ids(user_id, db)
    tracked_tasks = [
        task
        for track_summary in get_tracks_summary()
        if (track := find_track(track_summary["id"])) is not None
        for lesson in track["lessons"]
        if str(lesson.get("source_file", "")).startswith(
            ("foundations/block_03/", "chapter_01/")
        )
        for task in lesson.get("tasks", [])
    ]
    chapter_one_self_checks = [
        lesson
        for track_summary in get_tracks_summary()
        if (track := find_track(track_summary["id"])) is not None
        for lesson in track["lessons"]
        if str(lesson.get("source_file", "")).startswith("chapter_01/")
        and lesson.get("self_check")
        and (lesson.get("manual_practice") or not lesson.get("tasks"))
    ]
    completed_task_revisions = progress.get_completed_task_revisions(
        user_id=user_id,
        task_ids=[task["id"] for task in tracked_tasks]
        + [
            progress.chapter_one_completion_task_id(lesson["id"])
            for lesson in chapter_one_self_checks
        ],
        db=db,
    )
    tracks: list[dict] = []
    completed_lessons = 0
    for track_summary in get_tracks_summary():
        track = find_track(track_summary["id"])
        if track is None:
            continue
        track_id = track["id"]
        modules_by_title: dict[str, dict] = {}
        for lesson in track["lessons"]:
            module_title = lesson["module"]
            module = modules_by_title.setdefault(
                module_title,
                {
                    "id": f"{track_id}:{module_title}",
                    "title": module_title,
                    "completed": 0,
                    "total": 0,
                    "lessons_total": 0,
                    "lessons": [],
                },
            )
            lesson_completed = lesson["id"] in completed_ids
            source_file = str(lesson.get("source_file", ""))
            is_chapter_one = source_file.startswith("chapter_01/")
            is_revision_tracked = is_chapter_one or source_file.startswith(
                "foundations/block_03/"
            )
            countable = bool(lesson.get("tasks") or lesson.get("self_check"))
            tasks = []
            for task in lesson.get("tasks", []):
                task_completed = (
                    completed_task_revisions.get(task["id"]) == task.get("revision")
                    if is_revision_tracked
                    else lesson_completed
                )
                tasks.append(
                    {
                        "id": task["id"],
                        "title": task["title"],
                        "level": task.get("level")
                        if task.get("level") in {"easy", "medium", "hard"}
                        else None,
                        "completed": task_completed,
                    }
                )
            if is_chapter_one:
                if not lesson_completed:
                    required_tasks = [
                        task for task in tasks if progress.is_task_required(task)
                    ]
                    all_tasks_complete = all(
                        (task["completed"] for task in required_tasks)
                    )
                    if required_tasks and (not all_tasks_complete):
                        lesson_completed = False
                    elif lesson.get("manual_practice") or not tasks:
                        if lesson.get("self_check"):
                            marker_id = progress.chapter_one_completion_task_id(
                                lesson["id"]
                            )
                            lesson_completed = completed_task_revisions.get(
                                marker_id
                            ) == progress.chapter_one_completion_revision(lesson)
                    else:
                        lesson_completed = bool(required_tasks) and all_tasks_complete
            elif is_revision_tracked and tasks:
                all_tasks_complete = all((task["completed"] for task in tasks))
                if lesson.get("manual_practice"):
                    lesson_completed = lesson_completed and all_tasks_complete
                else:
                    lesson_completed = all_tasks_complete
            if not tasks and lesson.get("self_check"):
                tasks = [
                    {
                        "id": f"{lesson['id']}:self-check",
                        "title": "Отметка выполнения",
                        "level": None,
                        "completed": lesson_completed,
                    }
                ]
            module["lessons_total"] += 1
            module["lessons"].append(
                {
                    "id": lesson["id"],
                    "title": lesson["title"],
                    "completed": lesson_completed,
                    "countable": countable,
                    "tasks": tasks,
                }
            )
            if countable:
                module["total"] += 1
                if lesson_completed:
                    module["completed"] += 1
                    completed_lessons += 1
        modules = list(modules_by_title.values())
        tracks.append(
            {
                "id": track_id,
                "title": track_summary["title"],
                "completed": sum((module["completed"] for module in modules)),
                "total": sum((module["total"] for module in modules)),
                "lessons_total": sum((module["lessons_total"] for module in modules)),
                "modules": modules,
            }
        )
    return (tracks, completed_lessons)


def admin_overview(actor: Principal, db: Session):
    """Краткая сводка по активности учеников, подпискам и загрузке расписания."""
    now = bookings.now_moscow()
    today = now.date()
    now_utc = now.astimezone(timezone.utc)
    week_start_utc = now_utc - timedelta(days=7)
    trend_days = 30
    trend_start_date = today - timedelta(days=trend_days - 1)
    trend_start_utc = datetime.combine(
        trend_start_date, datetime.min.time(), tzinfo=activity.MOSCOW_TZ
    ).astimezone(timezone.utc)
    student_totals = (
        db.query(
            func.count(models.User.id),
            func.sum(case((models.User.subscription_until > now_utc, 1), else_=0)),
        )
        .filter(models.User.is_admin.is_(False))
        .one()
    )
    total_students = int(student_totals[0] or 0)
    active_subscriptions_count = int(student_totals[1] or 0)
    active_students_7d = (
        db.query(func.count(func.distinct(models.UserActivityDay.user_id)))
        .join(models.User, models.User.id == models.UserActivityDay.user_id)
        .filter(
            models.User.is_admin.is_(False),
            models.UserActivityDay.activity_date >= today - timedelta(days=6),
            models.UserActivityDay.activity_date <= today,
        )
        .scalar()
        or 0
    )
    activity_by_date = {
        activity_date: active_count
        for activity_date, active_count in db.query(
            models.UserActivityDay.activity_date,
            func.count(func.distinct(models.UserActivityDay.user_id)),
        )
        .join(models.User, models.User.id == models.UserActivityDay.user_id)
        .filter(
            models.User.is_admin.is_(False),
            models.UserActivityDay.activity_date >= trend_start_date,
            models.UserActivityDay.activity_date <= today,
        )
        .group_by(models.UserActivityDay.activity_date)
        .all()
    }
    lessons_completed_7d = (
        db.query(func.count(models.UserLessonProgress.id))
        .join(models.User, models.User.id == models.UserLessonProgress.user_id)
        .filter(
            models.User.is_admin.is_(False),
            models.UserLessonProgress.completed_at >= week_start_utc,
            models.UserLessonProgress.completed_at <= now_utc,
        )
        .scalar()
        or 0
    )
    lessons_completed_by_date: dict[date, int] = {}
    completion_rows = (
        db.query(models.UserLessonProgress.completed_at)
        .join(models.User, models.User.id == models.UserLessonProgress.user_id)
        .filter(
            models.User.is_admin.is_(False),
            models.UserLessonProgress.completed_at >= trend_start_utc,
            models.UserLessonProgress.completed_at <= now_utc,
        )
        .all()
    )
    for (completed_at,) in completion_rows:
        normalized_at = accounts.normalize_datetime(completed_at)
        if normalized_at is None:
            continue
        completed_date = normalized_at.astimezone(activity.MOSCOW_TZ).date()
        lessons_completed_by_date[completed_date] = (
            lessons_completed_by_date.get(completed_date, 0) + 1
        )
    expiration_limit_utc = now_utc + timedelta(days=7)
    expiring_query = db.query(models.User).filter(
        models.User.is_admin.is_(False),
        models.User.subscription_until > now_utc,
        models.User.subscription_until <= expiration_limit_utc,
    )
    expiring_subscriptions_count = expiring_query.count()
    expiring_subscriptions = [
        {
            "id": user.id,
            "username": user.username,
            "subscription_plan": user.subscription_plan or "pro",
            "subscription_until": accounts.normalize_datetime(
                user.subscription_until
            ).isoformat(),
        }
        for user in expiring_query.order_by(models.User.subscription_until.asc())
        .limit(6)
        .all()
    ]
    slots_until = today + timedelta(days=29)
    upcoming_slots = (
        db.query(
            func.count(models.BookingSlot.id),
            func.sum(case((models.BookingSlot.student_id.is_not(None), 1), else_=0)),
        )
        .filter(
            models.BookingSlot.slot_date <= slots_until,
            or_(
                models.BookingSlot.slot_date > today,
                and_(
                    models.BookingSlot.slot_date == today,
                    models.BookingSlot.start_time >= now.strftime("%H:%M"),
                ),
            ),
        )
        .one()
    )
    total_slots = upcoming_slots[0] or 0
    booked_slots = upcoming_slots[1] or 0
    free_slots = total_slots - booked_slots
    slots_next_week_until = today + timedelta(days=6)
    next_week_slots = (
        db.query(
            func.count(models.BookingSlot.id),
            func.sum(case((models.BookingSlot.student_id.is_not(None), 1), else_=0)),
        )
        .filter(
            models.BookingSlot.slot_date <= slots_next_week_until,
            or_(
                models.BookingSlot.slot_date > today,
                and_(
                    models.BookingSlot.slot_date == today,
                    models.BookingSlot.start_time >= now.strftime("%H:%M"),
                ),
            ),
        )
        .one()
    )
    next_week_total = int(next_week_slots[0] or 0)
    next_week_booked = int(next_week_slots[1] or 0)
    upcoming_bookings = [
        {
            "id": slot.id,
            "date": slot.slot_date.isoformat(),
            "start_time": slot.start_time,
            "duration_minutes": slot.duration_minutes,
            "student": {
                "id": student.id,
                "username": student.username,
                "email": student.email,
            },
        }
        for slot, student in db.query(models.BookingSlot, models.User)
        .join(models.User, models.User.id == models.BookingSlot.student_id)
        .filter(
            models.BookingSlot.student_id.is_not(None),
            models.BookingSlot.slot_date <= slots_next_week_until,
            or_(
                models.BookingSlot.slot_date > today,
                and_(
                    models.BookingSlot.slot_date == today,
                    models.BookingSlot.start_time >= now.strftime("%H:%M"),
                ),
            ),
        )
        .order_by(
            models.BookingSlot.slot_date.asc(), models.BookingSlot.start_time.asc()
        )
        .limit(6)
        .all()
    ]
    most_active_students = [
        {"id": user_id, "username": username, "lessons_completed": int(completed_count)}
        for user_id, username, completed_count in db.query(
            models.User.id,
            models.User.username,
            func.count(models.UserLessonProgress.id),
        )
        .join(
            models.UserLessonProgress,
            models.UserLessonProgress.user_id == models.User.id,
        )
        .filter(
            models.User.is_admin.is_(False),
            models.UserLessonProgress.completed_at >= week_start_utc,
            models.UserLessonProgress.completed_at <= now_utc,
        )
        .group_by(models.User.id, models.User.username)
        .order_by(
            func.count(models.UserLessonProgress.id).desc(), models.User.username.asc()
        )
        .limit(6)
        .all()
    ]
    daily_active_students = [
        {
            "date": activity_date.isoformat(),
            "active_students": activity_by_date.get(activity_date, 0),
        }
        for activity_date in (
            trend_start_date + timedelta(days=day_offset)
            for day_offset in range(trend_days)
        )
    ]
    daily_lessons_completed = [
        {
            "date": activity_date.isoformat(),
            "lessons_completed": lessons_completed_by_date.get(activity_date, 0),
        }
        for activity_date in (
            trend_start_date + timedelta(days=day_offset)
            for day_offset in range(trend_days)
        )
    ]
    return {
        "total_students": total_students,
        "active_students_7d": active_students_7d,
        "inactive_students_7d": max(total_students - active_students_7d, 0),
        "active_subscriptions_count": active_subscriptions_count,
        "lessons_completed_7d": lessons_completed_7d,
        "expiring_subscriptions_count": expiring_subscriptions_count,
        "expiring_subscriptions": expiring_subscriptions,
        "slots_30d": {
            "booked": booked_slots,
            "total": total_slots,
            "free": free_slots,
            "occupancy_percent": round(booked_slots / total_slots * 100)
            if total_slots
            else None,
        },
        "slots_7d": {
            "booked": next_week_booked,
            "total": next_week_total,
            "free": next_week_total - next_week_booked,
        },
        "upcoming_bookings": upcoming_bookings,
        "most_active_students": most_active_students,
        "daily_active_students": daily_active_students,
        "daily_lessons_completed": daily_lessons_completed,
    }


def list_users(
    actor: Principal,
    search: str,
    subscription: Literal["all", "active", "inactive"],
    lessons: Literal["all", "none", "low", "many"],
    year: int | None,
    month: int | None,
    db: Session,
):
    term = search.strip().lower()
    query = db.query(models.User).order_by(models.User.id.asc())
    if not term and subscription == "all" and (lessons == "all"):
        query = query.limit(100)
    users = query.all()
    if term:
        users = [
            u for u in users if term in u.username.lower() or term in u.email.lower()
        ]
    now = bookings.now_moscow()
    if subscription != "all":
        users = [
            u
            for u in users
            if (
                (end := accounts.normalize_datetime(u.subscription_until)) is not None
                and end > now
            )
            == (subscription == "active")
        ]
    quota_year, quota_month = (year or now.year, month or now.month)
    completed_since = now - timedelta(days=7)
    completed_since_utc = completed_since.astimezone(timezone.utc)
    start_date, end_date = bookings.month_bounds(quota_year, quota_month)
    quotas: dict[int, dict] = {}
    if users:
        user_ids = [u.id for u in users]
        granted = dict(
            db.query(models.BookingQuota.user_id, models.BookingQuota.granted_slots)
            .filter(
                models.BookingQuota.user_id.in_(user_ids),
                models.BookingQuota.year == quota_year,
                models.BookingQuota.month == quota_month,
            )
            .all()
        )
        used = dict(
            db.query(models.BookingSlot.student_id, func.count(models.BookingSlot.id))
            .filter(
                models.BookingSlot.student_id.in_(user_ids),
                models.BookingSlot.slot_date >= start_date,
                models.BookingSlot.slot_date <= end_date,
            )
            .group_by(models.BookingSlot.student_id)
            .all()
        )
        quotas = {
            u.id: {
                "granted": granted.get(u.id, 0),
                "used": used.get(u.id, 0),
                "remaining": max(0, granted.get(u.id, 0) - used.get(u.id, 0)),
            }
            for u in users
        }
        if lessons != "all":
            minimum, maximum = {"none": (0, 0), "low": (1, 3), "many": (4, None)}[
                lessons
            ]
            users = [
                u
                for u in users
                if quotas[u.id]["remaining"] >= minimum
                and (maximum is None or quotas[u.id]["remaining"] <= maximum)
            ]
    users = users[:100]
    counts: dict[int, int] = {}
    recent_counts: dict[int, int] = {}
    if users:
        user_ids = [u.id for u in users]
        rows = (
            db.query(
                models.UserLessonProgress.user_id,
                func.count(models.UserLessonProgress.id),
            )
            .filter(models.UserLessonProgress.user_id.in_(user_ids))
            .group_by(models.UserLessonProgress.user_id)
            .all()
        )
        counts = dict(rows)
        recent_rows = (
            db.query(
                models.UserLessonProgress.user_id,
                func.count(models.UserLessonProgress.id),
            )
            .filter(
                models.UserLessonProgress.user_id.in_(user_ids),
                models.UserLessonProgress.completed_at >= completed_since_utc,
            )
            .group_by(models.UserLessonProgress.user_id)
            .all()
        )
        recent_counts = dict(recent_rows)
    return {
        "completed_since": completed_since.date().isoformat(),
        "users": [
            {
                **_serialize_account(u, counts.get(u.id, 0)),
                "completed_lessons_7d": recent_counts.get(u.id, 0),
                "quota": quotas[u.id],
            }
            for u in users
        ],
    }


def delete_user(
    user_id: int,
    actor: Principal,
    db: Session,
    *,
    expected_account_ref: str | None = None,
):
    admin = actor
    if admin.id == user_id:
        raise ApplicationError(
            status_code=400, detail="Нельзя удалить собственный аккаунт"
        )
    if db.bind is not None and db.bind.dialect.name == "postgresql":
        booking_storage._require_postgres_read_committed(db)
    if expected_account_ref is not None:
        from uuid import UUID

        try:
            if str(UUID(expected_account_ref)) != expected_account_ref:
                raise ValueError("noncanonical account reference")
        except (ValueError, TypeError, AttributeError):
            raise ApplicationError(
                status_code=400, detail="Invalid account reference"
            ) from None
        locked = db.execute(
            text(
                "\n            UPDATE users SET id = id WHERE id = :uid AND EXISTS (\n                SELECT 1 FROM account_lifecycles\n                WHERE user_id = :uid AND lifecycle_id = :reference\n            )\n        "
            ),
            {"uid": user_id, "reference": expected_account_ref},
        )
        if locked.rowcount != 1:
            raise ApplicationError(
                status_code=409, detail="Account changed; reload its profile"
            )
    else:
        locked = db.execute(
            text("UPDATE users SET id = id WHERE id = :uid"), {"uid": user_id}
        )
        if locked.rowcount != 1:
            raise ApplicationError(status_code=404, detail="User not found")
    target_user_query = db.query(models.User).filter(models.User.id == user_id)
    if db.bind is not None and db.bind.dialect.name == "postgresql":
        target_user_query = target_user_query.with_for_update()
    user_db = target_user_query.first()
    if user_db is None:
        raise ApplicationError(status_code=404, detail="User not found")
    account_ref = db.scalar(
        text("SELECT lifecycle_id FROM account_lifecycles WHERE user_id=:uid"),
        {"uid": user_id},
    )
    if account_ref is not None:
        subjects = table(
            "booking_notification_subjects", column("outbox_id"), column("lifecycle_id")
        )
        notifications = (
            db.query(models.BookingNotificationOutbox)
            .join(subjects, subjects.c.outbox_id == models.BookingNotificationOutbox.id)
            .filter(subjects.c.lifecycle_id == account_ref)
            .order_by(models.BookingNotificationOutbox.id)
        )
        if db.bind is not None and db.bind.dialect.name == "postgresql":
            notifications = notifications.with_for_update(
                of=models.BookingNotificationOutbox
            )
        notifications = notifications.all()
        if any((event.status == "processing" for event in notifications)):
            raise ApplicationError(
                status_code=409, detail="Notification delivery is still being resolved"
            )
        event_ids = [event.id for event in notifications]
        if event_ids:
            db.execute(
                text(
                    "DELETE FROM booking_notification_subjects WHERE lifecycle_id=:ref"
                ),
                {"ref": account_ref},
            )
            db.query(models.BookingNotificationOutbox).filter(
                models.BookingNotificationOutbox.id.in_(event_ids)
            ).delete(synchronize_session=False)
    if db.bind is not None and db.bind.dialect.name == "postgresql":
        db.execute(
            text("SELECT pymentor_capture_account_deletion(:uid)"), {"uid": user_id}
        )
    db.query(models.BookingSlot).filter(
        models.BookingSlot.student_id == user_id
    ).update({models.BookingSlot.student_id: None}, synchronize_session=False)
    for related in (
        models.Session,
        models.UserActivityDay,
        models.UserLessonProgress,
        models.UserTaskProgress,
        models.BookingQuota,
    ):
        db.query(related).filter(related.user_id == user_id).delete(
            synchronize_session=False
        )
    db.delete(user_db)
    db.commit()
    return {"deleted": user_id}


def change_subscription(
    user_id: int,
    payload: SubscriptionChange,
    actor: Principal,
    db: Session | None,
    *,
    uow: UnitOfWork | None = None,
):
    if uow is None:
        user_db = db.query(models.User).filter(models.User.id == user_id).first()
    else:
        user_db = uow.repository(models.User).find_one(id=user_id)
    if user_db is None:
        raise ApplicationError(status_code=404, detail="User not found")
    if payload.days is None:
        user_db.subscription_until = None
        user_db.subscription_plan = None
    else:
        now = datetime.now(timezone.utc)
        current = accounts.normalize_datetime(user_db.subscription_until)
        base = current if current is not None and current > now else now
        user_db.subscription_until = base + timedelta(days=payload.days)
        user_db.subscription_plan = user_db.subscription_plan or "pro"
    if uow is None:
        db.commit()
        db.refresh(user_db)
    else:
        uow.commit()
        uow.refresh(user_db)
    return {"user": _serialize_account(user_db, completed_lessons=0)}


def admin_list_slots(
    actor: Principal, year: int, month: int, include_past: bool, db: Session
):
    return {
        "slots": bookings.list_slots_for_month_admin(
            year=year, month=month, db=db, include_past=include_past
        )
    }


def admin_create_slot(payload: SlotCreate, actor: Principal, db: Session):
    slot = bookings.create_slot(
        slot_date=payload.slot_date,
        start_time=payload.start_time,
        duration_minutes=payload.duration_minutes,
        db=db,
    )
    return {"slot": bookings.serialize_slot_admin(slot, student=None)}


def admin_delete_slot(slot_id: int, actor: Principal, db: Session):
    bookings.delete_slot(slot_id=slot_id, db=db)
    return {"deleted": slot_id}


def _build_student_profile(
    user: models.User,
    year: int,
    month: int,
    db: Session,
    *,
    account_ref: str | None = None,
) -> dict:
    start_date, end_date = bookings.month_bounds(year, month)
    booking_rows = (
        db.query(models.BookingSlot)
        .filter(
            models.BookingSlot.student_id == user.id,
            models.BookingSlot.slot_date >= start_date,
            models.BookingSlot.slot_date <= end_date,
        )
        .order_by(
            models.BookingSlot.slot_date.asc(), models.BookingSlot.start_time.asc()
        )
        .all()
    )
    activity_records = activity.get_activity_records(
        user_id=user.id, year=year, month=month, db=db
    )
    activity_summary = (
        db.query(
            func.count(models.UserActivityDay.id),
            func.max(models.UserActivityDay.activity_date),
        )
        .filter(models.UserActivityDay.user_id == user.id)
        .one()
    )
    total_bookings = (
        db.query(func.count(models.BookingSlot.id))
        .filter(models.BookingSlot.student_id == user.id)
        .scalar()
        or 0
    )
    completed_lessons_7d = (
        db.query(func.count(models.UserLessonProgress.id))
        .filter(
            models.UserLessonProgress.user_id == user.id,
            models.UserLessonProgress.completed_at
            >= datetime.now(timezone.utc) - timedelta(days=7),
        )
        .scalar()
        or 0
    )
    learning_progress, completed_lessons = _build_learning_progress(user.id, db)
    data = _serialize_account(user, completed_lessons=completed_lessons)
    if account_ref is not None:
        data["account_ref"] = account_ref
    data["quota"] = bookings.get_quota_status(
        user_id=user.id, year=year, month=month, db=db
    )
    data["activity_days_count"] = len(activity_records)
    data["activity_days"] = [
        record.activity_date.isoformat() for record in activity_records
    ]
    data["total_activity_days"] = int(activity_summary[0] or 0)
    data["last_activity_date"] = (
        activity_summary[1].isoformat() if activity_summary[1] else None
    )
    data["total_bookings"] = int(total_bookings)
    data["completed_lessons_7d"] = int(completed_lessons_7d)
    data["activity_summary"] = activity.get_activity_summary(user_id=user.id, db=db)
    data["learning_progress"] = learning_progress
    data["bookings"] = [
        {
            "id": slot.id,
            "date": slot.slot_date.isoformat(),
            "start_time": slot.start_time,
            "duration_minutes": slot.duration_minutes,
        }
        for slot in booking_rows
    ]
    return data


def _guarded_profile_user(db: Session, user_id: int):
    """Read the displayed account and its generation in one SQL statement."""
    refs = table("account_lifecycles", column("user_id"), column("lifecycle_id"))

    def find():
        return (
            db.query(models.User, refs.c.lifecycle_id)
            .join(refs, refs.c.user_id == models.User.id)
            .filter(models.User.id == user_id)
            .populate_existing()
            .first()
        )

    result = find()
    if (
        result is None
        and db.bind is not None
        and (db.bind.dialect.name == "postgresql")
    ):
        from uuid import uuid4

        db.execute(
            text(
                "\n            INSERT INTO account_lifecycles(user_id, lifecycle_id)\n            SELECT id, :reference FROM users WHERE id = :uid\n            ON CONFLICT (user_id) DO NOTHING\n        "
            ),
            {"uid": user_id, "reference": str(uuid4())},
        )
        db.commit()
        result = find()
    if result is None:
        if db.query(models.User.id).filter_by(id=user_id).first() is not None:
            raise ApplicationError(
                status_code=503, detail="Account identity unavailable"
            )
        raise ApplicationError(status_code=404, detail="User not found")
    return result


def student_profile(user_id: int, actor: Principal, year: int, month: int, db: Session):
    user_db, account_ref = _guarded_profile_user(db, user_id)
    return {
        "profile": _build_student_profile(
            user_db, year, month, db, account_ref=account_ref
        )
    }


def change_quota(user_id: int, payload: QuotaChange, actor: Principal, db: Session):
    user_db = db.query(models.User).filter(models.User.id == user_id).first()
    if user_db is None:
        raise ApplicationError(status_code=404, detail="User not found")
    bookings.add_quota(
        user_id=user_id,
        year=payload.year,
        month=payload.month,
        amount=payload.add,
        db=db,
    )
    return {"profile": _build_student_profile(user_db, payload.year, payload.month, db)}
