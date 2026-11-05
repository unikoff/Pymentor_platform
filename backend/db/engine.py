import os

from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from core.config import BACKEND_ROOT
DEFAULT_DATABASE_URL = f"sqlite:///{(BACKEND_ROOT / 'test.db').as_posix()}"
configured_database_url = os.getenv("DATABASE_URL")

# A relative SQLite path depends on the working directory of the launcher and
# previously created a second test.db in the project root. Keep the default
# database next to the backend regardless of how the application is started.
DATABASE_URL = (
    configured_database_url
    if configured_database_url and not configured_database_url.startswith("sqlite:///./")
    else DEFAULT_DATABASE_URL
)

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine_options = {}
if os.getenv("PYMENTOR_DUAL_LOCAL_TEST") == "1":
    url = make_url(DATABASE_URL)
    if (url.drivername != "postgresql+psycopg" or url.host != "127.0.0.1" or url.port != 57152
            or url.database != "pymentor_test" or url.username != "pymentor_test" or bool(url.query)):
        raise RuntimeError("Dual local test mode requires the disposable PostgreSQL instance")
    connect_args = {"connect_timeout": 3}
    engine_options = {"pool_size": 3, "max_overflow": 0, "pool_timeout": 3,
                      "pool_pre_ping": True, "hide_parameters": True,
                      "isolation_level": "READ COMMITTED"}

engine = create_engine(url=DATABASE_URL, connect_args=connect_args, echo=False, **engine_options)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass
