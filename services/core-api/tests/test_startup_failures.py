import asyncio
from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest
from sqlalchemy.engine import make_url

from pymentor_core.app.settings import Settings

ENV={'DATABASE_URL':'postgresql+asyncpg://app:p@postgres/core', 'REDIS_URL':'redis://redis/0',
     'PYMENTOR_REDIS_PREFIX':'local:core:', 'PYMENTOR_LOGIN_RECOVERY_KEY':'ab'*32}

@pytest.mark.parametrize('key,value',[
    ('DATABASE_URL','postgresql+asyncpg://app:p@postgres/core?options=unsafe'),
    ('REDIS_URL','redis://redis/0?max_connections=999'),
    ('REDIS_URL','redis://redis/0#unexpected'),
])
def test_configuration_rejects_parameters_not_supported_by_runtime(key,value):
    from pathlib import Path
    env=dict(ENV); env[key]=value
    with pytest.raises(ValueError):
        Settings.from_environment('postgres_redis',env,legacy_root=Path.cwd())

def test_worker_refuses_to_reuse_loaded_engine_before_mutating_environment(monkeypatch):
    from pymentor_core.app.worker import main
    from pymentor_core.app.database import engine
    assert engine.url.get_backend_name()=='sqlite'
    for key,value in ENV.items(): monkeypatch.setenv(key,value)
    before=__import__('os').environ['DATABASE_URL']
    with pytest.raises(RuntimeError,match='fresh process'):
        main(profile='postgres_redis')
    assert __import__('os').environ['DATABASE_URL']==before

def test_lab_factory_rejects_a_preloaded_different_database(monkeypatch):
    from pymentor_core.app.factory import create_app
    from pymentor_core.app.database import engine
    assert engine.url.get_backend_name()=='sqlite'
    monkeypatch.setenv('PYMENTOR_DUAL_LOCAL_TEST','1')
    monkeypatch.setenv('PYMENTOR_TEST_PG_URL','postgresql+asyncpg://pymentor_test@127.0.0.1:57152/pymentor_test')
    with pytest.raises(RuntimeError,match='fresh process'):
        create_app(laboratory=True)

def test_failed_redis_startup_closes_resources_without_publishing_identity(monkeypatch):
    import sqlalchemy
    import pymentor_core.app.database as sql
    import pymentor_core.adapters.runtime as runtime
    from pymentor_core.app.factory import DUAL_LOCAL_REQUIRED_TABLES
    from pymentor_core.app.factory import DUAL_LOCAL_SCHEMA_REVISION
    from pymentor_core.app.wiring import postgres_resources
    closed=[]
    class Database:
        def __init__(self,*args,**kwargs): pass
        async def dispose(self): closed.append('database')
    class Store:
        def __init__(self,*args,**kwargs): pass
        async def ping(self): raise OSError('synthetic Redis unavailable')
        async def close(self): closed.append('redis')
    class Identity:
        def __init__(self,*args,**kwargs): pass
        async def check_async_database(self): pass
    connection=MagicMock()
    connection.execute.side_effect=[SimpleNamespace(one=lambda:('core','app')),SimpleNamespace(scalar_one=lambda:DUAL_LOCAL_SCHEMA_REVISION)]
    engine=MagicMock(); engine.url=make_url('postgresql+psycopg://app:p@postgres/core')
    engine.connect.return_value.__enter__.return_value=connection
    monkeypatch.setattr(sql,'engine',engine)
    monkeypatch.setattr(sqlalchemy,'inspect',lambda c:SimpleNamespace(get_table_names=lambda:DUAL_LOCAL_REQUIRED_TABLES))
    monkeypatch.setattr(runtime,'RuntimeAsyncDatabase',Database)
    monkeypatch.setattr(runtime,'RuntimeRedisSessionStore',Store)
    monkeypatch.setattr(runtime,'RuntimeIdentitySessions',Identity)
    app=SimpleNamespace(state=SimpleNamespace())
    settings=SimpleNamespace(async_database_url='unused',redis_url='unused',redis_prefix='unused:',login_recovery_key='ab'*32)
    async def run():
        async with postgres_resources(app,settings):
            pytest.fail('startup should fail')
    with pytest.raises(OSError,match='synthetic Redis'):
        asyncio.run(run())
    assert closed==['redis','database']
    assert getattr(app.state,'local_async_identity',None) is None


def test_normal_postgres_http_uses_async_identity_without_lab_flag(monkeypatch):
    from pymentor_core.modules.identity.api.sessions import _local_async_identity
    monkeypatch.delenv('PYMENTOR_DUAL_LOCAL_TEST',raising=False)
    sessions=object()
    request=SimpleNamespace(app=SimpleNamespace(state=SimpleNamespace(profile='postgres_redis',local_async_identity=sessions)))
    assert _local_async_identity(request) is sessions
    request.app.state.local_async_identity=None
    from fastapi import HTTPException
    with pytest.raises(HTTPException) as error:
        _local_async_identity(request)
    assert error.value.status_code==503
