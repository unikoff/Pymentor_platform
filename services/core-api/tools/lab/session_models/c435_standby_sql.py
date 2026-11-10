"""Synthetic-only SQL experiment; never connect to authentication or release.

Caller must prove lab isolation, synthetic-only data, authorization and Redis
checks externally, own the transaction and rollback on *any* error, and serialize
ALL session/operation writers (including delete, logout and legacy writers)
using these same owner locks. Cross-owner operation/digest writers also need
serialization or the unique constraints below. No DDL or commit is done here.

Independently provision c435_lab.owner_generation(user_id PRIMARY KEY,
generation BIGINT NOT NULL) and c435_lab.standby_operations with: operation_id
TEXT PRIMARY KEY, user_id NOT NULL, digest TEXT UNIQUE NOT NULL, generation
BIGINT NOT NULL, deadline TIMESTAMPTZ NOT NULL, status TEXT NOT NULL CHECK
(status IN ('switched','aborted','invalidated','confirmed')), standby_id (same type as sessions.id),
standby_created_at TIMESTAMPTZ, standby_digest TEXT; standby fields must be all
NULL or all NOT NULL. Add nullable candidate_id (same type as sessions.id) and
candidate_created_at TIMESTAMPTZ, both NULL unless status is confirmed, when
both must be NOT NULL. Require c435_lab.pending(digest UNIQUE NOT NULL, user_id,
generation BIGINT, expires_at TIMESTAMPTZ, status) with all fields NOT NULL and
status CHECK IN ('pending','active','revoked'). Digests must be 64 lowerhex.
A partial UNIQUE index on
(user_id) WHERE status = 'switched' is mandatory. Retain all operation IDs and
digests forever in this experiment; no retention policy is approved. Existing
session digests are synthetic 64 lowerhex, unique across owners and never reused;
enforce that and operation/session digest uniqueness across all writers. These
are prerequisites, not schema guarantees provided by this file.

Only an isolated lab role may use these tables: USAGE on c435_lab, SELECT and
row-lock privileges (PostgreSQL UPDATE privilege) on users, owner_generation,
standby_operations, pending and sessions; INSERT/DELETE on sessions, INSERT on
standby_operations, and UPDATE of operation status/candidate fields and pending
status. Grant sequence USAGE for the sessions id default if required. Restrict
all writers to the same serialization protocol. This describes prerequisites,
not executed DDL or grants; old schemas cannot run confirm_switch.

The lab-only SQL eligibility check excludes a matching standby while its operation
is switched or invalidated, even for a stale operation generation. It is not
authentication or authorization. Aborting merely changes
that marker, never restores a deleted, revoked, expired, or replaced session.
Abort requires matching id, owner, created_at, digest and current generation.
Deadline limits switch, not abort recovery.
Unknown commit outcomes require reconciliation by repeating confirm_switch;
repeating switch is rejected. Confirmation is not Redis or cookie proof.
SQL and Redis are not atomic, and HTTP delivery is unproven. SQL session TTL is
30 days as in the existing experimental SQL helper. Clock/TTL policy, actual
isolation, schema, compatibility and mixed writers are not validated here.
"""

from datetime import datetime
from datetime import timedelta
import re

from sqlalchemy import text

TTL = timedelta(days=30)
HEX = re.compile(r"[0-9a-f]{64}\Z")
OP = re.compile(
    r"(?:[0-9a-f]{64}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\Z"
)


class LabInvariantError(ValueError):
    """Fail closed; caller must roll back the transaction."""


def _valid(user_id, operation_id, generation):
    if (
        type(user_id) is not int
        or user_id <= 0
        or type(generation) is not int
        or generation < 0
        or type(operation_id) is not str
        or not OP.fullmatch(operation_id)
    ):
        raise LabInvariantError("invalid synthetic identifier")


def _digest(value):
    if type(value) is not str or not HEX.fullmatch(value):
        raise LabInvariantError("invalid synthetic digest")


def _time(value):
    if (
        not isinstance(value, datetime)
        or value.tzinfo is None
        or value.utcoffset() is None
    ):
        raise LabInvariantError("timezone-aware time required")
    return value


def _one(result):
    rows = result.mappings().all()
    if len(rows) > 1:
        raise LabInvariantError("ambiguous rows")
    return rows[0] if rows else None


