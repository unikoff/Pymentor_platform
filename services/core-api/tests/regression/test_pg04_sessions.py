from hashlib import sha256
from uuid import uuid4

import pytest
from sqlalchemy import text

from pymentor_core.adapters.runtime import RuntimeIdentitySessions, RuntimeRedisSessionStore
from pymentor_core.modules.identity.contracts import IdentityUnavailable, InvalidSession
from runtime_scenarios import run_scenario

KEY = b"synthetic-recovery-key-32-bytes!!"


def test_runtime_expiry_and_current_postgres_rights_are_enforced():
    async def scenario(db, store, user_id, email, password):
        service = RuntimeIdentitySessions(db, store, recovery_key=KEY)
        token = (await service.login(email, password, operation_id=str(uuid4()))).token
        async with db.unit_of_work() as uow:
            await uow.session.execute(text("UPDATE users SET is_admin=true WHERE id=:id"), {"id": user_id})
            await uow.commit()
        assert (await service.authenticate(token)).is_admin is True
        assert 0 < await store._client.pttl(f"{store._prefix}token:{sha256(token.encode()).hexdigest()}") <= 30 * 86400 * 1000
        async with db.unit_of_work() as uow:
            await uow.session.execute(text("UPDATE sessions SET created_at=clock_timestamp()-interval '31 days' WHERE user_id=:id"), {"id": user_id})
            await uow.commit()
        with pytest.raises(InvalidSession):
            await service.authenticate(token)
    run_scenario(scenario)


def test_actual_redis_outage_cannot_use_durable_sql_session():
    async def scenario(db, store, user_id, email, password):
        service = RuntimeIdentitySessions(db, store, recovery_key=KEY)
        token = (await service.login(email, password, operation_id=str(uuid4()))).token
        broken = RuntimeRedisSessionStore("redis://127.0.0.1:9/0", prefix="pg04-unavailable:", socket_timeout=0.2)
        try:
            unavailable = RuntimeIdentitySessions(db, broken, recovery_key=KEY)
            with pytest.raises(IdentityUnavailable):
                await unavailable.authenticate(token)
            with pytest.raises(IdentityUnavailable):
                await unavailable.login(email, password, operation_id=str(uuid4()))
        finally:
            await broken.close()
        assert (await service.authenticate(token)).user_id == user_id
    run_scenario(scenario)


def test_email_limits_are_shared_by_independent_redis_clients():
    async def scenario(db, store, user_id, email, password):
        import os
        other = RuntimeRedisSessionStore(os.environ["KNOWI_TEST_REDIS_URL"], prefix=store._prefix)
        digest = sha256(email.encode()).hexdigest()
        try:
            assert await store.allow_email_request(digest, 1)
            assert not await other.allow_email_request(digest, 1)
            assert 0 < await other._client.ttl(f"{store._prefix}email-rate:{digest}") <= 60
        finally:
            await other.close()
    run_scenario(scenario)
