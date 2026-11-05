"""Public, allowlisted event endpoints used by landing-page forms."""

from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException, Response, status
from sqlalchemy.orm import Session

from core.dependencies import get_db
from db import models
from . import service
from .schemas import LandingConsultationRequest

router = APIRouter()


@router.post("/{slug}/consultations", status_code=status.HTTP_202_ACCEPTED)
def submit_consultation_request(
    slug: str,
    payload: LandingConsultationRequest,
    response: Response,
    idempotency_key: str = Header(..., alias="Idempotency-Key", min_length=36, max_length=36),
    db: Session = Depends(get_db),
):
    try:
        event_id = str(UUID(idempotency_key))
    except ValueError:
        raise HTTPException(status_code=422, detail="Idempotency-Key должен быть UUID") from None

    landing = db.query(models.Landing).filter_by(slug=slug, is_active=True).first()
    if landing is None:
        raise HTTPException(status_code=404, detail="Активный лендинг не найден")

    config = service.current_landing_telegram_config(db, landing)
    if landing.telegram_enabled and config is not None and config.status == "verified":
        service.resolve_landing_bot_token(config.secret_ref)

    event_payload = payload.model_dump(exclude={"consent", "consent_version"})
    event_payload["consented_at"] = datetime.now(timezone.utc).isoformat()
    event_payload["consent_version"] = payload.consent_version
    event, duplicate = service.enqueue_landing_event(
        db,
        landing_id=landing.id,
        event_id=event_id,
        event_type="consultation_request.v1",
        payload=event_payload,
    )
    if duplicate:
        response.status_code = status.HTTP_200_OK
    return {"accepted": True, "duplicate": duplicate, "event_id": event.event_id}
