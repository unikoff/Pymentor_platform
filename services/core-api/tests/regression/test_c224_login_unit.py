"""Offline control-flow checks; real PostgreSQL/Redis checks are separate."""
import asyncio
from datetime import datetime
from datetime import timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from redis.exceptions import ConnectionError as RedisConnectionError
from sqlalchemy.engine import make_url
from sqlalchemy.exc import SQLAlchemyError

from pymentor_core.adapters.postgres import identity_sessions as async_sessions
from pymentor_core.adapters.postgres.identity_sessions import AsyncIdentitySessions
from pymentor_core.modules.identity.contracts import IdentityUnavailable
from pymentor_core.modules.identity.contracts import InvalidCredentials
from pymentor_core.adapters.redis.sessions import RedisSessionStore


class Database:
    def __init__(self):
        self.engine = SimpleNamespace(url=make_url(
            "postgresql+asyncpg://pymentor_test:unused@127.0.0.1:57152/pymentor_test"))
        self.open_count = 0
        self.commits = 0
        self.deleted = []
        self.added = []
        self.fail_commit = False
        self.session = SimpleNamespace(execute=AsyncMock(), scalar=AsyncMock(),
                                       delete=AsyncMock(side_effect=self.deleted.append),
                                       add=self.added.append, flush=AsyncMock())
        self.session.execute.return_value = SimpleNamespace(one_or_none=lambda: (1, "hash"))
        self.session.scalar.side_effect = self.scalar

    async def scalar(self, statement):
        if "clock_timestamp" in str(statement):
            return datetime.now(timezone.utc)
        return None

    def unit_of_work(self):
        database = self

        class Unit:
            session = database.session

            async def __aenter__(self):
                database.open_count += 1
                return self

            async def __aexit__(self, *args):
                database.open_count -= 1

            async def commit(self):
                database.commits += 1
                if database.fail_commit:
                    raise SQLAlchemyError("unknown commit outcome")

        return Unit()


def create_service(monkeypatch, prepare):
    database = Database()
    store = SimpleNamespace(prepare_session=AsyncMock(side_effect=prepare))
    service = AsyncIdentitySessions(database, store)
    user = SimpleNamespace(id=1, email="x@example.test", password="hash", username="synthetic",
                           subscription_until=None, subscription_plan=None, is_admin=False)
    service._locked_user = AsyncMock(return_value=user)
    service._mark_legacy_consumed = AsyncMock()
    previous = [object(), object(), object()]
    service._active_sessions = AsyncMock(return_value=previous)
    monkeypatch.setattr(async_sessions, "verify_password", lambda *_: True)
    return service, database, user, previous


@pytest.mark.parametrize("lost_reply", [False, True])
def test_redis_failure_precedes_sql_activation(monkeypatch, lost_reply):
    async def run():
        written = []
        database = None

        async def prepare(uid, digest, ttl):
            assert database.open_count == 0
            if lost_reply:
                written.append((uid, digest, ttl))
            raise RedisConnectionError("synthetic")

        service, database, _, _ = create_service(monkeypatch, prepare)
        with pytest.raises(IdentityUnavailable):
            await service.login("x@example.test", "password")
        assert bool(written) == lost_reply
        service._locked_user.assert_not_awaited()
        assert database.commits == 0 and not database.deleted and not database.added

    asyncio.run(run())


def test_activation_rechecks_password_and_limit_after_preparation(monkeypatch):
    async def run():
        database = None

        async def prepare(*_):
            assert database.open_count == 0

        service, database, user, previous = create_service(monkeypatch, prepare)
        user.password = "changed"
        with pytest.raises(InvalidCredentials):
            await service.login("x@example.test", "password")
        assert database.commits == 0 and not database.deleted
        user.password = "hash"
        grant = await service.login("x@example.test", "password")
        assert grant.principal.user_id == 1
        assert database.deleted == previous[:1]
        assert len(database.added) == 1 and database.commits == 1

    asyncio.run(run())


def test_unknown_commit_outcome_does_not_trigger_redis_compensation(monkeypatch):
    async def run():
        service, database, _, _ = create_service(monkeypatch, lambda *_: None)
        service.reconcile_user = AsyncMock()
        database.fail_commit = True
        with pytest.raises(IdentityUnavailable):
            await service.login("x@example.test", "password")
        service.reconcile_user.assert_not_awaited()
        assert service.redis.prepare_session.await_count == 1

    asyncio.run(run())


def test_cancellation_after_prepare_does_not_activate_sql(monkeypatch):
    async def run():
        written = asyncio.Event()
        wait = asyncio.Event()

        async def prepare(*_):
            written.set()
            await wait.wait()

        service, database, _, _ = create_service(monkeypatch, prepare)
        task = asyncio.create_task(service.login("x@example.test", "password"))
        await asyncio.wait_for(written.wait(), 3)
        task.cancel()
        with pytest.raises(asyncio.CancelledError):
            await task
        service._locked_user.assert_not_awaited()
        assert database.commits == 0 and not database.deleted and not database.added

    asyncio.run(run())


def test_sql_token_collision_does_not_evict_existing_sessions(monkeypatch):
    async def run():
        service, database, _, _ = create_service(monkeypatch, lambda *_: None)

        async def scalar(statement):
            if "clock_timestamp" in str(statement):
                return datetime.now(timezone.utc)
            return 99

        database.session.scalar.side_effect = scalar
        with pytest.raises(IdentityUnavailable, match="collision"):
            await service.login("x@example.test", "password")
        assert database.commits == 0 and not database.deleted and not database.added
        service._mark_legacy_consumed.assert_not_awaited()

    asyncio.run(run())


@pytest.mark.parametrize("values, owner", [(["7", None], 7), ([None, "7"], 7),
                                          (["7", "7"], 7), (["7", "8"], None),
                                          ([None, None], None)])
def test_redis_projection_reads_both_namespaces_fail_closed(values, owner):
    async def run():
        store = object.__new__(RedisSessionStore)
        store._prefix = "test:"
        store._client = SimpleNamespace(mget=AsyncMock(return_value=values))
        assert await store.get_user("synthetic") == owner
        keys = store._client.mget.await_args.args
        assert len(keys) == 2 and keys[0].startswith("test:token:")
        assert keys[1].startswith("test:token:prepared:")

    asyncio.run(run())
