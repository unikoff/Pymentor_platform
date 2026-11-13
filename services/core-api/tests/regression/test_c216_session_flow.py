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

def test_two_local_asgi_apps_share_login_and_logout():

    async def scenario(db, store, user_id, email, password):
        import httpx
        from tools.lab.async_auth_preview import create_auth_preview_app
        second_db = AsyncDatabase(os.environ['PYMENTOR_TEST_PG_URL'], pool_size=2, max_overflow=0, pool_timeout=3, connect_timeout=3, command_timeout=3)
        second_store = RedisSessionStore(os.environ['PYMENTOR_TEST_REDIS_URL'], prefix=store._prefix, max_connections=4, socket_timeout=2)
        app_a = create_auth_preview_app(AsyncIdentitySessions(db, store))
        app_b = create_auth_preview_app(AsyncIdentitySessions(second_db, second_store))
        try:
            async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app_a), base_url='http://test') as a, httpx.AsyncClient(transport=httpx.ASGITransport(app=app_b), base_url='http://test') as b:
                response = await a.post('/api/user/login', json={'email': email, 'password': password})
                assert response.status_code == 200
                assert response.json()['user']['id'] == user_id
                assert set(response.json()) == {'message', 'user'}
                assert set(response.json()['user']) == {'id', 'username', 'email', 'subscription_until', 'subscription_plan', 'has_active_subscription', 'is_admin', 'verified'}
                assert response.json()['user']['verified'] is False
                assert 'httponly' in response.headers['set-cookie'].lower()
                assert 'max-age=2592000' in response.headers['set-cookie'].lower()
                b.cookies.set('session', a.cookies['session'])
                assert (await b.get('/api/user/me')).json()['user']['id'] == user_id
                assert (await b.post('/api/user/logout')).status_code == 200
                assert (await a.get('/api/user/me')).status_code == 401
        finally:
            await second_store.close()
            await second_db.dispose()
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

def test_login_and_logout_across_two_local_server_processes():

    async def scenario(db, store, user_id, email, password):
        from contextlib import AsyncExitStack
        import socket
        import subprocess
        import sys
        import time
        from pathlib import Path
        import httpx

        def free_port():
            with socket.socket() as sock:
                sock.bind(('127.0.0.1', 0))
                return sock.getsockname()[1]
        env = os.environ.copy()
        env['PYMENTOR_C216_PREFIX'] = store._prefix
        env['PYTHONPATH'] = os.pathsep.join([str(Path(__file__).resolve().parent), env['PYTHONPATH']])
        ports = [free_port(), free_port()]
        assert ports[0] != ports[1]
        processes = []
        process_keys = set()
        try:
            for port in ports:
                processes.append(subprocess.Popen([sys.executable, '-m', 'uvicorn', 'c216_uvicorn_fixture:create', '--factory', '--host', '127.0.0.1', '--port', str(port), '--log-level', 'warning'], env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL))
            async with httpx.AsyncClient(timeout=2) as client:
                for process, port in zip(processes, ports):
                    deadline = time.monotonic() + 15
                    while True:
                        assert process.poll() is None, 'local fixture process exited before becoming ready'
                        try:
                            response = await client.get(f'http://127.0.0.1:{port}/api/user/me')
                            assert response.status_code == 401
                            break
                        except httpx.ConnectError:
                            if time.monotonic() >= deadline:
                                raise AssertionError('local fixture server did not become ready')
                            await asyncio.sleep(0.1)
                first, second = (f'http://127.0.0.1:{port}' for port in ports)
                login = await client.post(f'{first}/api/user/login', json={'email': email, 'password': password})
                assert login.status_code == 200 and login.json()['user']['id'] == user_id
                process_keys.add(f"{store._prefix}token:prepared:{store._digest(client.cookies['session'])}")
                assert (await client.get(f'{second}/api/user/me')).json()['user']['id'] == user_id
                assert (await client.post(f'{second}/api/user/logout')).status_code == 200
                assert (await client.get(f'{first}/api/user/me')).status_code == 401
                async with AsyncExitStack() as stack:
                    clients = [await stack.enter_async_context(httpx.AsyncClient(timeout=8)) for _ in range(4)]
                    grants = await asyncio.gather(*(clients[index].post(f'{(first, second)[index % 2]}/api/user/login', json={'email': email, 'password': password}) for index in range(4)))
                    assert all((response.status_code == 200 for response in grants))
                    process_keys.update((f"{store._prefix}token:prepared:{store._digest(item.cookies['session'])}" for item in clients))
                    checks = await asyncio.gather(*(clients[index].get(f'{(second, first)[index % 2]}/api/user/me') for index in range(4)))
                    assert sorted((response.status_code for response in checks)) == [200, 200, 200, 401]
        finally:
            for process in processes:
                if process.poll() is None:
                    process.terminate()
            for process in processes:
                try:
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    process.kill()
                    process.wait(timeout=5)
            if process_keys:
                await store._client.delete(*process_keys)
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

