"""Subprocess fixture: stop after prepared Redis write, before SQL activation."""
import asyncio
import os
from uuid import UUID

from identity import async_sessions
from infrastructure.dual_async_pg import AsyncDatabase
from infrastructure.redis_sessions import RedisSessionStore


class ExitAfterPrepare(RedisSessionStore):
    async def prepare_session(self, user_id, digest, ttl):
        await super().prepare_session(user_id, digest, ttl)
        os._exit(71)


async def main():
    database = AsyncDatabase(os.environ["PYMENTOR_TEST_PG_URL"], pool_size=1, max_overflow=0,
                             pool_timeout=3, connect_timeout=3, command_timeout=3)
    store = ExitAfterPrepare(os.environ["PYMENTOR_TEST_REDIS_URL"], prefix=os.environ["PYMENTOR_C216_PREFIX"])
    async_sessions.uuid4 = lambda: UUID(os.environ["PYMENTOR_C224_TOKEN"])
    await async_sessions.AsyncIdentitySessions(database, store).login(
        os.environ["PYMENTOR_C216_EMAIL"], os.environ["PYMENTOR_C216_PASSWORD"])


if __name__ == "__main__":
    asyncio.run(main())