async def _execute(db, sql, params):
    # Driver diagnostics may contain SQL parameters; never propagate them.
    try:
        result = await db.execute(text(sql), params)
    except Exception:
        failed = True
    else:
        failed = False
    if failed:
        # Raise outside the except block so the original error is not retained
        # in __context__ for telemetry that ignores suppressed tracebacks.
        raise LabInvariantError(
            "database operation failed; rollback required"
        ) from None
    return result


async def _locks(db, user_id, generation):
    user = _one(
        await _execute(
            db,
            "SELECT id FROM public.users WHERE id = :uid FOR UPDATE",
            {"uid": user_id},
        )
    )
    if user is None or user["id"] != user_id:
        raise LabInvariantError("owner unavailable")
    row = _one(
        await _execute(
            db,
            "SELECT generation FROM c435_lab.owner_generation WHERE user_id = :uid FOR UPDATE",
            {"uid": user_id},
        )
    )
    if (
        row is None
        or type(row["generation"]) is not int
        or row["generation"] != generation
    ):
        raise LabInvariantError("generation unavailable")


async def _clock(db):
    row = _one(await _execute(db, "SELECT clock_timestamp() AS now", {}))
    if row is None:
        raise LabInvariantError("SQL clock unavailable")
    return _time(row["now"])


async def sql_eligible(db, user_id, digest, generation):
    """Check only lab SQL eligibility, not identity, authentication or authorization.

    The caller must check identity/auth/gate, ensure lab isolation and shared
    serialization, retain tombstones, and own the transaction and its rollback.
    A True result is not authorization; no commit or Redis access occurs here.
    """
    if (
        type(user_id) is not int
        or user_id <= 0
        or type(generation) is not int
        or generation < 0
    ):
        raise LabInvariantError("invalid synthetic identifier")
    _digest(digest)
    await _locks(db, user_id, generation)
    session = _one(
        await _execute(
            db,
            "SELECT id, created_at, session_token FROM public.sessions WHERE user_id = :uid AND session_token = :digest FOR UPDATE",
            {"uid": user_id, "digest": digest},
        )
    )
    if session is None:
        return False
    now = await _clock(db)
    created = _time(session["created_at"])
    if created > now or created <= now - TTL:
        return False
    blocked = _one(
        await _execute(
            db,
            "SELECT operation_id FROM c435_lab.standby_operations WHERE user_id = :uid AND standby_id = :sid AND standby_created_at = :created AND standby_digest = :digest AND status IN ('switched', 'invalidated')",
            {
                "uid": user_id,
                "sid": session["id"],
                "created": created,
                "digest": digest,
            },
        )
    )
    if blocked is not None:
        return False
    after_check = await _clock(db)
    if after_check < now:
        raise LabInvariantError("SQL clock moved backwards")
    return created <= after_check and created > after_check - TTL


