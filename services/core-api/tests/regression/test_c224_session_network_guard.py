"""C2.2.4 login guards; execute only with the guarded synthetic PG/Redis fixture."""

import asyncio
from unittest.mock import patch
from uuid import UUID
from uuid import uuid4

import pytest
from redis.exceptions import ConnectionError as RedisConnectionError
from sqlalchemy import select
from sqlalchemy.exc import DBAPIError

from pymentor_core.adapters.sql import models
from pymentor_core.adapters.postgres.identity_sessions import AsyncIdentitySessions
from pymentor_core.modules.identity.contracts import IdentityUnavailable
from pymentor_core.modules.identity.contracts import InvalidSession
from test_c216_session_flow import run_scenario


def test_waiting_for_redis_does_not_hold_user_write_lock():
    async def scenario(db, store, user_id, email, password):
        entered, release = asyncio.Event(), asyncio.Event()

        class SlowRedis:
            async def prepare_session(self, uid, digest, ttl):
                entered.set()
                await release.wait()
                return await store.prepare_session(uid, digest, ttl)

        task = asyncio.create_task(AsyncIdentitySessions(db, SlowRedis()).login(email, password))
        try:
            await asyncio.wait_for(entered.wait(), 3)
            async with db.unit_of_work() as other:
                try:
                    await other.session.execute(
                        select(models.User.id).where(models.User.id == user_id).with_for_update(nowait=True)
                    )
                except DBAPIError as error:
                    if getattr(error.orig, "sqlstate", None) != "55P03":
                        raise
                    pytest.fail("user row remains locked while Redis is waiting")
        finally:
            release.set()
            await task

    run_scenario(scenario)


@pytest.mark.parametrize("legacy_keys", [False, True])
def test_failed_fourth_login_preserves_three_old_sessions_after_redis_recovers(legacy_keys):
    async def scenario(db, store, user_id, email, password):
        working = AsyncIdentitySessions(db, store)
        tokens = [(await working.login(email, password)).token for _ in range(3)]
        if legacy_keys:
            await working.reconcile_user(user_id)
            await store._client.delete(*(f"{store._prefix}token:prepared:{store._digest(token)}"
                                         for token in tokens))
        failed_token = uuid4()

        class LostReplyThenOffline:
            calls = 0

            async def prepare_session(self, uid, digest, ttl):
                self.calls += 1
                if self.calls == 1:
                    await store.prepare_session(uid, digest, ttl)
                raise RedisConnectionError("synthetic Redis outage")

            async def get_user(self, token):
                return await store.get_user(token)

        with patch('pymentor_core.adapters.postgres.identity_sessions.uuid4', return_value=failed_token):
            with pytest.raises(IdentityUnavailable):
                await AsyncIdentitySessions(db, LostReplyThenOffline()).login(email, password)

        # The underlying store represents Redis recovery after the failed attempt.
        for token in tokens:
            assert (await working.authenticate(token)).user_id == user_id
        with pytest.raises(InvalidSession):
            await working.authenticate(str(failed_token))

    run_scenario(scenario)


def test_cancelled_prepare_preserves_three_old_sessions():
    async def scenario(db, store, user_id, email, password):
        working = AsyncIdentitySessions(db, store)
        tokens = [(await working.login(email, password)).token for _ in range(3)]
        entered, release = asyncio.Event(), asyncio.Event()

        class SlowAfterWrite:
            async def prepare_session(self, uid, digest, ttl):
                await store.prepare_session(uid, digest, ttl)
                entered.set()
                await release.wait()

        task = asyncio.create_task(AsyncIdentitySessions(db, SlowAfterWrite()).login(email, password))
        try:
            await asyncio.wait_for(entered.wait(), 3)
            task.cancel()
            with pytest.raises(asyncio.CancelledError):
                await task
            for token in tokens:
                assert (await working.authenticate(token)).user_id == user_id
        finally:
            if not task.done():
                task.cancel()
                await asyncio.gather(task, return_exceptions=True)

    run_scenario(scenario)


@pytest.mark.parametrize("legacy_keys", [False, True])
def test_confirmed_redis_failure_preserves_three_old_sessions(legacy_keys):
    async def scenario(db, store, user_id, email, password):
        working = AsyncIdentitySessions(db, store)
        tokens = [(await working.login(email, password)).token for _ in range(3)]
        if legacy_keys:
            await working.reconcile_user(user_id)
            await store._client.delete(*(f"{store._prefix}token:prepared:{store._digest(token)}"
                                         for token in tokens))

        class Offline:
            async def prepare_session(self, uid, digest, ttl):
                raise RedisConnectionError("synthetic Redis outage before write")

        with pytest.raises(IdentityUnavailable):
            await AsyncIdentitySessions(db, Offline()).login(email, password)
        for token in tokens:
            assert (await working.authenticate(token)).user_id == user_id

    run_scenario(scenario)


def test_sql_token_collision_does_not_block_another_users_reconciliation():
    async def scenario(db, store, user_id, email, password):
        from pymentor_core.modules.identity.passwords import hash_password
        from sqlalchemy import text

        working = AsyncIdentitySessions(db, store)
        token = (await working.login(email, password)).token
        digest = store._digest(token)
        await store._client.delete(f"{store._prefix}token:prepared:{digest}")
        second_email = f"{uuid4()}@example.test"
        second_id = None
        try:
            async with db.unit_of_work() as uow:
                second_id = await uow.session.scalar(text(
                    "INSERT INTO users(username,email,password_hash) VALUES ('synthetic',:email,:hash) RETURNING id"
                ), {"email": second_email, "hash": hash_password(password)})
                await uow.commit()
            with patch('pymentor_core.adapters.postgres.identity_sessions.uuid4', return_value=UUID(token)):
                with pytest.raises(IdentityUnavailable):
                    await working.login(second_email, password)
            assert await store._client.get(f"{store._prefix}token:prepared:{digest}") is None
            await working.reconcile_user(user_id)
            assert (await working.authenticate(token)).user_id == user_id
        finally:
            if second_id is not None:
                async with db.unit_of_work() as uow:
                    await uow.session.execute(text("DELETE FROM users WHERE id=:id AND email=:email"),
                                              {"id": second_id, "email": second_email})
                    await uow.commit()
    run_scenario(scenario)


def test_reconcile_redis_outage_does_not_delete_historical_sessions():
    async def scenario(db, store, user_id, email, password):
        from sqlalchemy import func
        from sqlalchemy import text
        async with db.unit_of_work() as uow:
            for _ in range(4):
                await uow.session.execute(text(
                    "INSERT INTO sessions(user_id,session_token,created_at) VALUES (:id,:token,clock_timestamp())"
                ), {"id": user_id, "token": str(uuid4())})
            await uow.commit()

        class Offline:
            async def add_user_sessions(self, uid, sessions):
                raise RedisConnectionError("synthetic Redis outage")

        with pytest.raises(IdentityUnavailable):
            await AsyncIdentitySessions(db, Offline()).reconcile_user(user_id)
        async with db.unit_of_work() as uow:
            count = await uow.session.scalar(select(func.count()).select_from(models.Session).where(
                models.Session.user_id == user_id))
            assert count == 4
    run_scenario(scenario)


def test_reconcile_rechecks_when_logout_changes_historical_top_three():
    async def scenario(db, store, user_id, email, password):
        from sqlalchemy import text
        tokens = [str(uuid4()) for _ in range(4)]
        async with db.unit_of_work() as uow:
            for token in tokens:
                await uow.session.execute(text(
                    "INSERT INTO sessions(user_id,session_token,created_at) VALUES (:id,:token,clock_timestamp())"
                ), {"id": user_id, "token": token})
            await uow.commit()
        service = AsyncIdentitySessions(db, store)
        entered, release = asyncio.Event(), asyncio.Event()
        original = store.add_user_sessions
        calls = 0

        async def pause_first(uid, rows):
            nonlocal calls
            calls += 1
            if calls == 1:
                entered.set()
                await release.wait()
            await original(uid, rows)

        with patch.object(store, "add_user_sessions", side_effect=pause_first):
            task = asyncio.create_task(service.reconcile_user(user_id))
            try:
                await asyncio.wait_for(entered.wait(), 3)
                await service.logout(tokens[-1])
            finally:
                release.set()
            await task
        for token in tokens[:3]:
            assert (await service.authenticate(token)).user_id == user_id
    run_scenario(scenario)


@pytest.mark.parametrize("operation", ["reconcile", "import"])
def test_projection_wait_does_not_hold_user_write_lock(operation):
    from datetime import datetime
    from datetime import timezone
    from pymentor_core.adapters.postgres.legacy_sessions import LegacySession
    from pymentor_core.adapters.postgres.legacy_sessions import import_legacy_sessions

    async def scenario(db, store, user_id, email, password):
        service = AsyncIdentitySessions(db, store)
        entered, release = asyncio.Event(), asyncio.Event()
        add = store.add_user_sessions

        async def slow(uid, sessions):
            entered.set()
            await release.wait()
            await add(uid, sessions)

        if operation == "reconcile":
            await service.login(email, password)
            coroutine = service.reconcile_user(user_id)
        else:
            coroutine = import_legacy_sessions(service, user_id, [LegacySession(str(uuid4()), datetime.now(timezone.utc))])
        with patch.object(store, "add_user_sessions", side_effect=slow):
            task = asyncio.create_task(coroutine)
            try:
                await asyncio.wait_for(entered.wait(), 3)
                async with db.unit_of_work() as other:
                    await other.session.execute(select(models.User.id).where(
                        models.User.id == user_id).with_for_update(nowait=True))
            finally:
                release.set()
                await task
    run_scenario(scenario)


def test_delayed_reconcile_does_not_remove_parallel_login_or_revive_logout():
    async def scenario(db, store, user_id, email, password):
        service = AsyncIdentitySessions(db, store)
        old = (await service.login(email, password)).token
        entered, release = asyncio.Event(), asyncio.Event()
        add = store.add_user_sessions

        async def slow(uid, sessions):
            entered.set()
            await release.wait()
            await add(uid, sessions)

        with patch.object(store, "add_user_sessions", side_effect=slow):
            task = asyncio.create_task(service.reconcile_user(user_id))
            try:
                await asyncio.wait_for(entered.wait(), 3)
                await service.logout(old)
                new = (await service.login(email, password)).token
            finally:
                release.set()
                await task
        assert (await service.authenticate(new)).user_id == user_id
        with pytest.raises(InvalidSession):
            await service.authenticate(old)
    run_scenario(scenario)


@pytest.mark.parametrize("outcome", ["lost_reply", "cancel"])
def test_import_interrupted_after_redis_write_never_commits(outcome):
    from datetime import datetime
    from datetime import timezone
    from pymentor_core.adapters.postgres.legacy_sessions import LegacySession
    from pymentor_core.adapters.postgres.legacy_sessions import import_legacy_sessions

    async def scenario(db, store, user_id, email, password):
        service = AsyncIdentitySessions(db, store)
        token = str(uuid4())
        add = store.add_user_sessions

        async def interrupted(uid, sessions):
            await add(uid, sessions)
            if outcome == "cancel":
                raise asyncio.CancelledError()
            raise RedisConnectionError("synthetic lost response")

        with patch.object(store, "add_user_sessions", side_effect=interrupted):
            with pytest.raises(asyncio.CancelledError if outcome == "cancel" else IdentityUnavailable):
                await import_legacy_sessions(service, user_id, [LegacySession(token, datetime.now(timezone.utc))])
        with pytest.raises(InvalidSession):
            await service.authenticate(token)
        async with db.unit_of_work() as uow:
            from sqlalchemy import text
            row = (await uow.session.execute(text(
                "SELECT (SELECT count(*) FROM sessions WHERE user_id=:id), "
                "EXISTS (SELECT 1 FROM session_import_markers WHERE user_id=:id)"
            ), {"id": user_id})).one()
            assert tuple(row) == (0, False)
    run_scenario(scenario)


@pytest.mark.parametrize("winner", ["login", "login_logout", "import"])
def test_import_rechecks_after_a_concurrent_winner(winner):
    from datetime import datetime
    from datetime import timezone
    from pymentor_core.adapters.postgres.legacy_sessions import LegacySession
    from pymentor_core.adapters.postgres.legacy_sessions import import_legacy_sessions

    async def scenario(db, store, user_id, email, password):
        service = AsyncIdentitySessions(db, store)
        candidate = LegacySession(str(uuid4()), datetime.now(timezone.utc))
        entered, release = asyncio.Event(), asyncio.Event()
        add = store.add_user_sessions
        calls = 0

        async def first_slow(uid, sessions):
            nonlocal calls
            calls += 1
            if calls == 1:
                entered.set()
                await release.wait()
            await add(uid, sessions)

        with patch.object(store, "add_user_sessions", side_effect=first_slow):
            task = asyncio.create_task(import_legacy_sessions(service, user_id, [candidate]))
            try:
                await asyncio.wait_for(entered.wait(), 3)
                if winner == "import":
                    other = LegacySession(str(uuid4()), datetime.now(timezone.utc))
                    assert await import_legacy_sessions(service, user_id, [other]) == 1
                else:
                    grant = await service.login(email, password)
                    if winner == "login_logout":
                        await service.logout(grant.token)
            finally:
                release.set()
            with pytest.raises(ValueError, match="already has sessions|already consumed"):
                await task
        with pytest.raises(InvalidSession):
            await service.authenticate(candidate.token)
        if winner == "import":
            assert (await service.authenticate(other.token)).user_id == user_id
        elif winner == "login":
            assert (await service.authenticate(grant.token)).user_id == user_id
    run_scenario(scenario)
