"""Opt-in importer for synthetic, prevalidated local session migration experiments.

The source must be obtained independently: this module never opens a SQLite file.
It is deliberately restricted to the disposable test PostgreSQL and Redis.
"""

from dataclasses import dataclass
from dataclasses import field
from datetime import datetime
from datetime import timedelta
from datetime import timezone
from hashlib import sha256
from uuid import UUID

from redis.exceptions import RedisError
from sqlalchemy import func
from sqlalchemy import select
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from pymentor_core.adapters.sql import models
from pymentor_core.adapters.postgres.identity_sessions import AsyncIdentitySessions
from pymentor_core.modules.identity.contracts import IdentityUnavailable
from pymentor_core.adapters.postgres.identity_sessions import MAX_SESSIONS
from pymentor_core.adapters.postgres.identity_sessions import SESSION_TTL_SECONDS
from pymentor_core.adapters.redis.sessions import RedisSessionStore


@dataclass(frozen=True, slots=True)
class LegacySession:
    token: str = field(repr=False)
    created_at: datetime


async def import_legacy_sessions(
    service: AsyncIdentitySessions,
    user_id: int,
    candidates: list[LegacySession],
    *,
    require_all: bool = False,
) -> int:
    """Import up to three known UTC sessions into an empty synthetic target user.

    Call only while the source user is quiesced. Unknown timezone or future dates
    are errors, not guesses. By default expired candidates are ignored; the
    synthetic migration's require_all mode rejects any dropped candidate. No
    cookie is issued.
    """
    url = service.database.engine.url
    if (
        url.drivername != "postgresql+asyncpg"
        or url.host not in {"127.0.0.1", "localhost", "::1"}
        or url.port != 57152
        or url.database != "pymentor_test"
        or url.username != "pymentor_test"
        or bool(url.query)
        or service.mode != "redis"
        or not isinstance(service.redis, RedisSessionStore)
    ):
        raise ValueError(
            "Legacy import is restricted to disposable local test services"
        )
    if (
        not isinstance(user_id, int)
        or isinstance(user_id, bool)
        or not 1 <= user_id < 2**63
    ):
        raise ValueError("Invalid synthetic user id")
    if type(require_all) is not bool:
        raise ValueError("Invalid legacy import mode")
    if (
        not isinstance(candidates, list)
        or len(candidates) > 1000
        or (require_all and not candidates)
    ):
        raise ValueError("Expected a bounded list of synthetic sessions")
    normalized = []
    seen = set()
    for candidate in candidates:
        if not isinstance(candidate, LegacySession) or not isinstance(
            candidate.created_at, datetime
        ):
            raise ValueError("Invalid candidate")
        if (
            candidate.created_at.tzinfo is None
            or candidate.created_at.utcoffset() is None
        ):
            raise ValueError("Session timestamp requires an explicit timezone")
        if candidate.created_at.tzinfo is not timezone.utc:
            raise ValueError("Session timestamp must be normalized to UTC")
        try:
            valid_token = (
                isinstance(candidate.token, str)
                and str(UUID(candidate.token)) == candidate.token
            )
        except (ValueError, AttributeError):
            valid_token = False
        if not valid_token or candidate.token in seen:
            raise ValueError("Invalid or duplicate synthetic session token")
        seen.add(candidate.token)
        normalized.append(
            LegacySession(
                candidate.token, candidate.created_at.astimezone(timezone.utc)
            )
        )
    try:

        async def check_target(uow, *, lock):
            identity = (
                await uow.session.execute(
                    text("SELECT current_database(), current_user")
                )
            ).one()
            if tuple(identity) != ("pymentor_test", "pymentor_test"):
                raise RuntimeError("Unexpected test database identity")
            user = (
                await service._locked_user(uow, user_id)
                if lock
                else await uow.session.scalar(
                    select(models.User).where(models.User.id == user_id)
                )
            )
            fixture_accounts = {
                ("synthetic_student", "student@example.test"),
                ("synthetic_user_admin", "user-admin@example.test"),
            }
            synthetic_identity = user is not None and (
                (
                    user.username == "synthetic"
                    and isinstance(user.email, str)
                    and user.email.endswith("@example.test")
                )
                or (user.username, user.email) in fixture_accounts
            )
            if not synthetic_identity:
                raise ValueError("Synthetic target user does not exist")
            count = await uow.session.scalar(
                select(func.count())
                .select_from(models.Session)
                .where(models.Session.user_id == user_id)
            )
            if count:
                raise ValueError("Target user already has sessions")
            already_consumed = await uow.session.scalar(
                text(
                    "SELECT EXISTS (SELECT 1 FROM session_import_markers WHERE user_id=:id)"
                ),
                {"id": user_id},
            )
            if already_consumed:
                raise ValueError("Legacy sessions already consumed for this user")
            now = await uow.session.scalar(select(func.clock_timestamp()))
            if any(item.created_at > now for item in normalized):
                raise ValueError("Session timestamp is in the future")
            cutoff = now - timedelta(seconds=SESSION_TTL_SECONDS)
            active = sorted(
                (item for item in normalized if item.created_at > cutoff),
                key=lambda item: (item.created_at, item.token),
            )[-MAX_SESSIONS:]
            if require_all and len(active) != len(normalized):
                raise IdentityUnavailable("Legacy session set changed")
            identifiers = [
                identifier
                for item in active
                for identifier in (item.token, sha256(item.token.encode()).hexdigest())
            ]
            if (
                identifiers
                and await uow.session.scalar(
                    select(models.Session.id)
                    .where(models.Session.session_token.in_(identifiers))
                    .limit(1)
                )
                is not None
            ):
                raise IdentityUnavailable("Session token collision")
            return now, active

        # Validate the source and target before touching Redis, but hold no user
        # write lock or open SQL transaction during network I/O.
        async with service.database.unit_of_work() as uow:
            now, active = await check_target(uow, lock=False)
            prepared_sessions = frozenset(active)
            records = [
                models.Session(
                    user_id=user_id,
                    session_token=item.token,
                    created_at=item.created_at,
                )
                for item in active
            ]
            projection = service._projection(records, now)
        await service.redis.add_user_sessions(user_id, projection)
        # Redis can reject an already-expired absolute expiry without creating
        # a gate (for example, if its clock is ahead of SQL). Confirm gates
        # outside the SQL transaction before any durable write.
        for item in active:
            try:
                owner = await service.redis.get_user(item.token)
            except ValueError:
                raise IdentityUnavailable("Session projection unavailable") from None
            if owner != user_id:
                raise IdentityUnavailable("Session projection unavailable")

        async with service.database.unit_of_work() as uow:
            now, active = await check_target(uow, lock=True)
            # The database clock can move backwards between projections. Never
            # commit a newly eligible SQL session whose Redis gate was not
            # prepared; sessions that expired in the meantime may be omitted.
            if not set(active).issubset(prepared_sessions):
                raise IdentityUnavailable("Session selection changed")
            records = [
                models.Session(
                    user_id=user_id,
                    session_token=item.token,
                    created_at=item.created_at,
                )
                for item in active
            ]
            await service._mark_legacy_consumed(uow, user_id)
            uow.session.add_all(records)
            await uow.session.flush()
            await uow.commit()
            return len(records)
    except (RedisError, SQLAlchemyError, TimeoutError):
        # Driver exceptions may contain SQL parameters or sensitive token
        # values. Do not expose them through the public exception traceback.
        raise IdentityUnavailable("Session import unavailable") from None
