"""Create/migrate named disposable test DBs only; never drop an existing DB."""
import os
from pathlib import Path
import subprocess
import sys

import psycopg
from psycopg import sql
from sqlalchemy.engine import make_url

ROOT = Path(__file__).resolve().parents[2]
DATABASES = ("pymentor_test", "pg03_runtime_test", "pg05_worker_test", "pg08_http_test", "pg08_scenarios_test")


def prepare():
    if os.environ.get("KNOWI_PG02_INTEGRATION") != "1":
        raise RuntimeError("Explicit disposable integration opt-in required")
    url = make_url(os.environ["KNOWI_TEST_PG_URL"])
    if ((url.host, url.port, url.database, url.username) != ("127.0.0.1", 57382, "pymentor_test", "pymentor_test")
            or url.drivername not in {"postgresql+psycopg", "postgresql+asyncpg"} or url.query):
        raise RuntimeError("Disposable test database target rejected")
    with psycopg.connect(url.set(drivername="postgresql", database="postgres").render_as_string(hide_password=False),
                         autocommit=True, connect_timeout=3,
                         options="-c statement_timeout=3000 -c lock_timeout=1000") as connection:
        for name in DATABASES:
            if not connection.execute("SELECT 1 FROM pg_database WHERE datname=%s", (name,)).fetchone():
                connection.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(name)))
    for name in DATABASES:
        env = dict(os.environ, KNOWI_MIGRATION_HOST="127.0.0.1", KNOWI_MIGRATION_DATABASE=name,
                   KNOWI_MIGRATION_USER="pymentor_test",
                   KNOWI_MIGRATION_URL=url.set(drivername="postgresql+asyncpg", database=name).render_as_string(hide_password=False))
        subprocess.run([sys.executable, "-m", "alembic", "-c", "services/core-api/alembic-runtime.ini", "upgrade", "head"],
                       cwd=ROOT, env=env, check=True, timeout=60)
    print("PASS disposable databases prepared at managed Alembic head")


if __name__ == "__main__": prepare()
