"""Account authentication, SQL sessions and subscription information."""

import os
import uuid
from fastapi import HTTPException, status, Response, Request
from .schemas import UserCreate, UserLogin
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from db import models


def _secure_cookie_enabled() -> bool:
    return os.getenv("PYMENTOR_COOKIE_SECURE", "").strip().lower() in {"1", "true", "yes", "on"}


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


def login_user(response: Response, user: UserLogin, db: Session):
    user_db = db.query(models.User).filter(models.User.email == user.email).first()

    if user_db is None or user_db.verify_password(user.password) is False:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    
    # Держим не больше 3 активных сессий: при входе с 4-го устройства
    # вытесняем самую старую вместо вечного 403 (раньше логин блокировался
    # навсегда, потому что сессии никогда не удалялись).
    MAX_SESSIONS = 3
    sessions = (
        db.query(models.Session)
        .filter(models.Session.user_id == user_db.id)
        .order_by(models.Session.created_at.asc())
        .all()
    )
    for stale_session in sessions[: max(0, len(sessions) - (MAX_SESSIONS - 1))]:
        db.delete(stale_session)

    session_token = str(uuid.uuid4())
    new_session = models.Session(user_id=user_db.id, session_token=session_token)
    db.add(new_session)
    db.commit()

    response.set_cookie(
        key="session",
        value=session_token,
        httponly=True,
        samesite="lax",
        secure=_secure_cookie_enabled(),
        max_age=30 * 24 * 3600,
    )
    return user_db


def get_current_user(request: Request, db: Session):
    session_token = request.cookies.get("session")
    if not session_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No session token found")

    user_session = db.query(models.Session).filter(models.Session.session_token == session_token).first()
    if user_session is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session")

    user_db = db.query(models.User).filter(models.User.id == user_session.user_id).first()
    if user_db is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return user_db


def logout_user(request: Request, response: Response, db: Session):
    session_token = request.cookies.get("session")
    if not session_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No session token found")

    db.query(models.Session).filter(models.Session.session_token == session_token).delete()
    db.commit()
    response.delete_cookie(
        key="session",
        httponly=True,
        samesite="lax",
        secure=_secure_cookie_enabled(),
    )

    return {"message": "Logout successful"}
