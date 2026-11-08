import asyncio
from datetime import datetime, timedelta, timezone

import pytest

from backend.identity.c435_standby_sql import LabInvariantError, abort_unconfirmed, confirm_switch, invalidate_unrestorable, sql_eligible, switch_to_standby

NOW = datetime(2026, 1, 1, tzinfo=timezone.utc)
OP = 'a' * 64
DIGEST = 'b' * 64


class Result:
    def __init__(self, rows=(), rowcount=1):
        self.rows, self.rowcount = rows, rowcount

    def mappings(self):
        return self

    def all(self):
        return self.rows


class FakeDB:
    def __init__(self):
        self.sessions = [dict(id=i, user_id=1, created_at=NOW - timedelta(days=2 if i < 3 else 1), session_token=f'{i:064x}') for i in (2, 1, 3)]
        self.operations = {}
        self.pending = {digest: dict(digest=digest, user_id=1, generation=generation,
                                     status='pending', expires_at=NOW + timedelta(minutes=1))
                        for digest, generation in [(DIGEST, 4), ('d' * 64, 5)]
                        + [(f'{i:064x}', 4) for i in (1, 2, 3)]}
        self.generation = 4
        self.now = NOW
        self.sql = []
        self.bad_rowcount = None
        self.bad_write = None

    async def execute(self, statement, p):
        s = str(statement)
        self.sql.append(s)
        if s.startswith('SELECT id FROM public.users'):
            return Result([{'id': p['uid']}])
        if s.startswith('SELECT generation FROM'):
            return Result([{'generation': self.generation}])
        if s.startswith('SELECT operation_id FROM'):
            if 'standby_id = :sid' in s:
                rows = [r for r in self.operations.values() if r['user_id'] == p['uid'] and r['standby_id'] == p['sid'] and r['standby_created_at'] == p['created'] and r['standby_digest'] == p['digest'] and r['status'] in ('switched', 'invalidated')]
            elif ' OR digest' in s:
                rows = [r for op, r in self.operations.items() if op == p['op'] or r['digest'] == p['digest']]
            else:
                rows = [r for r in self.operations.values() if r['user_id'] == p['uid'] and r['status'] == 'switched']
            return Result(rows)
        if s.startswith('SELECT user_id, generation, status'):
            row = self.operations.get(p['op'])
            return Result([row] if row else [])
        if s.startswith('SELECT digest, user_id, generation, status'):
            row = self.pending.get(p['digest'])
            return Result([row.copy()] if row else [])
        if s.startswith('SELECT id FROM public.sessions WHERE session_token'):
            return Result([x for x in self.sessions if x['session_token'] == p['digest']])
        if s.startswith('SELECT id, created_at, session_token'):
            if 'session_token = :digest' in s:
                return Result([x.copy() for x in self.sessions if x['user_id'] == p['uid'] and x['session_token'] == p['digest']])
            rows = [x.copy() for x in self.sessions if x['user_id'] == p['uid']]
            if ' AS blocked\n        FROM public.sessions' in s:
                for x in rows:
                    x['blocked'] = any(op_id != p['op'] and op['user_id'] == p['uid']
                        and op['standby_id'] == x['id'] and op['standby_created_at'] == x['created_at']
                        and op['standby_digest'] == x['session_token'] and op['status'] in ('switched', 'invalidated')
                        for op_id, op in self.operations.items())
            if 'NOT EXISTS' in s:
                rows = [x for x in rows if not any(
                    op['user_id'] == p['uid'] and op['standby_id'] == x['id']
                    and op['standby_created_at'] == x['created_at']
                    and op['standby_digest'] == x['session_token']
                    and op['status'] in ('switched', 'invalidated')
                    for op in self.operations.values())]
            return Result(sorted(rows, key=lambda x: (x['created_at'], x['id'])))
        if s.startswith('SELECT id, user_id, created_at, session_token'):
            return Result([x.copy() for x in self.sessions if (x['id'] == p['sid'] if 'sid' in p else x['session_token'] == p['digest'])])
        if s.startswith('SELECT id FROM public.sessions WHERE id'):
            return Result([x for x in self.sessions if x['id'] == p['sid'] and x['user_id'] == p['uid'] and x['created_at'] == p['created'] and x['session_token'] == p['digest']])
        if s.startswith('SELECT clock_timestamp'):
            return Result([{'now': self.now}])
        if s.startswith('INSERT INTO c435_lab.standby_operations'):
            if self.bad_rowcount is not None:
                return Result(rowcount=self.bad_rowcount)
            self.operations[p['op']] = dict(user_id=p['uid'], digest=p['digest'], generation=p['generation'], deadline=p['deadline'], status='switched', standby_id=p['sid'], standby_created_at=p['created'], standby_digest=p['old_digest'], candidate_id=None, candidate_created_at=None)
            return Result()
        if self.bad_write and s.startswith(self.bad_write):
            return Result(rowcount=self.bad_rowcount)
        if s.startswith('DELETE FROM public.sessions'):
            matches = [x for x in self.sessions if x['id'] == p['sid'] and x['user_id'] == p['uid'] and x['created_at'] == p['created'] and x['session_token'] == p['digest']]
            for row in matches:
                self.sessions.remove(row)
            return Result(rowcount=len(matches))
        if s.startswith('INSERT INTO public.sessions'):
            row = dict(id=max([x['id'] for x in self.sessions] + [0]) + 1, user_id=p['uid'], created_at=p['now'], session_token=p['digest'])
            self.sessions.append(row)
            return Result([row.copy()])
        if s.startswith('UPDATE c435_lab.pending'):
            self.pending[p['digest']]['status'] = 'active'
            return Result()
        if s.startswith('UPDATE c435_lab.standby_operations'):
            if self.bad_rowcount is not None:
                return Result(rowcount=self.bad_rowcount)
            if "SET status = 'confirmed'" in s:
                self.operations[p['op']].update(status='confirmed', candidate_id=p['sid'], candidate_created_at=p['created'])
            else:
                self.operations[p['op']]['status'] = 'invalidated' if "SET status = 'invalidated'" in s else 'aborted'
            return Result()
        raise AssertionError('unexpected SQL')


