"""Legacy SQL session lifecycle and cookie handling within Identity."""

from __future__ import annotations

import os
import uuid
from datetime import datetime
from types import SimpleNamespace
from fastapi import HTTPException
from fastapi import Request
from fastapi import Response
from fastapi import status
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from sqlalchemy.orm import Session
from pymentor_core.shared.ports import UnitOfWork
from pymentor_core.app.dependencies import get_identity_repository


def _secure_cookie_enabled() -> bool:
    return os.getenv("PYMENTOR_COOKIE_SECURE", "").strip().lower() in {
        "1",
        "true",
        "yes",
        "on",
    }


def _local_async_identity(request: Request | None):
    application = (
        request.scope.get("app")
        if request is not None and hasattr(request, "scope")
        else getattr(request, "app", None)
    )
    state = getattr(application, "state", None)
    configured = getattr(state, "profile", None) == "postgres_redis"
    if not configured and os.getenv("PYMENTOR_DUAL_LOCAL_TEST") != "1":
        return None
    identity = getattr(state, "local_async_identity", None)
    if identity is None:
        raise HTTPException(status_code=503, detail="Session storage unavailable")
    return identity


def login_user(
    response: Response, user, db: Session, *, request: Request | None = None
):
    identity = _local_async_identity(request)
    if identity is not None:
        from anyio import from_thread
        from pymentor_core.modules.identity.contracts import IdentityUnavailable
        from pymentor_core.modules.identity.contracts import InvalidCredentials
        from pymentor_core.modules.identity.contracts import InvalidSession

        try:
            if getattr(identity, "supports_login_retry", False):
                operation_id = request.headers.get("Idempotency-Key")
                if not operation_id:
                    raise HTTPException(
                        status_code=400, detail="Login operation identifier required"
                    )
                grant = from_thread.run(
                    lambda: identity.login(
                        user.email, user.password, operation_id=operation_id
                    )
                )
            else:
                grant = from_thread.run(identity.login, user.email, user.password)
        except InvalidCredentials as exc:
            raise HTTPException(
                status_code=401, detail="Invalid email or password"
            ) from exc
        except InvalidSession as exc:
            raise HTTPException(
                status_code=409, detail="Login operation unavailable"
            ) from exc
        except IdentityUnavailable as exc:
            raise HTTPException(
                status_code=503, detail="Session storage unavailable"
            ) from exc
        response.set_cookie(
            key="session",
            value=grant.token,
            httponly=True,
            samesite="lax",
            secure=_secure_cookie_enabled(),
            max_age=30 * 24 * 3600,
        )
        public_user = dict(grant.public_user)
        if public_user["subscription_until"] is not None:
            public_user["subscription_until"] = datetime.fromisoformat(
                public_user["subscription_until"]
            )
        return SimpleNamespace(**public_user)
    repository = get_identity_repository(db, legacy_sessions=True)
    user_db = repository.user_by_email(user.email)

    if user_db is None or user_db.verify_password(user.password) is False:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password"
        )

    # The password may have changed after verification. Lock the matching row
    # before creating the session so a concurrent reset cannot revive old access.
    if not repository.claim_password_state(user_db.id, user_db.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password"
        )

    # Держим не больше 3 активных сессий: при входе с 4-го устройства
    # вытесняем самую старую вместо вечного 403 (раньше логин блокировался
    # навсегда, потому что сессии никогда не удалялись).
    MAX_SESSIONS = 3
    sessions = repository.ordered_sessions(user_db.id)
    for stale_session in sessions[: max(0, len(sessions) - (MAX_SESSIONS - 1))]:
        repository.delete_session(stale_session)

    session_token = str(uuid.uuid4())
    repository.add_session(user_db.id, session_token)
    repository.commit()

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
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="No session token found"
        )

    identity = _local_async_identity(request)
    if identity is not None:
        from anyio import from_thread
        from pymentor_core.modules.identity.contracts import IdentityUnavailable
        from pymentor_core.modules.identity.contracts import InvalidSession

        try:
            principal = from_thread.run(identity.authenticate, session_token)
        except InvalidSession as exc:
            raise HTTPException(status_code=401, detail="Invalid session") from exc
        except IdentityUnavailable as exc:
            raise HTTPException(
                status_code=503, detail="Session storage unavailable"
            ) from exc
        repository = get_identity_repository(db, uow)
        user_db = repository.user_by_id(principal.user_id)
        if user_db is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user_db

    repository = get_identity_repository(db, uow, legacy_sessions=True)
    user_session = repository.session_by_token(session_token)
    if user_session is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session"
        )

    user_db = repository.user_by_id(user_session.user_id)
    if user_db is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found"
        )

    return user_db


def logout_user(request: Request, response: Response, db: Session):
    session_token = request.cookies.get("session")
    if not session_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="No session token found"
        )

    identity = _local_async_identity(request)
    if identity is None:
        repository = get_identity_repository(db, legacy_sessions=True)
        repository.delete_token(session_token)
        repository.commit()
    else:
        from anyio import from_thread
        from pymentor_core.modules.identity.contracts import IdentityUnavailable

        try:
            from_thread.run(identity.logout, session_token)
        except IdentityUnavailable as exc:
            raise HTTPException(
                status_code=503, detail="Session storage unavailable"
            ) from exc
    response.delete_cookie(
        key="session",
        httponly=True,
        samesite="lax",
        secure=_secure_cookie_enabled(),
    )

    return {"message": "Logout successful"}
