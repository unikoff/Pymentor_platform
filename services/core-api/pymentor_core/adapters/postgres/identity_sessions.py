"""Experimental async sessions: PostgreSQL is authoritative, Redis is a fail-closed projection."""

from __future__ import annotations

import asyncio
import hmac
from hashlib import sha256
import re
from dataclasses import dataclass
from dataclasses import field
from datetime import datetime
from datetime import timedelta
from datetime import timezone
from uuid import UUID
from uuid import uuid4

from redis.exceptions import RedisError
from sqlalchemy import delete
from sqlalchemy import func
from sqlalchemy import select
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from pymentor_core.adapters.sql import models
from pymentor_core.modules.identity.passwords import verify_password
from pymentor_core.modules.identity.principal import Principal
from pymentor_core.adapters.redis.sessions import SessionDigest


from pymentor_core.modules.identity.contracts import SESSION_TTL_SECONDS
from pymentor_core.modules.identity.contracts import MAX_SESSIONS
from pymentor_core.modules.identity.contracts import InvalidCredentials
from pymentor_core.modules.identity.contracts import InvalidSession
from pymentor_core.modules.identity.contracts import IdentityUnavailable
from pymentor_core.modules.identity.contracts import SessionGrant


class AsyncIdentitySessions:
    """Locally tested SQL authority and optional required Redis projection."""

    def __init__(
        self,
        database,
        redis_store,
        *,
        mode: str = "redis",
        recovery_key: bytes | None = None,
    ) -> None:
        self._validate_database(database)
        if mode not in {"redis", "sql"}:
            raise ValueError("session mode must be redis or sql")
        if mode == "redis" and redis_store is None:
            raise ValueError("Redis projection is required in redis mode")
        self.database = database
        self.redis = redis_store
        self.mode = mode
        if recovery_key is not None and (
            type(recovery_key) is not bytes or len(recovery_key) < 32
        ):
            raise ValueError("Invalid login recovery key")
        self._recovery_key = recovery_key

    def _validate_database(self, database) -> None:
        url = database.engine.url
        if (
            url.drivername != "postgresql+asyncpg"
            or url.host not in {"127.0.0.1", "localhost", "::1"}
            or url.port != 57152
            or url.database != "pymentor_test"
            or url.username not in {"pymentor_test", "pymentor_app"}
            or bool(url.query)
        ):
            raise ValueError(
                "Async session prototype requires the disposable local test database"
            )

    @property
    def supports_login_retry(self) -> bool:
        return self.mode == "redis" and self._recovery_key is not None

    async def _locked_user(self, uow, user_id: int):
        return await uow.session.scalar(
            select(models.User).where(models.User.id == user_id).with_for_update()
        )

    async def check_async_database(self) -> None:
        """Verify the separate bounded auth pool reaches the intended test database."""
        try:
            async with self.database.unit_of_work() as uow:
                identity = (
                    await uow.session.execute(
                        text("SELECT current_database(), current_user")
                    )
                ).one()
                url = self.database.engine.url
                if tuple(identity) != (url.database, url.username):
                    raise IdentityUnavailable("Session storage unavailable")
        except (SQLAlchemyError, TimeoutError, OSError) as exc:
            raise IdentityUnavailable("Session storage unavailable") from exc

    @staticmethod
    async def _mark_legacy_consumed(uow, user_id: int) -> None:
        await uow.session.execute(
            text(
                "INSERT INTO session_import_markers(user_id) VALUES (:id) ON CONFLICT (user_id) DO NOTHING"
            ),
            {"id": user_id},
        )

    async def _active_sessions(self, uow, user_id: int, now):
        cutoff = now - timedelta(seconds=SESSION_TTL_SECONDS)
        sessions = list(
            (
                await uow.session.scalars(
                    select(models.Session)
                    .where(
                        models.Session.user_id == user_id,
                        models.Session.created_at > cutoff,
                    )
                    .order_by(models.Session.created_at.asc(), models.Session.id.asc())
                )
            ).all()
        )
        return sessions

    @staticmethod
    def _projection(sessions, now):
        result = []
        for item in sessions:
            expires = item.created_at + timedelta(seconds=SESSION_TTL_SECONDS)
            if expires > now:
                stored = item.session_token
                redis_token = (
                    SessionDigest(stored)
                    if re.fullmatch(r"[0-9a-f]{64}", stored)
                    else stored
                )
                expires = min(expires, now + timedelta(seconds=SESSION_TTL_SECONDS))
                epoch = datetime(1970, 1, 1, tzinfo=timezone.utc)
                result.append(
                    (redis_token, (expires - epoch) // timedelta(milliseconds=1))
                )
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
        """Add Redis gates for a committed SQL snapshot without deleting newer gates."""
        if self.redis is None:
            raise IdentityUnavailable("Redis projection unavailable")
        try:
            for _ in range(3):
                # Publish before deleting historical excess: a Redis error must
                # not revoke sessions. No network I/O occurs under the user lock.
                async with self.database.unit_of_work() as uow:
                    user = await uow.session.scalar(
                        select(models.User.id).where(models.User.id == user_id)
                    )
                    projection, selected_ids = [], ()
                    if user is not None:
                        now = await uow.session.scalar(select(func.clock_timestamp()))
                        sessions = await self._active_sessions(uow, user_id, now)
                        selected = sessions[-MAX_SESSIONS:]
                        selected_ids = tuple(item.id for item in selected)
                        projection = self._projection(selected, now)
                await self.redis.add_user_sessions(user_id, projection)
                # If login/logout changed the top three while publishing, retry
                # without deleting anything, rather than strand a valid session.
                async with self.database.unit_of_work() as uow:
                    locked_user = await self._locked_user(uow, user_id)
                    if locked_user is None:
                        if user is None:
                            return
                        continue
                    now = await uow.session.scalar(select(func.clock_timestamp()))
                    sessions = await self._active_sessions(uow, user_id, now)
                    if (
                        tuple(item.id for item in sessions[-MAX_SESSIONS:])
                        != selected_ids
                    ):
                        continue
                    for old in sessions[:-MAX_SESSIONS]:
                        await uow.session.delete(old)
                    await uow.commit()
                    return
            raise IdentityUnavailable("Session projection changed concurrently")
        except (RedisError, SQLAlchemyError, TimeoutError) as exc:
            raise IdentityUnavailable("Session storage unavailable") from exc

    async def login(
        self, email: str, password: str, *, operation_id: str | None = None
    ) -> SessionGrant:
        if operation_id is not None:
            return await self._login_with_operation(email, password, operation_id)
        try:
            async with self.database.unit_of_work() as lookup:
                credentials = (
                    await lookup.session.execute(
                        select(
                            models.User.id,
                            models.User._password_hash,
                        ).where(models.User.email == email)
                    )
                ).one_or_none()
            if credentials is None or not await asyncio.to_thread(
                verify_password, password, credentials[1]
            ):
                raise InvalidCredentials("Invalid email or password")
            token = str(uuid4())
            digest = sha256(token.encode()).hexdigest()
            prepared_at = None
            if self.mode == "redis":
                # The SQL timestamp bounds the prepared key's lifetime even if
                # Redis preparation or the subsequent row-lock wait is slow.
                async with self.database.unit_of_work() as clock:
                    # Refuse an existing SQL token before touching Redis: a stale
                    # reservation for another user could block reconciliation.
                    existing = await clock.session.scalar(
                        select(models.Session.id)
                        .where(models.Session.session_token.in_((token, digest)))
                        .limit(1)
                    )
                    if existing is not None:
                        raise IdentityUnavailable("Session token collision")
                    prepared_at = await clock.session.scalar(
                        select(func.clock_timestamp())
                    )
                await self.redis.prepare_session(
                    credentials[0], SessionDigest(digest), SESSION_TTL_SECONDS
                )
            async with self.database.unit_of_work() as uow:
                user = await self._locked_user(uow, credentials[0])
                if (
                    user is None
                    or user.email != email
                    or not hmac.compare_digest(user.password, credentials[1])
                ):
                    raise InvalidCredentials("Invalid email or password")
                # PostgreSQL now() is fixed at transaction start, which can predate
                # waiting for this user's lock during concurrent logins.
                now = await uow.session.scalar(select(func.clock_timestamp()))
                if prepared_at is not None and prepared_at <= now - timedelta(
                    seconds=SESSION_TTL_SECONDS
                ):
                    raise IdentityUnavailable("Prepared session expired")
                collision = await uow.session.scalar(
                    select(models.Session.id)
                    .where(models.Session.session_token.in_((token, digest)))
                    .limit(1)
                )
                if collision is not None:
                    raise IdentityUnavailable("Session token collision")
                await self._mark_legacy_consumed(uow, user.id)
                active = await self._active_sessions(uow, user.id, now)
                for old in active[: max(0, len(active) - (MAX_SESSIONS - 1))]:
                    await uow.session.delete(old)
                # Preserve commit-order semantics for concurrent logins. The Redis
                # key is prepared earlier and therefore cannot outlive this row.
                record = models.Session(
                    user_id=user.id, session_token=digest, created_at=now
                )
                uow.session.add(record)
                await uow.session.flush()
                until = user.subscription_until
                if until is not None:
                    until = (
                        until.replace(tzinfo=timezone.utc)
                        if until.tzinfo is None
                        else until.astimezone(timezone.utc)
                    )
                public_user = {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "subscription_until": until.isoformat() if until else None,
                    "subscription_plan": user.subscription_plan,
                    "has_active_subscription": until is not None and until > now,
                    "is_admin": bool(user.is_admin),
                }
                principal = Principal.from_user(user)
                await uow.commit()
                return SessionGrant(token, principal, public_user)
        except (RedisError, SQLAlchemyError, TimeoutError) as exc:
            # Redis and SQL responses can be lost after a write. Never compensate
            # based on an unknown outcome; uncommitted keys cannot authorize.
            raise IdentityUnavailable("Session storage unavailable") from exc

    async def _login_with_operation(
        self, email: str, password: str, operation_id: str
    ) -> SessionGrant:
        """Replay one authenticated login without creating a second session.

        SQL records the result atomically with session replacement. Redis is
        prepared outside the lock and is never sufficient to authorize a token.
        """
        from pymentor_core.modules.identity.login_recovery import derive_login_token

        if self._recovery_key is None or self.mode != "redis":
            raise IdentityUnavailable("Login recovery unavailable")
        try:
            async with self.database.unit_of_work() as uow:
                credentials = (
                    await uow.session.execute(
                        select(
                            models.User.id,
                            models.User._password_hash,
                        ).where(models.User.email == email)
                    )
                ).one_or_none()
            if credentials is None or not await asyncio.to_thread(
                verify_password, password, credentials[1]
            ):
                raise InvalidCredentials("Invalid email or password")
            # Reserve the operation under the same user lock used by session
            # writers. Unknown outcomes are reconciled by retrying this key.
            async with self.database.unit_of_work() as uow:
                user = await self._locked_user(uow, credentials[0])
                if (
                    user is None
                    or user.email != email
                    or not hmac.compare_digest(user.password, credentials[1])
                ):
                    raise InvalidCredentials("Invalid email or password")
                await uow.session.execute(
                    text("""
                    INSERT INTO account_lifecycles(user_id, lifecycle_id)
                    VALUES (:uid, :generation) ON CONFLICT (user_id) DO NOTHING
                """),
                    {"uid": user.id, "generation": str(uuid4())},
                )
                generation = await uow.session.scalar(
                    text(
                        "SELECT lifecycle_id FROM account_lifecycles WHERE user_id = :uid"
                    ),
                    {"uid": user.id},
                )
                if generation is None:
                    raise IdentityUnavailable("Account identity unavailable")
                generation_key = hmac.new(
                    self._recovery_key,
                    b"pymentor:identity:account-lifecycle:v1\x00"
                    + UUID(generation).bytes,
                    sha256,
                ).digest()
                try:
                    token = derive_login_token(
                        generation_key, credentials[0], operation_id
                    )
                except (TypeError, ValueError) as exc:
                    raise InvalidSession("Invalid login operation") from exc
                digest = sha256(token.encode()).hexdigest()
                await uow.session.execute(
                    text("""
                    INSERT INTO login_operations
                        (operation_id, user_id, token_digest, status, pending_expires_at, key_version)
                    VALUES (:op, :uid, :digest, 'pending', clock_timestamp() + interval '5 minutes', 1)
                    ON CONFLICT (operation_id) DO NOTHING
                """),
                    {"op": operation_id, "uid": user.id, "digest": digest},
                )
                operation = (
                    (
                        await uow.session.execute(
                            text("""
                    SELECT user_id, token_digest, status, pending_expires_at, session_id, key_version
                    FROM login_operations WHERE operation_id = :op FOR UPDATE
                """),
                            {"op": operation_id},
                        )
                    )
                    .mappings()
                    .one()
                )
                if (
                    operation["user_id"] != user.id
                    or operation["token_digest"] != digest
                    or operation["key_version"] != 1
                ):
                    raise InvalidSession("Invalid login operation")
                now = await uow.session.scalar(select(func.clock_timestamp()))
                if operation["status"] == "revoked":
                    raise InvalidSession("Login operation revoked")
                if (
                    operation["status"] == "pending"
                    and operation["pending_expires_at"] <= now
                ):
                    raise InvalidSession("Expired login operation")
                expiry = now + timedelta(seconds=SESSION_TTL_SECONDS)
                if operation["status"] == "committed":
                    existing = await uow.session.scalar(
                        select(models.Session).where(
                            models.Session.id == operation["session_id"],
                            models.Session.user_id == user.id,
                            models.Session.session_token == digest,
                            models.Session.created_at
                            > now - timedelta(seconds=SESSION_TTL_SECONDS),
                        )
                    )
                    if existing is None:
                        raise InvalidSession("Login session no longer active")
                    expiry = existing.created_at + timedelta(
                        seconds=SESSION_TTL_SECONDS
                    )
                await uow.commit()

            # A projected key alone cannot authorize; the second transaction
            # still verifies the operation and authoritative SQL session.
            epoch = datetime(1970, 1, 1, tzinfo=timezone.utc)
            await self.redis.add_user_sessions(
                credentials[0],
                [
                    (
                        SessionDigest(digest),
                        (expiry - epoch) // timedelta(milliseconds=1),
                    )
                ],
            )
            if await self.redis.get_user(token) != credentials[0]:
                raise IdentityUnavailable("Session projection unavailable")

            async with self.database.unit_of_work() as uow:
                user = await self._locked_user(uow, credentials[0])
                if (
                    user is None
                    or user.email != email
                    or not hmac.compare_digest(user.password, credentials[1])
                ):
                    raise InvalidCredentials("Invalid email or password")
                operation = (
                    (
                        await uow.session.execute(
                            text("""
                    SELECT user_id, token_digest, status, pending_expires_at, session_id, key_version
                    FROM login_operations WHERE operation_id = :op FOR UPDATE
                """),
                            {"op": operation_id},
                        )
                    )
                    .mappings()
                    .one_or_none()
                )
                now = await uow.session.scalar(select(func.clock_timestamp()))
                if (
                    operation is None
                    or operation["user_id"] != user.id
                    or operation["token_digest"] != digest
                    or operation["key_version"] != 1
                ):
                    raise InvalidSession("Invalid login operation")
                if operation["status"] == "committed":
                    record = await uow.session.scalar(
                        select(models.Session).where(
                            models.Session.id == operation["session_id"],
                            models.Session.user_id == user.id,
                            models.Session.session_token == digest,
                            models.Session.created_at
                            > now - timedelta(seconds=SESSION_TTL_SECONDS),
                        )
                    )
                    if record is None:
                        raise InvalidSession("Login session no longer active")
                elif (
                    operation["status"] == "pending"
                    and operation["pending_expires_at"] > now
                ):
                    await self._mark_legacy_consumed(uow, user.id)
                    active = await self._active_sessions(uow, user.id, now)
                    for old in active[: max(0, len(active) - (MAX_SESSIONS - 1))]:
                        await uow.session.delete(old)
                    record = models.Session(
                        user_id=user.id, session_token=digest, created_at=now
                    )
                    uow.session.add(record)
                    await uow.session.flush()
                    await uow.session.execute(
                        text("""
                        UPDATE login_operations SET status = 'committed', session_id = :sid,
                            committed_at = :now WHERE operation_id = :op
                    """),
                        {"sid": record.id, "now": now, "op": operation_id},
                    )
                else:
                    raise InvalidSession("Expired login operation")
                until = user.subscription_until
                if until is not None:
                    until = (
                        until.replace(tzinfo=timezone.utc)
                        if until.tzinfo is None
                        else until.astimezone(timezone.utc)
                    )
                public_user = {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "subscription_until": until.isoformat() if until else None,
                    "subscription_plan": user.subscription_plan,
                    "has_active_subscription": until is not None and until > now,
                    "is_admin": bool(user.is_admin),
                }
                principal = Principal.from_user(user)
                await uow.commit()
                final_expiry = record.created_at + timedelta(
                    seconds=SESSION_TTL_SECONDS
                )
            # Concurrent retries may have published before another attempt
            # committed. Clamp the Redis TTL to the authoritative SQL deadline.
            await self.redis.add_user_sessions(
                credentials[0],
                [
                    (
                        SessionDigest(digest),
                        (final_expiry - epoch) // timedelta(milliseconds=1),
                    )
                ],
            )
            if await self.redis.get_user(token) != credentials[0]:
                raise IdentityUnavailable("Session projection unavailable")
            return SessionGrant(token, principal, public_user)
        except (RedisError, SQLAlchemyError, TimeoutError) as exc:
            raise IdentityUnavailable("Session storage unavailable") from exc

    async def authenticate(self, token: str) -> Principal:
        identifiers = self._token_identifiers(token)
        if identifiers is None:
            raise InvalidSession("Invalid session")
        try:
            projected_user = (
                await self.redis.get_user(token) if self.mode == "redis" else None
            )
            if self.mode == "redis" and projected_user is None:
                # Redis is a recoverable projection, not authority for creating a
                # session. Read SQL first, publish without holding a row lock, and
                # then perform the normal SQL check again after publication.
                async with self.database.unit_of_work() as uow:
                    row = (
                        await uow.session.execute(
                            select(models.Session, func.clock_timestamp()).where(
                                models.Session.session_token.in_(identifiers)
                            )
                        )
                    ).one_or_none()
                    if row is None:
                        raise InvalidSession("Invalid session")
                    session_record, now = row
                    confirmed = await uow.session.scalar(
                        text("""
                        SELECT 1 FROM login_operations
                        WHERE session_id = :sid AND user_id = :uid
                          AND token_digest = :digest AND status = 'committed'
                    """),
                        {
                            "sid": session_record.id,
                            "uid": session_record.user_id,
                            "digest": identifiers[1],
                        },
                    )
                    if (
                        confirmed is None
                        or session_record.session_token != identifiers[1]
                    ):
                        raise InvalidSession("Invalid session")
                    projection = self._projection([session_record], now)
                    owner_id = session_record.user_id
                if not projection:
                    raise InvalidSession("Invalid session")
                await self.redis.add_user_sessions(owner_id, projection)
                projected_user = await self.redis.get_user(token)
                if projected_user is None:
                    raise InvalidSession("Invalid session")
            async with self.database.unit_of_work() as uow:
                row = (
                    await uow.session.execute(
                        select(models.Session, models.User, func.now())
                        .join(
                            models.User,
                            models.User.id == models.Session.user_id,
                        )
                        .where(models.Session.session_token.in_(identifiers))
                    )
                ).one_or_none()
                if row is None:
                    raise InvalidSession("Invalid session")
                session_record, user, now = row
                if session_record.created_at <= now - timedelta(
                    seconds=SESSION_TTL_SECONDS
                ):
                    raise InvalidSession("Invalid session")
                if self.mode == "redis" and projected_user != user.id:
                    raise InvalidSession("Invalid session")
                return Principal.from_user(user)
        except (RedisError, SQLAlchemyError, TimeoutError, OSError) as exc:
            raise IdentityUnavailable("Session storage unavailable") from exc

    async def invalidate_user_sessions(self, user_id: int) -> int:
        """Force a test user to sign in again; stale Redis gates cannot bypass SQL."""
        url = self.database.engine.url
        if (
            url.drivername != "postgresql+asyncpg"
            or url.host not in {"127.0.0.1", "localhost", "::1"}
            or url.port != 57152
            or url.database != "pymentor_test"
            or url.username != "pymentor_test"
            or bool(url.query)
        ):
            raise ValueError(
                "Session invalidation requires the disposable local test database"
            )
        if (
            not isinstance(user_id, int)
            or isinstance(user_id, bool)
            or not 1 <= user_id < 2**63
        ):
            raise ValueError("Invalid user id")
        try:
            async with self.database.unit_of_work() as uow:
                identity = (
                    await uow.session.execute(
                        text("SELECT current_database(), current_user")
                    )
                ).one()
                if tuple(identity) != ("pymentor_test", "pymentor_test"):
                    raise ValueError("Unexpected test database identity")
                user = await self._locked_user(uow, user_id)
                if user is None:
                    return 0
                if user.username != "synthetic" or not user.email.endswith(
                    "@example.test"
                ):
                    raise ValueError("Expected a synthetic test user")
                await self._mark_legacy_consumed(uow, user_id)
                await uow.session.execute(
                    text("""
                    UPDATE login_operations SET status = 'revoked'
                    WHERE user_id = :uid AND status = 'pending'
                """),
                    {"uid": user_id},
                )
                result = await uow.session.execute(
                    delete(models.Session).where(models.Session.user_id == user_id)
                )
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
                record = await uow.session.scalar(
                    select(models.Session).where(
                        models.Session.session_token.in_(identifiers)
                    )
                )
                if record is not None:
                    user_id = record.user_id
                    await self._locked_user(uow, user_id)
                    await self._mark_legacy_consumed(uow, user_id)
                    await uow.session.execute(
                        delete(models.Session).where(
                            models.Session.session_token.in_(identifiers)
                        )
                    )
                    await uow.commit()
        except (SQLAlchemyError, TimeoutError) as exc:
            raise IdentityUnavailable("Session storage unavailable") from exc
        if user_id is not None and self.mode == "redis":
            try:
                await self.redis.revoke_user_token(user_id, token)
            except (RedisError, TimeoutError):
                # SQL is authoritative. A stale Redis key cannot authenticate.
                pass
