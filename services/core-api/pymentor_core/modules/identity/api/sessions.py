"""Required Redis-gated session lifecycle and stable HTTP cookie contract."""
from __future__ import annotations

import os
from datetime import datetime
from types import SimpleNamespace
from typing import TYPE_CHECKING

from anyio import from_thread
from fastapi import HTTPException, Request, Response

from pymentor_core.app.dependencies import get_identity_repository
from pymentor_core.modules.identity.contracts import (
    IdentityUnavailable, InvalidCredentials, InvalidSession,
)
from pymentor_core.shared.ports import UnitOfWork

if TYPE_CHECKING:
    from sqlalchemy.orm import Session


def _secure_cookie_enabled() -> bool:
    return os.getenv("PYMENTOR_COOKIE_SECURE", "").strip().lower() in {
        "1", "true", "yes", "on",
    }


def require_identity(request: Request | None):
    application = (
        request.scope.get("app")
        if request is not None and hasattr(request, "scope")
        else getattr(request, "app", None)
    )
    identity = getattr(getattr(application, "state", None), "identity_sessions", None)
    if identity is None:
        raise HTTPException(status_code=503, detail="Session storage unavailable")
    return identity


def login_user(response: Response, user, db: Session, *, request: Request | None = None):
    identity = require_identity(request)
    operation_id = request.headers.get("Idempotency-Key")
    if not operation_id:
        raise HTTPException(status_code=400, detail="Login operation identifier required")
    try:
        grant = from_thread.run(
            lambda: identity.login(user.email, user.password, operation_id=operation_id)
        )
    except InvalidCredentials as exc:
        raise HTTPException(status_code=401, detail="Invalid email or password") from exc
    except InvalidSession as exc:
        raise HTTPException(status_code=409, detail="Login operation unavailable") from exc
    except IdentityUnavailable as exc:
        raise HTTPException(status_code=503, detail="Session storage unavailable") from exc
    response.set_cookie(
        key="session", value=grant.token, httponly=True, samesite="lax",
        secure=_secure_cookie_enabled(), max_age=30 * 24 * 3600,
    )
    public_user = dict(grant.public_user)
    if public_user["subscription_until"] is not None:
        public_user["subscription_until"] = datetime.fromisoformat(public_user["subscription_until"])
    return SimpleNamespace(**public_user)


def get_current_user(request: Request, db: Session | None, *, uow: UnitOfWork | None = None):
    session_token = request.cookies.get("session")
    if not session_token:
        raise HTTPException(status_code=401, detail="No session token found")
    identity = require_identity(request)
    try:
        principal = from_thread.run(identity.authenticate, session_token)
    except InvalidSession as exc:
        raise HTTPException(status_code=401, detail="Invalid session") from exc
    except IdentityUnavailable as exc:
        raise HTTPException(status_code=503, detail="Session storage unavailable") from exc
    user_db = get_identity_repository(db, uow).user_by_id(principal.user_id)
    if user_db is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user_db


def logout_user(request: Request, response: Response, db: Session):
    session_token = request.cookies.get("session")
    if not session_token:
        raise HTTPException(status_code=401, detail="No session token found")
    identity = require_identity(request)
    try:
        from_thread.run(identity.logout, session_token)
    except IdentityUnavailable as exc:
        raise HTTPException(status_code=503, detail="Session storage unavailable") from exc
    response.delete_cookie(key="session", httponly=True, samesite="lax", secure=_secure_cookie_enabled())
    return {"message": "Logout successful"}
