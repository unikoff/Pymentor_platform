import asyncio
from datetime import datetime
from datetime import timezone
from hashlib import sha256
from unittest.mock import patch

import pytest

from tools.lab.session_models.c435_pending_service import PendingServiceError
from tools.lab.session_models.c435_pending_service import SyntheticPendingCoordinator
from pymentor_core.adapters.redis.sessions import SessionDigest

TOKEN = '12345678-1234-4234-8234-123456789abc'
DEADLINE = datetime(2030, 1, 1, tzinfo=timezone.utc)
DIGEST = sha256(TOKEN.encode()).hexdigest()


class Database:
    def __init__(self):
        self.sessions = ['old1', 'old2', 'old3']
        self.pending = {}
        self.opened = 0
        self.commits = 0
        self.locked = False

    def __call__(self):
        self.opened += 1
        return Uow(self)


class Uow:
    def __init__(self, database):
        self.database = database
        self.sessions = list(database.sessions)
        self.pending = dict(database.pending)

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        self.database.locked = False

    async def commit(self):
        self.database.sessions = self.sessions
        self.database.pending = self.pending
        self.database.commits += 1


class Redis:
    def __init__(self, db):
        self.db = db
        self.values = {}
        self.failure = None
        self.received = None
        self.lose_after_gate = False

    async def prepare_session(self, user_id, digest, ttl):
        assert not self.db.locked
        self.received = (user_id, digest, ttl)
        if self.failure == 'before':
            raise RuntimeError(TOKEN)
        self.values[str(digest)] = user_id
        if self.failure == 'lost':
            raise RuntimeError(TOKEN)

    async def get_user(self, token):
        assert not self.db.locked
        if self.failure == 'get':
            raise RuntimeError(TOKEN)
        owner = self.values.get(sha256(token.encode()).hexdigest())
        if self.lose_after_gate:
            self.values.clear()
        return owner


async def fake_prepare(db, user_id, digest, generation, deadline, clock):
    db.database.locked = True
    assert digest == DIGEST
    db.pending[digest] = (user_id, generation, deadline)


async def fake_activate(db, user_id, digest, clock):
    db.database.locked = True
    if digest not in db.pending:
        return False
    db.sessions = db.sessions[1:] + [digest]
    del db.pending[digest]
    return True


def run(coro):
    return asyncio.run(coro)


def setup():
    db = Database()
    redis = Redis(db)
    return db, redis, SyntheticPendingCoordinator(db, redis)


def test_preparation_retains_sessions_and_passes_typed_digest():
    async def scenario():
        db, redis, service = setup()
        with patch('tools.lab.session_models.c435_pending_service.sql.prepare', fake_prepare):
            await service.prepare(7, 2, TOKEN, DEADLINE, 60)
        assert db.sessions == ['old1', 'old2', 'old3']
        assert DIGEST in db.pending and db.commits == 1
        assert redis.received == (7, DIGEST, 60)
        assert isinstance(redis.received[1], SessionDigest)
        assert TOKEN not in repr(service)
    run(scenario())


@pytest.mark.parametrize('failure', ['before', 'lost'])
def test_redis_failure_before_sql_preserves_sessions_even_if_reply_lost(failure):
    async def scenario():
        db, redis, service = setup()
        redis.failure = failure
        with pytest.raises(PendingServiceError) as exc:
            await service.prepare(7, 2, TOKEN, DEADLINE, 60)
        assert TOKEN not in str(exc.value)
        assert exc.value.__context__ is None and exc.value.__cause__ is None
        assert db.opened == 0 and db.sessions == ['old1', 'old2', 'old3']
        assert bool(redis.values) == (failure == 'lost')
    run(scenario())


@pytest.mark.parametrize('failure', ['get', 'owner'])
def test_activation_gate_failure_never_opens_sql(failure):
    async def scenario():
        db, redis, service = setup()
        redis.values[DIGEST] = 8 if failure == 'owner' else 7
        redis.failure = failure
        if failure == 'get':
            with pytest.raises(PendingServiceError):
                await service.activate(7, TOKEN)
        else:
            assert await service.activate(7, TOKEN) is False
        assert db.opened == 0 and db.sessions == ['old1', 'old2', 'old3']
    run(scenario())


