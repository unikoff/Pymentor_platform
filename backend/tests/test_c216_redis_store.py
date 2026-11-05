"""Synthetic integration checks for the C2.1.6 standalone Redis projection.

Every test creates a unique namespace and cleans up only explicitly registered keys.
"""

from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager
from hashlib import sha256
from unittest.mock import patch
from uuid import uuid4

import pytest
import redis.asyncio as redis
from redis.exceptions import ConnectionError as RedisConnectionError
from redis.exceptions import ResponseError, TimeoutError as RedisTimeoutError

from infrastructure.redis_sessions import RedisSessionStore


URL = "redis://127.0.0.1:57146/0"


def token_key(prefix: str, raw_token: str) -> str:
    return f"{prefix}token:{sha256(raw_token.encode('utf-8')).hexdigest()}"


def index_key(prefix: str, user_id: int) -> str:
    return f"{prefix}user:{user_id}"


@asynccontextmanager
async def isolated_redis():
    prefix = f"pymentor-c216-test:{uuid4().hex}:"
    store = RedisSessionStore(URL, prefix=prefix, max_connections=4, socket_timeout=1.0)
    inspector = redis.from_url(URL, max_connections=2, socket_timeout=1.0)
    owned: set[str] = set()

    def track(*, users=(), tokens=(), extras=()):
        owned.update(index_key(prefix, user) for user in users)
        owned.update(token_key(prefix, token) for token in tokens)
        owned.update(extras)

    try:
        try:
            await inspector.ping()
        except (RedisConnectionError, RedisTimeoutError):
            pytest.skip("synthetic standalone Redis is unavailable on 127.0.0.1:57146")
        yield store, inspector, prefix, track
    finally:
        try:
            if owned:
                await inspector.delete(*owned)
        finally:
            await store.close()
            await inspector.aclose()


@pytest.mark.parametrize("url", [
    "redis://localhost:6379/0",
    "redis://127.0.0.1:57146/1",
    "redis://example.com:57146/0",
    "rediss://localhost:57146/0",
    "redis://localhost:57146/0?db=0",
    "redis://localhost:57146/0#fragment",
    "redis://user@localhost:57146/0",
    "redis://:secret@localhost:57146/0",
    "redis://localhost:57146/not-a-db",
    "redis://localhost/0",
])
def test_only_explicit_local_redis_db0_is_accepted(url):
    with pytest.raises(ValueError):
        RedisSessionStore(url, prefix=f"pymentor-c216-test:{uuid4().hex}:")


@pytest.mark.parametrize("options", [
    {"prefix": ""},
    {"prefix": "unsafe*prefix"},
    {"max_connections": 0},
    {"max_connections": 1000},
    {"max_connections": True},
    {"socket_timeout": 0},
    {"socket_timeout": float("inf")},
    {"socket_timeout": float("nan")},
    {"socket_timeout": True},
])
def test_pool_and_namespace_are_bounded(options):
    params = {"prefix": f"pymentor-c216-test:{uuid4().hex}:", **options}
    with pytest.raises(ValueError):
        RedisSessionStore(URL, **params)


def test_projection_stores_hashes_and_preserves_other_users_and_keys():
    async def scenario():
        async with isolated_redis() as (store, client, prefix, track):
            a, b, c = "synthetic-secret-a", "synthetic-secret-b", "synthetic-secret-c"
            marker = f"{prefix}:sentinel"
            track(users=(11, 22), tokens=(a, b, c), extras=(marker,))
            await client.set(marker, "untouched")
            await store.replace_user_sessions(11, [(a, 20), (b, 30)])
            await store.replace_user_sessions(22, [(c, 30)])

            assert await store.get_user(a) == 11
            assert await store.get_user(b) == 11
            assert await store.get_user(c) == 22
            assert await client.get(token_key(prefix, a)) == b"11"
            members = await client.zrange(index_key(prefix, 11), 0, -1)
            assert set(members) == {
                sha256(a.encode()).hexdigest().encode(),
                sha256(b.encode()).hexdigest().encode(),
            }
            assert a.encode() not in b" ".join(members)
            assert await client.pttl(token_key(prefix, a)) > 0
            assert await client.pttl(index_key(prefix, 11)) > 0

            await store.replace_user_sessions(11, [(b, 30)])
            assert await store.get_user(a) is None
            assert await client.exists(token_key(prefix, a)) == 0
            assert await store.get_user(b) == 11
            assert await store.get_user(c) == 22
            assert await client.get(marker) == b"untouched"
            await store.replace_user_sessions(11, [])
            assert await store.get_user(b) is None
            assert await client.exists(index_key(prefix, 11)) == 0
            assert await store.get_user(c) == 22

    asyncio.run(scenario())


def test_repeated_projection_never_renews_existing_token_ttl():
    async def scenario():
        async with isolated_redis() as (store, client, prefix, track):
            token = "synthetic-no-renewal"
            track(users=(4,), tokens=(token,))
            await store.replace_user_sessions(4, [(token, 2)])
            before = await client.pttl(token_key(prefix, token))
            assert 0 < before <= 2000
            await asyncio.sleep(0.06)
            await store.replace_user_sessions(4, [(token, 2592000)])
            after = await client.pttl(token_key(prefix, token))
            assert 0 < after < before
            await store.replace_user_sessions(4, [(token, 1)])
            assert 0 < await client.pttl(token_key(prefix, token)) <= 1000

    asyncio.run(scenario())


def test_server_expires_token_and_index():
    async def scenario():
        async with isolated_redis() as (store, client, prefix, track):
            token = "synthetic-expiring"
            track(users=(5,), tokens=(token,))
            await store.replace_user_sessions(5, [(token, 1)])
            assert await store.get_user(token) == 5
            await asyncio.sleep(1.2)
            assert await store.get_user(token) is None
            assert await client.exists(index_key(prefix, 5)) == 0

    asyncio.run(scenario())


