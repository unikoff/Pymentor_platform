from fastapi import APIRouter, Depends, Header, Query, Request, Response
from sqlalchemy.orm import Session
from core.dependencies import get_db, get_request_context
from core.composition import RequestContext
from core.api_contracts import api_contract_responses
from . import service, activity
from .schemas import (
    ActivityCalendarResponse,
    ActivitySummaryResponse,
    ActivityVisit,
    ActivityVisitResponse,
    AuthResponse,
    CurrentUserResponse,
    LogoutResponse,
    UserCreate,
    UserLogin,
)

user_router = APIRouter()


@user_router.post("/register", responses=api_contract_responses(AuthResponse, 400))
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    user_db = service.register_user(user=user, db=db)
    return {"message": "Registration successful", "user": service._serialize_user(user_db)}


@user_router.get("/login-capabilities")
def login_capabilities(request: Request):
    # The experimental async service exists only in the isolated local mode.
    from identity.sessions import _local_async_identity
    identity = _local_async_identity(request)
    return {"idempotent_login": bool(identity and getattr(identity, "supports_login_retry", False))}


@user_router.post("/login", responses=api_contract_responses(AuthResponse, 400, 401, 409, 503))
def login_user(user: UserLogin, response: Response, request: Request,
               operation_id: str | None = Header(default=None, alias="Idempotency-Key"),
               db: Session = Depends(get_db)):
    user_db = service.login_user(response=response, user=user, db=db, request=request)
    return {"message": "Login successful", "user": service._serialize_user(user_db)}


@user_router.get("/me", responses=api_contract_responses(CurrentUserResponse, 401))
def me(
    request: Request,
    db: Session = Depends(get_db),
    context: RequestContext = Depends(get_request_context),
):
    user_db = service.get_current_user(request=request, db=db, uow=context.uow)
    return {"user": service._serialize_user(user_db)}


@user_router.post(
    "/activity/visit",
    responses=api_contract_responses(ActivityVisitResponse, 401),
)
def record_activity_visit(
    payload: ActivityVisit,
    request: Request,
    db: Session = Depends(get_db),
    context: RequestContext = Depends(get_request_context),
):
    user_db = service.get_current_user(request=request, db=db)
    visited_at = context.clock.now()
    activity_date = payload.activity_date or visited_at.astimezone(activity.MOSCOW_TZ).date()
    activity_day = activity.record_activity_day(
        user_id=user_db.id,
        activity_date=activity_date,
        db=db,
        visited_at=visited_at,
        uow=context.uow,
        clock=context.clock,
    )
    return {
        "activity_date": activity_day.activity_date.isoformat(),
        "visited_at": activity.serialize_activity_timestamp(activity_day.visited_at),
    }


@user_router.get(
    "/activity",
    responses=api_contract_responses(ActivityCalendarResponse, 401),
)
def get_activity_calendar(
    request: Request,
    year: int = Query(..., ge=2000, le=2100),
    month: int = Query(..., ge=1, le=12),
    db: Session = Depends(get_db),
):
    user_db = service.get_current_user(request=request, db=db)
    records = activity.get_activity_records(user_id=user_db.id, year=year, month=month, db=db)
    return {
        "days": [record.activity_date.isoformat() for record in records],
        "visits": [
            {
                "activity_date": record.activity_date.isoformat(),
                "visited_at": activity.serialize_activity_timestamp(record.visited_at),
            }
            for record in records
        ],
    }


@user_router.get(
    "/activity/summary",
    responses=api_contract_responses(ActivitySummaryResponse, 401),
)
def get_activity_summary(
    request: Request,
    db: Session = Depends(get_db),
    context: RequestContext = Depends(get_request_context),
):
    user_db = service.get_current_user(request=request, db=db)
    return activity.get_activity_summary(user_id=user_db.id, db=db, clock=context.clock)


@user_router.post("/logout", responses=api_contract_responses(LogoutResponse, 401))
def logout_user(request: Request, response: Response, db: Session = Depends(get_db)):
    service.logout_user(request=request, response=response, db=db)
    return {"message": "Logout successful"}