def test_preview_lifespan_closes_only_its_own_connections():

    async def scenario(db, store, user_id, email, password):
        from unittest.mock import AsyncMock
        from tools.lab.async_combined_preview import create_combined_preview
        owned_db = AsyncDatabase(os.environ['PYMENTOR_TEST_PG_URL'], pool_size=2, max_overflow=0, pool_timeout=3, connect_timeout=3, command_timeout=3)
        owned_store = RedisSessionStore(os.environ['PYMENTOR_TEST_REDIS_URL'], prefix=store._prefix)
        owned_store.close = AsyncMock(wraps=owned_store.close)
        owned_db.dispose = AsyncMock(wraps=owned_db.dispose)
        app = create_combined_preview(AsyncIdentitySessions(owned_db, owned_store))
        async with app.router.lifespan_context(app):
            assert (await AsyncIdentitySessions(db, store).login(email, password)).principal.user_id == user_id
        owned_store.close.assert_awaited_once()
        owned_db.dispose.assert_awaited_once()
    run_scenario(scenario)

def test_login_does_not_need_second_profile_lookup_after_commit():

    async def scenario(db, store, user_id, email, password):
        from unittest.mock import patch
        import httpx
        from tools.lab.async_auth_preview import create_auth_preview_app
        app = create_auth_preview_app(AsyncIdentitySessions(db, store))
        with patch('tools.lab.async_auth_preview._serialize_user', side_effect=RuntimeError('synthetic read failure')):
            async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url='http://test') as client:
                response = await client.post('/api/user/login', json={'email': email, 'password': password})
                assert response.status_code == 200
                assert response.json()['user']['id'] == user_id
                assert 'session' in client.cookies
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

def test_synthetic_sqlite_session_migration_and_forced_relogin_on_rollback():

    async def scenario(db, store, user_id, email, password):
        from datetime import datetime
        from datetime import timezone
        from fastapi import HTTPException
        from sqlalchemy import create_engine
        from sqlalchemy import delete
        from sqlalchemy.orm import Session
        from starlette.requests import Request
        from pymentor_core.adapters.sql import models
        from pymentor_core.modules.identity.api.sessions import get_current_user
        from pymentor_core.adapters.postgres.legacy_sessions import LegacySession
        from pymentor_core.adapters.postgres.legacy_sessions import import_legacy_sessions
        sqlite = create_engine('sqlite:///:memory:')
        models.Base.metadata.create_all(sqlite)
        token = str(uuid4())
        request = Request({'type': 'http', 'method': 'GET', 'path': '/', 'headers': [(b'cookie', f'session={token}'.encode())]})
        try:
            with Session(sqlite) as legacy:
                legacy_user = models.User(username='synthetic', email=email, password=password)
                legacy.add(legacy_user)
                legacy.flush()
                legacy.add(models.Session(user_id=legacy_user.id, session_token=token, created_at=datetime.now(timezone.utc)))
                legacy.commit()
                legacy_session = legacy.query(models.Session).filter_by(session_token=token).one()
                generated_created_at = legacy_session.created_at.replace(tzinfo=timezone.utc)
                service = AsyncIdentitySessions(db, store)
                assert await import_legacy_sessions(service, user_id, [LegacySession(token=token, created_at=generated_created_at)]) == 1
                assert (await service.authenticate(token)).user_id == user_id
                await service.logout(token)
                with pytest.raises(InvalidSession):
                    await AsyncIdentitySessions(db, store, mode='sql').authenticate(token)
                assert get_current_user(request, legacy).id == legacy_user.id
                legacy.execute(delete(models.Session))
                legacy.commit()
                with pytest.raises(HTTPException) as exc:
                    get_current_user(request, legacy)
                assert exc.value.status_code == 401
        finally:
            sqlite.dispose()
    run_scenario(scenario)

