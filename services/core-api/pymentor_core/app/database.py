"""PostgreSQL-only synchronous bridge for existing request-scoped SQL paths."""
import os

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from pymentor_core.app.settings import postgres_database_url

if os.getenv("PYMENTOR_DUAL_LOCAL_TEST") == "1":
    raise RuntimeError("Laboratory startup is not a Core runtime")
if os.getenv("PYMENTOR_SCHEMA_MODE") not in (None, "managed"):
    raise RuntimeError("Core requires externally managed PostgreSQL migrations")

DATABASE_URL = postgres_database_url(os.getenv("DATABASE_URL", "")).set(
    drivername="postgresql+psycopg"
).render_as_string(hide_password=False)
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
engine = create_engine(
    url=DATABASE_URL, connect_args=connect_args, echo=False, **engine_options
)


def matches_database_identity(identity, validated_url):
    return tuple(identity) == (validated_url.database, validated_url.username)


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass
