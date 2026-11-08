"""Synthetic-only PYM-435 SQL experiment. Never wire this into login.

Caller MUST restrict access to an isolated lab and synthetic users/digests,
serialize all writers (including cross-owner digest use, revocation, logout and
legacy session writers), perform auth and the external Redis checks, and own
commit/rollback and recovery. A user row lock alone does not serialize writers
that do not take it. The callback must read the database SQL clock *after* locks
(e.g. SELECT clock_timestamp()), not return a time captured before this call.
No raw tokens. No TTL maximum or tombstone retention policy is specified.

Required independently provisioned PostgreSQL lab tables (no DDL here):
owner_generation(user_id PRIMARY KEY, generation BIGINT NOT NULL); pending
(digest UNIQUE NOT NULL, user_id NOT NULL, generation BIGINT NOT NULL,
expires_at TIMESTAMPTZ NOT NULL, status NOT NULL CHECK status IN
('pending','active','revoked')). Keep all rows, including tombstones, to reject
reuse. Every synthetic digest ever used by *any* writer must have a retained
pending row; existing sessions also need checking. Missing or duplicate rows
fail closed. These requirements are not enforced by this module or a migration.
Also required: c435_lab.logout_operations(operation_id PRIMARY KEY, user_id,
generation_before, generation_after). This lab marker does not establish ID
safety after account deletion and recreation; no marker retention policy is set.
Existing sessions expire at created_at + 30 days, as in async_sessions.py.
"""

from datetime import datetime
from datetime import timedelta
import re
from typing import Awaitable
from typing import Callable

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

SESSION_TTL = timedelta(days=30)
Clock = Callable[[AsyncSession], Awaitable[datetime]]


class LabInvariantError(ValueError):
    """Invalid or ambiguous lab state; caller must roll back the transaction."""


def _one_or_none(result):
    rows = result.mappings().all()
    if len(rows) > 1:
        raise LabInvariantError("ambiguous row")
    return rows[0] if rows else None


def _valid(user_id, digest):
    if (
        type(user_id) is not int
        or user_id <= 0
        or type(digest) is not str
        or re.fullmatch(r"[0-9a-f]{64}", digest) is None
    ):
        raise LabInvariantError("invalid synthetic identifier")


def _time(value):
    if (
        not isinstance(value, datetime)
        or value.tzinfo is None
        or value.utcoffset() is None
    ):
        raise LabInvariantError("timezone-aware SQL time required")
    return value


async def _locks(db, user_id, digest):
    generation = await _owner_locks(db, user_id)
    pending = _one_or_none(
        await db.execute(
            text(
                "SELECT user_id, generation, expires_at, status FROM c435_lab.pending WHERE digest = :digest FOR UPDATE"
            ),
            {"digest": digest},
        )
    )
    return generation, pending


async def _owner_locks(db, user_id):
    user = _one_or_none(
        await db.execute(
            text("SELECT id FROM public.users WHERE id = :uid FOR UPDATE"),
            {"uid": user_id},
        )
    )
    if user is None:
        raise LabInvariantError("missing user")
    generation = _one_or_none(
        await db.execute(
            text(
                "SELECT generation FROM c435_lab.owner_generation WHERE user_id = :uid FOR UPDATE"
            ),
            {"uid": user_id},
        )
    )
    if (
        generation is None
        or type(generation["generation"]) is not int
        or generation["generation"] < 0
    ):
        raise LabInvariantError("missing or invalid generation")
    return generation["generation"]


async def prepare(
    db: AsyncSession,
    user_id: int,
    digest: str,
    expected_generation: int,
    expires_at: datetime,
    clock: Clock,
) -> None:
    """Create one pending record; never delete or create sessions."""
    _valid(user_id, digest)
    generation, pending = await _locks(db, user_id, digest)
    now = _time(await clock(db))
    if type(expected_generation) is not int or expected_generation != generation:
        raise LabInvariantError("stale generation")
    if pending is not None:
        raise LabInvariantError("digest already used")
    if _time(expires_at) <= now:
        raise LabInvariantError("expired pending")
    existing = _one_or_none(
        await db.execute(
            text("SELECT id FROM public.sessions WHERE session_token = :digest"),
            {"digest": digest},
        )
    )
    if existing is not None:
        raise LabInvariantError("digest already used")
    inserted = await db.execute(
        text(
            "INSERT INTO c435_lab.pending (digest, user_id, generation, expires_at, status) VALUES (:digest, :uid, :generation, :expires_at, 'pending')"
        ),
        {
            "digest": digest,
            "uid": user_id,
            "generation": generation,
            "expires_at": expires_at,
        },
    )
    if inserted.rowcount != 1:
        raise LabInvariantError("pending write mismatch")


async def activate(db: AsyncSession, user_id: int, digest: str, clock: Clock) -> bool:
    """Activate once; False means unavailable or already active; never commit.

    SQL failure after a write requires caller rollback, not a partial commit.
    """
    return await _activate(db, user_id, digest, clock, evict=True) == "activated"


async def activate_without_eviction(
    db: AsyncSession, user_id: int, digest: str, clock: Clock
) -> str:
    """Internal fail-closed primitive, not the fourth-login product policy.

    Returns activated, at_capacity, unavailable, or active_marker. An active
    marker is not authentication evidence. The caller owns commit and
    rollback; an unknown commit outcome requires separate reconciliation. Redis
    and cookie validity are not established by any result from this lab method.
    """
    return await _activate(db, user_id, digest, clock, evict=False)


async def _activate(db, user_id, digest, clock, *, evict):
    _valid(user_id, digest)
    generation, pending = await _locks(db, user_id, digest)
    now = _time(await clock(db))
    if pending is None:
        return "unavailable"
    if pending["user_id"] != user_id:
        raise LabInvariantError("digest belongs to another user")
    if pending["status"] == "active":
        return "active_marker"
    if pending["status"] == "revoked":
        return "unavailable"
    if pending["status"] != "pending":
        raise LabInvariantError("invalid pending status")
    if type(pending["generation"]) is not int or pending["generation"] != generation:
        return "unavailable"
    if _time(pending["expires_at"]) <= now:
        return "unavailable"
    existing = _one_or_none(
        await db.execute(
            text("SELECT id FROM public.sessions WHERE session_token = :digest"),
            {"digest": digest},
        )
    )
    if existing is not None:
        raise LabInvariantError("digest already in sessions")
    rows = (
        (
            await db.execute(
                text(
                    "SELECT id, created_at FROM public.sessions WHERE user_id = :uid AND created_at > :cutoff ORDER BY created_at, id FOR UPDATE"
                ),
                {"uid": user_id, "cutoff": now - SESSION_TTL},
            )
        )
        .mappings()
        .all()
    )
    # Waiting for row locks may outlast the pending TTL. Re-read the SQL clock
    # after those locks and before any mutation; discard sessions that expired
    # while waiting. Caller must also bound work before its eventual commit.
    after_lock = _time(await clock(db))
    if after_lock < now:
        raise LabInvariantError("SQL clock moved backwards")
    if _time(pending["expires_at"]) <= after_lock:
        return "unavailable"
    now = after_lock
    rows = [row for row in rows if _time(row["created_at"]) > now - SESSION_TTL]
    if len(rows) > 3:
        raise LabInvariantError("more than three live sessions")
    if len(rows) == 3:
        if not evict:
            return "at_capacity"
        deleted = await db.execute(
            text("DELETE FROM public.sessions WHERE id = :id AND user_id = :uid"),
            {"id": rows[0]["id"], "uid": user_id},
        )
        if deleted.rowcount != 1:
            raise LabInvariantError("session delete mismatch")
    inserted = await db.execute(
        text(
            "INSERT INTO public.sessions (user_id, session_token, created_at) VALUES (:uid, :digest, :now)"
        ),
        {"uid": user_id, "digest": digest, "now": now},
    )
    if inserted.rowcount != 1:
        raise LabInvariantError("session insert mismatch")
    updated = await db.execute(
        text(
            "UPDATE c435_lab.pending SET status = 'active' WHERE digest = :digest AND user_id = :uid AND status = 'pending'"
        ),
        {"digest": digest, "uid": user_id},
    )
    if updated.rowcount != 1:
        raise LabInvariantError("pending update mismatch")
    return "activated"


