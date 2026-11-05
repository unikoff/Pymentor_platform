from fastapi import APIRouter, Depends, Query, Request, Response
from sqlalchemy.orm import Session
from core.dependencies import get_db, get_request_context
from core.composition import RequestContext
from .schemas import StudentSlotEnvelope, StudentSlotsResponse
from core.api_contracts import api_contract_responses
import logging
from time import perf_counter
from routers.accounts import service as accounts
from . import service

booking_router = APIRouter()
logger = logging.getLogger("pymentor.booking")
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(name)s %(message)s"))
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)
    logger.propagate = False



@booking_router.get(
    "/slots",
    responses=api_contract_responses(StudentSlotsResponse, 401),
)
def get_bookable_slots(
    request: Request,
    year: int = Query(..., ge=2000, le=2100),
    month: int = Query(..., ge=1, le=12),
    db: Session = Depends(get_db),
    context: RequestContext = Depends(get_request_context),
):
    user_db = accounts.get_current_principal(request=request, db=db)
    slots = service.list_bookable_slots(
        year=year,
        month=month,
        user_id=user_db.id,
        db=db,
        clock=context.clock,
    )
    quota = service.get_quota_status(
        user_id=user_db.id, year=year, month=month, db=db, uow=context.uow
    )
    return {"slots": slots, "quota": quota}


@booking_router.post(
    "/slots/{slot_id}/book",
    responses=api_contract_responses(StudentSlotEnvelope, 400, 401, 403, 404, 409),
)
def book_slot(
    slot_id: int,
    request: Request,
    db: Session = Depends(get_db),
):
    started = perf_counter()
    user_db = accounts.get_current_principal(request=request, db=db)
    slot = service.book_slot(
        slot_id=slot_id,
        user_id=user_db.id,
        db=db,
        notification_username=user_db.username,
        notification_email=user_db.email,
    )
    logger.info("booking_saved slot_id=%s duration_ms=%.1f", slot.id, (perf_counter() - started) * 1000)
    return {"slot": service.serialize_slot_student(slot, user_db.id)}


@booking_router.post(
    "/slots/{slot_id}/cancel",
    responses=api_contract_responses(StudentSlotEnvelope, 401, 403, 404, 409),
)
def cancel_slot(
    slot_id: int,
    request: Request,
    db: Session = Depends(get_db),
):
    started = perf_counter()
    user_db = accounts.get_current_principal(request=request, db=db)
    slot = service.cancel_booking(
        slot_id=slot_id,
        user_id=user_db.id,
        db=db,
        notification_username=user_db.username,
        notification_email=user_db.email,
    )
    logger.info("booking_cancelled slot_id=%s duration_ms=%.1f", slot.id, (perf_counter() - started) * 1000)
    return {"slot": service.serialize_slot_student(slot, user_db.id)}
