import asyncio
import runpy
import sys
from contextlib import asynccontextmanager
from pathlib import Path
from types import ModuleType
from types import SimpleNamespace
from unittest.mock import MagicMock
import pytest
import sqlalchemy
import tools.lab.postgres_runtime as dual_local
import pymentor_core.adapters.postgres.async_database as async_pg
SYNC_URL = 'postgresql+psycopg://pymentor_test@127.0.0.1:57152/pymentor_test'
ASYNC_URL = 'postgresql+asyncpg://pymentor_test@127.0.0.1:57152/pymentor_test'
OPTIONS = '-c statement_timeout=3000 -c lock_timeout=1000'
ENGINE_FILE = Path(__file__).resolve().parents[4] / 'services' / 'core-api' / 'pymentor_core' / 'app' / 'database.py'



def test_async_opt_in_and_legacy_defaults(monkeypatch):
    capture = MagicMock()
    monkeypatch.setattr(async_pg, 'create_async_engine', capture)
    monkeypatch.setattr(async_pg, 'async_sessionmaker', MagicMock())
    async_pg.AsyncDatabase(ASYNC_URL)
    assert capture.call_args.kwargs['connect_args'] == {'timeout': 10.0, 'command_timeout': 30.0}
    async_pg.AsyncDatabase(ASYNC_URL, command_timeout=3, statement_timeout_ms=3000, lock_timeout_ms=1000)
    assert capture.call_args.kwargs['connect_args'] == {'timeout': 10.0, 'command_timeout': 3, 'server_settings': {'statement_timeout': '3000', 'lock_timeout': '1000'}}

@pytest.mark.parametrize('value', [0, -1, True, 1.5, '3000', float('nan'), 2147483648])
@pytest.mark.parametrize('name', ['statement_timeout_ms', 'lock_timeout_ms'])
def test_invalid_server_timeout_rejected_before_engine_creation(monkeypatch, name, value):
    capture = MagicMock()
    monkeypatch.setattr(async_pg, 'create_async_engine', capture)
    with pytest.raises(ValueError, match='positive integer'):
        async_pg.AsyncDatabase(ASYNC_URL, **{name: value})
    capture.assert_not_called()



def test_sync_runtime_always_uses_bounded_postgres_timeouts(monkeypatch):
    capture = MagicMock()
    monkeypatch.setattr(sqlalchemy, 'create_engine', capture)
    monkeypatch.setenv('DATABASE_URL', SYNC_URL)
    monkeypatch.delenv('PYMENTOR_DUAL_LOCAL_TEST', raising=False)
    runpy.run_path(str(ENGINE_FILE))
    assert capture.call_args.kwargs['connect_args'] == {'connect_timeout': 3, 'options': OPTIONS}


def test_sync_runtime_rejects_retired_lab_startup(monkeypatch):
    capture = MagicMock()
    monkeypatch.setattr(sqlalchemy, 'create_engine', capture)
    monkeypatch.setenv('DATABASE_URL', SYNC_URL)
    monkeypatch.setenv('PYMENTOR_DUAL_LOCAL_TEST', '1')
    with pytest.raises(RuntimeError, match='Laboratory startup'):
        runpy.run_path(str(ENGINE_FILE))
    capture.assert_not_called()
