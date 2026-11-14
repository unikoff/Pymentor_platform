"""Offline ordering and failure tests; no external services are contacted."""
import asyncio
from datetime import datetime
from datetime import timedelta
from datetime import timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest
from redis.exceptions import ConnectionError as RedisConnectionError
from sqlalchemy.engine import make_url
from sqlalchemy.exc import SQLAlchemyError

from pymentor_core.adapters.sql import models
from pymentor_core.adapters.postgres.identity_sessions import AsyncIdentitySessions
from pymentor_core.modules.identity.contracts import IdentityUnavailable
from pymentor_core.adapters.redis.sessions import RedisSessionStore


class Database:
    def __init__(self):
        self.engine = SimpleNamespace(url=make_url(
            "postgresql+asyncpg://pymentor_test:unused@127.0.0.1:57152/pymentor_test"))
        self.user = SimpleNamespace(id=1, username="synthetic", email="one@example.test")
        self.open_count = 0
        self.commits = 0
        self.marker = False
        self.rows = []
        self.now = datetime.now(timezone.utc)
        self.fail_commit = False
        self.flush_error = None

    def unit_of_work(self):
        database = self

        class Unit:
            def __init__(self):
                self.pending = []
                self.marked = False
                self.session = self

            async def __aenter__(self):
                database.open_count += 1
                return self

            async def __aexit__(self, *args):
                database.open_count -= 1

            async def execute(self, statement, *args):
                if "current_database" in str(statement):
                    return SimpleNamespace(one=lambda: ("pymentor_test", "pymentor_test"))
                if "INSERT INTO session_import_markers" in str(statement):
                    self.marked = True

            async def scalar(self, statement, *args):
                query = str(statement)
                if "count(" in query:
                    return len(database.rows)
                if "SELECT EXISTS" in query:
                    return database.marker
                if "clock_timestamp" in query:
                    return database.now
                if "FROM users" in query:
                    return database.user
                return None

            def add_all(self, records):
                self.pending.extend(records)

            async def flush(self):
                if database.flush_error is not None:
                    raise SQLAlchemyError(database.flush_error)

            async def commit(self):
                if database.fail_commit:
                    raise SQLAlchemyError("synthetic failure before commit")
                database.rows.extend(self.pending)
                database.marker |= self.marked
                database.commits += 1

            async def delete(self, item):
                database.rows.remove(item)

        return Unit()


def make_service():
    db = Database()
    store = object.__new__(RedisSessionStore)
    store.get_user = AsyncMock(return_value=1)
    service = AsyncIdentitySessions(db, store)
    service._locked_user = AsyncMock(return_value=db.user)
    return service, db, store


def test_reconcile_closes_transaction_before_add_and_never_replaces():
    async def run():
        service, db, store = make_service()
        token = str(uuid4())
        record = models.Session(user_id=1, session_token=token, created_at=db.now)
        service._active_sessions = AsyncMock(return_value=[record])

        async def add(uid, projection):
            assert db.open_count == 0 and db.commits == 0
            assert projection == [(token, int((db.now + timedelta(days=30)).timestamp() * 1000))]

        store.add_user_sessions = add
        store.replace_user_sessions = AsyncMock()
        await service.reconcile_user(1)
        assert db.commits == 1
        store.replace_user_sessions.assert_not_awaited()
    asyncio.run(run())


def test_reconcile_stops_after_bounded_concurrent_changes():
    async def run():
        service, db, store = make_service()
        records = [models.Session(id=index, user_id=1, session_token=str(uuid4()), created_at=db.now)
                   for index in range(1, 7)]
        service._active_sessions = AsyncMock(side_effect=[[item] for item in records])
        store.add_user_sessions = AsyncMock()
        with pytest.raises(IdentityUnavailable, match="changed concurrently"):
            await service.reconcile_user(1)
        assert store.add_user_sessions.await_count == 3
        assert db.commits == 0
        assert len(db.rows) == 0
    asyncio.run(run())
