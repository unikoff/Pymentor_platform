"""Local-only, fail-closed Redis projection for the experimental session slice."""

from hashlib import sha256
from math import isfinite
import re
from urllib.parse import urlsplit

from redis.asyncio import BlockingConnectionPool, Redis


_REPLACE = """
local effective = {}
for i = 3, #ARGV, 2 do
    local key = ARGV[1] .. ARGV[i]
    local owner = redis.call('GET', key)
    if owner and owner ~= ARGV[2] then
        return redis.error_reply('session token belongs to another user')
    end
    local prepared_owner = redis.call('GET', ARGV[1] .. 'prepared:' .. ARGV[i])
    if prepared_owner and prepared_owner ~= ARGV[2] then
        return redis.error_reply('prepared session belongs to another user')
    end
    local ttl = tonumber(ARGV[i + 1]) * 1000
    local remaining = redis.call('PTTL', key)
    if remaining > 0 and remaining < ttl then ttl = remaining end
    effective[i] = ttl
end
local old = redis.call('ZRANGE', KEYS[1], 0, -1)
for _, digest in ipairs(old) do
    if redis.call('GET', ARGV[1] .. digest) == ARGV[2] then
        redis.call('DEL', ARGV[1] .. digest)
    end
end
redis.call('DEL', KEYS[1])
local max_ttl = 0
for i = 3, #ARGV, 2 do
    local digest, ttl = ARGV[i], effective[i]
    redis.call('SET', ARGV[1] .. digest, ARGV[2], 'PX', ttl)
    redis.call('ZADD', KEYS[1], 0, digest)
    if ttl > max_ttl then max_ttl = ttl end
end
if max_ttl > 0 then redis.call('PEXPIRE', KEYS[1], max_ttl) end
return 1
"""

_PREPARE = """
if redis.call('EXISTS', KEYS[1], KEYS[2]) ~= 0 then
    return redis.error_reply('session token already exists')
end
redis.call('SET', KEYS[2], ARGV[1], 'EX', ARGV[2], 'NX')
return 1
"""

_ADD = """
local index_type = redis.call('TYPE', KEYS[1]).ok
if index_type ~= 'none' and index_type ~= 'zset' then
    return redis.error_reply('invalid session index type')
end
local time = redis.call('TIME')
local now = tonumber(time[1]) * 1000 + math.floor(tonumber(time[2]) / 1000)
local max_expiry = 0
for i = 3, #ARGV, 2 do
    if tonumber(ARGV[i + 1]) > now then
        local key = ARGV[1] .. ARGV[i]
        local owner = redis.call('GET', key)
        local prepared_owner = redis.call('GET', ARGV[1] .. 'prepared:' .. ARGV[i])
        if (owner and owner ~= ARGV[2]) or (prepared_owner and prepared_owner ~= ARGV[2]) then
            return redis.error_reply('session token belongs to another user')
        end
    end
end
local index_ttl = redis.call('PTTL', KEYS[1])
for i = 3, #ARGV, 2 do
    local key, expiry = ARGV[1] .. ARGV[i], tonumber(ARGV[i + 1])
    if expiry > now then
        local remaining = redis.call('PTTL', key)
        if remaining >= 0 and now + remaining < expiry then expiry = now + remaining end
        redis.call('SET', key, ARGV[2])
        redis.call('PEXPIREAT', key, expiry)
        redis.call('ZADD', KEYS[1], 0, ARGV[i])
        if expiry > max_expiry then max_expiry = expiry end
    end
end
if max_expiry > 0 and (index_ttl == -2 or (index_ttl >= 0 and now + index_ttl < max_expiry)) then
    redis.call('PEXPIREAT', KEYS[1], max_expiry)
end
return 1
"""

_REVOKE = """
if redis.call('GET', KEYS[2]) == ARGV[1] then
    redis.call('DEL', KEYS[2])
end
if redis.call('GET', KEYS[3]) == ARGV[1] then
    redis.call('DEL', KEYS[3])
end
redis.call('ZREM', KEYS[1], ARGV[2])
return 1
"""


class SessionDigest(str):
    """An already-hashed SQL token; never treat an HTTP cookie as this type."""

    def __new__(cls, value: str):
        if not isinstance(value, str) or not re.fullmatch(r"[0-9a-f]{64}", value):
            raise ValueError("Invalid session digest")
        return super().__new__(cls, value)


