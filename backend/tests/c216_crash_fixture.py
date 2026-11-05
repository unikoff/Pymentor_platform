"""Crash a synthetic login after Redis writes, before PostgreSQL commit."""
import asyncio
import os

from identity.async_sessions import AsyncIdentitySessions
from infrastructure.dual_async_pg import AsyncDatabase
from infrastructure.redis_sessions import RedisSessionStore


class ExitAfterRedisWrite(RedisSessionStore):
    async def replace_user_sessions(self, user_id, sessions):
        await super().replace_user_sessions(user_id, sessions)
        os._exit(71)


async def main():
    database = AsyncDatabase(os.environ["PYMENTOR_TEST_PG_URL"], pool_size=1, max_overflow=0,
                             pool_timeout=3, connect_timeout=3, command_timeout=3)
    redis = ExitAfterRedisWrite(os.environ["PYMENTOR_TEST_REDIS_URL"], prefix=os.environ["PYMENTOR_C216_PREFIX"])
    await AsyncIdentitySessions(database, redis).login(os.environ["PYMENTOR_C216_EMAIL"],
                                                        os.environ["PYMENTOR_C216_PASSWORD"])


if __name__ == "__main__":
    asyncio.run(main())
