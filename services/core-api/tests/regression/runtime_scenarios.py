"""Synthetic-only scenarios for the single runtime; independent of lab adapters."""
import asyncio
import os
from uuid import uuid4

import pytest
from sqlalchemy import text
from sqlalchemy.engine import make_url

from pymentor_core.adapters.runtime import RuntimeAsyncDatabase, RuntimeRedisSessionStore
from pymentor_core.modules.identity.passwords import hash_password


def run_scenario(scenario):
    if os.getenv("KNOWI_PG02_INTEGRATION") != "1":
        pytest.skip("requires explicitly opted-in task-owned PostgreSQL/Redis")
    url = make_url(os.environ["KNOWI_TEST_PG_URL"])
    assert (url.host, url.port, url.database, url.username) == (
        "127.0.0.1", 57382, "pymentor_test", "pymentor_test")
    redis_url = os.environ["KNOWI_TEST_REDIS_URL"]
    assert redis_url == "redis://127.0.0.1:57381/0"

    async def run():
        database = RuntimeAsyncDatabase(url.set(drivername="postgresql+asyncpg", database="pg08_scenarios_test").render_as_string(hide_password=False))
        prefix = f"pg04-scenario:{uuid4()}:"
        store = RuntimeRedisSessionStore(redis_url, prefix=prefix, max_connections=8)
        email, password = f"{uuid4()}@example.test", "Synthetic-test-password-123"
        user_id = None
        try:
            async with database.unit_of_work() as uow:
                user_id = await uow.session.scalar(text(
                    "INSERT INTO users(username,email,password_hash) VALUES ('synthetic',:email,:hash) RETURNING id"
                ), {"email": email, "hash": hash_password(password)})
                await uow.commit()
            await scenario(database, store, user_id, email, password)
        finally:
            try:
                if user_id is not None:
                    async with database.unit_of_work() as uow:
                        await uow.session.execute(text("DELETE FROM sessions WHERE user_id=:id"), {"id": user_id})
                        await uow.session.execute(text("DELETE FROM users WHERE id=:id AND email=:email"), {"id": user_id, "email": email})
                        await uow.session.execute(text("DELETE FROM account_deletion_events WHERE user_id=:id"), {"id": user_id})
                        await uow.commit()
                keys = [key async for key in store._client.scan_iter(match=prefix + "*")]
                if keys:
                    await store._client.delete(*keys)
            finally:
                await store.close()
                await database.dispose()
    asyncio.run(run())
