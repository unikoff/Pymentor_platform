"""Fail closed when Redis and synthetic SQL observe different times."""
import asyncio
import os
from datetime import datetime, timedelta, timezone
from uuid import uuid4

import pytest

from identity.async_sessions import AsyncIdentitySessions, IdentityUnavailable
from identity.legacy_session_import import LegacySession, import_legacy_sessions
from infrastructure.redis_sessions import RedisSessionStore
from test_c224_projection_unit import Database


def test_legacy_import_does_not_commit_if_redis_clock_has_already_expired_gate():
    url = os.getenv('PYMENTOR_TEST_REDIS_URL')
    if not url:
        pytest.skip('requires explicitly configured disposable Redis')

    async def scenario():
        database = Database()
        # Simulate SQL clock behind Redis without changing either system clock.
        database.now = datetime.now(timezone.utc) - timedelta(minutes=2)
        candidate = LegacySession(str(uuid4()), database.now - timedelta(days=30) + timedelta(seconds=30))
        prefix = f'pymentor-c216-test:{uuid4()}:'
        store = RedisSessionStore(url, prefix=prefix)
        service = AsyncIdentitySessions(database, store)
        try:
            # SQL fake needs only the same row lock already used by its other tests.
            from unittest.mock import AsyncMock
            service._locked_user = AsyncMock(return_value=database.user)
            with pytest.raises(IdentityUnavailable, match='Session projection unavailable'):
                await import_legacy_sessions(service, 1, [candidate])
            assert not database.rows and not database.marker
        finally:
            digest = store._digest(candidate.token)
            await store._client.delete(f'{prefix}user:1', f'{prefix}token:{digest}')
            await store.close()

    asyncio.run(scenario())


@pytest.mark.xfail(strict=True, reason='Redis gate can disappear after precheck and before SQL commit')
def test_legacy_import_does_not_strand_session_if_gate_disappears_after_check():
    url = os.getenv('PYMENTOR_TEST_REDIS_URL')
    if not url:
        pytest.skip('requires explicitly configured disposable Redis')

    async def scenario():
        database = Database()
        candidate = LegacySession(str(uuid4()), datetime.now(timezone.utc))
        prefix = f'pymentor-c216-test:{uuid4()}:'
        store = RedisSessionStore(url, prefix=prefix)
        service = AsyncIdentitySessions(database, store)
        from unittest.mock import AsyncMock
        service._locked_user = AsyncMock(return_value=database.user)
        original_get_user = store.get_user

        async def evict_after_check(token):
            owner = await original_get_user(token)
            await store._client.delete(f'{prefix}token:{store._digest(token)}')
            return owner

        store.get_user = evict_after_check
        try:
            try:
                await import_legacy_sessions(service, 1, [candidate])
            except IdentityUnavailable:
                assert not database.rows and not database.marker
                return
            assert not database.rows or await original_get_user(candidate.token) == 1
        finally:
            digest = store._digest(candidate.token)
            await store._client.delete(f'{prefix}user:1', f'{prefix}token:{digest}')
            await store.close()

    asyncio.run(scenario())
