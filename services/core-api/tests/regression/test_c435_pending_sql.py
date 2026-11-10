import asyncio
from functools import wraps
from datetime import datetime
from datetime import timedelta
from datetime import timezone

import pytest

from tools.lab.session_models.c435_pending_sql import LabInvariantError
from tools.lab.session_models.c435_pending_sql import activate
from tools.lab.session_models.c435_pending_sql import activate_without_eviction
from tools.lab.session_models.c435_pending_sql import prepare
from tools.lab.session_models.c435_pending_sql import revoke
from tools.lab.session_models.c435_pending_sql import logout_all

NOW = datetime(2026, 1, 1, tzinfo=timezone.utc)
NEW = 'f' * 64
OLD = tuple(f'{i:064x}' for i in range(1, 5))
OP = 'a' * 64
OP2 = 'b' * 64


def async_test(fn):
    @wraps(fn)
    def run(*args, **kwargs):
        return asyncio.run(fn(*args, **kwargs))
    return run


class Result:
    def __init__(self, rows=(), rowcount=1):
        self.rows = rows
        self.rowcount = rowcount

    def mappings(self):
        return self

    def all(self):
        return self.rows


class FakeDB:
    def __init__(self):
        self.generation = 4
        self.pending = {}
        self.operations = {}
        self.sessions = [dict(id=i, user_id=1, session_token=OLD[i - 1], created_at=NOW - timedelta(days=4-i)) for i in range(1, 4)]
        self.statements = []

    async def execute(self, stmt, params):
        sql = str(stmt)
        self.statements.append(sql)
        if sql.startswith('SELECT id FROM public.users'):
            return Result([{'id': params['uid']}])
        if sql.startswith('SELECT generation'):
            return Result([{'generation': self.generation}])
        if sql.startswith('SELECT user_id, generation_before'):
            row = self.operations.get(params['operation_id'])
            return Result([row] if row else [])
        if sql.startswith('SELECT user_id, generation'):
            row = self.pending.get(params['digest'])
            return Result([row] if row else [])
        if sql.startswith('SELECT id FROM public.sessions WHERE session_token'):
            return Result([{'id': s['id']} for s in self.sessions if s['session_token'] == params['digest']])
        if sql.startswith('SELECT id, user_id FROM public.sessions'):
            return Result([{'id': s['id'], 'user_id': s['user_id']} for s in self.sessions if s['session_token'] == params['digest']])
        if sql.startswith('SELECT id, created_at FROM public.sessions WHERE user_id'):
            rows = sorted((s for s in self.sessions if s['user_id'] == params['uid'] and s['created_at'] > params['cutoff']), key=lambda s: (s['created_at'], s['id']))
            return Result([{'id': s['id'], 'created_at': s['created_at']} for s in rows])
        if sql.startswith('INSERT INTO c435_lab.logout_operations'):
            if params['operation_id'] in self.operations:
                raise RuntimeError('duplicate operation_id')
            self.operations[params['operation_id']] = dict(user_id=params['uid'], generation_before=params['before'], generation_after=params['after'])
        elif sql.startswith('INSERT INTO c435_lab.pending'):
            self.pending[params['digest']] = dict(user_id=params['uid'], generation=params['generation'], expires_at=params['expires_at'], status='revoked' if "'revoked'" in sql else 'pending')
        elif sql.startswith('UPDATE c435_lab.owner_generation'):
            if self.generation != params['generation']:
                return Result(rowcount=0)
            self.generation += 1
        elif sql.startswith('DELETE FROM public.sessions WHERE user_id'):
            before = len(self.sessions)
            self.sessions = [s for s in self.sessions if not (s['user_id'] == params['uid'] and ('digest' not in params or s['session_token'] == params['digest']))]
            return Result(rowcount=before - len(self.sessions))
        elif sql.startswith('DELETE FROM public.sessions'):
            self.sessions = [s for s in self.sessions if not (s['id'] == params['id'] and s['user_id'] == params['uid'])]
        elif sql.startswith('INSERT INTO public.sessions'):
            self.sessions.append(dict(id=10, user_id=params['uid'], session_token=params['digest'], created_at=params['now']))
        elif sql.startswith('UPDATE c435_lab.pending'):
            if 'digest' in params:
                self.pending[params['digest']]['status'] = 'revoked' if "'revoked'" in sql else 'active'
            else:
                rows = [p for p in self.pending.values() if p['user_id'] == params['uid']]
                for row in rows:
                    row['status'] = 'revoked'
                return Result(rowcount=len(rows))
        else:
            raise AssertionError(sql)
        return Result()