async def switch_to_standby(db, user_id, operation_id, digest, generation, deadline):
    """Record a switch, or reject every replay; caller rolls back on any error."""
    _valid(user_id, operation_id, generation)
    _digest(digest)
    _time(deadline)
    await _locks(db, user_id, generation)
    pending = _one(
        await _execute(
            db,
            "SELECT digest, user_id, generation, status, expires_at FROM c435_lab.pending WHERE digest = :digest FOR UPDATE",
            {"digest": digest},
        )
    )
    row = _one(
        await _execute(
            db,
            "SELECT operation_id FROM c435_lab.standby_operations WHERE operation_id = :op OR digest = :digest",
            {"op": operation_id, "digest": digest},
        )
    )
    if row is not None:
        raise LabInvariantError("operation or digest already used")
    row = _one(
        await _execute(
            db,
            "SELECT operation_id FROM c435_lab.standby_operations WHERE user_id = :uid AND status = 'switched'",
            {"uid": user_id},
        )
    )
    if row is not None:
        raise LabInvariantError("unfinished operation")
    row = _one(
        await _execute(
            db,
            "SELECT id FROM public.sessions WHERE session_token = :digest",
            {"digest": digest},
        )
    )
    if row is not None:
        raise LabInvariantError("digest already used")
    # Lock the candidate rows before taking the authoritative SQL time.
    rows = (
        (
            await _execute(
                db,
                """SELECT id, created_at, session_token FROM public.sessions
        WHERE user_id = :uid AND NOT EXISTS (
            SELECT 1 FROM c435_lab.standby_operations AS blocked
            WHERE blocked.user_id = :uid AND blocked.standby_id = public.sessions.id
              AND blocked.standby_created_at = public.sessions.created_at
              AND blocked.standby_digest = public.sessions.session_token
              AND blocked.status IN ('switched', 'invalidated')
        ) ORDER BY created_at, id FOR UPDATE""",
                {"uid": user_id},
            )
        )
        .mappings()
        .all()
    )
    now = await _clock(db)
    if deadline <= now:
        raise LabInvariantError("deadline expired")
    if (
        pending is None
        or pending["digest"] != digest
        or pending["user_id"] != user_id
        or type(pending["generation"]) is not int
        or pending["generation"] != generation
        or pending["status"] != "pending"
    ):
        raise LabInvariantError("pending unavailable")
    expires = _time(pending["expires_at"])
    if expires <= now:
        raise LabInvariantError("pending expired")
    if deadline > expires:
        raise LabInvariantError("deadline exceeds pending expiry")
    live = []
    for session in rows:
        created = _time(session["created_at"])
        _digest(session["session_token"])
        if created > now:
            raise LabInvariantError("future session")
        if created > now - TTL:
            live.append(session)
    if len(live) > 3:
        raise LabInvariantError("too many live sessions")
    standby = live[0] if len(live) == 3 else None
    result = await _execute(
        db,
        "INSERT INTO c435_lab.standby_operations (operation_id, user_id, digest, generation, deadline, status, standby_id, standby_created_at, standby_digest) VALUES (:op, :uid, :digest, :generation, :deadline, 'switched', :sid, :created, :old_digest)",
        {
            "op": operation_id,
            "uid": user_id,
            "digest": digest,
            "generation": generation,
            "deadline": deadline,
            "sid": standby["id"] if standby else None,
            "created": standby["created_at"] if standby else None,
            "old_digest": standby["session_token"] if standby else None,
        },
    )
    if type(result.rowcount) is not int or result.rowcount != 1:
        raise LabInvariantError("operation insert mismatch")


