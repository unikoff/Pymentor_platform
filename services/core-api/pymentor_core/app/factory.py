"""One HTTP assembly point; database I/O belongs to lifespan, never import."""

import os
import sys
from contextlib import asynccontextmanager

from pymentor_core.app.paths import LEGACY_ROOT
from pymentor_core.app.settings import Settings

from pymentor_core.app.schema_policy import DUAL_LOCAL_SCHEMA_REVISION
from pymentor_core.app.schema_policy import compatible_schema_revision
from pymentor_core.app.schema_policy import DUAL_LOCAL_REQUIRED_TABLES


def _required_revision(app):
    compatibility = sys.modules.get("main")
    if compatibility is not None and getattr(compatibility, "app", None) is app:
        return compatibility.DUAL_LOCAL_SCHEMA_REVISION
    return DUAL_LOCAL_SCHEMA_REVISION


def _required_tables(app):
    compatibility = sys.modules.get("main")
    if compatibility is not None and getattr(compatibility, "app", None) is app:
        return compatibility.DUAL_LOCAL_REQUIRED_TABLES
    return DUAL_LOCAL_REQUIRED_TABLES


def create_app(profile=None, *, laboratory=False):
    """One profile per process; legacy callers pass their profile explicitly."""
    if laboratory:
        if os.getenv("PYMENTOR_DUAL_LOCAL_TEST") != "1":
            raise RuntimeError("Explicit local test opt-in is required")
        from pymentor_core.app.synthetic_policy import _validated_url

        validated = _validated_url(os.environ.get("PYMENTOR_TEST_PG_URL", ""))
        existing = sys.modules.get("pymentor_core.app.database")
        if existing is not None and existing.engine.url != validated:
            raise RuntimeError("A different database profile requires a fresh process")
        os.environ["DATABASE_URL"] = validated.render_as_string(hide_password=False)
        os.environ["PYMENTOR_SCHEMA_MODE"] = "managed"
        os.environ["PYTHON_DOTENV_DISABLED"] = "1"
        profile = "postgres_redis"
        settings = None
    else:
        # Only legacy hosting may load its existing dotenv; cluster configuration
        # is explicit environment configuration and must not inherit hosting DSNs.
        if (
            profile == "legacy_sqlite"
            or os.getenv("PYMENTOR_PROFILE") == "legacy_sqlite"
        ):
            from dotenv import load_dotenv

            load_dotenv(LEGACY_ROOT / ".env")
        settings = Settings.from_environment(profile, legacy_root=LEGACY_ROOT)
        profile = settings.profile
        if settings.course_transport != "local":
            raise RuntimeError("HTTP course transport is implemented separately in MC2")
        existing = sys.modules.get("pymentor_core.app.database")
        if existing is not None:
            from sqlalchemy.engine import make_url

            if existing.engine.url != make_url(settings.synchronous_database_url):
                raise RuntimeError(
                    "A different database profile requires a fresh process"
                )
        os.environ["DATABASE_URL"] = settings.synchronous_database_url
        os.environ["PYMENTOR_PROFILE"] = profile
        if profile == "postgres_redis":
            os.environ["PYMENTOR_SCHEMA_MODE"] = "managed"
            os.environ["PYTHON_DOTENV_DISABLED"] = "1"

    if str(LEGACY_ROOT) not in sys.path:
        sys.path.insert(0, str(LEGACY_ROOT))
    from fastapi import FastAPI
    from fastapi import HTTPException
    from fastapi import Request
    from sqlalchemy import inspect
    from sqlalchemy import text
    from sqlalchemy.exc import SQLAlchemyError
    from pymentor_core.app.wiring import configure_bindings

    configure_bindings()
    from pymentor_core.app.wiring import build_default_composition
    from pymentor_core.app.web import lifespan as hosting_lifespan
    from pymentor_core.app.web import configure_web
    from pymentor_core.app.web import mount_frontend
    from pymentor_core.app.schema_policy import should_run_legacy_bootstrap
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
        if laboratory:
            # dual_local owns its strictly guarded asynchronous resources.
            async with hosting_lifespan(application):
                yield
            return
        try:
            if profile == "legacy_sqlite":
                from pymentor_core.app.wiring import initialize_legacy_schema

                initialize_legacy_schema()
                async with hosting_lifespan(application):
                    yield
            else:
                from pymentor_core.app.wiring import postgres_resources

                async with postgres_resources(application, settings):
                    yield
        finally:
            engine.dispose()

    app = FastAPI(lifespan=application_lifespan)
    app.state.profile = profile
    app.state.settings = settings
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
        # FastAPI serves routes only after the ASGI lifespan has started.
        return {"status": "started"}

    @app.get("/health/ready")
    def readiness_health(request: Request):
        try:
            with engine.connect() as connection:
                connection.execute(text("SELECT 1"))
                if profile == "postgres_redis":
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
                        or not compatible_schema_revision(revision, _required_revision(app))
                        or not set(_required_tables(app)).issubset(available)
                    ):
                        raise HTTPException(
                            status_code=503, detail="test database schema unavailable"
                        )
                    from anyio import from_thread
                    from pymentor_core.modules.identity.contracts import (
                        IdentityUnavailable,
                    )
                    from redis.exceptions import RedisError

                    session_service = getattr(
                        request.app.state, "local_async_identity", None
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
