"""Subscription decisions and account serialization, independent of persistence."""

from datetime import datetime
from datetime import timezone


def _normalize_datetime(value: datetime | None) -> datetime | None:

    if value is None:
        return None

    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)

    return value.astimezone(timezone.utc)


def has_active_subscription(user_db) -> bool:

    subscription_until = _normalize_datetime(user_db.subscription_until)

    return subscription_until is not None and subscription_until > datetime.now(
        timezone.utc
    )


def _serialize_user(user_db) -> dict[str, object]:

    subscription_until = _normalize_datetime(user_db.subscription_until)

    return {
        "id": user_db.id,
        "username": user_db.username,
        "email": user_db.email,
        "subscription_until": subscription_until.isoformat()
        if subscription_until
        else None,
        "subscription_plan": user_db.subscription_plan,
        "has_active_subscription": has_active_subscription(user_db),
        "is_admin": bool(user_db.is_admin),
        "verified": bool(user_db.verified),
    }


normalize_datetime = _normalize_datetime
serialize_user = _serialize_user