async def revoke(db: AsyncSession, user_id: int, digest: str, clock: Clock) -> None:
    """Revoke one digest, retaining its tombstone; caller rolls back on error."""
    _valid(user_id, digest)
    generation, pending = await _locks(db, user_id, digest)
    now = _time(await clock(db))
    if pending is not None and pending["user_id"] != user_id:
        raise LabInvariantError("digest belongs to another user")
    if pending is not None and pending["status"] not in (
        "pending",
        "active",
        "revoked",
    ):
        raise LabInvariantError("invalid pending status")
    session = _one_or_none(
        await db.execute(
            text(
                "SELECT id, user_id FROM public.sessions WHERE session_token = :digest FOR UPDATE"
            ),
            {"digest": digest},
        )
    )
    if session is not None and session["user_id"] != user_id:
        raise LabInvariantError("digest belongs to another user")
    if pending is None:
        result = await db.execute(
            text(
                "INSERT INTO c435_lab.pending (digest, user_id, generation, expires_at, status) VALUES (:digest, :uid, :generation, :expires_at, 'revoked')"
            ),
            {
                "digest": digest,
                "uid": user_id,
                "generation": generation,
                "expires_at": now,
            },
        )
    else:
        result = await db.execute(
            text(
                "UPDATE c435_lab.pending SET status = 'revoked' WHERE digest = :digest AND user_id = :uid"
            ),
            {"digest": digest, "uid": user_id},
        )
    if result.rowcount != 1:
        raise LabInvariantError("pending revoke mismatch")
    deleted = await db.execute(
        text(
            "DELETE FROM public.sessions WHERE user_id = :uid AND session_token = :digest"
        ),
        {"uid": user_id, "digest": digest},
    )
    if deleted.rowcount != (1 if session is not None else 0):
        raise LabInvariantError("session revoke mismatch")


async def logout_all(db: AsyncSession, user_id: int, operation_id: str) -> bool:
    """Apply a lab logout once; caller must roll back the transaction on any error."""
    _valid(user_id, operation_id)
    generation = await _owner_locks(db, user_id)
    marker = _one_or_none(
        await db.execute(
            text(
                "SELECT user_id, generation_before, generation_after FROM c435_lab.logout_operations WHERE operation_id = :operation_id"
            ),
            {"operation_id": operation_id},
        )
    )
    if marker is not None:
        before, after = marker["generation_before"], marker["generation_after"]
        if (
            type(marker["user_id"]) is not int
            or marker["user_id"] != user_id
            or type(before) is not int
            or type(after) is not int
            or before < 0
            or after != before + 1
            or generation < after
        ):
            raise LabInvariantError("invalid logout operation marker")
        return False
    if generation >= 2**63 - 1:
        raise LabInvariantError("generation overflow")
    updated = await db.execute(
        text(
            "UPDATE c435_lab.owner_generation SET generation = generation + 1 WHERE user_id = :uid AND generation = :generation"
        ),
        {"uid": user_id, "generation": generation},
    )
    if updated.rowcount != 1:
        raise LabInvariantError("generation update mismatch")
    pending = await db.execute(
        text("UPDATE c435_lab.pending SET status = 'revoked' WHERE user_id = :uid"),
        {"uid": user_id},
    )
    if type(pending.rowcount) is not int or pending.rowcount < 0:
        raise LabInvariantError("pending logout mismatch")
    sessions = await db.execute(
        text("DELETE FROM public.sessions WHERE user_id = :uid"), {"uid": user_id}
    )
    if type(sessions.rowcount) is not int or sessions.rowcount < 0:
        raise LabInvariantError("session logout mismatch")
    inserted = await db.execute(
        text(
            "INSERT INTO c435_lab.logout_operations (operation_id, user_id, generation_before, generation_after) VALUES (:operation_id, :uid, :before, :after)"
        ),
        {
            "operation_id": operation_id,
            "uid": user_id,
            "before": generation,
            "after": generation + 1,
        },
    )
    if inserted.rowcount != 1:
        raise LabInvariantError("logout operation insert mismatch")
    return True
