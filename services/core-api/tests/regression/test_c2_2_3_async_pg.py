"""Real asynchronous transactions against the explicitly disposable local DB."""

import asyncio
import os
from time import perf_counter
from uuid import uuid4

import pytest
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError

from c222_pg_guard import validate_test_url
from pymentor_core.adapters.postgres.async_database import AsyncDatabase
from pymentor_core.adapters.postgres.async_database import AsyncUnitOfWork


@pytest.mark.parametrize("url,options", [
    ("sqlite+aiosqlite:///:memory:", {}),
    ("postgresql+asyncpg://user:password@example.com/db", {}),
    ("postgresql+asyncpg://user:password@localhost/db?host=example.com", {}),
    ("postgresql+asyncpg://user:password@127.0.0.1/db", {"pool_size": 0}),
    ("postgresql+asyncpg://user:password@127.0.0.1/db", {"max_overflow": 11}),
    ("postgresql+asyncpg://user:password@127.0.0.1/db", {"command_timeout": float("inf")}),
])
def test_async_database_rejects_unsafe_or_unbounded_configuration(url, options):
    with pytest.raises(ValueError):
        AsyncDatabase(url, **options)


def test_repeated_cancellations_cannot_interrupt_rollback_or_close():
    async def run():
        ready, rollback_started, release_rollback = asyncio.Event(), asyncio.Event(), asyncio.Event()
        close_started, release_close = asyncio.Event(), asyncio.Event()
        closed = []
        class FakeSession:
            def in_transaction(self):
                return True
            async def rollback(self):
                rollback_started.set()
                await release_rollback.wait()
            async def close(self):
                close_started.set()
                await release_close.wait()
                closed.append(True)
        async def worker():
            async with AsyncUnitOfWork(lambda: FakeSession()):
                ready.set()
                await asyncio.Event().wait()
        task = asyncio.create_task(worker())
        await ready.wait()
        task.cancel()
        await asyncio.wait_for(rollback_started.wait(), 1)
        task.cancel()
        release_rollback.set()
        await asyncio.wait_for(close_started.wait(), 1)
        task.cancel()
        release_close.set()
        with pytest.raises(asyncio.CancelledError):
            await task
        assert closed == [True]
    asyncio.run(run())


def run_real_database_scenario(scenario):
    url = os.getenv("PYMENTOR_TEST_PG_URL")
    if not url:
        pytest.skip("requires explicitly configured disposable local PostgreSQL")
    validate_test_url(url)

    async def run():
        db = AsyncDatabase(url, pool_size=2, max_overflow=0, pool_timeout=3,
                           connect_timeout=3, command_timeout=3)
        tag = f"{uuid4()}@example.test"
        verified = False
        try:
            async with db.unit_of_work() as uow:
                identity = (await uow.session.execute(text("SELECT current_database(), current_user"))).one()
                assert tuple(identity) == ("pymentor_test", "pymentor_test")
                verified = True
            await scenario(db, tag)
        finally:
            try:
                if verified:
                    async with db.unit_of_work() as uow:
                        await uow.session.execute(text("DELETE FROM users WHERE email=:email"), {"email": tag})
                        await uow.commit()
                assert db.engine.pool.checkedout() == 0
            finally:
                await db.dispose()

    asyncio.run(run())


async def insert(uow, email):
    await uow.session.execute(text(
        "INSERT INTO users(username,email,password_hash) VALUES ('synthetic',:email,'synthetic')"
    ), {"email": email})


async def exists(db, email):
    async with db.unit_of_work() as uow:
        return bool(await uow.session.scalar(text("SELECT count(*) FROM users WHERE email=:email"),
                                             {"email": email}))


def test_commit_and_exception_rollback():
    async def scenario(db, email):
        async with db.unit_of_work() as uow:
            await insert(uow, email)
            await uow.commit()
        assert await exists(db, email)
        async with db.unit_of_work() as uow:
            await uow.session.execute(text("DELETE FROM users WHERE email=:email"), {"email": email})
            await uow.commit()
        with pytest.raises(RuntimeError, match="synthetic"):
            async with db.unit_of_work() as uow:
                await insert(uow, email)
                raise RuntimeError("synthetic")
        assert not await exists(db, email)
    run_real_database_scenario(scenario)


