"""HTTP-compatible facade for the landing service binding."""

from __future__ import annotations
from fastapi import HTTPException
from pymentor_core.shared.bindings import get_bindings
from pymentor_core.modules.landings.contracts import LandingError


def _call(name, *args, **kwargs):
    try:
        return getattr(get_bindings().landings, name)(*args, **kwargs)
    except LandingError as exc:
        raise HTTPException(
            status_code=exc.status_code, detail=exc.detail, headers=exc.headers
        ) from exc


def resolve_landing_bot_token(secret_ref: str) -> str:
    return _call("resolve_landing_bot_token", secret_ref)


def create_landing(
    db: Session, *, slug: str, title: str, description: str, is_active: bool = True
) -> models.Landing:
    return _call(
        "create_landing",
        db,
        slug=slug,
        title=title,
        description=description,
        is_active=is_active,
    )


def set_landing_enabled(
    db: Session, landing_id: str, *, enabled: bool
) -> models.Landing:
    return _call("set_landing_enabled", db, landing_id, enabled=enabled)


def configure_landing_telegram(
    db: Session, landing_id: str, *, secret_ref: str, chat_id: str, bot_username: str
) -> models.LandingTelegramConfig:
    return _call(
        "configure_landing_telegram",
        db,
        landing_id,
        secret_ref=secret_ref,
        chat_id=chat_id,
        bot_username=bot_username,
    )


def disable_landing_telegram(db: Session, landing_id: str) -> models.Landing:
    return _call("disable_landing_telegram", db, landing_id)


def current_landing_telegram_config(
    db: Session, landing: models.Landing
) -> models.LandingTelegramConfig | None:
    return _call("current_landing_telegram_config", db, landing)


def enqueue_landing_event(
    db: Session, *, landing_id: str, event_id: str, event_type: str, payload: dict
) -> tuple[models.LandingNotificationOutbox, bool]:
    return _call(
        "enqueue_landing_event",
        db,
        landing_id=landing_id,
        event_id=event_id,
        event_type=event_type,
        payload=payload,
    )


def landing_event_status(
    db: Session, landing_id: str, event_id: str
) -> models.LandingNotificationOutbox:
    return _call("landing_event_status", db, landing_id, event_id)


def retry_landing_event(
    db: Session, landing_id: str, event_id: str
) -> models.LandingNotificationOutbox:
    return _call("retry_landing_event", db, landing_id, event_id)
