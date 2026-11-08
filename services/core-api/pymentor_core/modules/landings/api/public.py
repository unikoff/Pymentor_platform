"""Public, allowlisted event endpoints used by landing-page forms."""

from datetime import datetime
from datetime import timezone
from uuid import UUID

from fastapi import APIRouter
from fastapi import Depends
from fastapi import Header
from fastapi import HTTPException
from fastapi import Response
from fastapi import status
from sqlalchemy.orm import Session

from pymentor_core.app.dependencies import get_db
from pymentor_core.shared.bindings import get_bindings
from pymentor_core.modules.landings.contracts import LandingError
from pymentor_core.modules.landings.api.schemas import LandingConsultationRequest

router = APIRouter()


@router.post("/{slug}/consultations", status_code=status.HTTP_202_ACCEPTED)
def submit_consultation_request(
    slug: str,
    payload: LandingConsultationRequest,
    response: Response,
    idempotency_key: str = Header(
        ..., alias="Idempotency-Key", min_length=36, max_length=36
    ),
    db: Session = Depends(get_db),
):
    try:
        event_id = str(UUID(idempotency_key))
    except ValueError:
        raise HTTPException(
            status_code=422, detail="Idempotency-Key должен быть UUID"
        ) from None

    event_payload = payload.model_dump(exclude={"consent", "consent_version"})
    event_payload["consented_at"] = datetime.now(timezone.utc).isoformat()
    event_payload["consent_version"] = payload.consent_version
    try:
        event, duplicate = get_bindings().landing_requests.submit_consultation(
            db, slug, event_id, event_payload
        )
    except LandingError as exc:
        raise HTTPException(
            status_code=exc.status_code, detail=exc.detail, headers=exc.headers
        ) from exc
    if duplicate:
        response.status_code = status.HTTP_200_OK
    return {"accepted": True, "duplicate": duplicate, "event_id": event.event_id}
