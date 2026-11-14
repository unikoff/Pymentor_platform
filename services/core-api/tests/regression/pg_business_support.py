"""Shared, guarded PostgreSQL fixtures for business and transaction tests.

IdentityStub isolates these tests from authentication, which has its own real
PostgreSQL/Redis HTTP suite. It never creates or reads SQL session cookies.
"""
from types import SimpleNamespace

from pymentor_core.modules.identity.contracts import InvalidSession
from test_c2_1_4_auth_legacy import runtime_db  # noqa: F401 (pytest fixture)


class IdentityStub:
    def __init__(self, tokens):
        self.tokens = tokens

    async def authenticate(self, token):
        if token not in self.tokens:
            raise InvalidSession("synthetic unknown token")
        return SimpleNamespace(user_id=self.tokens[token])


def attach_identity(app, tokens):
    app.state.identity_sessions = IdentityStub(tokens)
