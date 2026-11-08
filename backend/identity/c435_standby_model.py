"""Lab-only, single-owner immutable state machine; callers serialize transitions.

IDs are synthetic only, never real tokens. There is no Redis, SQL or HTTP here.
SQL confirmation cannot prove receipt of an HTTP response, and Redis can vanish
after a gate check. This model does not prove release readiness. Operation and
revocation records are retained indefinitely; retention policy is unknown.
The known-session registry must itself come from trusted atomic state; it can
detect inconsistent snapshots, not protect against full-state forgery.
"""

from dataclasses import dataclass, field, replace


@dataclass(frozen=True, repr=False)
class Session:
    id: str = field(repr=False)
    created_at: int
    expires_at: int


@dataclass(frozen=True, repr=False)
class Attempt:
    op: str = field(repr=False)
    session: Session
    generation: int
    status: str = "prepared"
    standby: Session | None = None


@dataclass(frozen=True, repr=False)
class State:
    active: tuple[Session, ...] = ()
    known: frozenset[Session] = frozenset()
    attempts: tuple[Attempt, ...] = ()
    revoked: frozenset[str] = frozenset()
    logout_ops: frozenset[str] = frozenset()
    generation: int = 0
    observed_at: int | None = None


def _identifier(value):
    return type(value) is str and bool(value)


def _session(value):
    return (type(value) is Session and _identifier(value.id)
            and type(value.created_at) is int and type(value.expires_at) is int
            and 0 <= value.created_at < value.expires_at)


def _validate(state):
    if (type(state) is not State or type(state.active) is not tuple or type(state.known) is not frozenset
            or type(state.attempts) is not tuple or type(state.revoked) is not frozenset
            or type(state.logout_ops) is not frozenset
            or type(state.generation) is not int or state.generation < 0
            or (state.observed_at is not None and
                (type(state.observed_at) is not int or state.observed_at < 0))
            or any(not _session(s) for s in state.active)
            or any(not _session(s) for s in state.known)
            or any(not _identifier(x) for x in state.revoked | state.logout_ops)):
        raise ValueError("invalid state")
    if any(type(a) is not Attempt or not _identifier(a.op) or not _session(a.session)
           or type(a.generation) is not int or not 0 <= a.generation <= state.generation
           or a.status not in ("prepared", "switched", "confirmed", "aborted")
           or (a.standby is not None and not _session(a.standby)) for a in state.attempts):
        raise ValueError("invalid state")
    pending = [a for a in state.attempts if a.status in ("prepared", "switched")]
    active_ids = [s.id for s in state.active]
    ops = [a.op for a in state.attempts]
    session_ids = [a.session.id for a in state.attempts]
    if (len(active_ids) > 3 or len(set(active_ids)) != len(active_ids)
            or len({s.id for s in state.known}) != len(state.known)
            or any(s not in state.known for s in state.active)
            or any(a.session not in state.known or (a.standby is not None and a.standby not in state.known)
                   for a in state.attempts)
            or len(ops) != len(set(ops)) or len(session_ids) != len(set(session_ids))
            or len(pending) > 1 or set(active_ids) & state.revoked
            or any(a.generation != state.generation for a in pending)
            or any(a.status != "switched" and a.standby is not None for a in state.attempts)
            or any(a.session.id in active_ids for a in pending)
            or any(a.session.id in state.revoked for a in pending)
            or any(a.status == 'aborted' and a.session.id not in state.revoked for a in state.attempts)
            or any(a.standby is not None and a.standby.id in active_ids for a in pending)
            or any(a.standby is not None and a.standby.id == a.session.id for a in pending)
            or (pending and pending[0].status == "switched" and len(active_ids) > 2)
            or (state.observed_at is not None and any(
                s.created_at > state.observed_at for s in state.active
                + tuple(a.session for a in state.attempts)
                + tuple(a.standby for a in state.attempts if a.standby is not None)))):
        raise ValueError("invalid state")


def _timed(state, now):
    _validate(state)
    if type(now) is not int or now < 0:
        raise ValueError("invalid time")
    if state.observed_at is not None and now < state.observed_at:
        raise ValueError("time rollback")
    if any(s.created_at > now for s in state.active + tuple(a.session for a in state.attempts)
           + tuple(a.standby for a in state.attempts if a.standby is not None)):
        raise ValueError("invalid state")
    state = replace(state, observed_at=now)
    expired = next((a for a in state.attempts
                    if a.status in ('prepared', 'switched') and now >= a.session.expires_at), None)
    return _abort_transition(state, expired, now) if expired is not None else state


