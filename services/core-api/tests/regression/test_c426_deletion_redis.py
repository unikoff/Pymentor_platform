"""Synthetic PostgreSQL/Redis deletion and retry coverage."""

from hashlib import sha256
from unittest.mock import patch
from uuid import uuid4

import pytest
from redis.exceptions import ConnectionError as RedisConnectionError
from sqlalchemy import text

from pymentor_core.adapters.runtime import RuntimeIdentitySessions as AsyncIdentitySessions
from pymentor_core.modules.identity.contracts import InvalidSession
from pymentor_core.adapters.postgres.deletion_cleanup import cleanup_one
from pymentor_core.modules.identity.passwords import hash_password
from pymentor_core.adapters.redis.sessions import SessionDigest
from runtime_scenarios import run_scenario


def test_deletion_retry_cleans_late_redis_projection_and_does_not_revive_session():
    async def scenario(db, store, user_id, email, password):
        identity = AsyncIdentitySessions(db, store, recovery_key=b"synthetic-recovery-key-32-bytes!!")
        token = (await identity.login(email, password, operation_id=str(uuid4()))).token
        digest = sha256(token.encode()).hexdigest()
        async with db.unit_of_work() as uow:
            ref = await uow.session.scalar(text("SELECT lifecycle_id FROM account_lifecycles WHERE user_id=:id"), {"id": user_id})
            await uow.session.execute(text("SELECT pymentor_capture_account_deletion(:id)"), {"id": user_id})
            await uow.session.execute(text("DELETE FROM sessions WHERE user_id=:id"), {"id": user_id})
            await uow.session.execute(text("DELETE FROM users WHERE id=:id"), {"id": user_id})
            await uow.commit()
        async with db.unit_of_work() as uow:
            rows = (await uow.session.execute(text("""
                SELECT token_digest FROM account_deletion_redis_keys WHERE lifecycle_id=:ref
            """), {"ref": ref})).scalars().all()
            assert rows == [digest]
        with pytest.raises(InvalidSession):
            await identity.authenticate(token)
        # A different account can reuse the numerical id, but its new session
        # must not be removed along with the old generation's digest.
        new_email = f"replacement-{uuid4()}@example.test"
        async with db.unit_of_work() as uow:
            await uow.session.execute(text("""
                INSERT INTO users(id, username, email, password_hash)
                VALUES (:id, 'replacement', :email, :password)
            """), {"id": user_id, "email": new_email, "password": hash_password(password)})
            await uow.commit()
        replacement = (await identity.login(new_email, password, operation_id=str(uuid4()))).token
        with patch.object(store, "revoke_user_token", side_effect=RedisConnectionError("offline")):
            assert await cleanup_one(db, store)
        assert await store.get_user(token) == user_id
        async with db.unit_of_work() as uow:
            await uow.session.execute(text("UPDATE account_deletion_redis_keys SET next_attempt_at=clock_timestamp() WHERE lifecycle_id=:ref"), {"ref": ref})
            await uow.commit()
        assert await cleanup_one(db, store)
        assert await store.get_user(token) is None
        assert (await identity.authenticate(replacement)).user_id == user_id
        # Simulate a login that had already passed SQL and projects late.
        async with db.unit_of_work() as uow:
            expiry = await uow.session.scalar(text("SELECT extract(epoch from clock_timestamp() + interval '10 minutes') * 1000"))
            await uow.session.execute(text("UPDATE account_deletion_redis_keys SET next_attempt_at=clock_timestamp() WHERE lifecycle_id=:ref"), {"ref": ref})
            await uow.commit()
        await store.add_user_sessions(user_id, [(SessionDigest(digest), int(expiry))])
        assert await store.get_user(token) == user_id
        assert await cleanup_one(db, store)
        assert await store.get_user(token) is None
        with pytest.raises(InvalidSession):
            await identity.authenticate(token)
        assert (await identity.authenticate(replacement)).user_id == user_id
        async with db.unit_of_work() as uow:
            await uow.session.execute(text("DELETE FROM sessions WHERE user_id=:id"), {"id": user_id})
            await uow.session.execute(text("DELETE FROM users WHERE id=:id AND email=:email"),
                                      {"id": user_id, "email": new_email})
            await uow.commit()

    run_scenario(scenario)


def test_deletion_marker_rolls_back_with_account_in_postgres():
    async def scenario(db, _store, user_id, _email, _password):
        async with db.unit_of_work() as uow:
            await uow.session.execute(text("DELETE FROM users WHERE id=:id"), {"id": user_id})
            assert await uow.session.scalar(text("SELECT count(*) FROM account_deletion_events WHERE user_id=:id"), {"id": user_id}) == 1
            await uow.rollback()
        async with db.unit_of_work() as uow:
            assert await uow.session.scalar(text("SELECT count(*) FROM users WHERE id=:id"), {"id": user_id}) == 1
            assert await uow.session.scalar(text("SELECT count(*) FROM account_deletion_events WHERE user_id=:id"), {"id": user_id}) == 0

    run_scenario(scenario)