async def confirm_switch(db, user_id, operation_id, digest, generation):
    """Confirm one lab operation; caller owns gate, serialization and transaction.

    Any error requires rollback. A successful retry proves SQL state only; the
    caller must independently establish cookie/Redis gate ownership every time.
    """
    _valid(user_id, operation_id, generation)
    _digest(digest)
    await _locks(db, user_id, generation)
    op = _one(
        await _execute(
            db,
            "SELECT user_id, generation, status, standby_id, standby_created_at, standby_digest, digest, deadline, candidate_id, candidate_created_at FROM c435_lab.standby_operations WHERE operation_id = :op FOR UPDATE",
            {"op": operation_id},
        )
    )
    if (
        op is None
        or op["user_id"] != user_id
        or type(op["generation"]) is not int
        or op["generation"] != generation
        or op["digest"] != digest
    ):
        raise LabInvariantError("operation unavailable")
    if op["status"] not in ("switched", "confirmed"):
        raise LabInvariantError("invalid operation status")
    pending = _one(
        await _execute(
            db,
            "SELECT digest, user_id, generation, status, expires_at FROM c435_lab.pending WHERE digest = :digest FOR UPDATE",
            {"digest": digest},
        )
    )
    if (
        pending is None
        or pending["digest"] != digest
        or pending["user_id"] != user_id
        or type(pending["generation"]) is not int
        or pending["generation"] != generation
        or pending["status"] != ("active" if op["status"] == "confirmed" else "pending")
    ):
        raise LabInvariantError("pending unavailable")
    expires = _time(pending["expires_at"])
    deadline = _time(op["deadline"])
    if op["status"] == "confirmed":
        if op["candidate_id"] is None or op["candidate_created_at"] is None:
            raise LabInvariantError("candidate unavailable")
        created = _time(op["candidate_created_at"])
        candidate = _one(
            await _execute(
                db,
                "SELECT id, user_id, created_at, session_token FROM public.sessions WHERE id = :sid FOR UPDATE",
                {"sid": op["candidate_id"]},
            )
        )
        now = await _clock(db)
        if (
            candidate is None
            or candidate["id"] != op["candidate_id"]
            or candidate["user_id"] != user_id
            or candidate["session_token"] != digest
            or candidate["created_at"] != created
            or created > now
            or created <= now - TTL
        ):
            raise LabInvariantError("candidate unavailable")
        return "already_confirmed"
    if op["candidate_id"] is not None or op["candidate_created_at"] is not None:
        raise LabInvariantError("invalid candidate marker")
    standby = (op["standby_id"], op["standby_created_at"], op["standby_digest"])
    if any(v is None for v in standby) and not all(v is None for v in standby):
        raise LabInvariantError("invalid standby reference")
    if standby[0] is not None:
        _time(standby[1])
        _digest(standby[2])
    rows = (
        (
            await _execute(
                db,
                """SELECT id, created_at, session_token,
        EXISTS (SELECT 1 FROM c435_lab.standby_operations AS blocked
          WHERE blocked.user_id = :uid AND blocked.operation_id <> :op
            AND blocked.standby_id = public.sessions.id
            AND blocked.standby_created_at = public.sessions.created_at
            AND blocked.standby_digest = public.sessions.session_token
            AND blocked.status IN ('switched', 'invalidated')) AS blocked
        FROM public.sessions WHERE user_id = :uid ORDER BY created_at, id FOR UPDATE""",
                {"uid": user_id, "op": operation_id},
            )
        )
        .mappings()
        .all()
    )
    # Also lock a digest collision outside this owner before obtaining SQL time.
    collision = _one(
        await _execute(
            db,
            "SELECT id, user_id, created_at, session_token FROM public.sessions WHERE session_token = :digest FOR UPDATE",
            {"digest": digest},
        )
    )
    now = await _clock(db)
    if deadline <= now or expires <= now:
        raise LabInvariantError("deadline or pending expired")
    if collision is not None:
        raise LabInvariantError("digest already used")
    live = []
    found = False
    for session in rows:
        created = _time(session["created_at"])
        _digest(session["session_token"])
        if created > now:
            raise LabInvariantError("future session")
        if (session["id"], created, session["session_token"]) == standby:
            if session["blocked"]:
                raise LabInvariantError("standby blocked")
            found = True
        if not session["blocked"] and created > now - TTL:
            live.append(session)
    if standby[0] is not None and not found:
        raise LabInvariantError("standby unavailable")
    if len(live) > 3:
        raise LabInvariantError("too many live sessions")
    if len(live) == 3:
        oldest = live[0]
        if (oldest["id"], oldest["created_at"], oldest["session_token"]) != standby:
            raise LabInvariantError("standby is not oldest")
        deleted = await _execute(
            db,
            "DELETE FROM public.sessions WHERE id = :sid AND user_id = :uid AND created_at = :created AND session_token = :digest",
            {
                "sid": standby[0],
                "uid": user_id,
                "created": standby[1],
                "digest": standby[2],
            },
        )
        if type(deleted.rowcount) is not int or deleted.rowcount != 1:
            raise LabInvariantError("session delete mismatch")
    inserted = await _execute(
        db,
        "INSERT INTO public.sessions (user_id, session_token, created_at) VALUES (:uid, :digest, :now) RETURNING id, created_at",
        {"uid": user_id, "digest": digest, "now": now},
    )
    if type(inserted.rowcount) is not int or inserted.rowcount != 1:
        raise LabInvariantError("session insert mismatch")
    candidate = _one(inserted)
    if candidate is None or candidate["id"] is None or candidate["created_at"] != now:
        raise LabInvariantError("session insert mismatch")
    updated = await _execute(
        db,
        "UPDATE c435_lab.pending SET status = 'active' WHERE digest = :digest AND user_id = :uid AND generation = :generation AND status = 'pending'",
        {"digest": digest, "uid": user_id, "generation": generation},
    )
    if type(updated.rowcount) is not int or updated.rowcount != 1:
        raise LabInvariantError("pending update mismatch")
    updated = await _execute(
        db,
        "UPDATE c435_lab.standby_operations SET status = 'confirmed', candidate_id = :sid, candidate_created_at = :created WHERE operation_id = :op AND user_id = :uid AND generation = :generation AND digest = :digest AND status = 'switched'",
        {
            "op": operation_id,
            "uid": user_id,
            "generation": generation,
            "digest": digest,
            "sid": candidate["id"],
            "created": now,
        },
    )
    if type(updated.rowcount) is not int or updated.rowcount != 1:
        raise LabInvariantError("operation update mismatch")
    after_writes = await _clock(db)
    if after_writes < now:
        raise LabInvariantError("SQL clock moved backwards")
    if deadline <= after_writes or expires <= after_writes:
        raise LabInvariantError("deadline or pending expired; rollback required")
    return "confirmed"


