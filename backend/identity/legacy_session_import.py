"""Opt-in importer for synthetic, prevalidated local session migration experiments.

The source must be obtained independently: this module never opens a SQLite file.
It is deliberately restricted to the disposable test PostgreSQL and Redis.
"""

from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from uuid import UUID

from redis.exceptions import RedisError
from sqlalchemy import func, select, text
from sqlalchemy.exc import SQLAlchemyError

from db import models
from identity.async_sessions import (AsyncIdentitySessions, IdentityUnavailable, MAX_SESSIONS,
                                     SESSION_TTL_SECONDS)
from infrastructure.redis_sessions import RedisSessionStore


@dataclass(frozen=True, slots=True)
class LegacySession:
    token: str = field(repr=False)
    created_at: datetime


async def import_legacy_sessions(service: AsyncIdentitySessions, user_id: int,
                                 candidates: list[LegacySession]) -> int:
    """Import up to three known UTC sessions into an empty synthetic target user.

    Call only while the source user is quiesced. Unknown timezone or future dates
    are errors, not guesses. Expired candidates are ignored; no cookie is issued.
    """
    url = service.database.engine.url
    if (url.drivername != "postgresql+asyncpg" or url.host not in {"127.0.0.1", "localhost", "::1"}
            or url.port != 57152 or url.database != "pymentor_test" or url.username != "pymentor_test"
            or bool(url.query) or service.mode != "redis" or not isinstance(service.redis, RedisSessionStore)):
        raise ValueError("Legacy import is restricted to disposable local test services")
    if not isinstance(user_id, int) or isinstance(user_id, bool) or not 1 <= user_id < 2**63:
        raise ValueError("Invalid synthetic user id")
    if not isinstance(candidates, list) or len(candidates) > 1000:
        raise ValueError("Expected a bounded list of synthetic sessions")
    normalized = []
    seen = set()
    for candidate in candidates:
        if not isinstance(candidate, LegacySession) or not isinstance(candidate.created_at, datetime):
            raise ValueError("Invalid candidate")
        if candidate.created_at.tzinfo is None or candidate.created_at.utcoffset() is None:
            raise ValueError("Session timestamp requires an explicit timezone")
        if candidate.created_at.tzinfo is not timezone.utc:
            raise ValueError("Session timestamp must be normalized to UTC")
        try:
            valid_token = isinstance(candidate.token, str) and str(UUID(candidate.token)) == candidate.token
        except (ValueError, AttributeError):
            valid_token = False
        if not valid_token or candidate.token in seen:
            raise ValueError("Invalid or duplicate synthetic session token")
        seen.add(candidate.token)
        normalized.append(LegacySession(candidate.token, candidate.created_at.astimezone(timezone.utc)))
    try:
        async with service.database.unit_of_work() as uow:
            identity = (await uow.session.execute(text("SELECT current_database(), current_user"))).one()
            if tuple(identity) != ("pymentor_test", "pymentor_test"):
                raise RuntimeError("Unexpected test database identity")
            user = await service._locked_user(uow, user_id)
            if user is None or user.username != "synthetic" or not user.email.endswith("@example.test"):
                raise ValueError("Synthetic target user does not exist")
            count = await uow.session.scalar(select(func.count()).select_from(models.Session).where(
                models.Session.user_id == user_id))
            if count:
                raise ValueError("Target user already has sessions")
            already_consumed = await uow.session.scalar(text(
                "SELECT EXISTS (SELECT 1 FROM session_import_markers WHERE user_id=:id)"
            ), {"id": user_id})
            if already_consumed:
                raise ValueError("Legacy sessions already consumed for this user")
            now = await uow.session.scalar(select(func.clock_timestamp()))
            if any(item.created_at > now for item in normalized):
                raise ValueError("Session timestamp is in the future")
            cutoff = now - timedelta(seconds=SESSION_TTL_SECONDS)
            active = sorted((item for item in normalized if item.created_at > cutoff),
                            key=lambda item: (item.created_at, item.token))[-MAX_SESSIONS:]
            records = [models.Session(user_id=user_id, session_token=item.token, created_at=item.created_at)
                       for item in active]
            await service._mark_legacy_consumed(uow, user_id)
            uow.session.add_all(records)
            await uow.session.flush()
            await service.redis.replace_user_sessions(user_id, service._projection(records, now))
            await uow.commit()
            return len(records)
    except (RedisError, SQLAlchemyError, TimeoutError) as exc:
        try:
            await service.reconcile_user(user_id)
        except IdentityUnavailable:
            pass
        raise IdentityUnavailable("Session import unavailable") from exc
