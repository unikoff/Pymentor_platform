"""SQL commands for landing request flows; no HTTP or external network calls."""

from pymentor_core.adapters.sql import models
from pymentor_core.modules.landings.contracts import LandingError
from pymentor_core.adapters.sql import landings as service


def list_landings(db):
    return db.query(models.Landing).order_by(models.Landing.slug).all()


def update_landing(db, landing_id, changes):
    landing = db.get(models.Landing, landing_id)
    if landing is None:
        raise LandingError(status_code=404, detail="Лендинг не найден")
    if not changes:
        raise LandingError(status_code=422, detail="Не указаны поля для изменения")
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
    return landing


def get_landing(db, landing_id):
    landing = db.get(models.Landing, landing_id)
    if landing is None:
        raise LandingError(status_code=404, detail="Лендинг не найден")
    return landing


def prepare_telegram(db, landing_id, secret_ref):
    get_landing(db, landing_id)
    token = service.resolve_landing_bot_token(secret_ref)
    db.rollback()
    return token


def finish_telegram(db, landing_id, secret_ref, chat_id, bot_username):
    config = service.configure_landing_telegram(
        db,
        landing_id,
        secret_ref=secret_ref,
        chat_id=chat_id,
        bot_username=bot_username,
    )
    landing = get_landing(db, landing_id)
    db.refresh(landing)
    return landing, config


def submit_consultation(db, slug, event_id, event_payload):
    landing = db.query(models.Landing).filter_by(slug=slug, is_active=True).first()
    if landing is None:
        raise LandingError(status_code=404, detail="Активный лендинг не найден")
    config = service.current_landing_telegram_config(db, landing)
    if landing.telegram_enabled and config is not None and config.status == "verified":
        service.resolve_landing_bot_token(config.secret_ref)
    return service.enqueue_landing_event(
        db,
        landing_id=landing.id,
        event_id=event_id,
        event_type="consultation_request.v1",
        payload=event_payload,
    )
