"""Opt-in disposable PostgreSQL lab entrypoint using the canonical runtime.

Lab address/schema guards are preserved. Never use production or a real snapshot.
"""

import os
import re
import sys

from sqlalchemy import create_engine
from sqlalchemy import text
from sqlalchemy.engine import make_url
from sqlalchemy.pool import NullPool
from pymentor_core.app.schema_policy import SCHEMA_REVISION


def _validated_url(raw: str):
    url = make_url(raw)
    if (
        url.drivername != "postgresql+asyncpg"
        or url.host != "127.0.0.1"
        or url.port != 57152
        or url.database != "pymentor_test"
        or url.username not in {"pymentor_test", "pymentor_app"}
        or bool(url.query)
    ):
        raise ValueError(
            "Only the disposable local PostgreSQL test instance is permitted"
        )
    return url.set(drivername="postgresql+psycopg")


def _validated_recovery_key(raw: str | None) -> bytes:
    if not isinstance(raw, str) or re.fullmatch(r"[0-9a-f]{64}", raw) is None:
        raise ValueError("A 256-bit local login recovery key is required")
    return bytes.fromhex(raw)


def create_app():
    """Build the existing application in a fresh process against test data only."""
    if os.getenv("PYMENTOR_DUAL_LOCAL_TEST") != "1":
        raise RuntimeError("Explicit local test opt-in is required")
    if "main" in sys.modules or "pymentor_core.app.database" in sys.modules:
        raise RuntimeError("Local PostgreSQL mode requires a fresh process")
    recovery_key = _validated_recovery_key(
        os.environ.get("PYMENTOR_TEST_LOGIN_RECOVERY_KEY")
    )
    url = _validated_url(os.environ.get("PYMENTOR_TEST_PG_URL", ""))
    probe = create_engine(
        url,
        poolclass=NullPool,
        connect_args={
            "connect_timeout": 3,
            "options": "-c statement_timeout=3000 -c lock_timeout=1000",
        },
        hide_parameters=True,
    )
    try:
        with probe.connect() as connection:
            identity = tuple(
                connection.execute(
                    text("SELECT current_database(), current_user")
                ).one()
            )
            if identity != (url.database, url.username):
                raise RuntimeError("Unexpected test PostgreSQL identity")
            version = connection.execute(
                text("SELECT version_num FROM alembic_version")
            ).scalar_one()
            if version != SCHEMA_REVISION:
                raise RuntimeError("Test PostgreSQL migration version is not current")
    finally:
        probe.dispose()
    os.environ["DATABASE_URL"] = url.render_as_string(hide_password=False)
    os.environ["PYMENTOR_SCHEMA_MODE"] = "managed"
    os.environ["PYTHON_DOTENV_DISABLED"] = "1"
    os.environ["PYMENTOR_LOCAL_NOTIFICATIONS"] = "0"
    # The old lab opt-in is consumed here, never passed to the serving package.
    from urllib.parse import urlsplit
    redis_url = os.environ.get("PYMENTOR_TEST_REDIS_URL", "")
    redis = urlsplit(redis_url)
    if (redis.scheme != "redis" or redis.hostname != "127.0.0.1" or redis.port != 57146
            or redis.path not in {"", "/0"} or redis.username or redis.password or redis.query or redis.fragment):
        raise ValueError("Expected the disposable local Redis")
    os.environ.pop("PYMENTOR_DUAL_LOCAL_TEST", None)
    os.environ["REDIS_URL"] = redis_url
    os.environ["KNOWI_REDIS_PREFIX"] = os.environ["PYMENTOR_TEST_REDIS_PREFIX"]
    os.environ["KNOWI_LOGIN_RECOVERY_KEY"] = recovery_key.hex()
    from pymentor_core.app.factory import create_app as canonical_create_app
    return canonical_create_app()
