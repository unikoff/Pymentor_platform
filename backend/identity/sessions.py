"""Legacy SQL session lifecycle and cookie handling within Identity."""

import os
import uuid
from datetime import datetime
from types import SimpleNamespace
from fastapi import HTTPException, Request, Response, status
from sqlalchemy.orm import Session
from core.ports import UnitOfWork
from db import models


def _secure_cookie_enabled() -> bool:
    return os.getenv("PYMENTOR_COOKIE_SECURE", "").strip().lower() in {"1", "true", "yes", "on"}



def _local_async_identity(request: Request | None):
    if os.getenv("PYMENTOR_DUAL_LOCAL_TEST") != "1":
        return None
    identity = getattr(request.app.state, "local_async_identity", None) if request is not None else None
    if identity is None:
        raise HTTPException(status_code=503, detail="Session storage unavailable")
    return identity


def login_user(response: Response, user, db: Session, *, request: Request | None = None):
    identity = _local_async_identity(request)
    if identity is not None:
        from anyio import from_thread
        from identity.async_sessions import IdentityUnavailable, InvalidCredentials, InvalidSession
        try:
            if getattr(identity, "supports_login_retry", False):
                operation_id = request.headers.get("Idempotency-Key")
                if not operation_id:
                    raise HTTPException(status_code=400, detail="Login operation identifier required")
                grant = from_thread.run(lambda: identity.login(user.email, user.password, operation_id=operation_id))
            else:
                grant = from_thread.run(identity.login, user.email, user.password)
        except InvalidCredentials as exc:
            raise HTTPException(status_code=401, detail="Invalid email or password") from exc
        except InvalidSession as exc:
            raise HTTPException(status_code=409, detail="Login operation unavailable") from exc
        except IdentityUnavailable as exc:
            raise HTTPException(status_code=503, detail="Session storage unavailable") from exc
        response.set_cookie(key="session", value=grant.token, httponly=True, samesite="lax",
                            secure=_secure_cookie_enabled(), max_age=30 * 24 * 3600)
        public_user = dict(grant.public_user)
        if public_user["subscription_until"] is not None:
            public_user["subscription_until"] = datetime.fromisoformat(public_user["subscription_until"])
        return SimpleNamespace(**public_user)
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


def get_current_user(
    request: Request,
    db: Session | None,
    *,
    uow: UnitOfWork | None = None,
):
    session_token = request.cookies.get("session")
    if not session_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No session token found")

    identity = _local_async_identity(request)
    if identity is not None:
        from anyio import from_thread
        from identity.async_sessions import IdentityUnavailable, InvalidSession
        try:
            principal = from_thread.run(identity.authenticate, session_token)
        except InvalidSession as exc:
            raise HTTPException(status_code=401, detail="Invalid session") from exc
        except IdentityUnavailable as exc:
            raise HTTPException(status_code=503, detail="Session storage unavailable") from exc
        if uow is None:
            user_db = db.query(models.User).filter(models.User.id == principal.user_id).first()
        else:
            user_db = uow.repository(models.User).find_one(id=principal.user_id)
        if user_db is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user_db

    if uow is None:
        user_session = db.query(models.Session).filter(models.Session.session_token == session_token).first()
    else:
        user_session = uow.repository(models.Session).find_one(session_token=session_token)
    if user_session is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session")

    if uow is None:
        user_db = db.query(models.User).filter(models.User.id == user_session.user_id).first()
    else:
        user_db = uow.repository(models.User).find_one(id=user_session.user_id)
    if user_db is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return user_db


def logout_user(request: Request, response: Response, db: Session):
    session_token = request.cookies.get("session")
    if not session_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No session token found")

    identity = _local_async_identity(request)
    if identity is None:
        db.query(models.Session).filter(models.Session.session_token == session_token).delete()
        db.commit()
    else:
        from anyio import from_thread
        from identity.async_sessions import IdentityUnavailable
        try:
            from_thread.run(identity.logout, session_token)
        except IdentityUnavailable as exc:
            raise HTTPException(status_code=503, detail="Session storage unavailable") from exc
    response.delete_cookie(
        key="session",
        httponly=True,
        samesite="lax",
        secure=_secure_cookie_enabled(),
    )

    return {"message": "Logout successful"}
