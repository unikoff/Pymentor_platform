from dataclasses import FrozenInstanceError, replace

import pytest

from backend.identity.c435_standby_model import (
    Attempt, Session, State, abort, authorized, confirm, logout_all, prepare, revoke, switch,
)


def seeded():
    active = (Session("b", 1, 30), Session("c", 2, 30), Session("a", 1, 30))
    return State(active=active, known=frozenset(active), observed_at=2)


def ready(state=None):
    return prepare(state or seeded(), "op", Session("new", 3, 40), 0, 3)


def ids(state):
    return {s.id for s in state.active}


def test_oldest_tie_break_and_conditional_authorization():
    initial = seeded()
    prepared = ready(initial)
    assert prepared.active == initial.active
    switched = switch(prepared, "op", 4)
    assert switched.attempts[0].standby.id == "a"
    assert ids(switched) == {"b", "c"}
    assert not authorized(switched, "new", 4)[1]
    confirmed = confirm(switched, "op", 5)
    assert ids(confirmed) == {"b", "c", "new"}
    assert confirmed.attempts[0].standby is None
    assert authorized(confirmed, "new", 5)[1]
    with pytest.raises(ValueError, match="conflict"):
        prepare(confirmed, "reuse", Session("a", 6, 40), 0, 6)
    assert ids(initial) == {"a", "b", "c"}
    with pytest.raises(FrozenInstanceError):
        initial.active = ()


def test_gate_outage_after_switch_aborts_and_restores_original():
    switched = switch(ready(), "op", 4)  # gate outage is an external observation
    recovered = abort(switched, "op", 5)
    assert ids(recovered) == {"a", "b", "c"}
    assert not authorized(recovered, "new", 5)[1]
    assert recovered.attempts[0].status == "aborted"


def test_confirm_and_abort_both_orders():
    switched = switch(ready(), "op", 4)
    confirmed = confirm(switched, "op", 5)
    assert ids(abort(confirmed, "op", 6)) == {"b", "c", "new"}
    aborted = abort(switched, "op", 5)
    assert ids(confirm(aborted, "op", 6)) == {"a", "b", "c"}


def test_revoke_standby_and_abort_both_orders():
    switched = switch(ready(), "op", 4)
    first = abort(revoke(switched, "a", 5), "op", 6)
    second = revoke(abort(switched, "op", 5), "a", 6)
    assert ids(first) == ids(second) == {"b", "c"}
    assert "a" in first.revoked and "a" in second.revoked


def test_logout_and_abort_both_orders_and_stale_generation():
    switched = switch(ready(), "op", 4)
    first = abort(logout_all(switched, "logout", 5), "op", 6)
    second = logout_all(abort(switched, "op", 5), "logout", 6)
    assert ids(first) == ids(second) == set()
    assert first.generation == second.generation == 1
    with pytest.raises(ValueError, match="stale generation"):
        prepare(first, "other", Session("other", 6, 50), 0, 6)
    new = prepare(first, "other", Session("other", 6, 50), 1, 6)
    new = confirm(switch(new, "other", 7), "other", 8)
    assert ids(logout_all(new, "logout", 9)) == {"other"}


def test_only_one_pending_and_retries_are_idempotent():
    prepared = ready()
    assert prepare(prepared, "op", Session("new", 3, 40), 0, 4).attempts == prepared.attempts
    for state in (prepared, switch(prepared, "op", 4)):
        with pytest.raises(ValueError, match="conflict"):
            prepare(state, "other", Session("other", 4, 40), 0, 4)
    with pytest.raises(ValueError, match="conflict"):
        prepare(prepared, "op", Session("changed", 3, 40), 0, 4)
    switched = switch(prepared, "op", 4)
    assert switch(switched, "op", 5).active == switched.active
    done = confirm(switched, "op", 5)
    assert confirm(done, "op", 6).active == done.active
    aborted = abort(switched, "op", 5)
    assert abort(aborted, "op", 6).active == aborted.active
    for transition in (switch, confirm, abort):
        assert transition(switched, "unknown", 5).active == switched.active
    assert not authorized(switched, "unknown", 5)[1]