async def abort_unconfirmed(db, user_id, operation_id, generation):
    """Abort a switched marker; False is an already-aborted no-op."""
    _valid(user_id, operation_id, generation)
    await _locks(db, user_id, generation)
    row = _one(
        await _execute(
            db,
            "SELECT user_id, generation, status, standby_id, standby_created_at, standby_digest FROM c435_lab.standby_operations WHERE operation_id = :op FOR UPDATE",
            {"op": operation_id},
        )
    )
    if (
        row is None
        or row["user_id"] != user_id
        or type(row["generation"]) is not int
        or row["generation"] != generation
    ):
        raise LabInvariantError("operation unavailable")
    if row["status"] == "aborted":
        return False
    if row["status"] != "switched":
        raise LabInvariantError("invalid operation status")
    fields = (row["standby_id"], row["standby_created_at"], row["standby_digest"])
    if any(v is None for v in fields) and not all(v is None for v in fields):
        raise LabInvariantError("invalid standby reference")
    if fields[0] is not None:
        _digest(fields[2])
        created = _time(fields[1])
        session = _one(
            await _execute(
                db,
                "SELECT id FROM public.sessions WHERE id = :sid AND user_id = :uid AND created_at = :created AND session_token = :digest FOR UPDATE",
                {
                    "sid": fields[0],
                    "uid": user_id,
                    "created": created,
                    "digest": fields[2],
                },
            )
        )
        now = await _clock(db)
        if session is None or created > now:
            raise LabInvariantError("standby unavailable")
        # An expired original must remain ineligible to auth, but can be
        # terminally unblocked. The future reader must enforce its SQL TTL.
    result = await _execute(
        db,
        "UPDATE c435_lab.standby_operations SET status = 'aborted' WHERE operation_id = :op AND user_id = :uid AND generation = :generation AND status = 'switched'",
        {"op": operation_id, "uid": user_id, "generation": generation},
    )
    if type(result.rowcount) is not int or result.rowcount != 1:
        raise LabInvariantError("operation update mismatch")
    return True


async def invalidate_unrestorable(db, user_id, operation_id, generation):
    """Terminally invalidate an unrestorable switch; repeats return False.

    ``generation`` is the current owner generation. An aborted operation is
    rejected, and errors require the caller to roll back the transaction.
    """
    _valid(user_id, operation_id, generation)
    await _locks(db, user_id, generation)
    row = _one(
        await _execute(
            db,
            "SELECT user_id, generation, status, standby_id, standby_created_at, standby_digest FROM c435_lab.standby_operations WHERE operation_id = :op FOR UPDATE",
            {"op": operation_id},
        )
    )
    if (
        row is None
        or row["user_id"] != user_id
        or type(row["generation"]) is not int
        or row["generation"] < 0
        or row["generation"] > generation
    ):
        raise LabInvariantError("operation unavailable")
    if row["status"] == "invalidated":
        return False
    if row["status"] != "switched":
        raise LabInvariantError("operation is not switched")
    fields = (row["standby_id"], row["standby_created_at"], row["standby_digest"])
    if any(v is None for v in fields) and not all(v is None for v in fields):
        raise LabInvariantError("invalid standby reference")
    if fields[0] is not None:
        _digest(fields[2])
        created = _time(fields[1])
        session = _one(
            await _execute(
                db,
                "SELECT id, user_id, created_at, session_token FROM public.sessions WHERE id = :sid FOR UPDATE",
                {"sid": fields[0]},
            )
        )
        now = await _clock(db)
        if created > now:
            raise LabInvariantError("future standby")
        if (
            row["generation"] == generation
            and session is not None
            and session["id"] == fields[0]
            and session["user_id"] == user_id
            and session["created_at"] == created
            and session["session_token"] == fields[2]
            and created > now - TTL
        ):
            raise LabInvariantError("standby still restorable")
    elif row["generation"] == generation:
        raise LabInvariantError("operation still restorable")
    result = await _execute(
        db,
        "UPDATE c435_lab.standby_operations SET status = 'invalidated' WHERE operation_id = :op AND user_id = :uid AND generation = :generation AND status = 'switched'",
        {"op": operation_id, "uid": user_id, "generation": row["generation"]},
    )
    if type(result.rowcount) is not int or result.rowcount != 1:
        raise LabInvariantError("operation update mismatch")
    return True