def run(awaitable):
    return asyncio.run(awaitable)


def switch(db, op=OP, digest=DIGEST, generation=4, deadline=NOW + timedelta(minutes=1)):
    return run(switch_to_standby(db, 1, op, digest, generation, deadline))


def abort(db, user=1, op=OP, generation=4):
    return run(abort_unconfirmed(db, user, op, generation))


def invalidate(db, user=1, op=OP, generation=4):
    return run(invalidate_unrestorable(db, user, op, generation))


def prepare_confirm(db):
    switch(db)


def confirm(db, generation=4):
    return run(confirm_switch(db, 1, OP, DIGEST, generation))


def test_confirm_replaces_only_recorded_oldest_and_replay_has_no_writes():
    db = FakeDB()
    prepare_confirm(db)
    others = [s.copy() for s in db.sessions if s['id'] != 1]
    start = len(db.sql)
    assert confirm(db) == 'confirmed'
    assert [s for s in db.sessions if s['session_token'] != DIGEST] == others
    candidate = next(s for s in db.sessions if s['session_token'] == DIGEST)
    assert db.operations[OP]['candidate_id'] == candidate['id']
    assert db.operations[OP]['candidate_created_at'] == candidate['created_at']
    assert db.pending[DIGEST]['status'] == 'active'
    calls = db.sql[start:]
    assert all('FOR UPDATE' in calls[i] for i in (0, 1, 2, 3, 4, 5))
    assert 'clock_timestamp' in calls[6] and calls[7].startswith('DELETE')
    start = len(db.sql)
    before = [s.copy() for s in db.sessions]
    assert confirm(db) == 'already_confirmed'
    assert db.sessions == before and all(s.startswith('SELECT ') for s in db.sql[start:])