async def clock(db):
    assert db.statements[-1].startswith(('SELECT user_id, generation', 'SELECT id, created_at'))
    return NOW


def digests(db):
    return [row['session_token'] for row in db.sessions]


@async_test
async def test_no_eviction_at_capacity_preserves_exact_state_without_writes():
    db = FakeDB()
    await prepare(db, 1, NEW, 4, NOW + timedelta(hours=1), clock)
    before_sessions = [row.copy() for row in db.sessions]
    before_pending = {key: row.copy() for key, row in db.pending.items()}
    start = len(db.statements)
    assert await activate_without_eviction(db, 1, NEW, clock) == 'at_capacity'
    assert db.sessions == before_sessions and db.pending == before_pending
    assert all(statement.startswith('SELECT ') for statement in db.statements[start:])


@async_test
async def test_no_eviction_activates_with_two_sessions_and_repeat_is_only_marker():
    db = FakeDB()
    db.sessions.pop()
    await prepare(db, 1, NEW, 4, NOW + timedelta(hours=1), clock)
    before = [row.copy() for row in db.sessions]
    start = len(db.statements)
    assert await activate_without_eviction(db, 1, NEW, clock) == 'activated'
    assert db.sessions[:2] == before and digests(db) == [*OLD[:2], NEW]
    assert not any(s.startswith('DELETE ') for s in db.statements[start:])
    # A marker can persist even when the session is absent; it is not auth.
    db.sessions.pop()
    before = [row.copy() for row in db.sessions]
    start = len(db.statements)
    assert await activate_without_eviction(db, 1, NEW, clock) == 'active_marker'
    assert db.sessions == before
    assert all(s.startswith('SELECT ') for s in db.statements[start:])


@async_test
@pytest.mark.parametrize('case', ['missing', 'expired', 'revoked', 'stale', 'expires_during_lock'])
async def test_no_eviction_unavailable_does_not_write(case):
    db = FakeDB()
    if case != 'missing':
        await prepare(db, 1, NEW, 4, NOW + timedelta(seconds=1), clock)
        if case == 'expired':
            db.pending[NEW]['expires_at'] = NOW
        elif case == 'revoked':
            db.pending[NEW]['status'] = 'revoked'
        elif case == 'stale':
            db.generation += 1
    moments = iter([NOW, NOW + timedelta(seconds=2)])
    async def delayed_clock(_db):
        return next(moments)
    before_sessions = [row.copy() for row in db.sessions]
    before_pending = {key: row.copy() for key, row in db.pending.items()}
    start = len(db.statements)
    assert await activate_without_eviction(db, 1, NEW, delayed_clock if case == 'expires_during_lock' else clock) == 'unavailable'
    assert db.sessions == before_sessions and db.pending == before_pending
    assert all(s.startswith('SELECT ') for s in db.statements[start:])


@async_test
async def test_no_eviction_rechecks_clock_after_session_locks():
    db = FakeDB()
    db.sessions[0]['created_at'] = NOW - timedelta(days=30) + timedelta(seconds=1)
    await prepare(db, 1, NEW, 4, NOW + timedelta(hours=1), clock)
    moments = iter([NOW, NOW + timedelta(seconds=2)])
    async def delayed_clock(db):
        assert db.statements[-1].startswith(('SELECT user_id, generation', 'SELECT id, created_at'))
        return next(moments)
    before = [row.copy() for row in db.sessions]
    assert await activate_without_eviction(db, 1, NEW, delayed_clock) == 'activated'
    assert db.sessions[:3] == before and digests(db) == [*OLD[:3], NEW]
    assert db.sessions[-1]['created_at'] == NOW + timedelta(seconds=2)


