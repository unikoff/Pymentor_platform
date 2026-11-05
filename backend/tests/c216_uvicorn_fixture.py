"""Explicit factory used only by the synthetic local multi-process test."""
import os

from async_combined_preview import create_combined_preview
from identity.async_sessions import AsyncIdentitySessions
from infrastructure.dual_async_pg import AsyncDatabase
from infrastructure.redis_sessions import RedisSessionStore


def create():
    database = AsyncDatabase(os.environ["PYMENTOR_TEST_PG_URL"], pool_size=2, max_overflow=0,
                             pool_timeout=3, connect_timeout=3, command_timeout=3)
    redis = RedisSessionStore(os.environ["PYMENTOR_TEST_REDIS_URL"],
                              prefix=os.environ["PYMENTOR_C216_PREFIX"], max_connections=4, socket_timeout=2)
    return create_combined_preview(AsyncIdentitySessions(database, redis))
