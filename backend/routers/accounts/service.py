"""Account authentication, SQL sessions and subscription information."""

from fastapi import HTTPException, status
from .schemas import UserCreate
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from db import models
from identity.sessions import _secure_cookie_enabled, get_current_user, login_user, logout_user
from identity.principal import Principal


def _normalize_datetime(value: datetime | None) -> datetime | None:
    if value is None:
        return None
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def has_active_subscription(user_db: models.User) -> bool:
    subscription_until = _normalize_datetime(user_db.subscription_until)
    return subscription_until is not None and subscription_until > datetime.now(timezone.utc)


def _serialize_user(user_db: models.User) -> dict[str, object]:
    subscription_until = _normalize_datetime(user_db.subscription_until)
    return {
        "id": user_db.id,
        "username": user_db.username,
        "email": user_db.email,
        "subscription_until": subscription_until.isoformat() if subscription_until else None,
        "subscription_plan": user_db.subscription_plan,
        "has_active_subscription": has_active_subscription(user_db),
        "is_admin": bool(user_db.is_admin),
    }


def register_user(user: UserCreate, db: Session):
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists")

    new_user = models.User(username=user.username, email=user.email, password=user.password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


def get_current_principal(request, db, *, uow=None) -> Principal:
    """Expose verified identity to other modules without the ORM credential record."""
    kwargs = {"uow": uow} if uow is not None else {}
    return Principal.from_user(get_current_user(request=request, db=db, **kwargs))
