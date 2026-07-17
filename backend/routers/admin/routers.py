from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from DataBase import model as models
from routers.user import crud as user_crud
from routers.user.schemas import SlotCreate
from .schemas import QuotaChange, SubscriptionChange


admin_router = APIRouter()


def get_db():
    db = user_crud.get_db()
    try:
        yield db
    finally:
        db.close()


async def require_admin(request: Request, db: Session) -> models.User:
    """Доступ только для залогиненного пользователя с флагом is_admin."""
    user = await user_crud.get_current_user(request=request, db=db)
    if not user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Требуются права администратора")
    return user


def _serialize_account(user: models.User, completed_lessons: int) -> dict:
    data = user_crud._serialize_user(user)
    data["completed_lessons"] = completed_lessons
    return data


@admin_router.get("/users")
async def list_users(
    request: Request,
    search: str = Query(default="", max_length=100),
    db: Session = Depends(get_db),
):
    await require_admin(request, db)

    # Фильтруем в Python: LOWER() в SQLite не понижает кириллицу, поэтому
    # ilike по русским именам не находит ничего. На наших объёмах это дёшево.
    users = db.query(models.User).order_by(models.User.id.asc()).all()
    term = search.strip().lower()
    if term:
        users = [u for u in users if term in u.username.lower() or term in u.email.lower()]
    users = users[:100]

    counts: dict[int, int] = {}
    if users:
        rows = (
            db.query(models.UserLessonProgress.user_id, func.count(models.UserLessonProgress.id))
            .filter(models.UserLessonProgress.user_id.in_([u.id for u in users]))
            .group_by(models.UserLessonProgress.user_id)
            .all()
        )
        counts = dict(rows)

    return {"users": [_serialize_account(u, counts.get(u.id, 0)) for u in users]}


@admin_router.delete("/users/{user_id}")
async def delete_user(user_id: int, request: Request, db: Session = Depends(get_db)):
    admin = await require_admin(request, db)

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
    for related in (models.Session, models.UserActivityDay, models.UserLessonProgress, models.BookingQuota):
        db.query(related).filter(related.user_id == user_id).delete(synchronize_session=False)

    db.delete(user_db)
    db.commit()

    return {"deleted": user_id}


@admin_router.patch("/users/{user_id}/subscription")
async def change_subscription(
    user_id: int,
    payload: SubscriptionChange,
    request: Request,
    db: Session = Depends(get_db),
):
    await require_admin(request, db)

    user_db = db.query(models.User).filter(models.User.id == user_id).first()
    if user_db is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if payload.days is None:
        user_db.subscription_until = None
    else:
        now = datetime.now(timezone.utc)
        current = user_crud._normalize_datetime(user_db.subscription_until)
        base = current if current is not None and current > now else now
        user_db.subscription_until = base + timedelta(days=payload.days)

    db.commit()
    db.refresh(user_db)

    return {"user": _serialize_account(user_db, completed_lessons=0)}


# ==================== Слоты записи ====================


@admin_router.get("/slots")
async def admin_list_slots(
    request: Request,
    year: int = Query(..., ge=2000, le=2100),
    month: int = Query(..., ge=1, le=12),
    db: Session = Depends(get_db),
):
    await require_admin(request, db)
    return {"slots": user_crud.list_slots_for_month_admin(year=year, month=month, db=db)}


@admin_router.post("/slots")
async def admin_create_slot(payload: SlotCreate, request: Request, db: Session = Depends(get_db)):
    await require_admin(request, db)
    slot = user_crud.create_slot(
        slot_date=payload.slot_date,
        start_time=payload.start_time,
        duration_minutes=payload.duration_minutes,
        db=db,
    )
    return {"slot": user_crud.serialize_slot_admin(slot, student=None)}


@admin_router.delete("/slots/{slot_id}")
async def admin_delete_slot(slot_id: int, request: Request, db: Session = Depends(get_db)):
    await require_admin(request, db)
    user_crud.delete_slot(slot_id=slot_id, db=db)
    return {"deleted": slot_id}


# ==================== Профиль студента + квота ====================


def _build_student_profile(user: models.User, year: int, month: int, db: Session) -> dict:
    from routers.user import crud as uc

    start_date, end_date = uc._month_bounds(year, month)
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
    activity_days = uc.get_activity_days(user_id=user.id, year=year, month=month, db=db)

    data = _serialize_account(user, completed_lessons=0)
    data["quota"] = uc.get_quota_status(user_id=user.id, year=year, month=month, db=db)
    data["activity_days_count"] = len(activity_days)
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


@admin_router.get("/users/{user_id}/profile")
async def student_profile(
    user_id: int,
    request: Request,
    year: int = Query(..., ge=2000, le=2100),
    month: int = Query(..., ge=1, le=12),
    db: Session = Depends(get_db),
):
    await require_admin(request, db)
    user_db = db.query(models.User).filter(models.User.id == user_id).first()
    if user_db is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return {"profile": _build_student_profile(user_db, year, month, db)}


@admin_router.post("/users/{user_id}/quota")
async def change_quota(
    user_id: int,
    payload: QuotaChange,
    request: Request,
    db: Session = Depends(get_db),
):
    await require_admin(request, db)
    user_db = db.query(models.User).filter(models.User.id == user_id).first()
    if user_db is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user_crud.add_quota(user_id=user_id, year=payload.year, month=payload.month, amount=payload.add, db=db)
    return {"profile": _build_student_profile(user_db, payload.year, payload.month, db)}
