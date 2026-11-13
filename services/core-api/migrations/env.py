"""Isolated PostgreSQL migrations; never import application database settings or ORM metadata."""

import asyncio
import os

from alembic import context
from sqlalchemy import pool, text
from sqlalchemy.engine import make_url
from sqlalchemy.ext.asyncio import create_async_engine


# No .env loading or DATABASE_URL fallback is permitted here.
_MIGRATION_ENV_VAR = "PYMENTOR_MIGRATION_URL"
_RUNTIME_MIGRATIONS = context.config.get_main_option("core_runtime_migrations") == "true"
_EXPECTED_DATABASE = (
    os.environ.get("KNOWI_MIGRATION_DATABASE", "") if _RUNTIME_MIGRATIONS else "pymentor_test"
)
_EXPECTED_USER = (
    os.environ.get("KNOWI_MIGRATION_USER", "") if _RUNTIME_MIGRATIONS else "pymentor_test"
)
_EXPECTED_PORT = 57152
_ALLOWED_HOSTS = {"127.0.0.1", "localhost", "::1"}


def _runtime_migration_url() -> str:
    raw = os.environ.get("KNOWI_MIGRATION_URL", "")
    expected_host = os.environ.get("KNOWI_MIGRATION_HOST", "")
    try:
        url = make_url(raw)
        valid = (
            all(value and value.strip() == value
                for value in (expected_host, _EXPECTED_DATABASE, _EXPECTED_USER))
            and url.drivername == "postgresql+asyncpg"
            and url.host == expected_host
            and url.database == _EXPECTED_DATABASE
            and url.username == _EXPECTED_USER
            and not url.query
        )
    except Exception:
        valid = False
    if not valid:
        raise RuntimeError(
            "Runtime migration target rejected: explicit PostgreSQL URL, host, database and user must agree"
        ) from None
    return raw


def _migration_url() -> str:
    if _RUNTIME_MIGRATIONS:
        return _runtime_migration_url()
    raw = os.environ.get(_MIGRATION_ENV_VAR, "")
    if not raw:
        raise RuntimeError(
            "PYMENTOR_MIGRATION_URL is required; this migration never reads DATABASE_URL."
        )

    try:
        url = make_url(raw)
    except Exception as exc:
        raise RuntimeError("Invalid PYMENTOR_MIGRATION_URL.") from exc

    if (
        url.drivername != "postgresql+asyncpg"
        or url.host not in _ALLOWED_HOSTS
        or url.port != _EXPECTED_PORT
        or url.database != _EXPECTED_DATABASE
        or url.username != _EXPECTED_USER
        or bool(url.query)
    ):
        raise RuntimeError(
            "Migration URL rejected: only postgresql+asyncpg to localhost:57152/"
            "pymentor_test as user pymentor_test is permitted."
        )
    return raw


MIGRATION_URL = _migration_url()


def run_migrations_offline() -> None:
    """Generate SQL only after the same allowlist validation as online execution."""
    context.configure(
        url=MIGRATION_URL,
        target_metadata=None,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def _run_migrations(connection) -> None:
    # Verify actual server-reported identity in addition to validating the URL.
    database, user = connection.execute(
        text("SELECT current_database(), current_user")
    ).one()
    if (database, user) != (_EXPECTED_DATABASE, _EXPECTED_USER):
        raise RuntimeError("Connected PostgreSQL database identity did not match test allowlist.")

    # SELECT starts an implicit transaction; end it before Alembic owns DDL.
    connection.commit()
    context.configure(connection=connection, target_metadata=None)
    with context.begin_transaction():
        context.run_migrations()


async def _run_migrations_async() -> None:
    engine = create_async_engine(MIGRATION_URL, poolclass=pool.NullPool)
    try:
        async with engine.connect() as connection:
            await connection.run_sync(_run_migrations)
    finally:
        await engine.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(_run_migrations_async())
