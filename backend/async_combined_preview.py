"""Explicit local test composition of auth and the two activity endpoints."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.routing import APIRoute

from async_auth_preview import create_auth_preview_app
from async_preview import create_preview_app
from core.web import configure_web
from identity.async_sessions import AsyncIdentitySessions


def create_combined_preview(sessions: AsyncIdentitySessions) -> FastAPI:
    auth = create_auth_preview_app(sessions)
    activity = create_preview_app(sessions.database, identity_service=sessions)

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        # The auth preview owns the shared Redis client and PostgreSQL pool.
        async with auth.router.lifespan_context(auth):
            yield

    app = FastAPI(lifespan=lifespan)
    configure_web(app)
    for source in (auth, activity):
        app.router.routes.extend(route for route in source.router.routes if isinstance(route, APIRoute))
    return app
