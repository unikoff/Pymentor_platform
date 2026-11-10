"""Disposable local HTTP auth preview, not the production Core application."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi import HTTPException
from fastapi import Request
from fastapi import Response
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from pymentor_core.app.web import configure_web
from pymentor_core.adapters.sql import models
from pymentor_core.adapters.postgres.identity_sessions import AsyncIdentitySessions
from pymentor_core.modules.identity.contracts import IdentityUnavailable
from pymentor_core.modules.identity.contracts import InvalidCredentials
from pymentor_core.modules.identity.contracts import InvalidSession
from pymentor_core.adapters.postgres.identity_sessions import SESSION_TTL_SECONDS
from pymentor_core.modules.identity.api.sessions import _secure_cookie_enabled
from pymentor_core.adapters.redis.sessions import RedisSessionStore
from pymentor_core.modules.identity.api.schemas import UserLogin
from pymentor_core.modules.identity.api.accounts import _serialize_user


def create_auth_preview_app(sessions: AsyncIdentitySessions) -> FastAPI:
    url = sessions.database.engine.url
    if (
        url.drivername != "postgresql+asyncpg"
        or url.host not in {"127.0.0.1", "localhost", "::1"}
        or url.port != 57152
        or url.database != "pymentor_test"
        or url.username != "pymentor_test"
        or bool(url.query)
        or sessions.mode != "redis"
        or not isinstance(sessions.redis, RedisSessionStore)
    ):
        raise ValueError(
            "Auth preview requires the disposable local PostgreSQL and Redis"
        )

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        try:
            async with sessions.database.unit_of_work() as uow:
                identity = (
                    await uow.session.execute(
                        text("SELECT current_database(), current_user")
                    )
                ).one()
                if tuple(identity) != ("pymentor_test", "pymentor_test"):
                    raise RuntimeError("Unexpected local test database identity")
            yield
        finally:
            await sessions.redis.close()
            await sessions.database.dispose()

    app = FastAPI(lifespan=lifespan)
    configure_web(app)

    async def public_user(user_id):
        try:
            async with sessions.database.unit_of_work() as uow:
                user = await uow.session.get(models.User, user_id)
                if user is None:
                    raise HTTPException(status_code=401, detail="Invalid session")
                return _serialize_user(user)
        except (SQLAlchemyError, TimeoutError) as exc:
            raise HTTPException(
                status_code=503, detail="Session storage unavailable"
            ) from exc

    @app.post("/api/user/login")
    async def login(body: UserLogin, response: Response):
        try:
            grant = await sessions.login(body.email, body.password)
        except InvalidCredentials as exc:
            raise HTTPException(
                status_code=401, detail="Invalid email or password"
            ) from exc
        except IdentityUnavailable as exc:
            raise HTTPException(
                status_code=503, detail="Session storage unavailable"
            ) from exc
        response.set_cookie(
            "session",
            grant.token,
            httponly=True,
            samesite="lax",
            secure=_secure_cookie_enabled(),
            max_age=SESSION_TTL_SECONDS,
        )
        return {"message": "Login successful", "user": grant.public_user}

    @app.get("/api/user/me")
    async def me(request: Request):
        token = request.cookies.get("session")
        if not token:
            raise HTTPException(status_code=401, detail="No session token found")
        try:
            principal = await sessions.authenticate(token)
            return {"user": await public_user(principal.user_id)}
        except InvalidSession as exc:
            raise HTTPException(status_code=401, detail="Invalid session") from exc
        except IdentityUnavailable as exc:
            raise HTTPException(
                status_code=503, detail="Session storage unavailable"
            ) from exc

    @app.post("/api/user/logout")
    async def logout(request: Request, response: Response):
        token = request.cookies.get("session")
        if not token:
            raise HTTPException(status_code=401, detail="No session token found")
        try:
            await sessions.logout(token)
        except IdentityUnavailable as exc:
            raise HTTPException(
                status_code=503, detail="Session storage unavailable"
            ) from exc
        response.delete_cookie(
            "session", httponly=True, samesite="lax", secure=_secure_cookie_enabled()
        )
        return {"message": "Logout successful"}

    return app