@pytest.mark.parametrize('case', ['candidate_missing', 'candidate_id', 'candidate_time', 'candidate_digest', 'candidate_owner', 'pending_missing', 'revoked', 'generation'])
def test_confirm_repeat_inconsistent_state_fails_closed(case):
    db = FakeDB()
    prepare_confirm(db)
    confirm(db)
    candidate = next(s for s in db.sessions if s['session_token'] == DIGEST)
    if case == 'candidate_missing':
        db.sessions.remove(candidate)
    elif case == 'candidate_id':
        db.operations[OP]['candidate_id'] += 10
    elif case == 'candidate_time':
        db.operations[OP]['candidate_created_at'] -= timedelta(seconds=1)
    elif case == 'candidate_digest':
        candidate['session_token'] = 'e' * 64
    elif case == 'candidate_owner':
        candidate['user_id'] = 2
    elif case == 'pending_missing':
        del db.pending[DIGEST]
    elif case == 'revoked':
        db.pending[DIGEST]['status'] = 'revoked'
    else:
        db.generation += 1
    start = len(db.sql)
    with pytest.raises(LabInvariantError):
        confirm(db)
    assert all(s.startswith('SELECT ') for s in db.sql[start:])


@pytest.mark.parametrize('case', ['missing', 'changed', 'marker_changed', 'owner', 'revoked', 'generation', 'expired', 'deadline'])
def test_confirm_rejects_invalid_pending_or_standby_before_writes(case):
    db = FakeDB()
    prepare_confirm(db)
    if case == 'missing':
        db.sessions = [s for s in db.sessions if s['id'] != 1]
    elif case == 'changed':
        next(s for s in db.sessions if s['id'] == 1)['session_token'] = 'e' * 64
    elif case == 'marker_changed':
        db.operations[OP]['standby_digest'] = 'e' * 64
    elif case == 'owner':
        db.pending[DIGEST]['user_id'] = 2
    elif case == 'revoked':
        db.pending[DIGEST]['status'] = 'revoked'
    elif case == 'generation':
        db.pending[DIGEST]['generation'] = 3
    elif case == 'expired':
        db.pending[DIGEST]['expires_at'] = NOW
    else:
        db.operations[OP]['deadline'] = NOW
    start = len(db.sql)
    with pytest.raises(LabInvariantError):
        confirm(db)
    assert all(s.startswith('SELECT ') for s in db.sql[start:])


def test_confirm_when_room_appears_does_not_delete_standby():
    db = FakeDB()
    prepare_confirm(db)
    next(s for s in db.sessions if s['id'] == 3)['created_at'] = NOW - timedelta(days=30)
    before = [s.copy() for s in db.sessions]
    start = len(db.sql)
    assert confirm(db) == 'confirmed'
    assert db.sessions[:-1] == before
    assert not any(s.startswith('DELETE') for s in db.sql[start:])


def test_confirm_initially_below_capacity_and_blocked_sessions():
    db = FakeDB()
    switch(db)
    db.generation = 5
    invalidate(db, generation=5)
    switch(db, op='c' * 64, digest='d' * 64, generation=5)
    before = [s.copy() for s in db.sessions]
    start = len(db.sql)
    assert run(confirm_switch(db, 1, 'c' * 64, 'd' * 64, 5)) == 'confirmed'
    assert db.sessions[:-1] == before
    assert not any(s.startswith('DELETE') for s in db.sql[start:])


def test_confirm_pending_expires_during_lock_wait_before_first_write():
    db = FakeDB()
    prepare_confirm(db)
    execute = db.execute
    async def delayed(statement, params):
        result = await execute(statement, params)
        if ' AS blocked' in str(statement):
            db.now += timedelta(minutes=1)
        return result
    db.execute = delayed
    start = len(db.sql)
    with pytest.raises(LabInvariantError, match='expired'):
        confirm(db)
    assert all(s.startswith('SELECT ') for s in db.sql[start:])


