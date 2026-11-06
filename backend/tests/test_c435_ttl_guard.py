"""Session expiry and Redis-loss checks against guarded synthetic stores."""

import asyncio
from unittest.mock import patch
from uuid import uuid4

import pytest

from identity.async_sessions import AsyncIdentitySessions, IdentityUnavailable, InvalidSession
from test_c216_session_flow import run_scenario


def test_expired_preparation_does_not_evict_existing_sessions():
    async def scenario(db, store, user_id, email, password):
        service = AsyncIdentitySessions(db, store)
        previous = [(await service.login(email, password)).token for _ in range(3)]

        class ExpiredPreparation:
            async def prepare_session(self, uid, digest, ttl):
                await store.prepare_session(uid, digest, ttl)
                await asyncio.sleep(1.25)

        with patch("identity.async_sessions.SESSION_TTL_SECONDS", 1):
            with pytest.raises(IdentityUnavailable, match="expired"):
                await AsyncIdentitySessions(db, ExpiredPreparation()).login(email, password)
        for token in previous:
            assert (await service.authenticate(token)).user_id == user_id

    run_scenario(scenario)


def test_candidate_active_sql_session_recovers_after_projection_loss():
    async def scenario(db, store, user_id, email, password):
        service = AsyncIdentitySessions(db, store, recovery_key=b"synthetic-recovery-key-32-bytes!!")
        token = (await service.login(email, password, operation_id=str(uuid4()))).token
        digest = store._digest(token)
        await store._client.delete(f"{store._prefix}token:{digest}",
                                   f"{store._prefix}token:prepared:{digest}")
        assert (await service.authenticate(token)).user_id == user_id

    run_scenario(scenario)