@async_test
async def test_no_eviction_rowcount_mismatch_requires_rollback():
    db = FakeDB()
    db.sessions.pop()
    await prepare(db, 1, NEW, 4, NOW + timedelta(hours=1), clock)
    execute = db.execute
    async def lost_update(statement, params):
        if str(statement).startswith('UPDATE c435_lab.pending'):
            return Result(rowcount=0)
        return await execute(statement, params)
    db.execute = lost_update
    with pytest.raises(LabInvariantError, match='pending update mismatch'):
        await activate_without_eviction(db, 1, NEW, clock)
    # FakeDB cannot roll back the earlier insert.


@async_test
async def test_prepare_activate_and_lost_reply_retry_preserves_business_state():
    db = FakeDB()
    await prepare(db, 1, NEW, 4, NOW + timedelta(hours=1), clock)
    assert digests(db) == list(OLD[:3])
    assert [s.split(' FROM ')[1].split()[0] for s in db.statements[:3]] == ['public.users', 'c435_lab.owner_generation', 'c435_lab.pending']
    assert await activate(db, 1, NEW, clock) is True
    assert digests(db) == [*OLD[1:3], NEW]
    assert await activate(db, 1, NEW, clock) is False
    assert digests(db) == [*OLD[1:3], NEW]
    with pytest.raises(LabInvariantError, match='already used'):
        await prepare(db, 1, NEW, 4, NOW + timedelta(hours=1), clock)


@async_test
@pytest.mark.parametrize('case', ['missing', 'expired', 'revoked', 'stale'])
async def test_invalid_pending_never_changes_sessions(case):
    db = FakeDB()
    if case != 'missing':
        await prepare(db, 1, NEW, 4, NOW + timedelta(hours=1), clock)
        if case == 'expired':
            db.pending[NEW]['expires_at'] = NOW
        elif case == 'revoked':
            db.pending[NEW]['status'] = 'revoked'
        else:
            db.generation += 1
    before = [row.copy() for row in db.sessions]
    assert await activate(db, 1, NEW, clock) is False
    assert db.sessions == before


@async_test
async def test_prepare_rejects_stale_generation_and_existing_session_digest():
    db = FakeDB()
    for digest, generation in [(NEW, 3), (OLD[0], 4)]:
        with pytest.raises(LabInvariantError):
            await prepare(db, 1, digest, generation, NOW + timedelta(hours=1), clock)
    assert digests(db) == list(OLD[:3])
    assert not db.pending


@async_test
async def test_more_than_three_live_sessions_fails_closed():
    db = FakeDB()
    await prepare(db, 1, NEW, 4, NOW + timedelta(hours=1), clock)
    db.sessions.append(dict(id=4, user_id=1, session_token=OLD[3], created_at=NOW))
    before = [row.copy() for row in db.sessions]
    with pytest.raises(LabInvariantError, match='more than three'):
        await activate(db, 1, NEW, clock)
    assert db.sessions == before
    assert db.pending[NEW]['status'] == 'pending'


@async_test
async def test_pending_expiring_during_session_lock_does_not_evict():
    db = FakeDB()
    await prepare(db, 1, NEW, 4, NOW + timedelta(seconds=1), clock)
    moments = iter([NOW, NOW + timedelta(seconds=2)])
    async def delayed_clock(_db):
        return next(moments)
    before = [row.copy() for row in db.sessions]
    assert await activate(db, 1, NEW, delayed_clock) is False
    assert db.sessions == before and db.pending[NEW]['status'] == 'pending'