def _find(state, op):
    if not _identifier(op):
        raise ValueError("invalid operation")
    return next((a for a in state.attempts if a.op == op), None)


def _put(state, attempt):
    return replace(state, attempts=tuple(attempt if a.op == attempt.op else a
                                         for a in state.attempts))


def _purge_expired_active(state, now):
    live = tuple(s for s in state.active if now < s.expires_at)
    expired = {s.id for s in state.active if now >= s.expires_at}
    return replace(state, active=live, revoked=state.revoked | expired)


def _abort_transition(state, attempt, now):
    state = _purge_expired_active(state, now)
    active = state.active
    revoked = state.revoked | {attempt.session.id}
    old = attempt.standby
    if old is not None:
        if now >= old.expires_at:
            revoked = revoked | {old.id}
        elif (old.id not in revoked and attempt.generation == state.generation
              and len(active) < 3):
            active += (old,)
    return _put(replace(state, active=active, revoked=revoked),
                replace(attempt, status='aborted', standby=None))


def prepare(state, op, session, generation, now):
    state = _timed(state, now)
    old = _find(state, op)
    if type(generation) is not int or generation != state.generation:
        raise ValueError("stale generation")
    if not _session(session) or session.created_at > now:
        raise ValueError("invalid session")
    if old is not None:
        if old.session != session or old.generation != generation:
            raise ValueError("operation conflict")
        return state
    if session.created_at != now or session.expires_at <= now:
        raise ValueError("invalid session")
    if (any(a.status in ("prepared", "switched") for a in state.attempts)
            or session.id in state.revoked
            or any(s.id == session.id for s in state.active)
            or any(a.session.id == session.id for a in state.attempts)):
        raise ValueError("attempt conflict")
    return replace(state, known=state.known | {session},
                   attempts=state.attempts + (Attempt(op, session, generation),))


def switch(state, op, now):
    """Model SQL switch only; external Redis and credential checks are absent."""
    state = _timed(state, now)
    a = _find(state, op)
    if a is None or a.status != "prepared" or now >= a.session.expires_at:
        return state
    state = _purge_expired_active(state, now)
    active = state.active
    standby = min(active, key=lambda s: (s.created_at, s.id)) if len(active) == 3 else None
    if standby is not None:
        active = tuple(s for s in active if s != standby)
    return _put(replace(state, active=active), replace(a, status="switched", standby=standby))


def confirm(state, op, now):
    """Model SQL confirmation only; cookie possession and Redis are external."""
    state = _timed(state, now)
    a = _find(state, op)
    if (a is None or a.status != "switched" or now >= a.session.expires_at
            or a.session.id in state.revoked):
        return state
    state = _purge_expired_active(state, now)
    active = state.active
    if len(active) >= 3:
        return state
    revoked = state.revoked | ({a.standby.id} if a.standby is not None else set())
    return _put(replace(state, active=active + (a.session,), revoked=revoked),
                replace(a, status="confirmed", standby=None))


def abort(state, op, now):
    state = _timed(state, now)
    a = _find(state, op)
    if a is None or a.status not in ("prepared", "switched"):
        return state
    return _abort_transition(state, a, now)


def revoke(state, session_id, now):
    state = _timed(state, now)
    if not _identifier(session_id):
        raise ValueError("invalid session")
    a = next((a for a in state.attempts if a.session.id == session_id
              and a.status in ("prepared", "switched")), None)
    if a:
        # An explicit logout of the replacement is not a failed Redis login:
        # it must not silently restore the superseded session.
        if a.standby is not None:
            state = replace(state, revoked=state.revoked | {a.standby.id})
        state = _put(state, replace(a, status="aborted", standby=None))
    return replace(state, active=tuple(s for s in state.active if s.id != session_id),
                   revoked=state.revoked | {session_id})


def logout_all(state, op, now):
    state = _timed(state, now)
    if not _identifier(op):
        raise ValueError("invalid operation")
    if op in state.logout_ops:
        return state
    attempts = tuple(replace(a, status="aborted", standby=None)
                     if a.status in ("prepared", "switched") else a for a in state.attempts)
    prior = {s.id for s in state.active} | {a.session.id for a in state.attempts}
    prior |= {a.standby.id for a in state.attempts if a.standby is not None}
    return replace(state, active=(), attempts=attempts, revoked=state.revoked | prior,
                   generation=state.generation + 1,
                   logout_ops=state.logout_ops | {op})


def authorized(state, session_id, now):
    """Return updated state and SQL eligibility; a Redis gate is still required."""
    state = _timed(state, now)
    if not _identifier(session_id):
        raise ValueError("invalid session")
    return state, any(s.id == session_id and now < s.expires_at for s in state.active)
