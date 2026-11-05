"""Explicitly constructed local-only async activity slice; not the full Core app."""

from calendar import monthrange
from contextlib import asynccontextmanager
from datetime import date, datetime, timezone

from fastapi import Depends, FastAPI, HTTPException, Query, Request
from sqlalchemy import select, text
from sqlalchemy.dialects.postgresql import insert

from core.web import configure_web
from db import models
from identity.principal import Principal
from identity.async_sessions import AsyncIdentitySessions, IdentityUnavailable, InvalidSession
from infrastructure.dual_async_pg import AsyncDatabase, AsyncUnitOfWork
from infrastructure.redis_sessions import RedisSessionStore
from routers.accounts.activity import MOSCOW_TZ, serialize_activity_timestamp
from routers.accounts.schemas import ActivityVisit


def create_preview_app(database: AsyncDatabase, *, identity_service: AsyncIdentitySessions | None = None) -> FastAPI:
    """Construct an isolated preview; caller supplies its local test database."""
    url = database.engine.url
    if (url.drivername != "postgresql+asyncpg" or url.host not in {"127.0.0.1", "localhost", "::1"}
            or url.port != 57152 or url.database != "pymentor_test" or url.username != "pymentor_test"
            or bool(url.query)):
        raise ValueError("The activity preview requires the disposable local PostgreSQL database")
    if identity_service is not None and (
        identity_service.database is not database or identity_service.mode != "redis"
        or not isinstance(identity_service.redis, RedisSessionStore)
    ):
        raise ValueError("Redis identity must use this preview's disposable database")

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        try:
            async with database.unit_of_work() as uow:
                identity = (await uow.session.execute(text("SELECT current_database(), current_user"))).one()
                if tuple(identity) != ("pymentor_test", "pymentor_test"):
                    raise RuntimeError("The activity preview connected to an unexpected database identity")
            yield
        finally:
            await database.dispose()

    app = FastAPI(lifespan=lifespan)
    configure_web(app)

    async def request_uow():
        async with database.unit_of_work() as uow:
            yield uow

    async def principal(request: Request, uow: AsyncUnitOfWork = Depends(request_uow)) -> Principal:
        token = request.cookies.get("session")
        if not token:
            raise HTTPException(status_code=401, detail="No session token found")
        if identity_service is not None:
            try:
                return await identity_service.authenticate(token)
            except InvalidSession as exc:
                raise HTTPException(status_code=401, detail="Invalid session") from exc
            except IdentityUnavailable as exc:
                raise HTTPException(status_code=503, detail="Session storage unavailable") from exc
        session_record = await uow.session.scalar(select(models.Session).where(models.Session.session_token == token))
        if session_record is None:
            raise HTTPException(status_code=401, detail="Invalid session")
        user = await uow.session.get(models.User, session_record.user_id)
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return Principal.from_user(user)

    @app.post("/api/user/activity/visit")
    async def record_visit(payload: ActivityVisit, current: Principal = Depends(principal),
                           uow: AsyncUnitOfWork = Depends(request_uow)):
        now = datetime.now(timezone.utc)
        activity_date = payload.activity_date or now.astimezone(MOSCOW_TZ).date()
        statement = insert(models.UserActivityDay).values(
            user_id=current.user_id, activity_date=activity_date, visited_at=now,
        )
        statement = statement.on_conflict_do_update(
            index_elements=[models.UserActivityDay.user_id, models.UserActivityDay.activity_date],
            set_={"visited_at": statement.excluded.visited_at},
            where=models.UserActivityDay.visited_at.is_(None),
        )
        await uow.session.execute(statement)
        await uow.commit()
        day = await uow.session.scalar(select(models.UserActivityDay).where(
            models.UserActivityDay.user_id == current.user_id,
            models.UserActivityDay.activity_date == activity_date,
        ))
        return {"activity_date": day.activity_date.isoformat(),
                "visited_at": serialize_activity_timestamp(day.visited_at)}

    @app.get("/api/user/activity")
    async def activity(year: int = Query(..., ge=2000, le=2100),
                       month: int = Query(..., ge=1, le=12),
                       current: Principal = Depends(principal),
                       uow: AsyncUnitOfWork = Depends(request_uow)):
        start = date(year, month, 1)
        end = date(year, month, monthrange(year, month)[1])
        rows = (await uow.session.scalars(select(models.UserActivityDay).where(
            models.UserActivityDay.user_id == current.user_id,
            models.UserActivityDay.activity_date >= start,
            models.UserActivityDay.activity_date <= end,
        ).order_by(models.UserActivityDay.activity_date.asc()))).all()
        return {"days": [item.activity_date.isoformat() for item in rows],
                "visits": [{"activity_date": item.activity_date.isoformat(),
                            "visited_at": serialize_activity_timestamp(item.visited_at)} for item in rows]}

    return app