def test_confirm_expiry_during_writes_requires_rollback():
    db = FakeDB()
    prepare_confirm(db)
    execute = db.execute

    async def delayed(statement, params):
        result = await execute(statement, params)
        if str(statement).startswith('INSERT INTO public.sessions'):
            db.now += timedelta(minutes=1)
        return result

    db.execute = delayed
    with pytest.raises(LabInvariantError, match='expired'):
        confirm(db)
    # FakeDB has no transaction; real callers must roll back prior writes.


@pytest.mark.parametrize('statement', ['DELETE FROM public.sessions', 'INSERT INTO public.sessions', 'UPDATE c435_lab.pending', 'UPDATE c435_lab.standby_operations'])
@pytest.mark.parametrize('count', [0, 2, -1, True])
def test_confirm_each_write_requires_exact_rowcount(statement, count):
    db = FakeDB()
    prepare_confirm(db)
    db.bad_write, db.bad_rowcount = statement, count
    with pytest.raises(LabInvariantError, match='mismatch'):
        confirm(db)
    # FakeDB has no transaction: caller must roll back any preceding writes.


def test_confirm_stale_generation_rejected():
    db = FakeDB()
    prepare_confirm(db)
    db.generation = 5
    with pytest.raises(LabInvariantError, match='generation unavailable'):
        confirm(db)


@pytest.mark.parametrize('case', ['stale', 'deleted', 'changed_digest', 'changed_owner', 'changed_created', 'expired'])
def test_invalidate_unrestorable_and_repeat(case):
    db = FakeDB()
    switch(db)
    original = next(s for s in db.sessions if s['id'] == 1)
    if case == 'stale':
        db.generation = 5
    elif case == 'deleted':
        db.sessions.remove(original)
    elif case == 'changed_digest':
        original['session_token'] = 'e' * 64
    elif case == 'changed_owner':
        original['user_id'] = 2
    elif case == 'changed_created':
        original['created_at'] += timedelta(seconds=1)
    else:
        db.now = original['created_at'] + timedelta(days=30)
    before = [s.copy() for s in db.sessions]
    start = len(db.sql)
    assert invalidate(db, generation=db.generation) is True
    assert 'public.users' in db.sql[start] and 'FOR UPDATE' in db.sql[start]
    assert 'owner_generation' in db.sql[start + 1] and 'FOR UPDATE' in db.sql[start + 1]
    assert 'standby_operations' in db.sql[start + 2] and 'FOR UPDATE' in db.sql[start + 2]
    assert 'public.sessions' in db.sql[start + 3] and 'FOR UPDATE' in db.sql[start + 3]
    assert 'clock_timestamp' in db.sql[start + 4]
    assert invalidate(db, generation=db.generation) is False
    assert db.operations[OP]['status'] == 'invalidated' and db.sessions == before
    assert not any(s.startswith(('UPDATE public.sessions', 'INSERT INTO public.sessions', 'DELETE FROM public.sessions')) for s in db.sql)


def test_invalidate_live_wrong_owner_and_aborted_rejected():
    db = FakeDB()
    switch(db)
    for user, message in ((1, 'still restorable'), (2, 'operation unavailable')):
        with pytest.raises(LabInvariantError, match=message):
            invalidate(db, user=user)
        assert db.operations[OP]['status'] == 'switched'
    assert abort(db)
    with pytest.raises(LabInvariantError, match='not switched'):
        invalidate(db)
    assert db.operations[OP]['status'] == 'aborted'


def test_invalidate_no_standby_requires_stale_generation():
    db = FakeDB()
    db.sessions.pop()
    switch(db)
    with pytest.raises(LabInvariantError, match='still restorable'):
        invalidate(db)
    db.generation = 5
    assert invalidate(db, generation=5)


