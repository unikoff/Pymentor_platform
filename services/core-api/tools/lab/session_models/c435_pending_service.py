"""Isolated PYM-435 experiment; never connect this coordinator to login.

The caller provides a lab-only async session factory and Redis store, verifies
identity/user/password and isolates the environment. All SQL helper writer
serialization and tombstone requirements remain the caller's responsibility.
The Redis gate is not atomic with SQL: loss after the gate can leave an active
SQL session without Redis. Unknown commit outcomes and cookie delivery are not
resolved; never automatically retry or compensate an unknown outcome. The
Redis TTL and SQL deadline are independently supplied and are not reconciled.
This is unsafe for the requested session-preservation guarantee and release.
"""

from datetime import datetime
from hashlib import sha256
from uuid import UUID

from sqlalchemy import text

from tools.lab.session_models import c435_pending_sql as sql
from pymentor_core.adapters.redis.sessions import SessionDigest


class PendingServiceError(Exception):
    """A categorized, sanitized failure; its outcome may be unknown."""


def _inputs(user_id, token):
    if type(user_id) is not int or not 1 <= user_id < 2**63:
        raise PendingServiceError("invalid input")
    if type(token) is not str:
        raise PendingServiceError("invalid input")
    try:
        parsed = UUID(token)
    except (ValueError, AttributeError):
        parsed = None
    if parsed is None or str(parsed) != token:
        raise PendingServiceError("invalid input")
    return SessionDigest(sha256(token.encode("ascii")).hexdigest())


async def _sql_clock(db):
    return (await db.execute(text("SELECT clock_timestamp()"))).scalar_one()


class SyntheticPendingCoordinator:
    """Explicit lab dependencies only; no authentication or user creation.

    ``database`` is an async session factory yielding context-managed UOWs;
    each UOW must roll back uncommitted changes on exit. ``redis`` implements
    RedisSessionStore's prepare_session/get_user contract. TTL is explicit,
    in whole seconds, from 1 to 2592000 (the store's bound), not a policy.
    """

    def __init__(self, database, redis):
        self._database = database
        self._redis = redis

    async def prepare(self, user_id, captured_generation, token, pending_deadline, ttl):
        digest = _inputs(user_id, token)
        if (
            type(captured_generation) is not int
            or not 0 <= captured_generation < 2**63
            or not isinstance(pending_deadline, datetime)
            or pending_deadline.tzinfo is None
            or pending_deadline.utcoffset() is None
            or type(ttl) is not int
            or not 1 <= ttl <= 30 * 24 * 60 * 60
        ):
            raise PendingServiceError("invalid input")
        try:
            await self._redis.prepare_session(user_id, digest, ttl)
        except Exception:
            redis_failed = True
        else:
            redis_failed = False
        if redis_failed:
            raise PendingServiceError("redis unavailable or outcome unknown")
        try:
            async with self._database() as db:
                await sql.prepare(
                    db,
                    user_id,
                    str(digest),
                    captured_generation,
                    pending_deadline,
                    _sql_clock,
                )
                await db.commit()
            return
        except Exception:
            pass
        raise PendingServiceError("sql failure or outcome unknown")

    async def activate(self, user_id, token):
        digest = _inputs(user_id, token)
        try:
            owner = await self._redis.get_user(token)
        except Exception:
            owner = None
            redis_failed = True
        else:
            redis_failed = False
        if redis_failed:
            raise PendingServiceError("redis unavailable or outcome unknown")
        if type(owner) is not int or owner != user_id:
            return False
        try:
            async with self._database() as db:
                activated = await sql.activate(db, user_id, str(digest), _sql_clock)
                if activated:
                    await db.commit()
                return activated
        except Exception:
            pass
        raise PendingServiceError("sql failure or outcome unknown")