@async_test
async def test_session_expiring_during_lock_does_not_evict_another():
    db = FakeDB()
    db.sessions[0]['created_at'] = NOW - timedelta(days=30) + timedelta(seconds=1)
    await prepare(db, 1, NEW, 4, NOW + timedelta(hours=1), clock)
    moments = iter([NOW, NOW + timedelta(seconds=2)])
    async def delayed_clock(_db):
        return next(moments)
    assert await activate(db, 1, NEW, delayed_clock) is True
    assert digests(db) == [*OLD[:3], NEW]


@async_test
async def test_raw_cookie_token_is_rejected_before_sql():
    db = FakeDB()
    with pytest.raises(LabInvariantError, match='invalid synthetic identifier'):
        await prepare(db, 1, 'raw-token-must-not-be-stored', 4, NOW + timedelta(hours=1), clock)
    assert not db.statements


@async_test
async def test_missing_pending_update_demands_rollback():
    db = FakeDB()
    await prepare(db, 1, NEW, 4, NOW + timedelta(hours=1), clock)
    execute = db.execute
    async def lost_update(statement, params):
        if str(statement).startswith('UPDATE c435_lab.pending'):
            return Result(rowcount=0)
        return await execute(statement, params)
    db.execute = lost_update
    with pytest.raises(LabInvariantError, match='pending update mismatch'):
        await activate(db, 1, NEW, clock)
    # This fake cannot roll back; a real caller must roll back the transaction.


@async_test
@pytest.mark.parametrize('activate_first', [False, True])
async def test_revoke_and_activate_in_both_orders(activate_first):
    db = FakeDB()
    await prepare(db, 1, NEW, 4, NOW + timedelta(hours=1), clock)
    if activate_first:
        assert await activate(db, 1, NEW, clock)
    await revoke(db, 1, NEW, clock)
    assert await activate(db, 1, NEW, clock) is False
    assert NEW not in digests(db)
    assert db.pending[NEW]['status'] == 'revoked'


@async_test
async def test_revoke_unknown_and_repeat_creates_durable_tombstone():
    db = FakeDB()
    before = list(digests(db))
    await revoke(db, 1, NEW, clock)
    await revoke(db, 1, NEW, clock)
    assert digests(db) == before
    assert db.pending[NEW] == dict(user_id=1, generation=4, expires_at=NOW, status='revoked')
    with pytest.raises(LabInvariantError, match='already used'):
        await prepare(db, 1, NEW, 4, NOW + timedelta(hours=1), clock)


@async_test
@pytest.mark.parametrize('foreign_pending', [False, True])
async def test_revoke_rejects_other_owner_without_deleting_session(foreign_pending):
    db = FakeDB()
    db.sessions.append(dict(id=42, user_id=2, session_token=NEW, created_at=NOW))
    if foreign_pending:
        db.pending[NEW] = dict(user_id=2, generation=4, expires_at=NOW, status='active')
    before = [s.copy() for s in db.sessions]
    with pytest.raises(LabInvariantError, match='another user'):
        await revoke(db, 1, NEW, clock)
    assert db.sessions == before
    assert (NEW in db.pending) == foreign_pending


@async_test
async def test_logout_all_blocks_delayed_prepare_and_preserves_other_owner():
    db = FakeDB()
    await prepare(db, 1, NEW, 4, NOW + timedelta(hours=1), clock)
    db.pending['a' * 64] = dict(user_id=2, generation=4, expires_at=NOW, status='pending')
    db.sessions.append(dict(id=42, user_id=2, session_token='b' * 64, created_at=NOW))
    start = len(db.statements)
    await logout_all(db, 1, OP)
    assert [s.split(' FROM ')[1].split()[0] for s in db.statements[start:start+2]] == ['public.users', 'c435_lab.owner_generation']
    assert db.generation == 5 and db.pending[NEW]['status'] == 'revoked'
    assert db.pending['a' * 64]['status'] == 'pending'
    assert digests(db) == ['b' * 64]
    with pytest.raises(LabInvariantError, match='stale generation'):
        await prepare(db, 1, 'c' * 64, 4, NOW + timedelta(hours=1), clock)
    assert await activate(db, 1, NEW, clock) is False


