import asyncio
import runpy
import sys
from contextlib import asynccontextmanager
from pathlib import Path
from types import ModuleType, SimpleNamespace
from unittest.mock import MagicMock

import pytest
import sqlalchemy

import dual_local
import infrastructure.dual_async_pg as async_pg


SYNC_URL = "postgresql+psycopg://pymentor_test@127.0.0.1:57152/pymentor_test"
ASYNC_URL = "postgresql+asyncpg://pymentor_test@127.0.0.1:57152/pymentor_test"
OPTIONS = "-c statement_timeout=3000 -c lock_timeout=1000"
ENGINE_FILE = Path(__file__).resolve().parents[1] / "db" / "engine.py"


def test_sync_timeout_only_with_opt_in(monkeypatch):
    capture = MagicMock()
    monkeypatch.setattr(sqlalchemy, "create_engine", capture)
    monkeypatch.setenv("DATABASE_URL", SYNC_URL)
    monkeypatch.delenv("PYMENTOR_DUAL_LOCAL_TEST", raising=False)
    runpy.run_path(str(ENGINE_FILE))
    assert capture.call_args.kwargs["connect_args"] == {}

    monkeypatch.setenv("PYMENTOR_DUAL_LOCAL_TEST", "1")
    runpy.run_path(str(ENGINE_FILE))
    assert capture.call_args.kwargs["connect_args"] == {"connect_timeout": 3, "options": OPTIONS}


def test_sync_guard_still_rejects_untrusted_url(monkeypatch):
    capture = MagicMock()
    monkeypatch.setattr(sqlalchemy, "create_engine", capture)
    monkeypatch.setenv("PYMENTOR_DUAL_LOCAL_TEST", "1")
    monkeypatch.setenv("DATABASE_URL", SYNC_URL + "?options=untrusted")
    with pytest.raises(RuntimeError, match="disposable"):
        runpy.run_path(str(ENGINE_FILE))
    capture.assert_not_called()


def test_async_opt_in_and_legacy_defaults(monkeypatch):
    capture = MagicMock()
    monkeypatch.setattr(async_pg, "create_async_engine", capture)
    monkeypatch.setattr(async_pg, "async_sessionmaker", MagicMock())
    async_pg.AsyncDatabase(ASYNC_URL)
    assert capture.call_args.kwargs["connect_args"] == {"timeout": 10.0, "command_timeout": 30.0}
    async_pg.AsyncDatabase(ASYNC_URL, command_timeout=3, statement_timeout_ms=3000, lock_timeout_ms=1000)
    assert capture.call_args.kwargs["connect_args"] == {
        "timeout": 10.0, "command_timeout": 3,
        "server_settings": {"statement_timeout": "3000", "lock_timeout": "1000"},
    }


@pytest.mark.parametrize("value", [0, -1, True, 1.5, "3000", float("nan"), 2147483648])
@pytest.mark.parametrize("name", ["statement_timeout_ms", "lock_timeout_ms"])
def test_invalid_server_timeout_rejected_before_engine_creation(monkeypatch, name, value):
    capture = MagicMock()
    monkeypatch.setattr(async_pg, "create_async_engine", capture)
    with pytest.raises(ValueError, match="positive integer"):
        async_pg.AsyncDatabase(ASYNC_URL, **{name: value})
    capture.assert_not_called()


def test_dual_entrypoint_passes_timeouts_to_probe_and_async_pool(monkeypatch):
    # create_app changes these process-wide values; record them so the fixture
    # restores the caller's environment after this test.
    monkeypatch.setenv("DATABASE_URL", "sqlite:///:memory:")
    monkeypatch.setenv("PYMENTOR_SCHEMA_MODE", "legacy")
    monkeypatch.setenv("PYTHON_DOTENV_DISABLED", "1")
    monkeypatch.setenv("PYMENTOR_LOCAL_NOTIFICATIONS", "0")
    monkeypatch.setenv("PYMENTOR_DUAL_LOCAL_TEST", "1")
    monkeypatch.setenv("PYMENTOR_TEST_LOGIN_RECOVERY_KEY", "42" * 32)
    monkeypatch.setenv("PYMENTOR_TEST_PG_URL", ASYNC_URL)
    monkeypatch.setenv("PYMENTOR_TEST_REDIS_URL", "unused")
    monkeypatch.setenv("PYMENTOR_TEST_REDIS_PREFIX", "unused")
    monkeypatch.delitem(sys.modules, "db.engine", raising=False)
    monkeypatch.delitem(sys.modules, "main", raising=False)
    connection = MagicMock()
    connection.execute.return_value.one.return_value = ("pymentor_test", "pymentor_test")
    connection.execute.return_value.scalar_one.return_value = dual_local.DUAL_LOCAL_SCHEMA_REVISION
    probe = MagicMock()
    probe.connect.return_value.__enter__.return_value = connection
    create_engine = MagicMock(return_value=probe)
    monkeypatch.setattr(dual_local, "create_engine", create_engine)

    @asynccontextmanager
    async def original_lifespan(_app):
        yield

    app = SimpleNamespace(router=SimpleNamespace(lifespan_context=original_lifespan), state=SimpleNamespace())
    main = ModuleType("main")
    main.app = app
    probe.dispose.side_effect = lambda: monkeypatch.setitem(sys.modules, "main", main)
    database = MagicMock()
    async def dispose():
        pass
    database.dispose = dispose
    factory = MagicMock(return_value=database)
    monkeypatch.setattr(async_pg, "AsyncDatabase", factory)
    redis_sessions = ModuleType("infrastructure.redis_sessions")
    async_sessions = ModuleType("identity.async_sessions")
    monkeypatch.setitem(sys.modules, "infrastructure.redis_sessions", redis_sessions)
    monkeypatch.setitem(sys.modules, "identity.async_sessions", async_sessions)
    store = MagicMock()
    async def close():
        pass
    store.close = close
    redis_sessions.SessionDigest = str
    monkeypatch.setattr(redis_sessions, "RedisSessionStore", MagicMock(return_value=store), raising=False)
    monkeypatch.setattr(async_sessions, "AsyncIdentitySessions", MagicMock(), raising=False)
    dual_local.create_app()
    assert create_engine.call_args.kwargs["connect_args"] == {"connect_timeout": 3, "options": OPTIONS}

    async def enter():
        async with app.router.lifespan_context(app):
            pass
    asyncio.run(enter())
    assert factory.call_args.kwargs["statement_timeout_ms"] == 3000
    assert factory.call_args.kwargs["lock_timeout_ms"] == 1000
    assert factory.call_args.kwargs["command_timeout"] == 3
    probe.dispose.assert_called_once()