class RedisSessionStore:
    """Hash token keys; SQL remains authoritative. Never scan shared Redis."""

    def __init__(self, url: str, *, prefix: str, max_connections: int = 8,
                 socket_timeout: float = 2) -> None:
        parsed = urlsplit(url)
        if (parsed.scheme != 'redis' or parsed.hostname not in {'127.0.0.1', 'localhost', '::1'}
                or parsed.port != 57146 or parsed.path not in {'', '/0'}
                or parsed.username or parsed.password or parsed.query or parsed.fragment):
            raise ValueError('Expected the disposable local Redis on port 57146, database 0')
        if not isinstance(prefix, str) or not re.fullmatch(r'pymentor-c216-test:[0-9a-f-]{32,36}:', prefix):
            raise ValueError('An isolated test prefix is required')
        if (not isinstance(max_connections, int) or isinstance(max_connections, bool)
                or not 1 <= max_connections <= 64 or isinstance(socket_timeout, bool)
                or not isinstance(socket_timeout, (int, float)) or not isfinite(socket_timeout)
                or not 0 < socket_timeout <= 30):
            raise ValueError('A bounded pool and positive timeout are required')
        self._prefix = prefix
        pool = BlockingConnectionPool.from_url(
            url, decode_responses=True, max_connections=max_connections, timeout=socket_timeout,
            socket_timeout=socket_timeout, socket_connect_timeout=socket_timeout, retry_on_timeout=False,
        )
        self._client = Redis.from_pool(pool)

    @staticmethod
    def _digest(token: str) -> str:
        if isinstance(token, SessionDigest):
            return str(token)
        if not isinstance(token, str) or not token or len(token) > 256:
            raise ValueError('Invalid session token')
        return sha256(token.encode('utf-8')).hexdigest()

    def _user_key(self, user_id: int) -> str:
        if not isinstance(user_id, int) or isinstance(user_id, bool) or not 1 <= user_id < 2**63:
            raise ValueError('Invalid user id')
        return f'{self._prefix}user:{user_id}'

    async def replace_user_sessions(self, user_id: int, sessions: list[tuple[str, int]]) -> None:
        if len(sessions) > 3:
            raise ValueError('At most three sessions are permitted')
        values = []
        for token, ttl in sessions:
            if not isinstance(ttl, int) or isinstance(ttl, bool) or not 1 <= ttl <= 30 * 24 * 60 * 60:
                raise ValueError('Invalid session TTL')
            values.extend((self._digest(token), ttl))
        if len(set(values[::2])) != len(sessions):
            raise ValueError('Duplicate tokens')
        await self._client.eval(_REPLACE, 1, self._user_key(user_id),
                                f'{self._prefix}token:', str(user_id), *values)

    async def get_user(self, token: str) -> int | None:
        digest = self._digest(token)
        values = await self._client.mget(f'{self._prefix}token:{digest}',
                                         f'{self._prefix}token:prepared:{digest}')
        owners = {value for value in values if value is not None}
        if len(owners) > 1:
            return None
        value = next(iter(owners), None)
        return int(value) if value is not None else None

    async def add_user_sessions(self, user_id: int, sessions: list[tuple[str, int]]) -> None:
        """Add gates with absolute SQL expiry in Unix milliseconds, never delete others."""
        if len(sessions) > 3:
            raise ValueError('At most three sessions are permitted')
        values = []
        for token, expiry in sessions:
            if not isinstance(expiry, int) or isinstance(expiry, bool) or not 0 < expiry < 2**53:
                raise ValueError('Invalid session expiry')
            values.extend((self._digest(token), expiry))
        if len(set(values[::2])) != len(sessions):
            raise ValueError('Duplicate tokens')
        await self._client.eval(_ADD, 1, self._user_key(user_id),
                                f'{self._prefix}token:', str(user_id), *values)

    async def prepare_session(self, user_id: int, digest: SessionDigest, ttl: int) -> None:
        """Reserve a new digest outside the replaceable projection and its index."""
        self._user_key(user_id)
        if not isinstance(digest, SessionDigest):
            raise ValueError('Expected a session digest')
        if not isinstance(ttl, int) or isinstance(ttl, bool) or not 1 <= ttl <= 30 * 24 * 60 * 60:
            raise ValueError('Invalid session TTL')
        await self._client.eval(_PREPARE, 2, f'{self._prefix}token:{digest}',
                                f'{self._prefix}token:prepared:{digest}', str(user_id), ttl)

    async def ping(self) -> bool:
        return bool(await self._client.ping())

    async def revoke_user_token(self, user_id: int, token: str) -> None:
        digest = self._digest(token)
        await self._client.eval(_REVOKE, 3, self._user_key(user_id),
                                f'{self._prefix}token:{digest}',
                                f'{self._prefix}token:prepared:{digest}', str(user_id), digest)

    async def close(self) -> None:
        await self._client.aclose()
