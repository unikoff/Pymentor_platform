"""Explicit opt-in checks against this sprint's disposable PostgreSQL/Redis."""
import os
import subprocess
import sys
from pathlib import Path

import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url


@pytest.fixture
def runtime_env(monkeypatch):
    if os.getenv("KNOWI_PG02_INTEGRATION") != "1":
        pytest.skip("requires the dedicated sprint PostgreSQL/Redis containers")
    pg = os.environ["KNOWI_TEST_PG_URL"]
    redis = os.environ["KNOWI_TEST_REDIS_URL"]
    url = make_url(pg)
    assert (url.host, url.port, url.database, url.username) == (
        "127.0.0.1", 57382, "pymentor_test", "pymentor_test"
    )
    assert redis == "redis://127.0.0.1:57381/0"
    for key in ("PYMENTOR_PROFILE", "PYMENTOR_REDIS_PREFIX",
                "PYMENTOR_LOGIN_RECOVERY_KEY", "PYMENTOR_DUAL_LOCAL_TEST"):
        monkeypatch.delenv(key, raising=False)
    for key, value in {
        "DATABASE_URL": pg,
        "REDIS_URL": redis,
        "KNOWI_REDIS_PREFIX": "pg02:integration:",
        "KNOWI_LOGIN_RECOVERY_KEY": "ab" * 32,
        "PYMENTOR_LOCAL_NOTIFICATIONS": "0",
        "PYTHON_DOTENV_DISABLED": "1",
    }.items():
        monkeypatch.setenv(key, value)
    return pg


def test_real_startup_readiness_and_shutdown_clear_owned_resources(runtime_env):
    from fastapi.testclient import TestClient
    from pymentor_core.app.factory import create_app

    app = create_app()
    with TestClient(app) as client:
        assert client.get("/health/live").status_code == 200
        assert client.get("/health/startup").status_code == 200
        assert client.get("/health/ready").status_code == 200
        assert client.get("/api/user/me").status_code == 401
        assert app.state.identity_sessions is not None
    assert app.state.startup_complete is False
    assert app.state.identity_sessions is None


def test_exception_in_serving_context_still_releases_resources(runtime_env):
    from fastapi.testclient import TestClient
    from pymentor_core.app.factory import create_app

    app = create_app()
    with pytest.raises(RuntimeError, match="synthetic handler failure"):
        with TestClient(app):
            raise RuntimeError("synthetic handler failure")
    assert app.state.startup_complete is False
    assert app.state.identity_sessions is None


def test_wrong_real_postgres_schema_refuses_startup(runtime_env):
    from fastapi.testclient import TestClient
    from pymentor_core.app.factory import create_app

    engine = create_engine(runtime_env)
    try:
        with engine.begin() as connection:
            previous = connection.execute(text("SELECT version_num FROM alembic_version")).scalar_one()
            connection.execute(text("UPDATE alembic_version SET version_num = 'pg02_wrong_schema'"))
        app = create_app()
        try:
            with pytest.raises(RuntimeError, match="schema is not ready"):
                with TestClient(app):
                    pytest.fail("invalid schema reached serving state")
            assert app.state.startup_complete is False
            assert getattr(app.state, "identity_sessions", None) is None
        finally:
            with engine.begin() as connection:
                connection.execute(text("UPDATE alembic_version SET version_num = :revision"),
                                   {"revision": previous})
    finally:
        engine.dispose()


def test_real_redis_connection_failure_never_publishes_identity(runtime_env, monkeypatch):
    from fastapi.testclient import TestClient
    from redis.exceptions import RedisError
    from pymentor_core.app.factory import create_app

    monkeypatch.setenv("REDIS_URL", "redis://127.0.0.1:9/0")
    app = create_app()
    with pytest.raises(RedisError):
        with TestClient(app):
            pytest.fail("unavailable Redis reached serving state")
    assert app.state.startup_complete is False
    assert getattr(app.state, "identity_sessions", None) is None


def test_real_postgres_connection_failure_refuses_startup_in_fresh_process(runtime_env):
    env = os.environ.copy()
    env["DATABASE_URL"] = "postgresql+psycopg://pymentor_test:synthetic@127.0.0.1:9/pymentor_test"
    code = """
from fastapi.testclient import TestClient
from sqlalchemy.exc import OperationalError
from pymentor_core.app.factory import create_app
app = create_app()
try:
    with TestClient(app):
        raise AssertionError("unavailable PostgreSQL reached serving state")
except OperationalError:
    assert app.state.startup_complete is False
else:
    raise AssertionError("unavailable PostgreSQL was accepted")
"""
    result = subprocess.run([sys.executable, "-c", code], env=env,
                            capture_output=True, text=True, timeout=20)
    assert result.returncode == 0, result.stderr