@pytest.mark.parametrize('count', [0, 2, -1, True])
def test_invalidate_requires_exact_rowcount(count):
    db = FakeDB()
    switch(db)
    db.generation = 5
    db.bad_rowcount = count
    with pytest.raises(LabInvariantError, match='update mismatch'):
        invalidate(db, generation=5)
    assert db.operations[OP]['status'] == 'switched'


def test_oldest_tie_lock_order_no_session_writes_and_repeat():
    db = FakeDB()
    before = [s.copy() for s in db.sessions]
    switch(db)
    record = db.operations[OP]
    assert (record['standby_id'], record['standby_created_at'], record['standby_digest']) == (1, NOW - timedelta(days=2), f'{1:064x}')
    assert db.sql[0].startswith('SELECT id FROM public.users') and 'FOR UPDATE' in db.sql[0]
    assert db.sql[1].startswith('SELECT generation FROM c435_lab.owner_generation') and 'FOR UPDATE' in db.sql[1]
    assert db.sql[-2].startswith('SELECT clock_timestamp')
    with pytest.raises(LabInvariantError):
        switch(db)
    assert db.sessions == before and len(db.operations) == 1
    assert not any(s.startswith(('UPDATE public.sessions', 'INSERT INTO public.sessions', 'DELETE FROM public.sessions')) for s in db.sql)


def test_pending_conflict_and_abort_repeat_preserve_sessions():
    db = FakeDB()
    switch(db)
    before = [s.copy() for s in db.sessions]
    with pytest.raises(LabInvariantError, match='unfinished'):
        switch(db, 'c' * 64, 'd' * 64)
    start = len(db.sql)
    assert abort(db) is True
    assert db.sql[start].startswith('SELECT id FROM public.users')
    assert db.sql[start + 1].startswith('SELECT generation')
    assert abort(db) is False
    assert db.operations[OP]['status'] == 'aborted' and db.sessions == before
    assert not any(s.startswith(('UPDATE public.sessions', 'INSERT INTO public.sessions', 'DELETE FROM public.sessions')) for s in db.sql)


def test_less_than_three_has_no_standby_and_abort_works():
    db = FakeDB()
    db.sessions.pop()
    switch(db, '01234567-89ab-cdef-0123-456789abcdef')
    assert db.operations['01234567-89ab-cdef-0123-456789abcdef']['standby_id'] is None
    assert abort(db, op='01234567-89ab-cdef-0123-456789abcdef')


@pytest.mark.parametrize('case', ['owner', 'generation', 'deleted', 'changed'])
def test_abort_fails_closed(case):
    db = FakeDB()
    switch(db)
    if case == 'owner':
        db.operations[OP]['user_id'] = 2
    elif case == 'generation':
        db.generation += 1
    elif case == 'deleted':
        db.sessions = [s for s in db.sessions if s['id'] != 1]
    else:
        next(s for s in db.sessions if s['id'] == 1)['session_token'] = 'e' * 64
    before = [s.copy() for s in db.sessions]
    with pytest.raises(LabInvariantError):
        abort(db)
    assert db.operations[OP]['status'] == 'switched' and db.sessions == before


def test_expired_standby_aborts_without_reactivating_or_changing_sessions():
    db = FakeDB()
    switch(db)
    before = [s.copy() for s in db.sessions]
    db.now += timedelta(days=30)
    assert abort(db) is True
    assert db.operations[OP]['status'] == 'aborted' and db.sessions == before
    # The future auth reader must independently reject expired SQL sessions.


@pytest.mark.parametrize('count', [0, 2, -1, True])
def test_exact_write_rowcounts(count):
    db = FakeDB()
    db.bad_rowcount = count
    with pytest.raises(LabInvariantError, match='insert mismatch'):
        switch(db)
    db.bad_rowcount = None
    switch(db)
    db.bad_rowcount = count
    with pytest.raises(LabInvariantError, match='update mismatch'):
        abort(db)


