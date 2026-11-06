from typing import Literal
from fastapi import APIRouter, Depends, Header, Query, Request
from sqlalchemy.orm import Session
from core.composition import RequestContext
from core.dependencies import get_db, get_request_context
from core.api_contracts import api_contract_responses
from routers.bookings.schemas import SlotCreate
from .schemas import (
    AdminAccountsResponse,
    AdminOverviewResponse,
    AdminSlotEnvelope,
    AdminSlotsResponse,
    AdminUserEnvelope,
    DeletedIdResponse,
    QuotaChange,
    StudentProfileEnvelope,
    SubscriptionChange,
)
from . import service
from routers.landings.admin import router as landing_admin_router

admin_router = APIRouter()
admin_router.include_router(landing_admin_router, prefix="/landings", tags=["landing-admin"])


@admin_router.get("/overview", responses=api_contract_responses(AdminOverviewResponse, 401, 403))
def admin_overview(request: Request, db: Session = Depends(get_db)):
    'Краткая сводка по активности учеников, подпискам и загрузке расписания.'
    return service.admin_overview(request=request, db=db)


@admin_router.get("/users", responses=api_contract_responses(AdminAccountsResponse, 401, 403))
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


@admin_router.delete(
    "/users/{user_id}",
    responses=api_contract_responses(DeletedIdResponse, 400, 401, 403, 404, 409),
)
def delete_user(user_id: int, request: Request,
                expected_account_ref: str | None = Header(default=None, alias="X-Account-Ref"),
                db: Session = Depends(get_db)):
    return service.delete_user(user_id=user_id, request=request, db=db, expected_account_ref=expected_account_ref)


@admin_router.patch(
    "/users/{user_id}/subscription",
    responses=api_contract_responses(AdminUserEnvelope, 401, 403, 404),
)
def change_subscription(
    user_id: int,
    payload: SubscriptionChange,
    request: Request,
    db: Session = Depends(get_db),
    context: RequestContext = Depends(get_request_context),
):
    return service.change_subscription(user_id=user_id, payload=payload, request=request, db=db, uow=context.uow)


@admin_router.get("/slots", responses=api_contract_responses(AdminSlotsResponse, 401, 403))
def admin_list_slots(
    request: Request,
    year: int = Query(..., ge=2000, le=2100),
    month: int = Query(..., ge=1, le=12),
    include_past: bool = Query(default=False),
    db: Session = Depends(get_db),
):
    return service.admin_list_slots(request=request, year=year, month=month, include_past=include_past, db=db)


@admin_router.post(
    "/slots",
    responses=api_contract_responses(AdminSlotEnvelope, 400, 401, 403, 409),
)
def admin_create_slot(payload: SlotCreate, request: Request, db: Session = Depends(get_db)):
    return service.admin_create_slot(payload=payload, request=request, db=db)


@admin_router.delete(
    "/slots/{slot_id}",
    responses=api_contract_responses(DeletedIdResponse, 401, 403, 404),
)
def admin_delete_slot(slot_id: int, request: Request, db: Session = Depends(get_db)):
    return service.admin_delete_slot(slot_id=slot_id, request=request, db=db)


@admin_router.get(
    "/users/{user_id}/profile",
    responses=api_contract_responses(StudentProfileEnvelope, 401, 403, 404),
)
def student_profile(
    user_id: int,
    request: Request,
    year: int = Query(..., ge=2000, le=2100),
    month: int = Query(..., ge=1, le=12),
    db: Session = Depends(get_db),
):
    return service.student_profile(user_id=user_id, request=request, year=year, month=month, db=db)


@admin_router.post(
    "/users/{user_id}/quota",
    responses=api_contract_responses(StudentProfileEnvelope, 401, 403, 404),
)
def change_quota(
    user_id: int,
    payload: QuotaChange,
    request: Request,
    db: Session = Depends(get_db),
):
    return service.change_quota(user_id=user_id, payload=payload, request=request, db=db)
