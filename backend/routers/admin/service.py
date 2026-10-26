"""Administrative operations and student reports."""

from datetime import datetime, timedelta, timezone
from typing import Literal

from fastapi import HTTPException, Request, status
from sqlalchemy import and_, case, func, or_
from sqlalchemy.orm import Session

from db import models
from content.catalog import find_track, get_tracks_summary
from routers.accounts import service as accounts, activity
from routers.bookings import service as bookings
from routers.courses import progress
from routers.bookings.schemas import SlotCreate
from .schemas import QuotaChange, SubscriptionChange


def require_admin(request: Request, db: Session) -> models.User:
    """Доступ только для залогиненного пользователя с флагом is_admin."""
    user = accounts.get_current_user(request=request, db=db)
    if not user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Требуются права администратора")
    return user


def _serialize_account(user: models.User, completed_lessons: int) -> dict:
    data = accounts._serialize_user(user)
    data["completed_lessons"] = completed_lessons
    return data


def _build_learning_progress(user_id: int, db: Session) -> tuple[list[dict], int]:
    """Собирает компактное дерево треков, блоков, уроков и заданий для админки."""
    completed_ids = progress.get_completed_lesson_ids(user_id, db)
    block_three_tasks = [
        task
        for track_summary in get_tracks_summary()
        if (track := find_track(track_summary["id"])) is not None
        for lesson in track["lessons"]
        if str(lesson.get("source_file", "")).startswith("foundations/block_03/")
        for task in lesson.get("tasks", [])
    ]
    completed_task_revisions = progress.get_completed_task_revisions(
        user_id=user_id,
        task_ids=[task["id"] for task in block_three_tasks],
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
            is_block_three = str(lesson.get("source_file", "")).startswith("foundations/block_03/")
            countable = bool(lesson.get("tasks") or lesson.get("self_check"))
            tasks = []
            for task in lesson.get("tasks", []):
                task_completed = (
                    completed_task_revisions.get(task["id"]) == task.get("revision")
                    if is_block_three
                    else lesson_completed
                )
                tasks.append(
                    {
                        "id": task["id"],
                        "title": task["title"],
                        "level": task.get("level") if task.get("level") in {"easy", "medium", "hard"} else None,
                        "completed": task_completed,
                    }
                )
            if is_block_three and tasks:
                all_tasks_complete = all(task["completed"] for task in tasks)
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
                "completed": sum(module["completed"] for module in modules),
                "total": sum(module["total"] for module in modules),
                "lessons_total": sum(module["lessons_total"] for module in modules),
                "modules": modules,
            }
        )

    return tracks, completed_lessons


def admin_overview(request: Request, db: Session):
    """Краткая сводка по активности учеников, подпискам и загрузке расписания."""
    require_admin(request, db)

    now = bookings._now_moscow()
    today = now.date()
    now_utc = now.astimezone(timezone.utc)
    week_start_utc = now_utc - timedelta(days=7)
    month_start_date = today.replace(day=1)

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
        for activity_date, active_count in (
            db.query(
                models.UserActivityDay.activity_date,
                func.count(func.distinct(models.UserActivityDay.user_id)),
            )
            .join(models.User, models.User.id == models.UserActivityDay.user_id)
            .filter(
                models.User.is_admin.is_(False),
                models.UserActivityDay.activity_date >= month_start_date,
                models.UserActivityDay.activity_date <= today,
            )
            .group_by(models.UserActivityDay.activity_date)
            .all()
        )
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
            "subscription_until": accounts._normalize_datetime(user.subscription_until).isoformat(),
        }
        for user in expiring_query.order_by(models.User.subscription_until.asc()).limit(6).all()
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

    daily_active_students = [
        {
            "date": activity_date.isoformat(),
            "active_students": activity_by_date.get(activity_date, 0),
        }
        for activity_date in (
            month_start_date + timedelta(days=day_offset)
            for day_offset in range(today.day)
        )
    ]

    return {
        "active_students_7d": active_students_7d,
        "lessons_completed_7d": lessons_completed_7d,
        "expiring_subscriptions_count": expiring_subscriptions_count,
        "expiring_subscriptions": expiring_subscriptions,
        "slots_30d": {
            "booked": booked_slots,
            "total": total_slots,
            "free": free_slots,
            "occupancy_percent": round(booked_slots / total_slots * 100) if total_slots else None,
        },
        "daily_active_students": daily_active_students,
    }


