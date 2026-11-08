"""Identity session values and failures, independent of a database or HTTP."""

from dataclasses import dataclass
from dataclasses import field
from pymentor_core.modules.identity.principal import Principal

SESSION_TTL_SECONDS = 30 * 24 * 60 * 60
MAX_SESSIONS = 3


class InvalidCredentials(Exception):
    pass


class InvalidSession(Exception):
    pass


class IdentityUnavailable(Exception):
    pass


@dataclass(frozen=True, slots=True)
class SessionGrant:
    token: str = field(repr=False)
    principal: Principal = field(repr=False)
    public_user: dict[str, object] = field(repr=False)
