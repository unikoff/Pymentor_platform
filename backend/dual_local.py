"""Opt-in disposable PostgreSQL test entrypoint for existing Core routes.

This synchronous transition slice is not the complete async/Redis Core 2.0 and
must not be used against production or a real data snapshot.
"""

import os
import sys
from contextlib import asynccontextmanager

from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url
from sqlalchemy.pool import NullPool
from core.schema_policy import DUAL_LOCAL_SCHEMA_REVISION


def _validated_url(raw: str):
    url = make_url(raw)
    if (url.drivername != "postgresql+asyncpg" or url.host != "127.0.0.1"
            or url.port != 57152 or url.database != "pymentor_test" or url.username != "pymentor_test"
            or bool(url.query)):
        raise ValueError("Only the disposable local PostgreSQL test instance is permitted")
    return url.set(drivername="postgresql+psycopg")


def create_app():
    """Build the existing application in a fresh process against test data only."""
    if os.getenv("PYMENTOR_DUAL_LOCAL_TEST") != "1":
        raise RuntimeError("Explicit local test opt-in is required")
    if "main" in sys.modules or "db.engine" in sys.modules:
        raise RuntimeError("Local PostgreSQL mode requires a fresh process")
    url = _validated_url(os.environ.get("PYMENTOR_TEST_PG_URL", ""))
    probe = create_engine(url, poolclass=NullPool, connect_args={"connect_timeout": 3}, hide_parameters=True)
    try:
        with probe.connect() as connection:
            identity = tuple(connection.execute(text("SELECT current_database(), current_user")).one())
            if identity != ("pymentor_test", "pymentor_test"):
                raise RuntimeError("Unexpected test PostgreSQL identity")
            version = connection.execute(text("SELECT version_num FROM alembic_version")).scalar_one()
            if version != DUAL_LOCAL_SCHEMA_REVISION:
                raise RuntimeError("Test PostgreSQL migration version is not current")
    finally:
        probe.dispose()
    os.environ["DATABASE_URL"] = url.render_as_string(hide_password=False)
    os.environ["PYMENTOR_SCHEMA_MODE"] = "managed"
    os.environ["PYTHON_DOTENV_DISABLED"] = "1"
    os.environ["PYMENTOR_LOCAL_NOTIFICATIONS"] = "0"
    from identity.async_sessions import AsyncIdentitySessions
    from infrastructure.dual_async_pg import AsyncDatabase
    from infrastructure.redis_sessions import RedisSessionStore
    from main import app
    original_lifespan = app.router.lifespan_context

    @asynccontextmanager
    async def local_lifespan(application):
        async_database = AsyncDatabase(os.environ["PYMENTOR_TEST_PG_URL"], pool_size=3, max_overflow=0,
                                       pool_timeout=3, connect_timeout=3, command_timeout=3)
        store = None
        try:
            store = RedisSessionStore(os.environ["PYMENTOR_TEST_REDIS_URL"],
                                      prefix=os.environ["PYMENTOR_TEST_REDIS_PREFIX"],
                                      max_connections=6, socket_timeout=2)
            application.state.local_async_identity = AsyncIdentitySessions(async_database, store)
            async with original_lifespan(application):
                yield
        finally:
            try:
                if store is not None:
                    await store.close()
            finally:
                await async_database.dispose()

    app.router.lifespan_context = local_lifespan
    return app
