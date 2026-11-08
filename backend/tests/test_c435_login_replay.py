"""Acceptance cases for idempotent local PostgreSQL/Redis login.

The fixture creates only a synthetic account on an explicitly guarded lab.
"""

import asyncio
from uuid import uuid4
from unittest.mock import patch

import pytest
from redis.exceptions import ConnectionError as RedisConnectionError
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from identity.async_sessions import AsyncIdentitySessions, IdentityUnavailable, InvalidSession
from identity.passwords import hash_password
from infrastructure.dual_async_pg import AsyncUnitOfWork
from test_c216_session_flow import run_scenario


def test_retry_of_confirmed_login_never_evicts_another_session():
    async def scenario(db, store, user_id, email, password):
        service = AsyncIdentitySessions(db, store, recovery_key=b"synthetic-recovery-key-32-bytes!!")
        previous = [(await service.login(email, password, operation_id=str(uuid4()))).token
                    for _ in range(3)]
        operation = str(uuid4())
        first = await service.login(email, password, operation_id=operation)
        retry = await service.login(email, password, operation_id=operation)

        assert retry.token == first.token
        with pytest.raises(InvalidSession):
            await service.authenticate(previous[0])
        for token in previous[1:]:
            assert (await service.authenticate(token)).user_id == user_id
        assert (await service.authenticate(retry.token)).user_id == user_id

    run_scenario(scenario)


def test_retry_after_logout_does_not_restore_the_revoked_session():
    async def scenario(db, store, _user_id, email, password):
        service = AsyncIdentitySessions(db, store, recovery_key=b"synthetic-recovery-key-32-bytes!!")
        operation = str(uuid4())
        token = (await service.login(email, password, operation_id=operation)).token
        await service.logout(token)
        with pytest.raises(InvalidSession):
            await service.login(email, password, operation_id=operation)
        with pytest.raises(InvalidSession):
            await service.authenticate(token)

    run_scenario(scenario)


def test_lost_commit_ack_can_be_retried_without_a_second_eviction():
    async def scenario(db, store, user_id, email, password):
        service = AsyncIdentitySessions(db, store, recovery_key=b"synthetic-recovery-key-32-bytes!!")
        previous = [(await service.login(email, password, operation_id=str(uuid4()))).token
                    for _ in range(3)]
        operation = str(uuid4())
        real_commit = AsyncUnitOfWork.commit
        calls = 0

        async def lose_activation_ack(uow):
            nonlocal calls
            calls += 1
            await real_commit(uow)
            if calls == 2:
                raise SQLAlchemyError("synthetic lost activation acknowledgement")

        with patch.object(AsyncUnitOfWork, "commit", lose_activation_ack):
            with pytest.raises(IdentityUnavailable):
                await service.login(email, password, operation_id=operation)
        assert calls == 2
        retried = await service.login(email, password, operation_id=operation)
        assert (await service.authenticate(retried.token)).user_id == user_id
        with pytest.raises(InvalidSession):
            await service.authenticate(previous[0])
        for token in previous[1:]:
            assert (await service.authenticate(token)).user_id == user_id

    run_scenario(scenario)


def test_redis_failure_before_commit_keeps_existing_sessions():
    async def scenario(db, store, user_id, email, password):
        service = AsyncIdentitySessions(db, store, recovery_key=b"synthetic-recovery-key-32-bytes!!")
        previous = [(await service.login(email, password, operation_id=str(uuid4()))).token
                    for _ in range(3)]
        with patch.object(store, "add_user_sessions", side_effect=RedisConnectionError("synthetic outage")):
            with pytest.raises(IdentityUnavailable):
                await service.login(email, password, operation_id=str(uuid4()))
        for token in previous:
            assert (await service.authenticate(token)).user_id == user_id

    run_scenario(scenario)


def test_concurrent_retries_share_one_session():
    async def scenario(db, store, user_id, email, password):
        service = AsyncIdentitySessions(db, store, recovery_key=b"synthetic-recovery-key-32-bytes!!")
        previous = [(await service.login(email, password, operation_id=str(uuid4()))).token
                    for _ in range(3)]
        operation = str(uuid4())
        results = await asyncio.gather(*(
            service.login(email, password, operation_id=operation) for _ in range(3)
        ))
        assert len({grant.token for grant in results}) == 1
        with pytest.raises(InvalidSession):
            await service.authenticate(previous[0])
        for token in previous[1:]:
            assert (await service.authenticate(token)).user_id == user_id
        assert (await service.authenticate(results[0].token)).user_id == user_id

    run_scenario(scenario)


