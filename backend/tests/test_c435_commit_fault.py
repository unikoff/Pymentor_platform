"""Release-gate scenarios on explicitly guarded, synthetic PostgreSQL/Redis."""

from unittest.mock import patch

import pytest
from sqlalchemy.exc import SQLAlchemyError

from identity.async_sessions import AsyncIdentitySessions, IdentityUnavailable, InvalidSession
from infrastructure.dual_async_pg import AsyncUnitOfWork
from test_c216_session_flow import run_scenario


@pytest.mark.xfail(
    strict=True,
    raises=InvalidSession,
    reason="PYM-435: lost SQL commit acknowledgement can evict an old session without delivering a cookie",
)
def test_lost_commit_acknowledgement_keeps_previous_sessions_until_new_cookie_is_usable():
    async def scenario(db, store, user_id, email, password):
        service = AsyncIdentitySessions(db, store)
        previous = [(await service.login(email, password)).token for _ in range(3)]
        real_commit = AsyncUnitOfWork.commit

        async def committed_but_ack_lost(uow):
            await real_commit(uow)
            raise SQLAlchemyError("synthetic lost acknowledgement after committed transaction")

        with patch.object(AsyncUnitOfWork, "commit", committed_but_ack_lost):
            with pytest.raises(IdentityUnavailable):
                await service.login(email, password)

        # The new cookie was never returned. The desired release invariant is that
        # all previous sessions remain usable. Current code evicts the first one.
        for token in previous:
            assert (await service.authenticate(token)).user_id == user_id

    run_scenario(scenario)
