"""Explicit runtime resource ownership; no connections on import."""

import asyncio
from contextlib import AsyncExitStack
from contextlib import asynccontextmanager


@asynccontextmanager
async def postgres_resources(app, settings):
    from pymentor_core.adapters.runtime import RuntimeAsyncDatabase
    from pymentor_core.adapters.runtime import RuntimeRedisSessionStore
    from pymentor_core.adapters.runtime import RuntimeIdentitySessions
    from pymentor_core.adapters.postgres.deletion_cleanup import cleanup_loop
    from sqlalchemy import inspect
    from sqlalchemy import text
    from pymentor_core.app.database import engine
    from pymentor_core.app.database import matches_database_identity
    from pymentor_core.app.schema_policy import DUAL_LOCAL_REQUIRED_TABLES
    from pymentor_core.app.schema_policy import DUAL_LOCAL_SCHEMA_REVISION
    from pymentor_core.app.schema_policy import compatible_schema_revision

    # Check only. Alembic must have been run by a separate migration operation.
    with engine.connect() as connection:
        identity = tuple(
            connection.execute(text("SELECT current_database(), current_user")).one()
        )
        revision = connection.execute(
            text("SELECT version_num FROM alembic_version")
        ).scalar_one()
        if (
            not matches_database_identity(identity, engine.url)
            or not compatible_schema_revision(revision, DUAL_LOCAL_SCHEMA_REVISION)
            or not set(DUAL_LOCAL_REQUIRED_TABLES).issubset(
                inspect(connection).get_table_names()
            )
        ):
            raise RuntimeError("Configured PostgreSQL schema is not ready")
    async with AsyncExitStack() as resources:
        database = RuntimeAsyncDatabase(
            settings.async_database_url,
            pool_size=3,
            max_overflow=0,
            pool_timeout=3,
            connect_timeout=3,
            command_timeout=3,
            statement_timeout_ms=3000,
            lock_timeout_ms=1000,
        )
        resources.push_async_callback(database.dispose)
        store = RuntimeRedisSessionStore(
            settings.redis_url,
            prefix=settings.redis_prefix,
            max_connections=6,
            socket_timeout=2,
        )
        resources.push_async_callback(store.close)
        sessions = RuntimeIdentitySessions(
            database, store, recovery_key=bytes.fromhex(settings.login_recovery_key)
        )
        await sessions.check_async_database()
        if not await store.ping():
            raise RuntimeError("Configured Redis is not ready")
        app.state.local_async_identity = (
            sessions  # temporary compatibility with existing HTTP use cases
        )
        task = asyncio.create_task(cleanup_loop(database, store))

        async def stop_cleanup():
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass

        resources.push_async_callback(stop_cleanup)
        try:
            yield
        finally:
            app.state.local_async_identity = None


from pymentor_core.app.context import CompositionRoot
from pymentor_core.app.defaults import DenyAllPermissions
from pymentor_core.app.defaults import SystemClock
from pymentor_core.app.defaults import UnconfiguredExternalAPI
from pymentor_core.app.defaults import UnconfiguredQueue


def build_default_composition() -> CompositionRoot:
    from pymentor_core.adapters.sql.unit_of_work import SqlAlchemyUnitOfWork

    return CompositionRoot(
        uow_factory=SqlAlchemyUnitOfWork,
        clock=SystemClock(),
        permissions=DenyAllPermissions(),
        queue=UnconfiguredQueue(),
        external_api=UnconfiguredExternalAPI(),
    )


def identity_repository(database, uow=None, *, legacy_sessions=False):
    # Selection is wiring; business modules never import the legacy adapter.
    if legacy_sessions:
        from pymentor_core.adapters.legacy_sqlite.sessions import SqlSessionRepository

        return SqlSessionRepository(database, uow)
    from pymentor_core.adapters.sql.accounts import AccountReader

    return AccountReader(database, uow)


def ensure_notification_schema(engine):
    from pymentor_core.app.schema_policy import should_run_legacy_bootstrap
    import os

    if should_run_legacy_bootstrap(
        engine.dialect.name, os.getenv("PYMENTOR_SCHEMA_MODE")
    ):
        from pymentor_core.adapters.legacy_sqlite.bootstrap import (
            ensure_notification_tables,
        )

        ensure_notification_tables(engine)
        return
    from pymentor_core.adapters.sql import models
    from sqlalchemy import inspect

    required = {
        models.BookingNotificationOutbox.__tablename__,
        models.BookingNotificationDeliveryState.__tablename__,
        models.Landing.__tablename__,
        models.LandingTelegramConfig.__tablename__,
        models.LandingNotificationOutbox.__tablename__,
        models.LandingNotificationDeliveryState.__tablename__,
    }
    missing = required.difference(inspect(engine).get_table_names())
    if missing:
        raise RuntimeError(
            "Database migration required before starting notification worker"
        )
    return


def initialize_legacy_schema():
    """Explicit legacy startup, also used by the HTTP-only WSGI adapter."""
    from pymentor_core.app.database import engine
    from pymentor_core.app.schema_policy import should_run_legacy_bootstrap
    import os

    if should_run_legacy_bootstrap(
        engine.dialect.name, os.getenv("PYMENTOR_SCHEMA_MODE")
    ):
        from pymentor_core.adapters.legacy_sqlite.bootstrap import ensure_schema

        ensure_schema()


def configure_bindings():
    from pymentor_core.shared.bindings import Bindings
    from pymentor_core.shared.bindings import install_bindings
    from pymentor_core.adapters.sql.registration import Registration
    from pymentor_core.adapters.sql import activity
    from pymentor_core.adapters.sql import progress
    from pymentor_core.adapters.course_local.provider import LocalCourseProvider
    from pymentor_core.adapters.legacy_runner.provider import LegacyRunner
    from pymentor_core.adapters.sql import (
        bookings,
        administration,
        landings,
        landing_requests,
        notification_outbox,
        email_auth,
    )

    from pymentor_core.adapters.telegram import transport

    install_bindings(
        Bindings(
            registration=Registration(),
            activity=activity,
            progress=progress,
            content=LocalCourseProvider(),
            runner=LegacyRunner(),
            bookings=bookings,
            administration=administration,
            landings=landings,
            landing_requests=landing_requests,
            notifications=notification_outbox,
            telegram=transport,
            email_auth=email_auth,
        )
    )
