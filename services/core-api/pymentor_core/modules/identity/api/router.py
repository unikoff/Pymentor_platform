import logging

from fastapi import APIRouter
from fastapi import BackgroundTasks
from fastapi import Depends
from fastapi import Header
from fastapi import Query
from fastapi import Request
from fastapi import Response
from sqlalchemy.orm import Session
from pymentor_core.app.dependencies import get_db
from pymentor_core.app.dependencies import get_request_context
from pymentor_core.app.context import RequestContext
from pymentor_core.shared.api_contracts import api_contract_responses
from pymentor_core.modules.identity.api import accounts as service
from pymentor_core.modules.identity import activity
from pymentor_core.modules.identity.api.schemas import ActivityCalendarResponse
from pymentor_core.modules.identity.api.schemas import ActivitySummaryResponse
from pymentor_core.modules.identity.api.schemas import ActivityVisit
from pymentor_core.modules.identity.api.schemas import ActivityVisitResponse
from pymentor_core.modules.identity.api.schemas import AuthResponse
from pymentor_core.modules.identity.api.schemas import CurrentUserResponse
from pymentor_core.modules.identity.api.schemas import LogoutResponse
from pymentor_core.modules.identity.api.schemas import UserCreate
from pymentor_core.modules.identity.api.schemas import UserLogin
from pymentor_core.shared.bindings import get_bindings

user_router = APIRouter()
logger = logging.getLogger(__name__)


def _send_registration_verification(user_id: int, email: str, password_hash: str):
    try:
        get_bindings().email_auth.send_registration_verification(user_id, email, password_hash)
    except Exception as exc:
        logger.warning("Registration verification email failed: %s", type(exc).__name__)


@user_router.post("/register", responses=api_contract_responses(AuthResponse, 400))
def register_user(user: UserCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    user_db = service.register_user(user=user, db=db)
    response = {
        "message": "Registration successful",
        "user": service._serialize_user(user_db),
    }
    background_tasks.add_task(_send_registration_verification, user_db.id, user_db.email, user_db.password)
    return response


@user_router.get("/login-capabilities")
def login_capabilities(request: Request):
    # The single runtime always uses credentialed, recoverable login operations.
    from pymentor_core.modules.identity.api.sessions import require_identity

    identity = require_identity(request)
    return {
        "idempotent_login": bool(
            identity and getattr(identity, "supports_login_retry", False)
        )
    }


@user_router.post(
    "/login", responses=api_contract_responses(AuthResponse, 400, 401, 409, 503)
)
def login_user(
    user: UserLogin,
    response: Response,
    request: Request,
    operation_id: str | None = Header(default=None, alias="Idempotency-Key"),
    db: Session = Depends(get_db),
):
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
    activity_date = (
        payload.activity_date or visited_at.astimezone(activity.MOSCOW_TZ).date()
    )
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
    records = activity.get_activity_records(
        user_id=user_db.id, year=year, month=month, db=db
    )
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


from pymentor_core.modules.identity.api.email_actions import router as email_actions_router

user_router.include_router(email_actions_router)