def test_legacy_import_rejects_naive_timestamp_without_mutating_target():

    async def scenario(db, store, user_id, email, password):
        from datetime import datetime
        from pymentor_core.adapters.postgres.legacy_sessions import LegacySession
        from pymentor_core.adapters.postgres.legacy_sessions import import_legacy_sessions
        service = AsyncIdentitySessions(db, store)
        with pytest.raises(ValueError, match='timezone'):
            await import_legacy_sessions(service, user_id, [LegacySession(token=str(uuid4()), created_at=datetime(2026, 1, 1))])
        async with db.unit_of_work() as uow:
            assert await uow.session.scalar(text('SELECT count(*) FROM sessions WHERE user_id=:id'), {'id': user_id}) == 0
    run_scenario(scenario)

@pytest.mark.parametrize('offset_hours', [-4, -5])
def test_legacy_import_requires_caller_to_resolve_local_timezone(offset_hours):

    async def scenario(db, store, user_id, email, password):
        from datetime import datetime
        from datetime import timedelta
        from datetime import timezone
        from pymentor_core.adapters.postgres.legacy_sessions import LegacySession
        from pymentor_core.adapters.postgres.legacy_sessions import import_legacy_sessions
        ambiguous = datetime(2026, 11, 1, 1, 30, tzinfo=timezone(timedelta(hours=offset_hours)))
        with pytest.raises(ValueError, match='normalized to UTC'):
            await import_legacy_sessions(AsyncIdentitySessions(db, store), user_id, [LegacySession(str(uuid4()), ambiguous)])
        async with db.unit_of_work() as uow:
            assert await uow.session.scalar(text('SELECT count(*) FROM sessions WHERE user_id=:id'), {'id': user_id}) == 0
    run_scenario(scenario)

def test_legacy_import_keeps_three_newest_and_never_overwrites_target():

    async def scenario(db, store, user_id, email, password):
        from datetime import datetime
        from datetime import timedelta
        from datetime import timezone
        from pymentor_core.adapters.postgres.legacy_sessions import LegacySession
        from pymentor_core.adapters.postgres.legacy_sessions import import_legacy_sessions
        service = AsyncIdentitySessions(db, store)
        now = datetime.now(timezone.utc)
        tokens = [str(uuid4()) for _ in range(5)]
        candidates = [LegacySession(token, now - timedelta(days=age)) for token, age in zip(tokens, [1, 2, 3, 4, 31])]
        assert await import_legacy_sessions(service, user_id, candidates) == 3
        for token in tokens[:3]:
            assert (await service.authenticate(token)).user_id == user_id
        for token in tokens[3:]:
            with pytest.raises(InvalidSession):
                await service.authenticate(token)
        with pytest.raises(ValueError, match='already has sessions'):
            await import_legacy_sessions(service, user_id, candidates)
        assert (await service.authenticate(tokens[0])).user_id == user_id
    run_scenario(scenario)

def test_legacy_import_rejects_future_timestamp():

    async def scenario(db, store, user_id, email, password):
        from datetime import datetime
        from datetime import timedelta
        from datetime import timezone
        from pymentor_core.adapters.postgres.legacy_sessions import LegacySession
        from pymentor_core.adapters.postgres.legacy_sessions import import_legacy_sessions
        candidate = LegacySession(str(uuid4()), datetime.now(timezone.utc) + timedelta(days=1))
        assert candidate.token not in repr(candidate)
        with pytest.raises(ValueError, match='future'):
            await import_legacy_sessions(AsyncIdentitySessions(db, store), user_id, [candidate])
        assert await store.get_user(candidate.token) is None
    run_scenario(scenario)

