"""Runtime policy does not relax the original synthetic adapters."""

from types import SimpleNamespace
from unittest.mock import patch

import pytest
from sqlalchemy.engine import make_url

from pymentor_core.adapters.postgres.identity_sessions import AsyncIdentitySessions
from pymentor_core.adapters.postgres.async_database import AsyncDatabase
from pymentor_core.adapters.redis.sessions import RedisSessionStore
from pymentor_core.adapters.runtime import RuntimeAsyncDatabase
from pymentor_core.adapters.runtime import RuntimeIdentitySessions
from pymentor_core.adapters.runtime import RuntimeRedisSessionStore

PG = "postgresql+asyncpg://app:example@postgres.namespace.svc:5432/core"
REDIS = "rediss://app:example@redis.namespace.svc:6379/1"


def database(url):
    return SimpleNamespace(engine=SimpleNamespace(url=make_url(url)))


def test_original_constructors_keep_synthetic_guards():
    with pytest.raises(ValueError, match="loopback PostgreSQL"):
        AsyncDatabase(PG)
    with pytest.raises(ValueError, match="disposable local Redis"):
        RedisSessionStore(REDIS, prefix="production:")
    with pytest.raises(ValueError, match="disposable local test database"):
        AsyncIdentitySessions(database(PG), None, mode="sql")


def test_runtime_constructors_accept_cluster_dns_without_connecting():
    with patch('pymentor_core.adapters.postgres.async_database.create_async_engine') as engine, \
         patch('pymentor_core.adapters.postgres.async_database.async_sessionmaker'):
        RuntimeAsyncDatabase(PG)
        engine.assert_called_once()
    with patch('pymentor_core.adapters.redis.sessions.BlockingConnectionPool.from_url') as pool, \
         patch('pymentor_core.adapters.redis.sessions.Redis.from_pool'):
        RuntimeRedisSessionStore(REDIS, prefix="production:")
        pool.assert_called_once()
    assert RuntimeIdentitySessions(database(PG), None, mode="sql").mode == "sql"


@pytest.mark.parametrize("url", [
    "postgresql://app@postgres/core", "postgresql+asyncpg://postgres/core",
    "postgresql+asyncpg://app@postgres/", "postgresql+asyncpg://app@/core",
    "postgresql+asyncpg://app@postgres/core?ssl=require",
])
def test_runtime_rejects_invalid_postgres_urls(url):
    with pytest.raises(ValueError, match="Invalid runtime PostgreSQL"):
        RuntimeAsyncDatabase(url)
    with pytest.raises(ValueError, match="Invalid runtime PostgreSQL"):
        RuntimeIdentitySessions(database(url), None, mode="sql")


@pytest.mark.parametrize("url,prefix", [
    ("http://redis:6379/0", "production:"), ("redis:///0", "production:"),
    ("redis://redis/0?max_connections=999", "production:"),
    ("redis://redis:bad/0", "production:"), ("redis://redis/0", " "),
    ("redis://redis/0", "pymentor-c216-test:abc:"),
])
def test_runtime_rejects_invalid_redis_config(url, prefix):
    with pytest.raises(ValueError):
        RuntimeRedisSessionStore(url, prefix=prefix)


def test_runtime_retains_pool_and_identity_guards():
    with pytest.raises(ValueError, match="pool_size"):
        RuntimeAsyncDatabase(PG, pool_size=21)
    with pytest.raises(ValueError, match="bounded pool"):
        RuntimeRedisSessionStore(REDIS, prefix="production:", max_connections=65)
    with pytest.raises(ValueError, match="Redis projection"):
        RuntimeIdentitySessions(database(PG), None, mode="redis")


def test_additive_email_schema_bridge_is_narrow():
    from pymentor_core.app.schema_policy import compatible_schema_revision

    assert compatible_schema_revision("c426_deletion_outbox", "c426_deletion_outbox")
    assert compatible_schema_revision("c503_dual_email_change", "c426_deletion_outbox")
    assert not compatible_schema_revision("c501_verified", "c426_deletion_outbox")
    assert not compatible_schema_revision("unknown", "c426_deletion_outbox")
    assert not compatible_schema_revision("c426_deletion_outbox", "c503_dual_email_change")
