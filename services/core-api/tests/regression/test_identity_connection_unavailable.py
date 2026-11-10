"""Session auth fails closed when PostgreSQL is unreachable."""
import asyncio
from contextlib import asynccontextmanager
from types import SimpleNamespace
from uuid import uuid4

import pytest
from sqlalchemy.engine import make_url
from pymentor_core.adapters.postgres.identity_sessions import AsyncIdentitySessions
from pymentor_core.modules.identity.contracts import IdentityUnavailable


def test_authentication_translates_connection_refused_without_revoking_session():
    class Database:
        engine = SimpleNamespace(url=make_url('postgresql+asyncpg://pymentor_test:x@127.0.0.1:57152/pymentor_test'))

        @asynccontextmanager
        async def unit_of_work(self):
            raise ConnectionRefusedError('synthetic database outage')
            yield

    class Redis:
        async def get_user(self, token):
            return 1

    service = AsyncIdentitySessions(Database(), Redis())
    with pytest.raises(IdentityUnavailable, match='Session storage unavailable'):
        asyncio.run(service.authenticate(str(uuid4())))
