"""Admin-only API for landing configuration and connection-test events."""

from datetime import timezone
from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from core.dependencies import get_db
from db import models
from notifications.telegram import TelegramDeliveryError, verify_telegram_destination
from routers.admin.service import require_admin
from . import service
from .schemas import LandingCreate, LandingPatch, LandingTestEvent, TelegramConfigInput

router = APIRouter()


def _landing_view(landing: models.Landing) -> dict[str, object]:
    return {
        "id": landing.id,
        "slug": landing.slug,
        "title": landing.title,
        "description": landing.description,
        "version": landing.version,
        "is_active": landing.is_active,
        "telegram_enabled": landing.telegram_enabled,
        "telegram_config_version": landing.config_version,
    }


def _config_view(
    landing: models.Landing,
    config: models.LandingTelegramConfig | None,
) -> dict[str, object]:
    if config is None:
        return {
            "enabled": False,
            "status": "not_configured",
            "version": 0,
            "chat_id": None,
            "bot_username": None,
            "verified_at": None,
        }
    verified_at = config.verified_at
    if verified_at.tzinfo is None:
        verified_at = verified_at.replace(tzinfo=timezone.utc)
    else:
        verified_at = verified_at.astimezone(timezone.utc)
    return {
        "enabled": landing.telegram_enabled,
        "status": config.status,
        "version": config.version,
        "chat_id": config.chat_id,
        "bot_username": config.bot_username or None,
        "verified_at": verified_at.isoformat(),
    }


def _event_view(event: models.LandingNotificationOutbox) -> dict[str, object]:
    next_attempt = event.next_attempt_at
    if next_attempt.tzinfo is None:
        next_attempt = next_attempt.replace(tzinfo=timezone.utc)
    sent_at = event.sent_at
    if sent_at is not None and sent_at.tzinfo is None:
        sent_at = sent_at.replace(tzinfo=timezone.utc)
    return {
        "landing_id": event.landing_id,
        "event_id": event.event_id,
        "event_type": event.event_type,
        "schema_version": event.schema_version,
        "status": event.status,
        "attempts": event.attempts,
        "manual_retry_count": event.manual_retry_count,
        "next_attempt_at": next_attempt.isoformat(),
        "sent_at": sent_at.isoformat() if sent_at else None,
        "error": event.last_error,
    }


@router.get("")
def list_landings(request: Request, db: Session = Depends(get_db)):
    require_admin(request, db)
    landings = db.query(models.Landing).order_by(models.Landing.slug).all()
    return [_landing_view(landing) for landing in landings]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_landing(payload: LandingCreate, request: Request, db: Session = Depends(get_db)):
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
    landing = db.get(models.Landing, landing_id)
    if landing is None:
        raise HTTPException(status_code=404, detail="Лендинг не найден")
    changes = payload.model_dump(exclude_unset=True)
    if not changes:
        raise HTTPException(status_code=422, detail="Не указаны поля для изменения")
    content_changed = False
    for field in ("title", "description"):
        if field in changes and changes[field] is not None:
            value = changes[field].strip()
            if getattr(landing, field) != value:
                setattr(landing, field, value)
                content_changed = True
    if "is_active" in changes and changes["is_active"] is not None:
        landing.is_active = changes["is_active"]
    if content_changed:
        landing.version += 1
    db.commit()
    db.refresh(landing)
    return _landing_view(landing)


@router.get("/{landing_id}/telegram")
def get_telegram_config(landing_id: str, request: Request, db: Session = Depends(get_db)):
    require_admin(request, db)
    landing = db.get(models.Landing, landing_id)
    if landing is None:
        raise HTTPException(status_code=404, detail="Лендинг не найден")
    config = service.current_landing_telegram_config(db, landing)
    return _config_view(landing, config)


@router.put("/{landing_id}/telegram")
def replace_telegram_config(
    landing_id: str,
    payload: TelegramConfigInput,
    request: Request,
    db: Session = Depends(get_db),
):
    require_admin(request, db)
    landing = db.get(models.Landing, landing_id)
    if landing is None:
        raise HTTPException(status_code=404, detail="Лендинг не найден")
    token = service.resolve_landing_bot_token(payload.secret_ref)
    try:
        bot_username = verify_telegram_destination(token, payload.chat_id)
    except TelegramDeliveryError as exc:
        code = 503 if exc.retryable else 422
        detail = "Не удалось проверить Telegram сейчас" if exc.retryable else "Не удалось проверить бота или чат Telegram"
        raise HTTPException(status_code=code, detail=detail) from None
    config = service.configure_landing_telegram(
        db,
        landing_id,
        secret_ref=payload.secret_ref,
        chat_id=payload.chat_id,
        bot_username=bot_username,
    )
    db.refresh(landing)
    return _config_view(landing, config)


@router.delete("/{landing_id}/telegram")
def disable_telegram_config(landing_id: str, request: Request, db: Session = Depends(get_db)):
    require_admin(request, db)
    landing = service.disable_landing_telegram(db, landing_id)
    return _config_view(landing, service.current_landing_telegram_config(db, landing))


@router.post("/{landing_id}/events", status_code=status.HTTP_202_ACCEPTED)
def enqueue_landing_test_event(
    landing_id: str,
    payload: LandingTestEvent,
    request: Request,
    response: Response,
    idempotency_key: str = Header(..., alias="Idempotency-Key", min_length=36, max_length=36),
    db: Session = Depends(get_db),
):
    require_admin(request, db)
    try:
        event_id = str(UUID(idempotency_key))
    except ValueError:
        raise HTTPException(status_code=422, detail="Idempotency-Key должен быть UUID") from None
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
def get_landing_event(landing_id: str, event_id: str, request: Request, db: Session = Depends(get_db)):
    require_admin(request, db)
    event = service.landing_event_status(db, landing_id, event_id)
    return _event_view(event)


@router.post("/{landing_id}/events/{event_id}/retry")
def retry_landing_event(landing_id: str, event_id: str, request: Request, db: Session = Depends(get_db)):
    require_admin(request, db)
    event = service.retry_landing_event(db, landing_id, event_id)
    return _event_view(event)
