from dataclasses import FrozenInstanceError

import pytest

from backend.identity.c435_pending_model import (
    Pending, Session, State, activate, clean_expired_pending, logout_all, prepare, revoke,
)


def pending(state, digest, pending_until=10, session_until=20):
    return prepare(state, digest, state.observed_at or 0, pending_until,
                   session_until, state.generation)


def three_active():
    state = State()
    for digest in ("a", "b", "c"):
        state = activate(pending(state, digest), digest, 1)
    return state


def ids(state):
    return tuple(s.digest for s in state.active)


@pytest.mark.parametrize('state', [State(used=set()), State(active=[]), State(pending=[])])
def test_mutable_corrupt_state_is_rejected(state):
    with pytest.raises(ValueError, match='invalid state'):
        prepare(state, 'x', 0, 10, 20, state.generation)


@pytest.mark.parametrize('now', [True, 1.5, '1'])
def test_non_integer_clock_is_rejected(now):
    with pytest.raises(ValueError, match='invalid time'):
        activate(State(), 'x', now)


def test_prepare_is_immutable_and_activation_evicts_once():
    original = three_active()
    ready = pending(original, "d")
    assert ids(original) == ids(ready) == ("a", "b", "c")
    activated = activate(ready, "d", 1)
    assert ids(activated) == ("b", "c", "d")
    assert activate(activated, "d", 2).active == activated.active
    with pytest.raises(FrozenInstanceError):
        ready.active = ()


def test_invalid_expired_and_revoked_do_not_change_active():
    original = three_active()
    ready = pending(original, "d")
    assert activate(ready, "unknown", 1) is ready
    assert activate(ready, "d", 10).active == ready.active
    revoked = revoke(ready, "d")
    assert activate(revoked, "d", 1) is revoked
    assert ids(revoked) == ids(original)
    session_expired = pending(original, "e", pending_until=20, session_until=5)
    assert activate(session_expired, "e", 5).active == session_expired.active


def test_serialized_competing_activations_and_retry():
    ready = pending(pending(three_active(), "d"), "e")
    for first, second in (("d", "e"), ("e", "d")):
        after_first = activate(ready, first, 1)
        after_second = activate(after_first, second, 1)
        assert ids(after_first) == ("b", "c", first)
        assert ids(after_second) == ("c", first, second)
        assert activate(after_second, first, 2).active == after_second.active


def test_logout_and_cleanup_order_cannot_resurrect():
    ready = pending(three_active(), "d")
    for state in (logout_all(ready), clean_expired_pending(ready, 10)):
        assert activate(state, "d", state.observed_at).active == state.active
        with pytest.raises(ValueError):
            pending(state, "d")
    activated = activate(ready, "d", 1)
    logged_out = logout_all(activated)
    assert ids(logged_out) == ()
    assert activate(logged_out, "d", 2).active == logged_out.active
    assert ids(revoke(activated, "d")) == ("b", "c")
    assert ids(activate(clean_expired_pending(ready, 9), "d", 9)) == ("b", "c", "d")


def test_boundaries_and_sensitive_values_are_hidden():
    secret = "synthetic-sensitive-token-or-pii"
    state = pending(State(), secret)
    assert secret not in repr(state)
    assert secret not in repr(state.pending[0])
    assert secret not in repr(activate(state, secret, 1).active[0])
    with pytest.raises(ValueError) as exc:
        pending(state, secret)
    assert secret not in str(exc.value)
    for deadline in (0, -1):
        with pytest.raises(ValueError):
            pending(State(), "x", deadline, 20)
        with pytest.raises(ValueError):
            pending(State(), "x", 20, deadline)


def test_revocation_and_logout_block_delayed_preparation_in_both_orders():
    initial = State()
    generation = initial.generation  # Captured before preparation starts.
    revoked_first = revoke(initial, "x")
    with pytest.raises(ValueError):
        prepare(revoked_first, "x", 0, 10, 20, generation)
    prepared_first = prepare(initial, "x", 0, 10, 20, generation)
    assert not activate(revoke(prepared_first, "x"), "x", 1).active

    logged_out = logout_all(initial)
    with pytest.raises(ValueError):
        prepare(logged_out, "x", 0, 10, 20, generation)
    assert not activate(logout_all(prepared_first), "x", 1).active
    assert pending(logged_out, "fresh").generation == 1


def test_activation_removes_expired_entries_before_evicting_live_session():
    state = State()
    for digest, expiry in (("a", 20), ("b", 5), ("c", 20)):
        state = activate(pending(state, digest, session_until=expiry), digest, 1)
    state = pending(state, "d")
    assert ids(activate(state, "d", 5)) == ("a", "c", "d")


@pytest.mark.parametrize("corrupt", [
    State(active=(Session("a", 20), Session("a", 20)), used=frozenset({"a"})),
    State(pending=(Pending("a", 10, 20, 0), Pending("a", 10, 20, 0)),
          used=frozenset({"a"})),
    State(active=(Session("a", 20),), pending=(Pending("a", 10, 20, 0),),
          used=frozenset({"a"})),
    State(active=(Session("a", 20),)),
    State(pending=(Pending("a", 10, 20, 0),)),
    State(pending=(Pending("a", 10, 20, 1),), used=frozenset({"a"})),
])
def test_corrupt_state_fails_closed_at_every_operation(corrupt):
    operations = (
        lambda: prepare(corrupt, "x", 0, 10, 20, 0),
        lambda: activate(corrupt, "x", 0),
        lambda: revoke(corrupt, "x"),
        lambda: logout_all(corrupt),
        lambda: clean_expired_pending(corrupt, 0),
    )
    for operation in operations:
        with pytest.raises(ValueError, match="invalid state"):
            operation()


def test_time_rollback_rejected_after_expiry_observed():
    ready = pending(State(), "a")
    expired = activate(ready, "a", 10)
    assert expired.pending == ready.pending
    for operation in (
        lambda: activate(expired, "a", 9),
        lambda: prepare(expired, "b", 9, 20, 30, expired.generation),
        lambda: clean_expired_pending(expired, 9),
    ):
        with pytest.raises(ValueError, match="time rollback"):
            operation()
    cleaned = clean_expired_pending(expired, 10)
    assert not cleaned.pending
    assert not activate(cleaned, "a", 10).active
