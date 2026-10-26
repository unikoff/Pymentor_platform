from typing import Literal
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session
from core.dependencies import get_db
from routers.bookings.schemas import SlotCreate
from .schemas import QuotaChange, SubscriptionChange
from . import service

admin_router = APIRouter()


@admin_router.get("/overview")
def admin_overview(request: Request, db: Session = Depends(get_db)):
    'Краткая сводка по активности учеников, подпискам и загрузке расписания.'
    return service.admin_overview(request=request, db=db)


@admin_router.get("/users")
def list_users(
    request: Request,
    search: str = Query(default="", max_length=100),
    subscription: Literal["all", "active", "inactive"] = Query(default="all"),
    lessons: Literal["all", "none", "low", "many"] = Query(default="all"),
    year: int | None = Query(default=None, ge=2000, le=2100),
    month: int | None = Query(default=None, ge=1, le=12),
    db: Session = Depends(get_db),
):
    return service.list_users(request=request, search=search, subscription=subscription, lessons=lessons, year=year, month=month, db=db)


@admin_router.delete("/users/{user_id}")
def delete_user(user_id: int, request: Request, db: Session = Depends(get_db)):
    return service.delete_user(user_id=user_id, request=request, db=db)


@admin_router.patch("/users/{user_id}/subscription")
def change_subscription(
    user_id: int,
    payload: SubscriptionChange,
    request: Request,
    db: Session = Depends(get_db),
):
    return service.change_subscription(user_id=user_id, payload=payload, request=request, db=db)


@admin_router.get("/slots")
def admin_list_slots(
    request: Request,
    year: int = Query(..., ge=2000, le=2100),
    month: int = Query(..., ge=1, le=12),
    include_past: bool = Query(default=False),
    db: Session = Depends(get_db),
):
    return service.admin_list_slots(request=request, year=year, month=month, include_past=include_past, db=db)


@admin_router.post("/slots")
def admin_create_slot(payload: SlotCreate, request: Request, db: Session = Depends(get_db)):
    return service.admin_create_slot(payload=payload, request=request, db=db)


@admin_router.delete("/slots/{slot_id}")
def admin_delete_slot(slot_id: int, request: Request, db: Session = Depends(get_db)):
    return service.admin_delete_slot(slot_id=slot_id, request=request, db=db)


@admin_router.get("/users/{user_id}/profile")
def student_profile(
    user_id: int,
    request: Request,
    year: int = Query(..., ge=2000, le=2100),
    month: int = Query(..., ge=1, le=12),
    db: Session = Depends(get_db),
):
    return service.student_profile(user_id=user_id, request=request, year=year, month=month, db=db)


@admin_router.post("/users/{user_id}/quota")
def change_quota(
    user_id: int,
    payload: QuotaChange,
    request: Request,
    db: Session = Depends(get_db),
):
    return service.change_quota(user_id=user_id, payload=payload, request=request, db=db)
