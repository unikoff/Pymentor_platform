"""A Redis cache repair must not undo a concurrent SQL logout."""

import pytest
from hashlib import sha256
from uuid import uuid4
from sqlalchemy import text

from pymentor_core.adapters.runtime import RuntimeIdentitySessions as AsyncIdentitySessions
from pymentor_core.modules.identity.contracts import InvalidSession
from runtime_scenarios import run_scenario


def test_projection_repair_does_not_authenticate_after_concurrent_logout():
    async def scenario(db, store, _user_id, email, password):
        service = AsyncIdentitySessions(db, store, recovery_key=b"synthetic-recovery-key-32-bytes!!")
        token = (await service.login(email, password, operation_id=str(uuid4()))).token
        digest = store._digest(token)
        await store._client.delete(f"{store._prefix}token:{digest}",
                                   f"{store._prefix}token:prepared:{digest}")
        real_add = store.add_user_sessions
        repair_attempted = False

        async def add_then_logout(user_id, sessions):
            nonlocal repair_attempted
            repair_attempted = True
            await real_add(user_id, sessions)
            await service.logout(token)

        store.add_user_sessions = add_then_logout
        with pytest.raises(InvalidSession):
            await service.authenticate(token)
        assert repair_attempted, "the test must exercise Redis repair before logout"
        with pytest.raises(InvalidSession):
            await service.authenticate(token)

    run_scenario(scenario)


def test_sql_row_without_confirmed_operation_does_not_repair_redis():
    async def scenario(db, store, user_id, _email, _password):
        service = AsyncIdentitySessions(db, store, recovery_key=b"synthetic-recovery-key-32-bytes!!")
        token = str(uuid4())
        digest = sha256(token.encode()).hexdigest()
        async with db.unit_of_work() as uow:
            await uow.session.execute(text(
                "INSERT INTO sessions(user_id, session_token) VALUES (:uid, :digest)"
            ), {"uid": user_id, "digest": digest})
            await uow.commit()
        with pytest.raises(InvalidSession):
            await service.authenticate(token)
        assert await store.get_user(token) is None

    run_scenario(scenario)
