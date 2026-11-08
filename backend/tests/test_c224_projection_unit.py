"""Offline ordering and failure tests; no external services are contacted."""
import asyncio
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest
from redis.exceptions import ConnectionError as RedisConnectionError
from sqlalchemy.engine import make_url
from sqlalchemy.exc import SQLAlchemyError

from db import models
from identity.async_sessions import AsyncIdentitySessions, IdentityUnavailable
from identity.legacy_session_import import LegacySession, import_legacy_sessions
from infrastructure.redis_sessions import RedisSessionStore


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


@pytest.mark.parametrize("outcome", ["failure", "lost_reply", "cancel"])
def test_import_never_commits_when_redis_prepare_does_not_return(outcome):
    async def run():
        service, db, store = make_service()
        written = []

        async def add(uid, projection):
            assert db.open_count == 0
            if outcome != "failure":
                written.extend(projection)
            if outcome == "cancel":
                raise asyncio.CancelledError()
            raise RedisConnectionError("synthetic failure")

        store.add_user_sessions = add
        candidate = LegacySession(str(uuid4()), db.now)
        with pytest.raises(asyncio.CancelledError if outcome == "cancel" else IdentityUnavailable):
            await import_legacy_sessions(service, 1, [candidate])
        assert bool(written) == (outcome != "failure")
        assert db.commits == 0 and not db.rows and not db.marker
        service._locked_user.assert_not_awaited()
    asyncio.run(run())


@pytest.mark.parametrize("concurrent", ["login", "login_logout", "import"])
def test_import_rechecks_target_after_preparation(concurrent):
    async def run():
        service, db, store = make_service()

        async def add(uid, projection):
            assert db.open_count == 0
            db.marker = True
            if concurrent != "login_logout":
                db.rows.append(object())

        store.add_user_sessions = add
        with pytest.raises(ValueError, match="already has sessions|already consumed"):
            await import_legacy_sessions(service, 1, [LegacySession(str(uuid4()), db.now)])
        assert db.commits == 0
        assert len(db.rows) == (0 if concurrent == "login_logout" else 1)
    asyncio.run(run())


def test_import_commits_marker_and_sessions_after_add():
    async def run():
        service, db, store = make_service()
        candidate = LegacySession(str(uuid4()), db.now - timedelta(days=1))

        async def add(uid, projection):
            assert db.open_count == 0 and not db.rows and not db.marker
            assert projection == [(candidate.token, int((candidate.created_at + timedelta(days=30)).timestamp() * 1000))]

        store.add_user_sessions = add
        assert await import_legacy_sessions(service, 1, [candidate]) == 1
        assert db.commits == 1 and db.marker and db.rows[0].session_token == candidate.token
    asyncio.run(run())


@pytest.mark.parametrize('username,email', [
    ('synthetic_student', 'student@example.test'),
    ('synthetic_user_admin', 'user-admin@example.test'),
])
def test_import_accepts_only_the_two_exact_pinned_fixture_accounts(username, email):
    async def run():
        service, db, store = make_service()
        db.user.username = username
        db.user.email = email
        service._locked_user.return_value = db.user
        store.add_user_sessions = AsyncMock()
        assert await import_legacy_sessions(service, 1, [LegacySession(str(uuid4()), db.now)]) == 1
    asyncio.run(run())


@pytest.mark.parametrize('username,email', [
    ('synthetic_student', 'other@example.test'),
    ('synthetic_student', 'user-admin@example.test'),
    ('synthetic_user_admin', 'student@example.test'),
    ('synthetic_user_admin', 'other@example.test'),
    ('synthetic_student_changed', 'student@example.test'),
])
def test_import_rejects_mismatched_fixture_identity(username, email):
    async def run():
        service, db, store = make_service()
        db.user.username = username
        db.user.email = email
        store.add_user_sessions = AsyncMock()
        with pytest.raises(ValueError, match='Synthetic target user'):
            await import_legacy_sessions(service, 1, [LegacySession(str(uuid4()), db.now)])
        assert db.commits == 0
        store.add_user_sessions.assert_not_awaited()
    asyncio.run(run())


def test_import_never_commits_when_prepared_gate_is_missing():
    async def run():
        service, db, store = make_service()
        store.add_user_sessions = AsyncMock()
        store.get_user = AsyncMock(return_value=None)
        with pytest.raises(IdentityUnavailable, match='Session projection unavailable'):
            await import_legacy_sessions(service, 1, [LegacySession(str(uuid4()), db.now)])
        assert db.commits == 0 and not db.marker and not db.rows
        service._locked_user.assert_not_awaited()
    asyncio.run(run())