def test_deadline_clock_validation_and_secret_safe_errors():
    db = FakeDB()
    with pytest.raises(LabInvariantError, match='deadline'):
        switch(db, deadline=NOW)
    assert not db.operations
    secret = 'raw-token-must-never-appear'
    with pytest.raises(LabInvariantError) as exc:
        switch(db, digest=secret)
    assert secret not in str(exc.value)
    async def failure(*_args):
        raise RuntimeError(secret)
    db.execute = failure
    with pytest.raises(LabInvariantError) as exc:
        switch(db)
    assert secret not in str(exc.value) and exc.value.__cause__ is None and exc.value.__suppress_context__
    assert exc.value.__context__ is None


def test_more_than_three_live_sessions_and_existing_digest_rejected():
    db = FakeDB()
    with pytest.raises(LabInvariantError, match='digest already used'):
        switch(db, digest=db.sessions[0]['session_token'])
    db.sessions.append(dict(id=4, user_id=1, created_at=NOW, session_token=f'{4:064x}'))
    with pytest.raises(LabInvariantError, match='too many'):
        switch(db)
    assert not db.operations and len(db.sessions) == 4


def test_deadline_checked_after_waiting_for_session_locks():
    db = FakeDB()
    db.now = NOW + timedelta(minutes=2)
    with pytest.raises(LabInvariantError, match='deadline'):
        switch(db)
    assert not db.operations and len(db.sessions) == 3


@pytest.mark.parametrize('case', ['missing', 'revoked', 'active', 'owner', 'generation',
                                  'expired', 'deadline_after_expiry'])
def test_switch_rejects_invalid_pending_without_marker(case):
    db = FakeDB()
    pending = db.pending[DIGEST]
    if case == 'missing':
        del db.pending[DIGEST]
    elif case in ('revoked', 'active'):
        pending['status'] = case
    elif case == 'owner':
        pending['user_id'] = 2
    elif case == 'generation':
        pending['generation'] = 3
    elif case == 'expired':
        pending['expires_at'] = NOW
    else:
        pending['expires_at'] -= timedelta(microseconds=1)
    with pytest.raises(LabInvariantError):
        switch(db)
    assert not db.operations
    assert not any(s.startswith('INSERT ') for s in db.sql)


@pytest.mark.parametrize('wait_on', ['pending', 'sessions'])
def test_switch_rechecks_pending_expiry_after_lock_wait(wait_on):
    db = FakeDB()
    db.pending[DIGEST]['expires_at'] = NOW + timedelta(seconds=30)
    execute = db.execute

    async def delayed(statement, params):
        result = await execute(statement, params)
        sql = str(statement)
        if (wait_on == 'pending' and 'FROM c435_lab.pending' in sql
                or wait_on == 'sessions' and 'NOT EXISTS' in sql):
            db.now += timedelta(seconds=30)
        return result

    db.execute = delayed
    with pytest.raises(LabInvariantError, match='pending expired'):
        switch(db)
    assert not db.operations
    pending_index = next(i for i, sql in enumerate(db.sql) if 'FROM c435_lab.pending' in sql)
    session_index = next(i for i, sql in enumerate(db.sql) if 'NOT EXISTS' in sql)
    clock_index = next(i for i, sql in enumerate(db.sql) if 'clock_timestamp' in sql)
    assert pending_index == 2 and 'FOR UPDATE' in db.sql[pending_index]
    assert pending_index < session_index < clock_index
    assert not any(s.startswith('INSERT ') for s in db.sql)


def test_switch_sees_revocation_after_waiting_for_pending_lock():
    db = FakeDB()
    execute = db.execute

    async def delayed(statement, params):
        if 'FROM c435_lab.pending' in str(statement):
            db.pending[DIGEST]['status'] = 'revoked'
        return await execute(statement, params)

    db.execute = delayed
    with pytest.raises(LabInvariantError, match='pending unavailable'):
        switch(db)
    assert not db.operations
    assert not any(s.startswith('INSERT ') for s in db.sql)


