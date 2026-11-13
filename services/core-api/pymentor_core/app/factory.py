"""Single PostgreSQL/Redis HTTP assembly; resource I/O belongs to lifespan."""

import os
import sys
from contextlib import asynccontextmanager

from pymentor_core.app.settings import Settings
from pymentor_core.app.schema_policy import SCHEMA_REVISION
from pymentor_core.app.schema_policy import compatible_schema_revision
from pymentor_core.app.schema_policy import REQUIRED_TABLES


def create_app(profile=None, *, laboratory=False):
    """Build the only supported Core runtime without connecting on import."""
    if laboratory:
        raise ValueError("Laboratory startup is not a Core runtime")
    settings = Settings.from_environment(profile)
    if settings.course_transport != "local":
        raise RuntimeError("HTTP course transport is implemented separately in MC2")
    existing = sys.modules.get("pymentor_core.app.database")
    if existing is not None:
        from sqlalchemy.engine import make_url

        if existing.engine.url != make_url(settings.synchronous_database_url):
            raise RuntimeError("A different database identity requires a fresh process")
    os.environ["DATABASE_URL"] = settings.synchronous_database_url
    os.environ["PYMENTOR_SCHEMA_MODE"] = "managed"
    os.environ["PYTHON_DOTENV_DISABLED"] = "1"
    os.environ["PYMENTOR_PROFILE"] = settings.profile
    from fastapi import FastAPI
    from fastapi import HTTPException
    from fastapi import Request
    from sqlalchemy import inspect
    from sqlalchemy import text
    from sqlalchemy.exc import SQLAlchemyError
    from pymentor_core.app.wiring import configure_bindings

    configure_bindings()
    from pymentor_core.app.wiring import build_default_composition
    from pymentor_core.app.web import configure_web
    from pymentor_core.app.web import mount_frontend
    from pymentor_core.app.database import engine
    from pymentor_core.app.database import matches_database_identity
    from pymentor_core.modules.administration.api.router import admin_router
    from pymentor_core.modules.identity.api.router import user_router
    from pymentor_core.modules.bookings.api.router import booking_router
    from pymentor_core.modules.learning.api.router import learning_router
    from pymentor_core.modules.landings.api.public import (
        router as public_landing_router,
    )

    @asynccontextmanager
    async def application_lifespan(application):
        from pymentor_core.app.wiring import postgres_resources

        try:
            async with postgres_resources(application, settings):
                application.state.startup_complete = True
                try:
                    yield
                finally:
                    application.state.startup_complete = False
        finally:
            engine.dispose()

    app = FastAPI(lifespan=application_lifespan)
    app.state.profile = settings.profile
    app.state.settings = settings
    app.state.startup_complete = False
    app.state.composition_root = build_default_composition()
    configure_web(app)
    from pymentor_core.app.release import ReleaseRevisionMiddleware
    app.add_middleware(ReleaseRevisionMiddleware)

    @app.get("/health")
    def health():
        return {"status": "ok"}

    @app.get("/health/live")
    def liveness_health():
        # Keep liveness independent of the database and other dependencies so a
        # transient outage does not create a restart loop.
        return {"status": "ok"}

    @app.get("/health/startup")
    def startup_health():
        if not app.state.startup_complete:
            raise HTTPException(status_code=503, detail="Core startup incomplete")
        return {"status": "started"}

    @app.get("/health/ready")
    def readiness_health(request: Request):
        if not app.state.startup_complete:
            raise HTTPException(status_code=503, detail="Core startup incomplete")
        try:
            with engine.connect() as connection:
                connection.execute(text("SELECT 1"))
                identity = tuple(
                    connection.execute(
                        text("SELECT current_database(), current_user")
                    ).one()
                )
                revision = connection.execute(
                    text("SELECT version_num FROM alembic_version")
                ).scalar_one()
                available = set(inspect(connection).get_table_names())
                if (
                    not matches_database_identity(identity, engine.url)
                    or not compatible_schema_revision(revision, SCHEMA_REVISION)
                    or not set(REQUIRED_TABLES).issubset(available)
                ):
                    raise HTTPException(
                        status_code=503, detail="Configured database schema unavailable"
                    )
                from anyio import from_thread
                from pymentor_core.modules.identity.contracts import (
                    IdentityUnavailable,
                )
                from redis.exceptions import RedisError

                session_service = getattr(
                    request.app.state, "identity_sessions", None
                )
                if session_service is None:
                    raise HTTPException(
                        status_code=503, detail="Session storage unavailable"
                    )
                try:
                    from_thread.run(session_service.check_async_database)
                    if not from_thread.run(session_service.redis.ping):
                        raise HTTPException(
                            status_code=503, detail="Session storage unavailable"
                        )
                except (IdentityUnavailable, RedisError, TimeoutError) as exc:
                    raise HTTPException(
                        status_code=503, detail="Session storage unavailable"
                    ) from exc
        except SQLAlchemyError:
            raise HTTPException(
                status_code=503, detail="database unavailable"
            ) from None
        return {"status": "ready"}

    app.include_router(admin_router, prefix="/admin")
    app.include_router(user_router, prefix="/user")
    app.include_router(booking_router, prefix="/user")
    app.include_router(learning_router, prefix="/learning")
    app.include_router(
        public_landing_router, prefix="/api/landings", tags=["landing-public"]
    )
    app.include_router(admin_router, prefix="/api/admin")
    app.include_router(user_router, prefix="/api/user")
    app.include_router(booking_router, prefix="/api/user")
    app.include_router(learning_router, prefix="/api/learning")
    mount_frontend(app)

    return app