def test_legacy_import_lost_redis_reply_never_activates_uncommitted_token():

    async def scenario(db, store, user_id, email, password):
        from datetime import datetime
        from datetime import timezone
        from unittest.mock import patch
        from pymentor_core.adapters.postgres.legacy_sessions import LegacySession
        from pymentor_core.adapters.postgres.legacy_sessions import import_legacy_sessions
        service = AsyncIdentitySessions(db, store)
        token = str(uuid4())
        add = store.add_user_sessions

        async def lost_reply(uid, rows):
            await add(uid, rows)
            raise RedisConnectionError('synthetic lost response')
        source = [LegacySession(token, datetime.now(timezone.utc))]
        with patch.object(store, 'add_user_sessions', side_effect=lost_reply):
            with pytest.raises(IdentityUnavailable):
                await import_legacy_sessions(service, user_id, source)
        with pytest.raises(InvalidSession):
            await service.authenticate(token)
        async with db.unit_of_work() as uow:
            assert await uow.session.scalar(text('SELECT count(*) FROM sessions WHERE user_id=:id'), {'id': user_id}) == 0
        await service.reconcile_user(user_id)
        with pytest.raises(InvalidSession):
            await service.authenticate(token)
        assert await import_legacy_sessions(service, user_id, source) == 1
    run_scenario(scenario)

def test_legacy_import_cannot_replay_revoked_session():

    async def scenario(db, store, user_id, email, password):
        from datetime import datetime
        from datetime import timezone
        from pymentor_core.adapters.postgres.legacy_sessions import LegacySession
        from pymentor_core.adapters.postgres.legacy_sessions import import_legacy_sessions
        service = AsyncIdentitySessions(db, store)
        token = str(uuid4())
        source = [LegacySession(token, datetime.now(timezone.utc))]
        assert await import_legacy_sessions(service, user_id, source) == 1
        assert await service.invalidate_user_sessions(user_id) == 1
        with pytest.raises(ValueError, match='already consumed'):
            await import_legacy_sessions(service, user_id, source)
        with pytest.raises(InvalidSession):
            await service.authenticate(token)
        with pytest.raises(InvalidSession):
            await AsyncIdentitySessions(db, store, mode='sql').authenticate(token)
    run_scenario(scenario)

def test_normal_login_prevents_later_stale_legacy_import():

    async def scenario(db, store, user_id, email, password):
        from datetime import datetime
        from datetime import timezone
        from pymentor_core.adapters.postgres.legacy_sessions import LegacySession
        from pymentor_core.adapters.postgres.legacy_sessions import import_legacy_sessions
        service = AsyncIdentitySessions(db, store)
        token = (await service.login(email, password)).token
        await service.logout(token)
        stale = LegacySession(str(uuid4()), datetime.now(timezone.utc))
        with pytest.raises(ValueError, match='already consumed'):
            await import_legacy_sessions(service, user_id, [stale])
        with pytest.raises(InvalidSession):
            await service.authenticate(stale.token)
    run_scenario(scenario)

def test_forced_relogin_before_import_prevents_stale_source_replay():

    async def scenario(db, store, user_id, email, password):
        from datetime import datetime
        from datetime import timezone
        from pymentor_core.adapters.postgres.legacy_sessions import LegacySession
        from pymentor_core.adapters.postgres.legacy_sessions import import_legacy_sessions
        service = AsyncIdentitySessions(db, store)
        assert await service.invalidate_user_sessions(user_id) == 0
        stale = LegacySession(str(uuid4()), datetime.now(timezone.utc))
        with pytest.raises(ValueError, match='already consumed'):
            await import_legacy_sessions(service, user_id, [stale])
        with pytest.raises(InvalidSession):
            await service.authenticate(stale.token)
    run_scenario(scenario)