@pytest.mark.parametrize('outcome', ['wrong_owner', 'failure', 'cancel', 'invalid_owner'])
def test_import_checks_each_gate_outside_sql_and_stops_on_error(outcome):
    async def run():
        service, db, store = make_service()
        candidates = [LegacySession(str(uuid4()), db.now - timedelta(seconds=age)) for age in (3, 2, 1)]
        store.add_user_sessions = AsyncMock()
        checked = []

        async def get_user(token):
            assert db.open_count == 0
            checked.append(token)
            if len(checked) == 2:
                if outcome == 'failure':
                    raise RedisConnectionError('synthetic failure')
                if outcome == 'cancel':
                    raise asyncio.CancelledError()
                if outcome == 'invalid_owner':
                    raise ValueError('sensitive invalid redis owner')
                return 2
            return 1

        store.get_user = get_user
        with pytest.raises(asyncio.CancelledError if outcome == 'cancel' else IdentityUnavailable) as error:
            await import_legacy_sessions(service, 1, candidates)
        if outcome == 'invalid_owner':
            import traceback
            assert 'sensitive invalid redis owner' not in ''.join(traceback.format_exception(error.value))
        assert len(checked) == 2 and db.commits == 0 and not db.rows and not db.marker
        service._locked_user.assert_not_awaited()
    asyncio.run(run())


def test_import_sql_error_traceback_does_not_leak_token():
    import traceback

    async def run():
        service, db, store = make_service()
        candidate = LegacySession(str(uuid4()), db.now)
        db.flush_error = 'sensitive synthetic token ' + candidate.token
        store.add_user_sessions = AsyncMock()
        with pytest.raises(IdentityUnavailable) as error:
            await import_legacy_sessions(service, 1, [candidate])
        assert candidate.token not in ''.join(traceback.format_exception(error.value))
        assert db.commits == 0 and not db.rows and not db.marker
    asyncio.run(run())


def test_import_sql_failure_does_not_compensate_or_commit_partial_state():
    async def run():
        service, db, store = make_service()
        db.fail_commit = True
        store.add_user_sessions = AsyncMock()
        store.revoke_user_token = AsyncMock()
        with pytest.raises(IdentityUnavailable):
            await import_legacy_sessions(service, 1, [LegacySession(str(uuid4()), db.now)])
        assert db.commits == 0 and not db.marker and not db.rows
        store.add_user_sessions.assert_awaited_once()
        store.revoke_user_token.assert_not_awaited()
    asyncio.run(run())


def test_import_rechecks_expiration_after_preparation():
    async def run():
        service, db, store = make_service()
        candidate = LegacySession(str(uuid4()), db.now - timedelta(days=30) + timedelta(seconds=1))

        async def add(uid, projection):
            assert len(projection) == 1
            db.now += timedelta(seconds=2)

        store.add_user_sessions = add
        assert await import_legacy_sessions(service, 1, [candidate]) == 0
        assert db.commits == 1 and db.marker and not db.rows
    asyncio.run(run())


def test_strict_import_does_not_drop_session_that_expires_during_preparation():
    async def run():
        service, db, store = make_service()
        candidate = LegacySession(str(uuid4()), db.now - timedelta(days=30) + timedelta(seconds=1))

        async def add(uid, projection):
            assert len(projection) == 1
            db.now += timedelta(seconds=2)

        store.add_user_sessions = add
        with pytest.raises(IdentityUnavailable, match='Legacy session set changed'):
            await import_legacy_sessions(service, 1, [candidate], require_all=True)
        assert db.commits == 0 and not db.rows and not db.marker
    asyncio.run(run())


def test_import_rejects_new_candidate_if_database_clock_moves_backwards():
    async def run():
        service, db, store = make_service()
        candidate = LegacySession(str(uuid4()), db.now - timedelta(days=30, seconds=1))

        async def add(uid, projection):
            assert projection == []
            db.now -= timedelta(seconds=2)

        store.add_user_sessions = add
        with pytest.raises(IdentityUnavailable, match='Session selection changed'):
            await import_legacy_sessions(service, 1, [candidate])
        assert db.commits == 0 and not db.marker and not db.rows
    asyncio.run(run())


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