def test_expired_standby_and_expired_active_do_not_return():
    active = (Session("a", 1, 5), Session("b", 1, 30), Session("c", 2, 30))
    initial = replace(seeded(), active=active, known=frozenset(active))
    switched = switch(ready(initial), "op", 4)
    assert ids(abort(switched, "op", 5)) == {"b", "c"}
    switched_late = switch(ready(initial), "op", 5)
    assert switched_late.attempts[0].standby is None
    assert ids(confirm(switched_late, "op", 6)) == {"b", "c", "new"}


def test_expired_switched_attempt_recovers_on_next_observation():
    prepared = prepare(seeded(), 'op', Session('new', 3, 6), 0, 3)
    switched = switch(prepared, 'op', 4)
    recovered, allowed = authorized(switched, 'a', 6)
    assert allowed and ids(recovered) == {'a', 'b', 'c'}
    assert recovered.attempts[0].status == 'aborted'
    assert prepare(recovered, 'later', Session('later', 7, 40), 0, 7)


def test_expired_prepared_attempt_does_not_block_a_new_attempt():
    prepared = prepare(seeded(), 'op', Session('new', 3, 6), 0, 3)
    next_state = prepare(prepared, 'later', Session('later', 6, 40), 0, 6)
    assert next_state.attempts[0].status == 'aborted'
    assert ids(next_state) == {'a', 'b', 'c'}


def test_expired_old_session_cannot_be_reissued_after_purge():
    active = (Session('a', 1, 5), Session('b', 1, 30), Session('c', 2, 30))
    initial = replace(seeded(), active=active, known=frozenset(active))
    switched = switch(ready(initial), 'op', 5)
    assert 'a' in switched.revoked
    confirmed = confirm(switched, 'op', 6)
    with pytest.raises(ValueError, match='conflict'):
        prepare(confirmed, 'new-op', Session('a', 7, 40), 0, 7)


def test_aborted_attempt_without_tombstone_is_rejected():
    fake = Session('new', 1, 20)
    corrupt = State(known=frozenset({fake}), attempts=(Attempt('op', fake, 0, status='aborted'),), observed_at=1)
    with pytest.raises(ValueError, match='invalid state'):
        authorized(corrupt, 'new', 1)


def test_standby_not_in_trusted_registry_is_rejected():
    state = switch(ready(), 'op', 4)
    forged = replace(state.attempts[0], standby=Session('invented', 1, 30))
    with pytest.raises(ValueError, match='invalid state'):
        abort(replace(state, attempts=(forged,)), 'op', 5)


def test_explicit_revoke_new_does_not_restore_superseded_session():
    state = revoke(switch(ready(), "op", 4), "new", 5)
    assert ids(confirm(state, "op", 6)) == {"b", "c"}
    assert {"new", "a"} <= state.revoked


def test_logout_all_retains_tombstones_for_preexisting_sessions():
    state = logout_all(seeded(), 'logout', 3)
    assert {'a', 'b', 'c'} <= state.revoked
    with pytest.raises(ValueError, match='conflict'):
        prepare(state, 'fresh-op', Session('a', 4, 40), 1, 4)


@pytest.mark.parametrize("bad", [True, -1, 1.5, "4"])
def test_invalid_clock(bad):
    with pytest.raises(ValueError):
        switch(ready(), "op", bad)


def test_rollback_and_invalid_state_fail_closed():
    state = switch(ready(), "op", 4)
    with pytest.raises(ValueError, match="time rollback"):
        abort(state, "op", 3)
    corrupt = [State(active=[]), State(active=(Session("x", 2, 2),)),
               replace(state, active=state.active + (Session("d", 1, 30),)),
               replace(state, revoked=frozenset({"new"})),
               replace(state, attempts=state.attempts + (Attempt("o2", Session("n2", 3, 40), 0),))]
    for item in corrupt:
        with pytest.raises(ValueError, match="invalid state"):
            authorized(item, "new", 4)


def test_no_sensitive_values_in_repr_or_errors():
    fake = "synthetic-digest-value"
    state = prepare(State(), "synthetic-op", Session(fake, 0, 20), 0, 0)
    assert fake not in repr(state) and fake not in repr(state.attempts[0].session)
    with pytest.raises(ValueError) as exc:
        prepare(state, "synthetic-op", Session("another", 0, 20), 0, 1)
    assert fake not in str(exc.value)
