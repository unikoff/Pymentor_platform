"""Release-gate case: Redis fails after reservation, before fourth login commits."""
import pytest
from redis.exceptions import ConnectionError as RedisConnectionError

from identity.async_sessions import AsyncIdentitySessions, IdentityUnavailable, InvalidSession
from test_c216_session_flow import run_scenario


@pytest.mark.xfail(strict=True, raises=InvalidSession,
    reason='PYM-435: Redis can fail after preparation and SQL still evicts a previous session')
def test_redis_failure_after_prepare_keeps_old_sessions_if_new_session_unusable():
    async def scenario(db, store, user_id, email, password):
        working = AsyncIdentitySessions(db, store)
        previous = [(await working.login(email, password)).token for _ in range(3)]

        class DownAfterPreparation:
            async def prepare_session(self, uid, digest, ttl):
                await store.prepare_session(uid, digest, ttl)

            async def get_user(self, token):
                raise RedisConnectionError('synthetic outage after preparation')

        during_outage = AsyncIdentitySessions(db, DownAfterPreparation())
        grant = await during_outage.login(email, password)
        with pytest.raises(IdentityUnavailable):
            await during_outage.authenticate(grant.token)
        # Redis recovered; a login which was unusable during the outage must
        # not have made any of the three pre-existing sessions unusable.
        for token in previous:
            assert (await working.authenticate(token)).user_id == user_id

    run_scenario(scenario)