def test_uncommitted_work_is_not_persisted_on_exit():
    async def scenario(db, email):
        async with db.unit_of_work() as uow:
            await insert(uow, email)
        assert not await exists(db, email)
    run_real_database_scenario(scenario)


def test_cancel_rolls_back_and_releases_connection():
    async def scenario(db, email):
        ready = asyncio.Event()
        async def write_then_wait():
            async with db.unit_of_work() as uow:
                await insert(uow, email)
                ready.set()
                await asyncio.Event().wait()
        task = asyncio.create_task(write_then_wait())
        await asyncio.wait_for(ready.wait(), timeout=5)
        task.cancel()
        with pytest.raises(asyncio.CancelledError):
            await task
        assert not await exists(db, email)
    run_real_database_scenario(scenario)


def test_cancellation_during_database_query_does_not_persist():
    async def scenario(db, email):
        ready = asyncio.Event()
        async def write_then_query():
            async with db.unit_of_work() as uow:
                await insert(uow, email)
                ready.set()
                await uow.session.execute(text("SELECT pg_sleep(10)"))
        task = asyncio.create_task(write_then_query())
        await asyncio.wait_for(ready.wait(), timeout=5)
        await asyncio.sleep(0.1)
        task.cancel()
        with pytest.raises(asyncio.CancelledError):
            await task
        assert not await exists(db, email)
    run_real_database_scenario(scenario)


def test_timed_out_query_rolls_back():
    async def scenario(db, email):
        with pytest.raises(TimeoutError):
            async with db.unit_of_work() as uow:
                await insert(uow, email)
                await asyncio.wait_for(uow.session.execute(text("SELECT pg_sleep(10)")), timeout=0.1)
        assert not await exists(db, email)
    run_real_database_scenario(scenario)


def test_second_cancellation_during_rollback_still_releases_session():
    async def scenario(db, email):
        ready, cleanup_started, release_cleanup = asyncio.Event(), asyncio.Event(), asyncio.Event()
        async def write_then_wait():
            async with db.unit_of_work() as uow:
                await insert(uow, email)
                original = uow.session.rollback
                async def slow_rollback():
                    cleanup_started.set()
                    await release_cleanup.wait()
                    await original()
                uow.session.rollback = slow_rollback
                ready.set()
                await asyncio.Event().wait()
        task = asyncio.create_task(write_then_wait())
        await asyncio.wait_for(ready.wait(), timeout=5)
        task.cancel()
        await asyncio.wait_for(cleanup_started.wait(), timeout=5)
        task.cancel()
        release_cleanup.set()
        with pytest.raises(asyncio.CancelledError):
            await task
        assert not await exists(db, email)
    run_real_database_scenario(scenario)


def test_concurrent_work_uses_separate_sessions_and_connections():
    async def scenario(db, email):
        ready = asyncio.Event()
        entered = []
        async def worker():
            async with db.unit_of_work() as uow:
                pid = await uow.session.scalar(text("SELECT pg_backend_pid()"))
                entered.append((id(uow.session), pid))
                if len(entered) == 2:
                    ready.set()
                await asyncio.wait_for(ready.wait(), timeout=5)
        await asyncio.gather(worker(), worker())
        assert len({item[0] for item in entered}) == 2
        assert len({item[1] for item in entered}) == 2
    run_real_database_scenario(scenario)


def test_waiting_on_postgres_does_not_block_event_loop():
    async def scenario(db, email):
        started = asyncio.Event()
        ticks = []
        start = perf_counter()
        async def wait_on_db():
            async with db.unit_of_work() as uow:
                started.set()
                await uow.session.execute(text("SELECT pg_sleep(0.5)"))
        async def heartbeat():
            await started.wait()
            await asyncio.sleep(0.05)
            ticks.append(perf_counter() - start)
        await asyncio.gather(wait_on_db(), heartbeat())
        assert ticks and ticks[0] < 0.35
    run_real_database_scenario(scenario)


def test_failed_commit_does_not_leak_broken_session():
    async def scenario(db, email):
        async with db.unit_of_work() as uow:
            await insert(uow, email)
            await uow.commit()
        with pytest.raises(IntegrityError):
            async with db.unit_of_work() as uow:
                await insert(uow, email)
                await uow.commit()
        assert await exists(db, email)
    run_real_database_scenario(scenario)