@pytest.mark.parametrize("user_id,sessions", [
    (0, [("good", 20)]),
    (-1, [("good", 20)]),
    (True, [("good", 20)]),
    (2**64, [("good", 20)]),
    (3, [("", 20)]),
    (3, [("good", 0)]),
    (3, [("good", 2592001)]),
    (3, [("good", True)]),
    (3, [("good", 1), ("good", 1)]),
    (3, [("a", 1), ("b", 1), ("c", 1), ("d", 1)]),
])
def test_invalid_input_is_rejected_without_mutation(user_id, sessions):
    async def scenario():
        async with isolated_redis() as (store, client, prefix, track):
            original = "synthetic-stable"
            track(users=(3,), tokens=(original,))
            await store.replace_user_sessions(3, [(original, 20)])
            initial = await client.zrange(index_key(prefix, 3), 0, -1)
            with pytest.raises(ValueError):
                await store.replace_user_sessions(user_id, sessions)
            assert await client.zrange(index_key(prefix, 3), 0, -1) == initial
            assert await store.get_user(original) == 3

    asyncio.run(scenario())


def test_atomic_replacement_has_no_partial_index_or_unmapped_members():
    async def scenario():
        async with isolated_redis() as (store, client, prefix, track):
            old = ("synthetic-old-1", "synthetic-old-2")
            new = ("synthetic-new-1", "synthetic-new-2", "synthetic-new-3")
            user_id = 17
            track(users=(user_id,), tokens=(*old, *new))
            original = [(t, 30) for t in old]
            replacement = [(t, 30) for t in new]
            await store.replace_user_sessions(user_id, original)
            possible = {
                frozenset(sha256(t.encode()).hexdigest().encode() for t in group)
                for group in (old, new)
            }
            check = """
            local hashes = redis.call('ZRANGE', KEYS[1], 0, -1)
            for _, h in ipairs(hashes) do
              if redis.call('GET', ARGV[1] .. h) ~= ARGV[2] then
                return {'missing-owner'}
              end
            end
            return hashes
            """

            async def writer():
                for _ in range(80):
                    await store.replace_user_sessions(user_id, replacement)
                    await asyncio.sleep(0)
                    await store.replace_user_sessions(user_id, original)

            async def reader():
                for _ in range(160):
                    snapshot = await client.eval(check, 1, index_key(prefix, user_id),
                                                 f"{prefix}token:", str(user_id))
                    assert frozenset(snapshot) in possible
                    await asyncio.sleep(0)

            await asyncio.gather(writer(), reader())
            assert await store.get_user(old[0]) == user_id
            assert await store.get_user(new[0]) is None

    asyncio.run(scenario())


def test_logout_revocation_is_idempotent_and_does_not_rewrite_new_projection():
    async def scenario():
        async with isolated_redis() as (store, client, prefix, track):
            obsolete, current, newest, foreign = (
                "synthetic-obsolete", "synthetic-current",
                "synthetic-newest", "synthetic-foreign",
            )
            track(users=(25, 26), tokens=(obsolete, current, newest, foreign))
            await store.replace_user_sessions(25, [(obsolete, 30), (current, 30)])
            await store.replace_user_sessions(26, [(foreign, 30)])
            await store.replace_user_sessions(25, [(current, 30), (newest, 30)])
            await store.revoke_user_token(25, obsolete)
            await store.revoke_user_token(25, obsolete)
            await store.revoke_user_token(25, current)
            await store.revoke_user_token(25, current)
            assert await store.get_user(obsolete) is None
            assert await store.get_user(current) is None
            assert await store.get_user(newest) == 25
            assert await store.get_user(foreign) == 26
            members = await client.zrange(index_key(prefix, 25), 0, -1)
            assert members == [sha256(newest.encode()).hexdigest().encode()]

    asyncio.run(scenario())


def test_revoke_cannot_delete_token_owned_by_another_user():
    async def scenario():
        async with isolated_redis() as (store, client, prefix, track):
            shared = "synthetic-owner-boundary"
            track(users=(41, 42), tokens=(shared,))
            await store.replace_user_sessions(41, [(shared, 30)])
            digest = sha256(shared.encode()).hexdigest()
            await client.zadd(index_key(prefix, 42), {digest: 1})
            await store.revoke_user_token(42, shared)
            assert await store.get_user(shared) == 41
            assert await client.zcard(index_key(prefix, 42)) == 0

    asyncio.run(scenario())


def test_cross_user_token_conflict_is_atomic_and_cannot_hijack_owner():
    async def scenario():
        async with isolated_redis() as (store, client, prefix, track):
            shared, unrelated = "synthetic-conflict", "synthetic-other"
            track(users=(51, 52), tokens=(shared, unrelated))
            await store.replace_user_sessions(51, [(shared, 30)])
            await store.replace_user_sessions(52, [(unrelated, 30)])
            with pytest.raises(ResponseError):
                await store.replace_user_sessions(52, [(shared, 30)])
            assert await store.get_user(shared) == 51
            assert await store.get_user(unrelated) == 52
            assert await client.zcard(index_key(prefix, 52)) == 1

    asyncio.run(scenario())


def test_redis_failure_propagates_no_fallback():
    async def scenario():
        async with isolated_redis() as (store, _client, _prefix, _track):
            with patch.object(store._client, "get", side_effect=RedisConnectionError("synthetic")):
                with pytest.raises(RedisConnectionError, match="synthetic"):
                    await store.get_user("synthetic-token")

    asyncio.run(scenario())
