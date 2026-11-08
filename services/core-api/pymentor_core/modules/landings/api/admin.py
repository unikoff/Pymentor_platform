"""Admin-only API for landing configuration and connection-test events."""

from uuid import UUID

from fastapi import APIRouter
from fastapi import Depends
from fastapi import Header
from fastapi import HTTPException
from fastapi import Request
from fastapi import Response
from fastapi import status
from sqlalchemy.orm import Session

from pymentor_core.app.dependencies import get_db
from pymentor_core.modules.notifications.contracts import TelegramDeliveryError
from pymentor_core.modules.notifications.service import verify_telegram_destination
from pymentor_core.modules.administration.public import require_admin
from pymentor_core.modules.landings.views import _landing_view
from pymentor_core.modules.landings.views import _config_view
from pymentor_core.modules.landings.views import _event_view
from pymentor_core.modules.landings.contracts import LandingError
from pymentor_core.shared.bindings import get_bindings
from pymentor_core.modules.landings.api import service
from pymentor_core.modules.landings.api.schemas import LandingCreate
from pymentor_core.modules.landings.api.schemas import LandingPatch
from pymentor_core.modules.landings.api.schemas import LandingTestEvent
from pymentor_core.modules.landings.api.schemas import TelegramConfigInput

router = APIRouter()


def _request_call(name, *args, **kwargs):
    try:
        return getattr(get_bindings().landing_requests, name)(*args, **kwargs)
    except LandingError as exc:
        raise HTTPException(
            status_code=exc.status_code, detail=exc.detail, headers=exc.headers
        ) from exc


@router.get("")
def list_landings(request: Request, db: Session = Depends(get_db)):
    require_admin(request, db)
    return [_landing_view(landing) for landing in _request_call("list_landings", db)]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_landing(
    payload: LandingCreate, request: Request, db: Session = Depends(get_db)
):
    require_admin(request, db)
    landing = service.create_landing(
        db,
        slug=payload.slug,
        title=payload.title.strip(),
        description=payload.description.strip(),
        is_active=payload.is_active,
    )
    return _landing_view(landing)


@router.patch("/{landing_id}")
def update_landing(
    landing_id: str,
    payload: LandingPatch,
    request: Request,
    db: Session = Depends(get_db),
):
    require_admin(request, db)
    return _landing_view(
        _request_call(
            "update_landing", db, landing_id, payload.model_dump(exclude_unset=True)
        )
    )


@router.get("/{landing_id}/telegram")
def get_telegram_config(
    landing_id: str, request: Request, db: Session = Depends(get_db)
):
    require_admin(request, db)
    landing = _request_call("get_landing", db, landing_id)
    return _config_view(landing, service.current_landing_telegram_config(db, landing))


@router.put("/{landing_id}/telegram")
def replace_telegram_config(
    landing_id: str,
    payload: TelegramConfigInput,
    request: Request,
    db: Session = Depends(get_db),
):
    require_admin(request, db)
    token = _request_call("prepare_telegram", db, landing_id, payload.secret_ref)
    try:
        bot_username = verify_telegram_destination(token, payload.chat_id)
    except TelegramDeliveryError as exc:
        code = 503 if exc.retryable else 422
        detail = (
            "Не удалось проверить Telegram сейчас"
            if exc.retryable
            else "Не удалось проверить бота или чат Telegram"
        )
        raise HTTPException(status_code=code, detail=detail) from None
    landing, config = _request_call(
        "finish_telegram",
        db,
        landing_id,
        payload.secret_ref,
        payload.chat_id,
        bot_username,
    )
    return _config_view(landing, config)


@router.delete("/{landing_id}/telegram")
def disable_telegram_config(
    landing_id: str, request: Request, db: Session = Depends(get_db)
):
    require_admin(request, db)
    landing = service.disable_landing_telegram(db, landing_id)
    return _config_view(landing, service.current_landing_telegram_config(db, landing))


@router.post("/{landing_id}/events", status_code=status.HTTP_202_ACCEPTED)
def enqueue_landing_test_event(
    landing_id: str,
    payload: LandingTestEvent,
    request: Request,
    response: Response,
    idempotency_key: str = Header(
        ..., alias="Idempotency-Key", min_length=36, max_length=36
    ),
    db: Session = Depends(get_db),
):
    require_admin(request, db)
    try:
        event_id = str(UUID(idempotency_key))
    except ValueError:
        raise HTTPException(
            status_code=422, detail="Idempotency-Key должен быть UUID"
        ) from None
    event, duplicate = service.enqueue_landing_event(
        db,
        landing_id=landing_id,
        event_id=event_id,
        event_type=payload.event_type,
        payload=payload.payload,
    )
    if duplicate:
        response.status_code = status.HTTP_200_OK
    return {**_event_view(event), "duplicate": duplicate}


@router.get("/{landing_id}/events/{event_id}")
def get_landing_event(
    landing_id: str, event_id: str, request: Request, db: Session = Depends(get_db)
):
    require_admin(request, db)
    event = service.landing_event_status(db, landing_id, event_id)
    return _event_view(event)


@router.post("/{landing_id}/events/{event_id}/retry")
def retry_landing_event(
    landing_id: str, event_id: str, request: Request, db: Session = Depends(get_db)
):
    require_admin(request, db)
    event = service.retry_landing_event(db, landing_id, event_id)
    return _event_view(event)