def list_users(request: Request, search: str, subscription: Literal['all', 'active', 'inactive'], lessons: Literal['all', 'none', 'low', 'many'], year: int | None, month: int | None, db: Session):
    require_admin(request, db)

    # Фильтруем в Python: LOWER() в SQLite не понижает кириллицу, поэтому
    # ilike по русским именам не находит ничего. На наших объёмах это дёшево.
    users = db.query(models.User).order_by(models.User.id.asc()).all()
    term = search.strip().lower()
    if term:
        users = [u for u in users if term in u.username.lower() or term in u.email.lower()]
    now = bookings._now_moscow()
    if subscription != "all":
        users = [u for u in users if (
            (end := accounts._normalize_datetime(u.subscription_until)) is not None and end > now
        ) == (subscription == "active")]

    quota_year, quota_month = year or now.year, month or now.month
    completed_since = now - timedelta(days=7)
    completed_since_utc = completed_since.astimezone(timezone.utc)
    start_date, end_date = bookings._month_bounds(quota_year, quota_month)
    quotas: dict[int, dict] = {}
    if users:
        user_ids = [u.id for u in users]
        granted = dict(db.query(models.BookingQuota.user_id, models.BookingQuota.granted_slots).filter(
            models.BookingQuota.user_id.in_(user_ids),
            models.BookingQuota.year == quota_year,
            models.BookingQuota.month == quota_month,
        ).all())
        used = dict(db.query(models.BookingSlot.student_id, func.count(models.BookingSlot.id)).filter(
            models.BookingSlot.student_id.in_(user_ids),
            models.BookingSlot.slot_date >= start_date,
            models.BookingSlot.slot_date <= end_date,
        ).group_by(models.BookingSlot.student_id).all())
        quotas = {u.id: {
            "granted": granted.get(u.id, 0), "used": used.get(u.id, 0),
            "remaining": max(0, granted.get(u.id, 0) - used.get(u.id, 0)),
        } for u in users}
        if lessons != "all":
            minimum, maximum = {"none": (0, 0), "low": (1, 3), "many": (4, None)}[lessons]
            users = [u for u in users
                     if quotas[u.id]["remaining"] >= minimum
                     and (maximum is None or quotas[u.id]["remaining"] <= maximum)]
    users = users[:100]

    counts: dict[int, int] = {}
    recent_counts: dict[int, int] = {}
    if users:
        user_ids = [u.id for u in users]
        rows = (
            db.query(models.UserLessonProgress.user_id, func.count(models.UserLessonProgress.id))
            .filter(models.UserLessonProgress.user_id.in_(user_ids))
            .group_by(models.UserLessonProgress.user_id)
            .all()
        )
        counts = dict(rows)
        recent_rows = (
            db.query(models.UserLessonProgress.user_id, func.count(models.UserLessonProgress.id))
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


def delete_user(user_id: int, request: Request, db: Session):
    admin = require_admin(request, db)

    if admin.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Нельзя удалить собственный аккаунт",
        )

    user_db = db.query(models.User).filter(models.User.id == user_id).first()
    if user_db is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Слоты создавал админ, поэтому их не удаляем, а освобождаем — после
    # удаления студента занятие снова доступно для записи.
    db.query(models.BookingSlot).filter(models.BookingSlot.student_id == user_id).update(
        {models.BookingSlot.student_id: None}, synchronize_session=False
    )

    # Остальное принадлежит только этому пользователю и уходит вместе с ним.
    for related in (
        models.Session,
        models.UserActivityDay,
        models.UserLessonProgress,
        models.UserTaskProgress,
        models.BookingQuota,
    ):
        db.query(related).filter(related.user_id == user_id).delete(synchronize_session=False)

    db.delete(user_db)
    db.commit()

    return {"deleted": user_id}


def change_subscription(user_id: int, payload: SubscriptionChange, request: Request, db: Session):
    require_admin(request, db)

    user_db = db.query(models.User).filter(models.User.id == user_id).first()
    if user_db is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if payload.days is None:
        user_db.subscription_until = None
        user_db.subscription_plan = None
    else:
        now = datetime.now(timezone.utc)
        current = accounts._normalize_datetime(user_db.subscription_until)
        base = current if current is not None and current > now else now
        user_db.subscription_until = base + timedelta(days=payload.days)
        user_db.subscription_plan = user_db.subscription_plan or "pro"

    db.commit()
    db.refresh(user_db)

    return {"user": _serialize_account(user_db, completed_lessons=0)}


def admin_list_slots(request: Request, year: int, month: int, include_past: bool, db: Session):
    require_admin(request, db)
    return {"slots": bookings.list_slots_for_month_admin(year=year, month=month, db=db, include_past=include_past)}


def admin_create_slot(payload: SlotCreate, request: Request, db: Session):
    require_admin(request, db)
    slot = bookings.create_slot(
        slot_date=payload.slot_date,
        start_time=payload.start_time,
        duration_minutes=payload.duration_minutes,
        db=db,
    )
    return {"slot": bookings.serialize_slot_admin(slot, student=None)}


def admin_delete_slot(slot_id: int, request: Request, db: Session):
    require_admin(request, db)
    bookings.delete_slot(slot_id=slot_id, db=db)
    return {"deleted": slot_id}


def _build_student_profile(user: models.User, year: int, month: int, db: Session) -> dict:
    start_date, end_date = bookings._month_bounds(year, month)
    bookings = (
        db.query(models.BookingSlot)
        .filter(
            models.BookingSlot.student_id == user.id,
            models.BookingSlot.slot_date >= start_date,
            models.BookingSlot.slot_date <= end_date,
        )
        .order_by(models.BookingSlot.slot_date.asc(), models.BookingSlot.start_time.asc())
        .all()
    )
    activity_records = activity.get_activity_records(user_id=user.id, year=year, month=month, db=db)
    learning_progress, completed_lessons = _build_learning_progress(user.id, db)

    data = _serialize_account(user, completed_lessons=completed_lessons)
    data["quota"] = bookings.get_quota_status(user_id=user.id, year=year, month=month, db=db)
    data["activity_days_count"] = len(activity_records)
    data["activity_days"] = [record.activity_date.isoformat() for record in activity_records]
    data["learning_progress"] = learning_progress
    data["bookings"] = [
        {
            "id": slot.id,
            "date": slot.slot_date.isoformat(),
            "start_time": slot.start_time,
            "duration_minutes": slot.duration_minutes,
        }
        for slot in bookings
    ]
    return data


def student_profile(user_id: int, request: Request, year: int, month: int, db: Session):
    require_admin(request, db)
    user_db = db.query(models.User).filter(models.User.id == user_id).first()
    if user_db is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return {"profile": _build_student_profile(user_db, year, month, db)}


def change_quota(user_id: int, payload: QuotaChange, request: Request, db: Session):
    require_admin(request, db)
    user_db = db.query(models.User).filter(models.User.id == user_id).first()
    if user_db is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    bookings.add_quota(user_id=user_id, year=payload.year, month=payload.month, amount=payload.add, db=db)
    return {"profile": _build_student_profile(user_db, payload.year, payload.month, db)}