def test_missing_redis_gate_before_commit_preserves_existing_sessions():
    async def scenario(db, store, user_id, email, password):
        service = AsyncIdentitySessions(db, store, recovery_key=b"synthetic-recovery-key-32-bytes!!")
        previous = [(await service.login(email, password, operation_id=str(uuid4()))).token
                    for _ in range(3)]

        async def drop_new_projection(_user_id, _sessions):
            pass

        with patch.object(store, "add_user_sessions", drop_new_projection):
            with pytest.raises(IdentityUnavailable):
                await service.login(email, password, operation_id=str(uuid4()))
        for token in previous:
            assert (await service.authenticate(token)).user_id == user_id

    run_scenario(scenario)


def test_forced_logout_invalidates_a_pending_login_and_its_retry():
    async def scenario(db, store, user_id, email, password):
        service = AsyncIdentitySessions(db, store, recovery_key=b"synthetic-recovery-key-32-bytes!!")
        operation = str(uuid4())
        real_add = store.add_user_sessions
        called = False

        async def add_then_invalidate(uid, sessions):
            nonlocal called
            await real_add(uid, sessions)
            if not called:
                called = True
                await service.invalidate_user_sessions(user_id)

        with patch.object(store, "add_user_sessions", add_then_invalidate):
            with pytest.raises(InvalidSession):
                await service.login(email, password, operation_id=operation)
        assert called
        with pytest.raises(InvalidSession):
            await service.login(email, password, operation_id=operation)

    run_scenario(scenario)


def test_reused_numeric_user_id_does_not_recreate_old_accounts_token():
    async def scenario(db, store, user_id, email, password):
        service = AsyncIdentitySessions(db, store, recovery_key=b"synthetic-recovery-key-32-bytes!!")
        operation = str(uuid4())
        old_token = (await service.login(email, password, operation_id=operation)).token
        async with db.unit_of_work() as uow:
            await uow.session.execute(text("DELETE FROM sessions WHERE user_id=:uid"), {"uid": user_id})
            await uow.session.execute(text("DELETE FROM users WHERE id=:uid"), {"uid": user_id})
            await uow.session.execute(text("""
                INSERT INTO users(id, username, email, password_hash)
                VALUES (:uid, 'synthetic', :email, :hash)
            """), {"uid": user_id, "email": email, "hash": hash_password(password)})
            await uow.commit()
        with pytest.raises(InvalidSession):
            await service.authenticate(old_token)
        new_token = (await service.login(email, password, operation_id=operation)).token
        assert new_token != old_token
        with pytest.raises(InvalidSession):
            await service.authenticate(old_token)

    run_scenario(scenario)


def test_failure_before_activation_commit_preserves_sessions_and_retry_succeeds():
    async def scenario(db, store, user_id, email, password):
        service = AsyncIdentitySessions(db, store, recovery_key=b"synthetic-recovery-key-32-bytes!!")
        previous = [(await service.login(email, password, operation_id=str(uuid4()))).token
                    for _ in range(3)]
        operation = str(uuid4())
        real_commit = AsyncUnitOfWork.commit
        calls = 0

        async def fail_before_activation(uow):
            nonlocal calls
            calls += 1
            if calls == 2:
                raise SQLAlchemyError("synthetic failure before activation commit")
            await real_commit(uow)

        with patch.object(AsyncUnitOfWork, "commit", fail_before_activation):
            with pytest.raises(IdentityUnavailable):
                await service.login(email, password, operation_id=operation)
        assert calls == 2
        for token in previous:
            assert (await service.authenticate(token)).user_id == user_id
        grant = await service.login(email, password, operation_id=operation)
        assert (await service.authenticate(grant.token)).user_id == user_id
        with pytest.raises(InvalidSession):
            await service.authenticate(previous[0])
        for token in previous[1:]:
            assert (await service.authenticate(token)).user_id == user_id

    run_scenario(scenario)


def test_redis_loss_after_commit_is_reconciled_by_repeating_same_operation():
    async def scenario(db, store, user_id, email, password):
        service = AsyncIdentitySessions(db, store, recovery_key=b"synthetic-recovery-key-32-bytes!!")
        previous = [(await service.login(email, password, operation_id=str(uuid4()))).token
                    for _ in range(3)]
        operation = str(uuid4())
        real_get = store.get_user
        calls = 0

        async def unavailable_after_commit(token):
            nonlocal calls
            calls += 1
            if calls > 1:
                raise RedisConnectionError("synthetic Redis outage")
            return await real_get(token)

        with patch.object(store, "get_user", unavailable_after_commit):
            with pytest.raises(IdentityUnavailable):
                await service.login(email, password, operation_id=operation)
        assert calls == 2
        grant = await service.login(email, password, operation_id=operation)
        assert (await service.authenticate(grant.token)).user_id == user_id
        with pytest.raises(InvalidSession):
            await service.authenticate(previous[0])
        for token in previous[1:]:
            assert (await service.authenticate(token)).user_id == user_id
        assert (await service.login(email, password, operation_id=operation)).token == grant.token

    run_scenario(scenario)


