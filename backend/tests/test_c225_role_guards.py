import os
import subprocess
import sys
from types import SimpleNamespace

import pytest
from sqlalchemy.engine import make_url

from c222_pg_guard import validate_test_url
from db.engine import matches_database_identity
from dual_local import _validated_url, create_app
from identity.async_sessions import AsyncIdentitySessions


PYTHON = sys.executable


@pytest.mark.parametrize("role", ["pymentor_test", "pymentor_app"])
def test_async_sessions_accept_only_named_disposable_roles(role):
    database = SimpleNamespace(engine=SimpleNamespace(url=make_url(
        f"postgresql+asyncpg://{role}@127.0.0.1:57152/pymentor_test"
    )))
    assert AsyncIdentitySessions(database, object()).database is database


def test_async_sessions_reject_admin_role():
    database = SimpleNamespace(engine=SimpleNamespace(url=make_url(
        "postgresql+asyncpg://pymentor_admin@127.0.0.1:57152/pymentor_test"
    )))
    with pytest.raises(ValueError, match="disposable"):
        AsyncIdentitySessions(database, object())


@pytest.mark.parametrize("role", ["pymentor_test", "pymentor_app"])
def test_dual_local_url_accepts_only_runtime_roles(role):
    url = _validated_url(
        f"postgresql+asyncpg://{role}@127.0.0.1:57152/pymentor_test"
    )

    assert url.drivername == "postgresql+psycopg"
    assert url.username == role
    assert url.database == "pymentor_test"


@pytest.mark.parametrize("url", [
    "postgresql+asyncpg://pymentor_admin@127.0.0.1:57152/pymentor_test",
    "postgresql+asyncpg://pymentor_app@localhost:57152/pymentor_test",
    "postgresql+asyncpg://pymentor_app@127.0.0.1:5432/pymentor_test",
    "postgresql+asyncpg://pymentor_app@127.0.0.1:57152/other",
    "postgresql+asyncpg://pymentor_app@127.0.0.1:57152/pymentor_test?sslmode=require",
    "postgresql+asyncpg://pymentor_app@example.com:57152/pymentor_test",
    "postgresql+psycopg://pymentor_app@127.0.0.1:57152/pymentor_test",
])
def test_dual_local_url_rejects_roles_and_endpoints_outside_allowlist(url):
    with pytest.raises(ValueError, match="disposable"):
        _validated_url(url)


@pytest.mark.parametrize("role", ["pymentor_test", "pymentor_app"])
def test_runtime_engine_accepts_allowed_role_without_connecting(role):
    env = os.environ.copy()
    env.update(
        DATABASE_URL=f"postgresql+psycopg://{role}@127.0.0.1:57152/pymentor_test",
        PYMENTOR_DUAL_LOCAL_TEST="1",
        PYTHONPATH=os.pathsep.join(filter(None, ["backend", env.get("PYTHONPATH", "")])),
        PYTHON_DOTENV_DISABLED="1",
    )
    result = subprocess.run(
        [PYTHON, "-c", "from db.engine import engine; print(engine.url.username)"],
        env=env, capture_output=True, text=True, timeout=15,
    )

    assert result.returncode == 0, result.stderr
    assert result.stdout.strip() == role


def test_runtime_engine_rejects_other_roles_without_connecting():
    env = os.environ.copy()
    env.update(
        DATABASE_URL="postgresql+psycopg://pymentor_admin@127.0.0.1:57152/pymentor_test",
        PYMENTOR_DUAL_LOCAL_TEST="1",
        PYTHONPATH=os.pathsep.join(filter(None, ["backend", env.get("PYTHONPATH", "")])),
        PYTHON_DOTENV_DISABLED="1",
    )
    result = subprocess.run(
        [PYTHON, "-c", "from db.engine import engine"],
        env=env, capture_output=True, text=True, timeout=15,
    )

    assert result.returncode != 0
    assert "disposable PostgreSQL" in result.stderr


def test_pg_migrator_guard_still_accepts_only_legacy_test_role():
    url = validate_test_url(
        "postgresql+asyncpg://pymentor_test@127.0.0.1:57152/pymentor_test"
    )
    assert url.username == "pymentor_test"

    with pytest.raises(ValueError):
        validate_test_url(
            "postgresql+asyncpg://pymentor_app@127.0.0.1:57152/pymentor_test"
        )


def test_dual_local_probe_rejects_database_identity_not_matching_validated_url(monkeypatch):
    class Result:
        def one(self):
            return "pymentor_test", "pymentor_test"

    class Connection:
        def __enter__(self):
            return self

        def __exit__(self, *_args):
            return False

        def execute(self, _statement):
            return Result()

    class Probe:
        def connect(self):
            return Connection()

        def dispose(self):
            pass

    monkeypatch.setenv("PYMENTOR_DUAL_LOCAL_TEST", "1")
    monkeypatch.setenv("PYMENTOR_TEST_LOGIN_RECOVERY_KEY", "42" * 32)
    monkeypatch.setenv(
        "PYMENTOR_TEST_PG_URL",
        "postgresql+asyncpg://pymentor_app@127.0.0.1:57152/pymentor_test",
    )
    monkeypatch.setattr("dual_local.create_engine", lambda *_args, **_kwargs: Probe())
    monkeypatch.delitem(__import__("sys").modules, "main", raising=False)
    monkeypatch.delitem(__import__("sys").modules, "db.engine", raising=False)

    with pytest.raises(RuntimeError, match="identity"):
        create_app()


@pytest.mark.parametrize("role", ["pymentor_test", "pymentor_app"])
def test_readiness_identity_matches_only_the_role_in_validated_engine_url(role):
    validated_url = make_url(
        f"postgresql+psycopg://{role}@127.0.0.1:57152/pymentor_test"
    )

    assert matches_database_identity(("pymentor_test", role), validated_url)
    other_role = "pymentor_app" if role == "pymentor_test" else "pymentor_test"
    assert not matches_database_identity(("pymentor_test", other_role), validated_url)


@pytest.mark.parametrize("database_url", [
    "postgresql+psycopg://pymentor_app@localhost:57152/pymentor_test",
    "postgresql+psycopg://pymentor_app@127.0.0.1:5432/pymentor_test",
    "postgresql+psycopg://pymentor_app@127.0.0.1:57152/other",
    "postgresql+psycopg://pymentor_app@127.0.0.1:57152/pymentor_test?sslmode=require",
    "postgresql+asyncpg://pymentor_app@127.0.0.1:57152/pymentor_test",
])
def test_runtime_engine_rejects_other_endpoints_without_connecting(database_url):
    env = os.environ.copy()
    env.update(
        DATABASE_URL=database_url,
        PYMENTOR_DUAL_LOCAL_TEST="1",
        PYTHONPATH=os.pathsep.join(filter(None, ["backend", env.get("PYTHONPATH", "")])),
        PYTHON_DOTENV_DISABLED="1",
    )
    result = subprocess.run(
        [PYTHON, "-c", "from db.engine import engine"],
        env=env, capture_output=True, text=True, timeout=15,
    )

    assert result.returncode != 0
    assert "disposable PostgreSQL" in result.stderr
