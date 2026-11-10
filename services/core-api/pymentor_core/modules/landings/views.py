"""Pure representations of opaque landing records."""

from __future__ import annotations
from datetime import timezone


def _landing_view(landing: object) -> dict[str, object]:
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
    landing: object,
    config: object | None,
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


def _event_view(event: object) -> dict[str, object]:
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