def test_activation_and_false_do_not_claim_previous_success():
    async def scenario():
        db, redis, service = setup()
        with patch('tools.lab.session_models.c435_pending_service.sql.prepare', fake_prepare), patch('tools.lab.session_models.c435_pending_service.sql.activate', fake_activate):
            await service.prepare(7, 2, TOKEN, DEADLINE, 60)
            assert await service.activate(7, TOKEN) is True
            assert db.sessions == ['old2', 'old3', DIGEST]
            assert await service.activate(7, TOKEN) is False
        assert db.commits == 2
    run(scenario())


def test_redis_loss_after_gate_is_unresolved():
    async def scenario():
        db, redis, service = setup()
        with patch('tools.lab.session_models.c435_pending_service.sql.prepare', fake_prepare), patch('tools.lab.session_models.c435_pending_service.sql.activate', fake_activate):
            await service.prepare(7, 2, TOKEN, DEADLINE, 60)
            redis.lose_after_gate = True
            assert await service.activate(7, TOKEN) is True
        assert DIGEST in db.sessions and DIGEST not in redis.values
    run(scenario())


def test_sql_failure_rolls_back_and_leaves_redis_reservation():
    async def failing(db, *args):
        db.sessions.clear()
        raise RuntimeError(TOKEN)
    async def scenario():
        db, redis, service = setup()
        with patch('tools.lab.session_models.c435_pending_service.sql.prepare', failing):
            with pytest.raises(PendingServiceError) as exc:
                await service.prepare(7, 2, TOKEN, DEADLINE, 60)
        assert TOKEN not in str(exc.value)
        assert db.sessions == ['old1', 'old2', 'old3'] and db.commits == 0
        assert redis.values[DIGEST] == 7
    run(scenario())


@pytest.mark.parametrize('ttl', [0, -1, True, 2592001])
def test_invalid_ttl_has_no_side_effects(ttl):
    async def scenario():
        db, redis, service = setup()
        with pytest.raises(PendingServiceError):
            await service.prepare(7, 2, TOKEN, DEADLINE, ttl)
        assert db.opened == 0 and not redis.values
    run(scenario())


def test_injected_clock_reads_sql_in_same_uow():
    async def scenario():
        db, redis, service = setup()
        async def verify_clock(uow, user_id, digest, generation, deadline, clock):
            class Result:
                def scalar_one(self):
                    return DEADLINE
            async def execute(statement):
                assert str(statement) == 'SELECT clock_timestamp()'
                return Result()
            uow.execute = execute
            assert await clock(uow) == DEADLINE
        with patch('tools.lab.session_models.c435_pending_service.sql.prepare', verify_clock):
            await service.prepare(7, 2, TOKEN, DEADLINE, 1)
    run(scenario())


def test_redis_store_contract_with_fake_client():
    from pymentor_core.adapters.redis.sessions import RedisSessionStore

    class Client:
        def __init__(self):
            self.data = {}

        async def eval(self, script, count, active, prepared, owner, ttl):
            assert count == 2 and active not in self.data and prepared not in self.data
            self.data[prepared] = owner
            return 1

        async def mget(self, *keys):
            return [self.data.get(key) for key in keys]

    async def scenario():
        db = Database()
        store = object.__new__(RedisSessionStore)
        store._prefix = 'test:'
        store._client = Client()
        service = SyntheticPendingCoordinator(db, store)
        with patch('tools.lab.session_models.c435_pending_service.sql.prepare', fake_prepare), patch('tools.lab.session_models.c435_pending_service.sql.activate', fake_activate):
            await service.prepare(7, 2, TOKEN, DEADLINE, 60)
            assert await service.activate(7, TOKEN) is True
        assert db.sessions == ['old2', 'old3', DIGEST]
        assert list(store._client.data) == ['test:token:prepared:' + DIGEST]
    run(scenario())
