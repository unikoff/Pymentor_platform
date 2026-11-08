"""Pure single-owner transition model; callers serialize each whole transition.

Identifiers represent synthetic token digests, never raw tokens. This model does
not implement authentication, storage, Redis gates or browser delivery.
Times are caller-validated, comparable absolute integer timestamps. Timed
transitions retain their observed time even when activation does nothing.
Used digests (including revocation tombstones) grow without bound in this model;
no retention or TTL policy is specified here.
"""

from dataclasses import dataclass, field, replace


@dataclass(frozen=True, repr=False)
class Session:
    digest: str = field(repr=False)
    expires_at: int


@dataclass(frozen=True, repr=False)
class Pending:
    digest: str = field(repr=False)
    pending_expires_at: int
    session_expires_at: int
    generation: int


@dataclass(frozen=True, repr=False)
class State:
    # Active order is activation order, oldest first. Used digests are retained
    # after removal so a delayed request cannot recreate a revoked session.
    active: tuple[Session, ...] = ()
    pending: tuple[Pending, ...] = ()
    used: frozenset[str] = frozenset()
    generation: int = 0
    observed_at: int | None = None


def _validate(state: State) -> None:
    if (type(state) is not State or type(state.active) is not tuple
            or type(state.pending) is not tuple or type(state.used) is not frozenset
            or type(state.generation) is not int
            or (state.observed_at is not None and type(state.observed_at) is not int)
            or any(type(s) is not Session or type(s.expires_at) is not int for s in state.active)
            or any(type(p) is not Pending or type(p.pending_expires_at) is not int
                   or type(p.session_expires_at) is not int or type(p.generation) is not int
                   for p in state.pending)):
        raise ValueError('invalid state')
    active = [s.digest for s in state.active]
    pending = [p.digest for p in state.pending]
    all_digests = active + pending
    if (state.generation < 0 or len(active) > 3
            or any(type(digest) is not str or not digest for digest in all_digests)
            or len(set(all_digests)) != len(all_digests)
            or not set(all_digests).issubset(state.used)
            or any(type(digest) is not str or not digest for digest in state.used)
            or any(p.generation != state.generation for p in state.pending)):
        raise ValueError("invalid state")


def _timed(state: State, now: int) -> State:
    _validate(state)
    if type(now) is not int:
        raise ValueError('invalid time')
    if state.observed_at is not None and now < state.observed_at:
        raise ValueError("time rollback")
    return state if state.observed_at == now else replace(state, observed_at=now)


def prepare(state: State, digest: str, now: int, pending_expires_at: int,
            session_expires_at: int, generation: int) -> State:
    """Register a fresh pending digest without modifying existing sessions."""
    state = _timed(state, now)
    if type(generation) is not int or generation != state.generation:
        raise ValueError("stale generation")
    if type(digest) is not str or not digest or digest in state.used:
        raise ValueError("invalid or previously used digest")
    if (type(pending_expires_at) is not int or type(session_expires_at) is not int
            or pending_expires_at <= now or session_expires_at <= now):
        raise ValueError("expiry must be in the future")
    item = Pending(digest, pending_expires_at, session_expires_at, generation)
    return replace(state, pending=state.pending + (item,), used=state.used | {digest})


def activate(state: State, digest: str, now: int) -> State:
    """Atomically present a digest, retaining time even on failure or retry."""
    state = _timed(state, now)
    if type(digest) is not str or not digest:
        raise ValueError('invalid digest')
    item = next((p for p in state.pending if p.digest == digest), None)
    if item is None or now >= item.pending_expires_at or now >= item.session_expires_at:
        return state
    if item.generation != state.generation:
        raise ValueError("stale generation")
    active = tuple(s for s in state.active if now < s.expires_at)
    active = active[1:] if len(active) == 3 else active
    return replace(state, active=active + (Session(digest, item.session_expires_at),),
                   pending=tuple(p for p in state.pending if p.digest != digest))


def revoke(state: State, digest: str) -> State:
    """Revoke either phase; retained used digests prevent reissue."""
    _validate(state)
    if type(digest) is not str or not digest:
        raise ValueError("invalid digest")
    return replace(state, active=tuple(s for s in state.active if s.digest != digest),
                   pending=tuple(p for p in state.pending if p.digest != digest),
                   used=state.used | {digest})


def logout_all(state: State) -> State:
    _validate(state)
    return replace(state, active=(), pending=(), generation=state.generation + 1)


def clean_expired_pending(state: State, now: int) -> State:
    state = _timed(state, now)
    return replace(state, pending=tuple(
        p for p in state.pending
        if now < p.pending_expires_at and now < p.session_expires_at
    ))