def test_concurrent_legacy_import_and_login_are_serialized():

    async def scenario(db, store, user_id, email, password):
        from datetime import datetime
        from datetime import timezone
        from pymentor_core.adapters.postgres.legacy_sessions import LegacySession
        from pymentor_core.adapters.postgres.legacy_sessions import import_legacy_sessions
        service = AsyncIdentitySessions(db, store)
        old = LegacySession(str(uuid4()), datetime.now(timezone.utc))
        imported, grant = await asyncio.gather(import_legacy_sessions(service, user_id, [old]), service.login(email, password), return_exceptions=True)
        assert not isinstance(grant, BaseException)
        assert imported == 1 or isinstance(imported, ValueError)
        if isinstance(imported, ValueError):
            assert 'already has sessions' in str(imported) or 'already consumed' in str(imported)
        assert (await service.authenticate(grant.token)).user_id == user_id
        async with db.unit_of_work() as uow:
            count = await uow.session.scalar(text('SELECT count(*) FROM sessions WHERE user_id=:id'), {'id': user_id})
            assert count in {1, 2}
        if imported == 1:
            assert (await service.authenticate(old.token)).user_id == user_id
        else:
            with pytest.raises(InvalidSession):
                await service.authenticate(old.token)
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
            from pymentor_core.app.schema_policy import DUAL_LOCAL_SCHEMA_REVISION
            assert await uow.session.scalar(text('SELECT version_num FROM alembic_version')) == DUAL_LOCAL_SCHEMA_REVISION
        assert (await service.authenticate(token)).user_id == user_id
    run_scenario(scenario)

def test_redis_authorized_identity_is_used_by_async_activity_slice():

    async def scenario(db, store, user_id, email, password):
        import httpx
        from tools.lab.async_auth_preview import create_auth_preview_app
        from tools.lab.async_preview import create_preview_app
        service = AsyncIdentitySessions(db, store)
        auth = create_auth_preview_app(service)
        activity = create_preview_app(db, identity_service=service)
        try:
            async with httpx.AsyncClient(transport=httpx.ASGITransport(app=auth), base_url='http://test') as a, httpx.AsyncClient(transport=httpx.ASGITransport(app=activity), base_url='http://test') as b:
                assert (await a.post('/api/user/login', json={'email': email, 'password': password})).status_code == 200
                b.cookies.set('session', a.cookies['session'])
                response = await b.post('/api/user/activity/visit', json={'activity_date': '2026-03-01'})
                assert response.status_code == 200
                assert response.json()['activity_date'] == '2026-03-01'
                from unittest.mock import patch
                with patch.object(store, 'get_user', side_effect=RedisConnectionError('synthetic outage')):
                    unavailable = await b.post('/api/user/activity/visit', json={'activity_date': '2026-03-03'})
                    assert unavailable.status_code == 503
                assert (await a.post('/api/user/logout')).status_code == 200
                assert (await b.post('/api/user/activity/visit', json={'activity_date': '2026-03-02'})).status_code == 401
        finally:
            async with db.unit_of_work() as uow:
                await uow.session.execute(text('DELETE FROM user_activity_days WHERE user_id=:id'), {'id': user_id})
                await uow.commit()
    run_scenario(scenario)

def test_single_local_preview_connects_auth_and_activity():

    async def scenario(db, store, user_id, email, password):
        import httpx
        from tools.lab.async_combined_preview import create_combined_preview
        app = create_combined_preview(AsyncIdentitySessions(db, store))
        try:
            async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url='http://test') as client:
                assert (await client.post('/api/user/login', json={'email': email, 'password': password})).status_code == 200
                assert (await client.get('/api/user/me')).json()['user']['id'] == user_id
                assert (await client.post('/api/user/activity/visit', json={'activity_date': '2026-03-04'})).status_code == 200
                assert (await client.post('/api/user/logout')).status_code == 200
                assert (await client.get('/api/user/me')).status_code == 401
                assert (await client.get('/api/user/activity', params={'year': 2026, 'month': 3})).status_code == 401
        finally:
            async with db.unit_of_work() as uow:
                await uow.session.execute(text('DELETE FROM user_activity_days WHERE user_id=:id'), {'id': user_id})
                await uow.commit()
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