def eligible(db, digest, user=1, generation=4):
    return run(sql_eligible(db, user, digest, generation))


@pytest.mark.parametrize('status', ['switched', 'invalidated', 'aborted'])
def test_sql_eligibility_status_repeat_and_read_only(status):
    db = FakeDB()
    switch(db)
    db.operations[OP]['status'] = status
    if status == 'invalidated':
        db.generation = 5  # Old-generation invalidation still blocks.
    start = len(db.sql)
    token = f'{1:064x}'
    for _ in range(2):
        assert eligible(db, token, generation=db.generation) is (status == 'aborted')
    statements = db.sql[start:]
    assert all(s.startswith('SELECT ') for s in statements)
    assert 'public.users' in statements[0] and 'FOR UPDATE' in statements[0]
    assert 'owner_generation' in statements[1] and 'FOR UPDATE' in statements[1]
    assert 'public.sessions' in statements[2] and 'FOR UPDATE' in statements[2]
    assert 'clock_timestamp' in statements[3]
    assert 'standby_operations' in statements[4]


def test_sql_eligibility_unknown_owner_expiry_future_and_stale():
    db = FakeDB()
    token = f'{1:064x}'
    assert not eligible(db, token, user=2)
    assert not eligible(db, 'f' * 64)
    session = next(s for s in db.sessions if s['id'] == 1)
    session['created_at'] = NOW - timedelta(days=30)
    assert not eligible(db, token)
    session['created_at'] = NOW + timedelta(microseconds=1)
    assert not eligible(db, token)
    session['created_at'] = NOW - timedelta(days=30) + timedelta(microseconds=1)
    assert eligible(db, token)
    with pytest.raises(LabInvariantError, match='generation unavailable'):
        eligible(db, token, generation=3)
    assert all(s.startswith('SELECT ') for s in db.sql)


def test_sql_eligibility_rechecks_expiry_after_operation_lookup():
    db = FakeDB()
    session = next(s for s in db.sessions if s['id'] == 1)
    session['created_at'] = NOW - timedelta(days=30) + timedelta(seconds=1)
    execute = db.execute
    async def delayed(statement, params):
        result = await execute(statement, params)
        if 'standby_id = :sid' in str(statement):
            db.now = NOW + timedelta(seconds=2)
        return result
    db.execute = delayed
    assert eligible(db, f'{1:064x}') is False


def test_invalidated_standby_is_not_counted_as_an_active_candidate():
    db = FakeDB()
    switch(db)
    db.generation = 5
    assert invalidate(db, generation=5) is True
    switch(db, op='c' * 64, digest='d' * 64, generation=5)
    assert db.operations['c' * 64]['standby_id'] is None


def test_sql_eligibility_reused_id_and_ambiguous_rows_fail_closed():
    db = FakeDB()
    switch(db)
    session = next(s for s in db.sessions if s['id'] == 1)
    session['session_token'] = 'e' * 64
    start = len(db.sql)
    assert eligible(db, 'e' * 64)
    assert not eligible(db, f'{1:064x}')
    session['session_token'] = f'{1:064x}'
    db.operations['c' * 64] = db.operations[OP].copy()
    with pytest.raises(LabInvariantError, match='ambiguous'):
        eligible(db, session['session_token'])
    db.sessions.append(session.copy())
    with pytest.raises(LabInvariantError, match='ambiguous'):
        eligible(db, session['session_token'])
    assert all(s.startswith('SELECT ') for s in db.sql[start:])


def test_sql_eligibility_rejects_invalid_digest_without_disclosure():
    db = FakeDB()
    secret = 'raw-token-must-never-appear'
    with pytest.raises(LabInvariantError) as exc:
        eligible(db, secret)
    assert secret not in str(exc.value) and not db.sql
