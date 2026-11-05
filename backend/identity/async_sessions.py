"""Experimental async sessions: PostgreSQL is authoritative, Redis is a fail-closed projection."""

from __future__ import annotations

import asyncio
import hmac
from hashlib import sha256
import re
from dataclasses import dataclass, field
from datetime import timedelta, timezone
from uuid import UUID, uuid4

from redis.exceptions import RedisError
from sqlalchemy import delete, func, select, text
from sqlalchemy.exc import SQLAlchemyError

from db import models
from identity.passwords import verify_password
from identity.principal import Principal
from infrastructure.redis_sessions import SessionDigest


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


class AsyncIdentitySessions:
    """Locally tested SQL authority and optional required Redis projection."""

    def __init__(self, database, redis_store, *, mode: str = "redis") -> None:
        url = database.engine.url
        if (url.drivername != "postgresql+asyncpg" or url.host not in {"127.0.0.1", "localhost", "::1"}
                or url.port != 57152 or url.database != "pymentor_test" or url.username != "pymentor_test"
                or bool(url.query)):
            raise ValueError("Async session prototype requires the disposable local test database")
        if mode not in {"redis", "sql"}:
            raise ValueError("session mode must be redis or sql")
        if mode == "redis" and redis_store is None:
            raise ValueError("Redis projection is required in redis mode")
        self.database = database
        self.redis = redis_store
        self.mode = mode

    async def _locked_user(self, uow, user_id: int):
        return await uow.session.scalar(select(models.User).where(models.User.id == user_id).with_for_update())

    async def check_async_database(self) -> None:
        """Verify the separate bounded auth pool reaches the intended test database."""
        try:
            async with self.database.unit_of_work() as uow:
                identity = (await uow.session.execute(text("SELECT current_database(), current_user"))).one()
                if tuple(identity) != ("pymentor_test", "pymentor_test"):
                    raise IdentityUnavailable("Session storage unavailable")
        except (SQLAlchemyError, TimeoutError, OSError) as exc:
            raise IdentityUnavailable("Session storage unavailable") from exc

    @staticmethod
    async def _mark_legacy_consumed(uow, user_id: int) -> None:
        await uow.session.execute(text(
            "INSERT INTO session_import_markers(user_id) VALUES (:id) ON CONFLICT (user_id) DO NOTHING"
        ), {"id": user_id})

    async def _active_sessions(self, uow, user_id: int, now):
        cutoff = now - timedelta(seconds=SESSION_TTL_SECONDS)
        sessions = list((await uow.session.scalars(select(models.Session).where(
            models.Session.user_id == user_id,
            models.Session.created_at > cutoff,
        ).order_by(models.Session.created_at.asc(), models.Session.id.asc()))).all())
        return sessions

    @staticmethod
    def _projection(sessions, now):
        result = []
        for item in sessions:
            remaining = int((item.created_at + timedelta(seconds=SESSION_TTL_SECONDS) - now).total_seconds())
            if remaining > 0:
                stored = item.session_token
                redis_token = SessionDigest(stored) if re.fullmatch(r"[0-9a-f]{64}", stored) else stored
                result.append((redis_token, min(remaining, SESSION_TTL_SECONDS)))
        return result

    @staticmethod
    def _token_identifiers(token: str) -> tuple[str, str] | None:
        if not isinstance(token, str) or len(token) != 36:
            return None
        try:
            if str(UUID(token)) != token:
                return None
        except ValueError:
            return None
        return token, sha256(token.encode("utf-8")).hexdigest()

    async def reconcile_user(self, user_id: int) -> None:
        """Rebuild only this user's Redis projection from committed PostgreSQL rows."""
        if self.redis is None:
            raise IdentityUnavailable("Redis projection unavailable")
        try:
            async with self.database.unit_of_work() as uow:
                user = await self._locked_user(uow, user_id)
                if user is None:
                    await self.redis.replace_user_sessions(user_id, [])
                    return
                now = await uow.session.scalar(select(func.clock_timestamp()))
                sessions = await self._active_sessions(uow, user_id, now)
                # Old SQL states can have more than three entries; preserve a single
                # authority by revoking excess in SQL before publishing projection.
                for old in sessions[:-MAX_SESSIONS]:
                    await uow.session.delete(old)
                sessions = sessions[-MAX_SESSIONS:]
                await self.redis.replace_user_sessions(user_id, self._projection(sessions, now))
                await uow.commit()
        except (RedisError, SQLAlchemyError, TimeoutError) as exc:
            raise IdentityUnavailable("Session storage unavailable") from exc

    async def login(self, email: str, password: str) -> SessionGrant:
        user_id = None
        try:
            async with self.database.unit_of_work() as lookup:
                credentials = (await lookup.session.execute(select(
                    models.User.id, models.User._password_hash,
                ).where(models.User.email == email))).one_or_none()
            if credentials is None or not await asyncio.to_thread(verify_password, password, credentials[1]):
                raise InvalidCredentials("Invalid email or password")
            async with self.database.unit_of_work() as uow:
                user = await self._locked_user(uow, credentials[0])
                if user is None or user.email != email or not hmac.compare_digest(user.password, credentials[1]):
                    raise InvalidCredentials("Invalid email or password")
                user_id = user.id
                await self._mark_legacy_consumed(uow, user.id)
                # PostgreSQL now() is fixed at transaction start, which can predate
                # waiting for this user's lock during concurrent logins.
                now = await uow.session.scalar(select(func.clock_timestamp()))
                active = await self._active_sessions(uow, user.id, now)
                for old in active[:max(0, len(active) - (MAX_SESSIONS - 1))]:
                    await uow.session.delete(old)
                active = active[-(MAX_SESSIONS - 1):]
                token = str(uuid4())
                record = models.Session(user_id=user.id, session_token=sha256(token.encode()).hexdigest(), created_at=now)
                uow.session.add(record)
                await uow.session.flush()
                active.append(record)
                if self.mode == "redis":
                    await self.redis.replace_user_sessions(user.id, self._projection(active, now))
                until = user.subscription_until
                if until is not None:
                    until = (until.replace(tzinfo=timezone.utc) if until.tzinfo is None
                             else until.astimezone(timezone.utc))
                public_user = {
                    "id": user.id, "username": user.username, "email": user.email,
                    "subscription_until": until.isoformat() if until else None,
                    "subscription_plan": user.subscription_plan,
                    "has_active_subscription": until is not None and until > now,
                    "is_admin": bool(user.is_admin),
                }
                principal = Principal.from_user(user)
                await uow.commit()
                return SessionGrant(token, principal, public_user)
        except (RedisError, SQLAlchemyError, TimeoutError) as exc:
            # A lost response can have an unknown outcome. SQL is authoritative;
            # rebuilding from committed rows is safe, but may itself be unavailable.
            if user_id is not None and self.mode == "redis":
                try:
                    await self.reconcile_user(user_id)
                except IdentityUnavailable:
                    pass
            raise IdentityUnavailable("Session storage unavailable") from exc

    async def authenticate(self, token: str) -> Principal:
        identifiers = self._token_identifiers(token)
        if identifiers is None:
            raise InvalidSession("Invalid session")
        try:
            projected_user = await self.redis.get_user(token) if self.mode == "redis" else None
            if self.mode == "redis" and projected_user is None:
                raise InvalidSession("Invalid session")
            async with self.database.unit_of_work() as uow:
                row = (await uow.session.execute(select(models.Session, models.User, func.now()).join(
                    models.User, models.User.id == models.Session.user_id,
                ).where(models.Session.session_token.in_(identifiers)))).one_or_none()
                if row is None:
                    raise InvalidSession("Invalid session")
                session_record, user, now = row
                if session_record.created_at <= now - timedelta(seconds=SESSION_TTL_SECONDS):
                    raise InvalidSession("Invalid session")
                if self.mode == "redis" and projected_user != user.id:
                    raise InvalidSession("Invalid session")
                return Principal.from_user(user)
        except (RedisError, SQLAlchemyError, TimeoutError) as exc:
            raise IdentityUnavailable("Session storage unavailable") from exc

    async def invalidate_user_sessions(self, user_id: int) -> int:
        """Force a test user to sign in again; stale Redis gates cannot bypass SQL."""
        url = self.database.engine.url
        if (url.drivername != "postgresql+asyncpg" or url.host not in {"127.0.0.1", "localhost", "::1"}
                or url.port != 57152 or url.database != "pymentor_test" or url.username != "pymentor_test"
                or bool(url.query)):
            raise ValueError("Session invalidation requires the disposable local test database")
        if not isinstance(user_id, int) or isinstance(user_id, bool) or not 1 <= user_id < 2**63:
            raise ValueError("Invalid user id")
        try:
            async with self.database.unit_of_work() as uow:
                identity = (await uow.session.execute(text("SELECT current_database(), current_user"))).one()
                if tuple(identity) != ("pymentor_test", "pymentor_test"):
                    raise ValueError("Unexpected test database identity")
                user = await self._locked_user(uow, user_id)
                if user is None:
                    return 0
                if user.username != "synthetic" or not user.email.endswith("@example.test"):
                    raise ValueError("Expected a synthetic test user")
                await self._mark_legacy_consumed(uow, user_id)
                result = await uow.session.execute(delete(models.Session).where(models.Session.user_id == user_id))
                count = result.rowcount
                await uow.commit()
                return count
        except (SQLAlchemyError, TimeoutError) as exc:
            raise IdentityUnavailable("Session storage unavailable") from exc

    async def logout(self, token: str) -> None:
        """Revoke in the authoritative SQL transaction before invalidating Redis."""
        identifiers = self._token_identifiers(token)
        if identifiers is None:
            return
        user_id = None
        try:
            async with self.database.unit_of_work() as uow:
                record = await uow.session.scalar(select(models.Session).where(models.Session.session_token.in_(identifiers)))
                if record is not None:
                    user_id = record.user_id
                    await self._locked_user(uow, user_id)
                    await self._mark_legacy_consumed(uow, user_id)
                    await uow.session.execute(delete(models.Session).where(models.Session.session_token.in_(identifiers)))
                    await uow.commit()
        except (SQLAlchemyError, TimeoutError) as exc:
            raise IdentityUnavailable("Session storage unavailable") from exc
        if user_id is not None and self.mode == "redis":
            try:
                await self.redis.revoke_user_token(user_id, token)
            except (RedisError, TimeoutError):
                # SQL is authoritative. A stale Redis key cannot authenticate.
                pass
