import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

load_dotenv()
BACKEND_ROOT = Path(__file__).resolve().parent.parent
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

engine = create_engine(
    url=DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass
