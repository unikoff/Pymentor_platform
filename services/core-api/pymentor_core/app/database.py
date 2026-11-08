import os

from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import sessionmaker

from pymentor_core.app.paths import BACKEND_ROOT

if (
    os.environ.get("PYMENTOR_REQUIRE_DATABASE_URL", "").strip().lower()
    in {"1", "true", "yes", "on"}
    and not os.environ.get("DATABASE_URL", "").strip()
):
    raise RuntimeError("Required environment variable DATABASE_URL is not set")


DEFAULT_DATABASE_URL = f"sqlite:///{(BACKEND_ROOT / 'test.db').as_posix()}"
configured_database_url = os.getenv("DATABASE_URL")

# A relative SQLite path depends on the working directory of the launcher and
# previously created a second test.db in the project root. Keep the default
# database next to the backend regardless of how the application is started.
DATABASE_URL = (
    configured_database_url
    if configured_database_url
    and not configured_database_url.startswith("sqlite:///./")
    else DEFAULT_DATABASE_URL
)

connect_args = {}
engine_options = {}
if os.getenv("PYMENTOR_DUAL_LOCAL_TEST") == "1":
    url = make_url(DATABASE_URL)
    if (
        url.drivername != "postgresql+psycopg"
        or url.host != "127.0.0.1"
        or url.port != 57152
        or url.database != "pymentor_test"
        or url.username not in {"pymentor_test", "pymentor_app"}
        or bool(url.query)
    ):
        raise RuntimeError(
            "Dual local test mode requires the disposable PostgreSQL instance"
        )
    connect_args = {
        "connect_timeout": 3,
        "options": "-c statement_timeout=3000 -c lock_timeout=1000",
    }
    engine_options = {
        "pool_size": 3,
        "max_overflow": 0,
        "pool_timeout": 3,
        "pool_pre_ping": True,
        "hide_parameters": True,
        "isolation_level": "READ COMMITTED",
    }

if (
    os.getenv("PYMENTOR_PROFILE") == "postgres_redis"
    and os.getenv("PYMENTOR_DUAL_LOCAL_TEST") != "1"
):
    url = make_url(DATABASE_URL)
    if (
        url.drivername != "postgresql+psycopg"
        or not url.host
        or not url.database
        or not url.username
    ):
        raise RuntimeError(
            "PostgreSQL runtime requires an explicit psycopg database URL"
        )
    connect_args = {
        "connect_timeout": 3,
        "options": "-c statement_timeout=3000 -c lock_timeout=1000",
    }
    engine_options = {
        "pool_size": 3,
        "max_overflow": 0,
        "pool_timeout": 3,
        "pool_pre_ping": True,
        "hide_parameters": True,
        "isolation_level": "READ COMMITTED",
    }

if make_url(DATABASE_URL).get_backend_name() == "sqlite":
    from pymentor_core.adapters.legacy_sqlite.engine import build_engine

    engine = build_engine(DATABASE_URL, create_engine)
else:
    engine = create_engine(
        url=DATABASE_URL, connect_args=connect_args, echo=False, **engine_options
    )


def matches_database_identity(identity, validated_url):
    return tuple(identity) == (validated_url.database, validated_url.username)


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass
