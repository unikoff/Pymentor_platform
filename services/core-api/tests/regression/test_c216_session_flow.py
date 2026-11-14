"""Redis-gated sessions with PostgreSQL as durable authority; synthetic accounts only."""
import asyncio
import os
from uuid import uuid4
import pytest
from redis.exceptions import ConnectionError as RedisConnectionError
from redis.exceptions import RedisError
from sqlalchemy import text
from c222_pg_guard import validate_test_url
from pymentor_core.adapters.postgres.identity_sessions import AsyncIdentitySessions
from pymentor_core.modules.identity.contracts import InvalidSession
from pymentor_core.modules.identity.contracts import IdentityUnavailable
from pymentor_core.modules.identity.passwords import hash_password
from pymentor_core.adapters.postgres.async_database import AsyncDatabase
from pymentor_core.adapters.redis.sessions import RedisSessionStore

@pytest.mark.parametrize('url', ['postgresql+asyncpg://pymentor_test:unused@127.0.0.1:57152/other', 'postgresql+asyncpg://pymentor_test:unused@127.0.0.1:5432/pymentor_test', 'postgresql+asyncpg://other:unused@127.0.0.1:57152/pymentor_test', 'postgresql+asyncpg://pymentor_test:unused@remote.example:57152/pymentor_test'])
def test_session_service_rejects_non_test_database_without_connecting(url):
    from types import SimpleNamespace
    from sqlalchemy.engine import make_url
    database = SimpleNamespace(engine=SimpleNamespace(url=make_url(url)))
    with pytest.raises(ValueError, match='disposable'):
        AsyncIdentitySessions(database, object())

def run_scenario(scenario):
    pg_url, redis_url = (os.getenv('PYMENTOR_TEST_PG_URL'), os.getenv('PYMENTOR_TEST_REDIS_URL'))
    if not pg_url or not redis_url:
        pytest.skip('requires explicitly configured disposable local PostgreSQL and Redis')
    validate_test_url(pg_url)

    async def run():
        db = AsyncDatabase(pg_url, pool_size=5, max_overflow=0, pool_timeout=3, connect_timeout=3, command_timeout=3)
        prefix = f'pymentor-c216-test:{uuid4()}:'
        store = RedisSessionStore(redis_url, prefix=prefix, max_connections=8, socket_timeout=2)
        prepared_keys = set()
        projection_keys = set()
        prepare_session = store.prepare_session
        add_user_sessions = store.add_user_sessions

        async def track_prepared(uid, digest, ttl):
            prepared_keys.add(f'{prefix}token:prepared:{digest}')
            return await prepare_session(uid, digest, ttl)
        store.prepare_session = track_prepared

        async def track_projection(uid, sessions):
            projection_keys.update((f'{prefix}token:{store._digest(token)}' for token, _ in sessions))
            return await add_user_sessions(uid, sessions)
        store.add_user_sessions = track_projection
        email = f'{uuid4()}@example.test'
        password = 'Synthetic-test-password-123'
        user_id = None
        try:
            async with db.unit_of_work() as uow:
                identity = (await uow.session.execute(text('SELECT current_database(), current_user'))).one()
                assert tuple(identity) == ('pymentor_test', 'pymentor_test')
                user_id = await uow.session.scalar(text("INSERT INTO users(username,email,password_hash) VALUES ('synthetic',:email,:hash) RETURNING id"), {'email': email, 'hash': hash_password(password)})
                await uow.commit()
            await scenario(db, store, user_id, email, password)
        finally:
            try:
                if user_id is not None:
                    try:
                        await store.replace_user_sessions(user_id, [])
                    finally:
                        async with db.unit_of_work() as uow:
                            await uow.session.execute(text('DELETE FROM sessions WHERE user_id=:id'), {'id': user_id})
                            await uow.session.execute(text('DELETE FROM users WHERE id=:id AND email=:email'), {'id': user_id, 'email': email})
                            await uow.commit()
            finally:
                try:
                    if prepared_keys or projection_keys:
                        await store._client.delete(*prepared_keys | projection_keys)
                finally:
                    await store.close()
                    await db.dispose()
    asyncio.run(run())

def test_login_limit_logout_and_safe_sql_fallback():

    async def scenario(db, store, user_id, email, password):
        redis_mode = AsyncIdentitySessions(db, store, mode='redis')
        sql_mode = AsyncIdentitySessions(db, store, mode='sql')
        grants = [await redis_mode.login(email, password) for _ in range(4)]
        tokens = [grant.token for grant in grants]
        assert all((grant.token not in repr(grant) for grant in grants))
        assert len(set(tokens)) == 4
        with pytest.raises(InvalidSession):
            await redis_mode.authenticate(tokens[0])
        with pytest.raises(InvalidSession):
            await sql_mode.authenticate(tokens[0])
        for token in tokens[1:]:
            assert (await redis_mode.authenticate(token)).user_id == user_id
        await redis_mode.logout(tokens[1])
        for mode in (redis_mode, sql_mode):
            with pytest.raises(InvalidSession):
                await mode.authenticate(tokens[1])
        assert (await sql_mode.authenticate(tokens[2])).user_id == user_id
    run_scenario(scenario)

def test_simultaneous_logins_from_two_replicas_enforce_limit():

    async def scenario(db, store, user_id, email, password):
        first = AsyncIdentitySessions(db, store, mode='redis')
        second = AsyncIdentitySessions(db, store, mode='redis')
        grants = await asyncio.gather(*(service.login(email, password) for service in (first, second, first, second)))
        async with db.unit_of_work() as uow:
            count = await uow.session.scalar(text('SELECT count(*) FROM sessions WHERE user_id=:id'), {'id': user_id})
            assert count == 3
        accepted = 0
        for grant in grants:
            try:
                await first.authenticate(grant.token)
                accepted += 1
            except InvalidSession:
                pass
        assert accepted == 3
    run_scenario(scenario)

def test_sql_removal_prevents_revival_even_with_stale_redis():

    async def scenario(db, store, user_id, email, password):
        redis_mode = AsyncIdentitySessions(db, store, mode='redis')
        sql_mode = AsyncIdentitySessions(db, store, mode='sql')
        token = (await redis_mode.login(email, password)).token
        async with db.unit_of_work() as uow:
            await uow.session.execute(text('DELETE FROM sessions WHERE user_id=:id'), {'id': user_id})
            await uow.commit()
        assert await store.get_user(token) == user_id
        for mode in (redis_mode, sql_mode):
            with pytest.raises(InvalidSession):
                await mode.authenticate(token)
        await redis_mode.reconcile_user(user_id)
        with pytest.raises(InvalidSession):
            await redis_mode.authenticate(token)
    run_scenario(scenario)

def test_redis_unavailable_fails_closed_without_destroying_existing_sql_sessions():

    async def scenario(db, store, user_id, email, password):
        working = AsyncIdentitySessions(db, store, mode='redis')
        token = (await working.login(email, password)).token

        class Unavailable:

            async def get_user(self, token):
                raise RedisConnectionError('synthetic outage')

            async def prepare_session(self, user_id, digest, ttl):
                raise RedisConnectionError('synthetic outage')
        broken = AsyncIdentitySessions(db, Unavailable(), mode='redis')
        with pytest.raises(IdentityUnavailable):
            await broken.authenticate(token)
        with pytest.raises(IdentityUnavailable):
            await broken.login(email, password)
        await working.reconcile_user(user_id)
        assert (await working.authenticate(token)).user_id == user_id
    run_scenario(scenario)

def test_expired_sql_session_is_rejected_even_if_redis_has_a_key():

    async def scenario(db, store, user_id, email, password):
        from hashlib import sha256
        service = AsyncIdentitySessions(db, store, mode='redis')
        token = (await service.login(email, password)).token
        async with db.unit_of_work() as uow:
            await uow.session.execute(text("UPDATE sessions SET created_at=clock_timestamp()-interval '31 days' WHERE user_id=:id AND session_token=:token"), {'id': user_id, 'token': sha256(token.encode()).hexdigest()})
            await uow.commit()
        assert await store.get_user(token) == user_id
        with pytest.raises(InvalidSession):
            await service.authenticate(token)
        with pytest.raises(InvalidSession):
            await AsyncIdentitySessions(db, store, mode='sql').authenticate(token)
    run_scenario(scenario)

def test_reconcile_projects_only_live_synthetic_sql_sessions():

    async def scenario(db, store, user_id, email, password):
        service = AsyncIdentitySessions(db, store, mode='redis')
        recent, expired = (str(uuid4()), str(uuid4()))
        async with db.unit_of_work() as uow:
            await uow.session.execute(text("INSERT INTO sessions(user_id,session_token,created_at) VALUES (:id,:recent,clock_timestamp()-interval '1 day'), (:id,:expired,clock_timestamp()-interval '31 days')"), {'id': user_id, 'recent': recent, 'expired': expired})
            await uow.commit()
        await service.reconcile_user(user_id)
        assert (await service.authenticate(recent)).user_id == user_id
        assert await store.get_user(expired) is None
        with pytest.raises(InvalidSession):
            await service.authenticate(expired)
    run_scenario(scenario)


def test_password_verification_does_not_hold_the_user_row_lock(monkeypatch):

    async def scenario(db, store, user_id, email, password):
        import threading
        from sqlalchemy import select
        from pymentor_core.adapters.sql import models
        from pymentor_core.adapters.postgres import identity_sessions as session_module
        started, release = (threading.Event(), threading.Event())
        original = session_module.verify_password

        def slow_verify(plain, hashed):
            started.set()
            if not release.wait(timeout=5):
                raise AssertionError('test did not release password verification')
            return original(plain, hashed)
        monkeypatch.setattr(session_module, 'verify_password', slow_verify)
        service = AsyncIdentitySessions(db, store)
        login = asyncio.create_task(service.login(email, password))
        try:
            assert await asyncio.to_thread(started.wait, 3)
            async with db.unit_of_work() as uow:
                locked_id = await uow.session.scalar(select(models.User.id).where(models.User.id == user_id).with_for_update(nowait=True))
                assert locked_id == user_id
        finally:
            release.set()
            await login
    run_scenario(scenario)

def test_password_change_during_verification_invalidates_login(monkeypatch):

    async def scenario(db, store, user_id, email, password):
        import threading
        from pymentor_core.adapters.postgres import identity_sessions as session_module
        started, release = (threading.Event(), threading.Event())
        original = session_module.verify_password
        new_hash = hash_password('Synthetic-Changed-Password-456')

        def slow_verify(plain, hashed):
            started.set()
            if not release.wait(timeout=5):
                raise AssertionError('test did not release password verification')
            return original(plain, hashed)
        monkeypatch.setattr(session_module, 'verify_password', slow_verify)
        service = AsyncIdentitySessions(db, store)
        login = asyncio.create_task(service.login(email, password))
        try:
            assert await asyncio.to_thread(started.wait, 3)
            async with db.unit_of_work() as uow:
                await uow.session.execute(text('UPDATE users SET password_hash=:hash WHERE id=:id'), {'hash': new_hash, 'id': user_id})
                await uow.commit()
        finally:
            release.set()
        with pytest.raises(session_module.InvalidCredentials):
            await login
        async with db.unit_of_work() as uow:
            assert await uow.session.scalar(text('SELECT count(*) FROM sessions WHERE user_id=:id'), {'id': user_id}) == 0
    run_scenario(scenario)

def test_redis_timeout_after_write_never_authorizes_uncommitted_session():

    async def scenario(db, store, user_id, email, password):
        service = AsyncIdentitySessions(db, store)
        original = (await service.login(email, password)).token

        class LostReply:

            async def prepare_session(self, uid, digest, ttl):
                await store.prepare_session(uid, digest, ttl)
                raise RedisConnectionError('synthetic lost response after write')

            async def get_user(self, token):
                return await store.get_user(token)
        broken = AsyncIdentitySessions(db, LostReply())
        with pytest.raises(IdentityUnavailable):
            await broken.login(email, password)
        async with db.unit_of_work() as uow:
            count = await uow.session.scalar(text('SELECT count(*) FROM sessions WHERE user_id=:id'), {'id': user_id})
            assert count == 1
        await service.reconcile_user(user_id)
        assert (await service.authenticate(original)).user_id == user_id
    run_scenario(scenario)

def test_redis_projection_uses_hashes_and_absolute_ttl():

    async def scenario(db, store, user_id, email, password):
        service = AsyncIdentitySessions(db, store)
        token = (await service.login(email, password)).token
        digest = store._digest(token)
        key = f'{store._prefix}token:prepared:{digest}'
        assert token not in key
        assert await store._client.get(key) == str(user_id)
        ttl_before = await store._client.ttl(key)
        assert 0 < ttl_before <= 30 * 24 * 60 * 60
        assert await store.get_user(token) == user_id
        assert await store._client.ttl(key) <= ttl_before
        with pytest.raises(ValueError):
            await store.replace_user_sessions(user_id, [(token, 31 * 24 * 60 * 60)])
        await service.logout(token)
        assert await store._client.get(key) is None
        with pytest.raises(InvalidSession):
            await service.authenticate(token)
    run_scenario(scenario)

def test_new_sql_session_stores_digest_and_digest_is_not_a_cookie():

    async def scenario(db, store, user_id, email, password):
        from hashlib import sha256
        service = AsyncIdentitySessions(db, store)
        grant = await service.login(email, password)
        async with db.unit_of_work() as uow:
            stored = await uow.session.scalar(text('SELECT session_token FROM sessions WHERE user_id=:id'), {'id': user_id})
        assert stored == sha256(grant.token.encode()).hexdigest()
        assert grant.token != stored
        for candidate in (service, AsyncIdentitySessions(db, store, mode='sql')):
            assert (await candidate.authenticate(grant.token)).user_id == user_id
            with pytest.raises(InvalidSession):
                await candidate.authenticate(stored)
        await service.logout(grant.token)
        with pytest.raises(InvalidSession):
            await service.authenticate(grant.token)
    run_scenario(scenario)

def test_digest_session_can_be_reconciled_after_redis_loss():

    async def scenario(db, store, user_id, email, password):
        service = AsyncIdentitySessions(db, store)
        token = (await service.login(email, password)).token
        async with db.unit_of_work() as uow:
            assert await uow.session.scalar(text('SHOW transaction_isolation')) == 'read committed'
        await store._client.delete(f'{store._prefix}token:prepared:{store._digest(token)}')
        with pytest.raises(InvalidSession):
            await service.authenticate(token)
        await service.reconcile_user(user_id)
        assert (await service.authenticate(token)).user_id == user_id
        await service.logout(token)
        with pytest.raises(InvalidSession):
            await service.authenticate(token)
    run_scenario(scenario)


def test_concurrent_logout_and_login_do_not_revive_logged_out_session():

    async def scenario(db, store, user_id, email, password):
        first = AsyncIdentitySessions(db, store)
        second = AsyncIdentitySessions(db, store)
        old = (await first.login(email, password)).token
        await first.login(email, password)
        await first.login(email, password)
        _, fresh = await asyncio.gather(first.logout(old), second.login(email, password))
        with pytest.raises(InvalidSession):
            await first.authenticate(old)
        assert (await second.authenticate(fresh.token)).user_id == user_id
        async with db.unit_of_work() as uow:
            count = await uow.session.scalar(text('SELECT count(*) FROM sessions WHERE user_id=:id'), {'id': user_id})
            assert count <= 3
    run_scenario(scenario)

def test_role_change_and_account_deletion_take_effect_on_next_request():

    async def scenario(db, store, user_id, email, password):
        service = AsyncIdentitySessions(db, store)
        token = (await service.login(email, password)).token
        assert not (await service.authenticate(token)).is_admin
        async with db.unit_of_work() as uow:
            await uow.session.execute(text('UPDATE users SET is_admin=true WHERE id=:id'), {'id': user_id})
            await uow.commit()
        assert (await service.authenticate(token)).is_admin
        async with db.unit_of_work() as uow:
            await uow.session.execute(text('DELETE FROM sessions WHERE user_id=:id'), {'id': user_id})
            await uow.session.execute(text('DELETE FROM users WHERE id=:id'), {'id': user_id})
            await uow.commit()
        with pytest.raises(InvalidSession):
            await service.authenticate(token)
    run_scenario(scenario)


def test_process_crash_after_prepare_preserves_previous_sessions():

    async def scenario(db, store, user_id, email, password):
        import subprocess
        import sys
        from pathlib import Path
        service = AsyncIdentitySessions(db, store)
        tokens = [(await service.login(email, password)).token for _ in range(3)]
        crash_token = str(uuid4())
        crash_key = f'{store._prefix}token:prepared:{store._digest(crash_token)}'
        env = os.environ.copy()
        env.update(PYMENTOR_C216_PREFIX=store._prefix, PYMENTOR_C216_EMAIL=email, PYMENTOR_C216_PASSWORD=password, PYMENTOR_C224_TOKEN=crash_token)
        env['PYTHONPATH'] = os.pathsep.join([str(Path(__file__).resolve().parent), env['PYTHONPATH']])
        try:
            result = await asyncio.to_thread(subprocess.run, [sys.executable, '-m', 'test_c224_crash_fixture'], env=env, capture_output=True, timeout=15)
            assert result.returncode == 71, 'synthetic crash was not reached'
            async with db.unit_of_work() as uow:
                assert await uow.session.scalar(text('SELECT count(*) FROM sessions WHERE user_id=:id'), {'id': user_id}) == 3
            for token in tokens:
                assert (await service.authenticate(token)).user_id == user_id
            with pytest.raises(InvalidSession):
                await service.authenticate(crash_token)
        finally:
            await store._client.delete(crash_key)
    run_scenario(scenario)


def test_migration_downgrade_preserves_verification_and_live_session():

    async def scenario(db, store, user_id, email, password):
        import subprocess
        import sys
        from pathlib import Path
        service = AsyncIdentitySessions(db, store)
        token = (await service.login(email, password)).token
        env = os.environ.copy()
        env['PYMENTOR_MIGRATION_URL'] = env['PYMENTOR_TEST_PG_URL']
        alembic_ini = Path(__file__).resolve().parents[2] / 'alembic.ini'
        result = await asyncio.to_thread(subprocess.run, [sys.executable, '-m', 'alembic', '-c', str(alembic_ini), 'downgrade', 'c222_initial_pg'], env=env, capture_output=True, text=True, timeout=15)
        assert result.returncode != 0
        # The new head refuses first, before older downgrade guards are reached.
        assert 'Refusing to discard pending email-change confirmations' in result.stderr
        async with db.unit_of_work() as uow:
            from pymentor_core.app.schema_policy import SCHEMA_REVISION
            assert await uow.session.scalar(text('SELECT version_num FROM alembic_version')) == SCHEMA_REVISION
        assert (await service.authenticate(token)).user_id == user_id
    run_scenario(scenario)


def test_invalidate_sessions_blocks_synthetic_stale_snapshot_revival():

    async def scenario(db, store, user_id, email, password):
        service = AsyncIdentitySessions(db, store)
        token = (await service.login(email, password)).token
        await service.logout(token)
        async with db.unit_of_work() as uow:
            await uow.session.execute(text('INSERT INTO sessions(user_id,session_token,created_at) VALUES (:id,:token,clock_timestamp())'), {'id': user_id, 'token': token})
            await uow.commit()
        await store.replace_user_sessions(user_id, [(token, 60)])
        assert (await service.authenticate(token)).user_id == user_id
        assert await service.invalidate_user_sessions(user_id) == 1
        for mode in (service, AsyncIdentitySessions(db, store, mode='sql')):
            with pytest.raises(InvalidSession):
                await mode.authenticate(token)
    run_scenario(scenario)

def test_recovery_order_invalidates_each_synthetic_account_before_reopening():

    async def scenario(db, store, user_id, email, password):
        service = AsyncIdentitySessions(db, store)
        second_email = f'{uuid4()}@example.test'
        second_id = None
        try:
            async with db.unit_of_work() as uow:
                second_id = await uow.session.scalar(text("INSERT INTO users(username,email,password_hash) VALUES ('synthetic',:email,:hash) RETURNING id"), {'email': second_email, 'hash': hash_password(password)})
                await uow.commit()
            first_token = (await service.login(email, password)).token
            second_token = (await service.login(second_email, password)).token
            await service.logout(first_token)
            await service.logout(second_token)
            async with db.unit_of_work() as uow:
                for uid, token in ((user_id, first_token), (second_id, second_token)):
                    await uow.session.execute(text('DELETE FROM session_import_markers WHERE user_id=:id'), {'id': uid})
                    await uow.session.execute(text('INSERT INTO sessions(user_id,session_token,created_at) VALUES (:id,:token,clock_timestamp())'), {'id': uid, 'token': token})
                await uow.commit()
            await store.replace_user_sessions(user_id, [(first_token, 60)])
            await store.replace_user_sessions(second_id, [(second_token, 60)])
            assert await service.invalidate_user_sessions(user_id) == 1
            assert await service.invalidate_user_sessions(second_id) == 1
            for token in (first_token, second_token):
                with pytest.raises(InvalidSession):
                    await service.authenticate(token)
            assert (await service.login(email, password)).principal.user_id == user_id
        finally:
            if second_id is not None:
                try:
                    await store.replace_user_sessions(second_id, [])
                finally:
                    async with db.unit_of_work() as uow:
                        await uow.session.execute(text('DELETE FROM sessions WHERE user_id=:id'), {'id': second_id})
                        await uow.session.execute(text('DELETE FROM users WHERE id=:id AND email=:email'), {'id': second_id, 'email': second_email})
                        await uow.commit()
    run_scenario(scenario)

def test_force_relogin_refuses_non_synthetic_account_without_mutation():

    async def scenario(db, store, user_id, email, password):
        service = AsyncIdentitySessions(db, store)
        token = (await service.login(email, password)).token
        async with db.unit_of_work() as uow:
            await uow.session.execute(text("UPDATE users SET username='not-synthetic' WHERE id=:id"), {'id': user_id})
            await uow.commit()
        with pytest.raises(ValueError, match='synthetic'):
            await service.invalidate_user_sessions(user_id)
        assert (await service.authenticate(token)).user_id == user_id
    run_scenario(scenario)

def test_disposable_redis_restart_fails_closed_and_reconciles():
    if os.environ.get('PYMENTOR_TEST_REDIS_RESTART') != '1':
        pytest.skip('explicit opt-in required to restart the disposable Redis container')

    async def scenario(db, store, user_id, email, password):
        import json
        import subprocess
        import time
        service = AsyncIdentitySessions(db, store)
        token = (await service.login(email, password)).token
        inspection = subprocess.run(['docker', 'inspect', '--format', '{{.Name}} {{.Config.Image}} {{.HostConfig.AutoRemove}}', 'pymentor-c2-local-redis'], capture_output=True, text=True, check=True, timeout=10).stdout.strip()
        assert inspection == '/pymentor-c2-local-redis redis:7-alpine true'
        metadata = json.loads(subprocess.run(['docker', 'inspect', 'pymentor-c2-local-redis'], capture_output=True, text=True, check=True, timeout=10).stdout)[0]
        assert metadata['Mounts'] == []
        assert metadata['HostConfig']['Tmpfs'] == {'/data': 'rw,size=128m'}
        assert metadata['Config']['Cmd'] == ['redis-server', '--save', '', '--appendonly', 'no']
        assert metadata['NetworkSettings']['Ports']['6379/tcp'] == [{'HostIp': '127.0.0.1', 'HostPort': '57146'}]
        result = await asyncio.to_thread(subprocess.run, ['docker', 'restart', '--time', '2', 'pymentor-c2-local-redis'], capture_output=True, text=True, timeout=20)
        assert result.returncode == 0, 'disposable Redis restart failed'
        with pytest.raises((InvalidSession, IdentityUnavailable)):
            await service.authenticate(token)
        deadline = time.monotonic() + 15
        while True:
            try:
                await store._client.ping()
                break
            except RedisError:
                if time.monotonic() >= deadline:
                    raise AssertionError('restarted disposable Redis did not become ready')
                await asyncio.sleep(0.2)
        with pytest.raises(InvalidSession):
            await service.authenticate(token)
        await service.reconcile_user(user_id)
        assert (await service.authenticate(token)).user_id == user_id
    run_scenario(scenario)