@async_test
async def test_logout_all_lost_commit_reply_preserves_new_session_on_retry():
    db = FakeDB()
    assert await logout_all(db, 1, OP) is True  # Simulate a committed transaction.
    assert db.operations[OP] == dict(user_id=1, generation_before=4, generation_after=5)
    new_session = dict(id=10, user_id=1, session_token=NEW, created_at=NOW)
    db.sessions.append(new_session)
    start = len(db.statements)
    assert await logout_all(db, 1, OP) is False
    assert db.generation == 5 and db.sessions == [new_session]
    assert len(db.statements[start:]) == 3
    assert 'FOR UPDATE' not in db.statements[-1]
    assert await logout_all(db, 1, OP2) is True
    assert db.generation == 6 and not db.sessions
    assert await logout_all(db, 1, OP) is False


@async_test
@pytest.mark.parametrize('marker', [
    dict(user_id=2, generation_before=3, generation_after=4),
    dict(user_id=1, generation_before=2, generation_after=4),
    dict(user_id=1, generation_before=4, generation_after=5),
    dict(user_id=1, generation_before=-1, generation_after=0),
    dict(user_id=1, generation_before=True, generation_after=2),
])
async def test_logout_all_rejects_foreign_or_corrupt_marker(marker):
    db = FakeDB()
    db.operations[OP] = marker
    before = [row.copy() for row in db.sessions]
    with pytest.raises(LabInvariantError, match='marker'):
        await logout_all(db, 1, OP)
    assert db.generation == 4 and db.sessions == before and db.operations[OP] == marker
    assert len(db.statements) == 3


@async_test
@pytest.mark.parametrize('operation_id', ['', 'A' * 64, 'g' * 64, 'a' * 63, None, 1])
async def test_logout_all_rejects_invalid_operation_id_without_sql(operation_id):
    db = FakeDB()
    with pytest.raises(LabInvariantError, match='invalid synthetic identifier'):
        await logout_all(db, 1, operation_id)
    assert not db.statements


@async_test
async def test_revoke_invalid_digest_and_logout_invalid_owner_do_not_query():
    db = FakeDB()
    with pytest.raises(LabInvariantError, match='invalid synthetic identifier'):
        await revoke(db, 1, 'F' * 64, clock)
    with pytest.raises(LabInvariantError, match='invalid synthetic identifier'):
        await logout_all(db, True, OP)
    assert not db.statements


@async_test
@pytest.mark.parametrize('prefix,bad_count,operation', [
    ('INSERT INTO c435_lab.pending', 0, 'revoke'),
    ('UPDATE c435_lab.pending', 2, 'revoke_existing'),
    ('DELETE FROM public.sessions WHERE user_id', 2, 'revoke'),
    ('UPDATE c435_lab.owner_generation', 0, 'logout'),
    ('UPDATE c435_lab.owner_generation', 2, 'logout'),
    ('UPDATE c435_lab.pending', -1, 'logout'),
    ('DELETE FROM public.sessions WHERE user_id', -1, 'logout'),
    ('INSERT INTO c435_lab.logout_operations', 0, 'logout'),
    ('INSERT INTO c435_lab.logout_operations', 2, 'logout'),
])
async def test_rowcount_anomalies_require_caller_rollback(prefix, bad_count, operation):
    db = FakeDB()
    if operation == 'revoke_existing':
        await prepare(db, 1, NEW, 4, NOW + timedelta(hours=1), clock)
    execute = db.execute
    async def anomalous(statement, params):
        if str(statement).startswith(prefix):
            return Result(rowcount=bad_count)
        return await execute(statement, params)
    db.execute = anomalous
    with pytest.raises(LabInvariantError, match='mismatch'):
        if operation == 'logout':
            await logout_all(db, 1, OP)
        else:
            await revoke(db, 1, NEW, clock)
    # FakeDB cannot roll back earlier mutations; caller must roll back.