def test_expired_pending_operation_cannot_replace_existing_sessions():
    async def scenario(db, store, user_id, email, password):
        service = AsyncIdentitySessions(db, store, recovery_key=b"synthetic-recovery-key-32-bytes!!")
        previous = [(await service.login(email, password, operation_id=str(uuid4()))).token
                    for _ in range(3)]
        operation = str(uuid4())
        real_add = store.add_user_sessions

        async def expire_before_commit(uid, projection):
            await real_add(uid, projection)
            async with db.unit_of_work() as uow:
                await uow.session.execute(text("""
                    UPDATE login_operations SET pending_expires_at=clock_timestamp() - interval '1 second'
                    WHERE operation_id=:op
                """), {"op": operation})
                await uow.commit()

        with patch.object(store, "add_user_sessions", expire_before_commit):
            with pytest.raises(InvalidSession):
                await service.login(email, password, operation_id=operation)
        for token in previous:
            assert (await service.authenticate(token)).user_id == user_id

    run_scenario(scenario)


def test_retry_and_projection_recovery_do_not_extend_sql_session_expiry():
    async def scenario(db, store, _user_id, email, password):
        service = AsyncIdentitySessions(db, store, recovery_key=b"synthetic-recovery-key-32-bytes!!")
        operation = str(uuid4())
        grant = await service.login(email, password, operation_id=operation)
        digest = store._digest(grant.token)
        key = f"{store._prefix}token:{digest}"
        before = await store._client.pttl(key)
        await service.login(email, password, operation_id=operation)
        after = await store._client.pttl(key)
        assert 0 < after <= before
        await store._client.delete(key)
        await service.authenticate(grant.token)
        restored = await store._client.pttl(key)
        async with db.unit_of_work() as uow:
            remaining = await uow.session.scalar(text("""
                SELECT EXTRACT(EPOCH FROM (created_at + interval '30 days' - clock_timestamp())) * 1000
                FROM sessions WHERE session_token=:digest
            """), {"digest": digest})
        assert 0 < restored <= float(remaining) + 500

    run_scenario(scenario)


def test_expired_redis_gate_before_activation_preserves_existing_sessions():
    async def scenario(db, store, user_id, email, password):
        service = AsyncIdentitySessions(db, store, recovery_key=b"synthetic-recovery-key-32-bytes!!")
        previous = [(await service.login(email, password, operation_id=str(uuid4()))).token
                    for _ in range(3)]
        real_add = store.add_user_sessions

        async def expire_new_gate(uid, projection):
            await real_add(uid, projection)
            digest = str(projection[0][0])
            await store._client.pexpire(f"{store._prefix}token:{digest}", 1)
            await asyncio.sleep(0.02)

        with patch.object(store, "add_user_sessions", expire_new_gate):
            with pytest.raises(IdentityUnavailable):
                await service.login(email, password, operation_id=str(uuid4()))
        for token in previous:
            assert (await service.authenticate(token)).user_id == user_id

    run_scenario(scenario)


def test_concurrent_reconcile_and_login_preserve_the_newest_three_sessions():
    async def scenario(db, store, user_id, email, password):
        service = AsyncIdentitySessions(db, store, recovery_key=b"synthetic-recovery-key-32-bytes!!")
        previous = [(await service.login(email, password, operation_id=str(uuid4()))).token
                    for _ in range(3)]
        original_add = store.add_user_sessions
        entered, resume = asyncio.Event(), asyncio.Event()
        first_reconcile = True

        async def pause_reconcile(uid, projection):
            nonlocal first_reconcile
            if len(projection) == 3 and first_reconcile:
                first_reconcile = False
                entered.set()
                await resume.wait()
            return await original_add(uid, projection)

        with patch.object(store, "add_user_sessions", pause_reconcile):
            task = asyncio.create_task(service.reconcile_user(user_id))
            try:
                await asyncio.wait_for(entered.wait(), timeout=5)
                grant = await service.login(email, password, operation_id=str(uuid4()))
            finally:
                resume.set()
                await asyncio.wait_for(task, timeout=5)
        with pytest.raises(InvalidSession):
            await service.authenticate(previous[0])
        for token in [*previous[1:], grant.token]:
            assert (await service.authenticate(token)).user_id == user_id

    run_scenario(scenario)
