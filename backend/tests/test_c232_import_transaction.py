import asyncio

import pytest

from infrastructure.c232_import_transaction import (
    TransactionGateError, check_empty_target, experiment_import_rollback_only,
)
from infrastructure.c232_mapping import TABLE_MAPPINGS, TABLE_ORDER


class FakeTransaction:
    def __init__(self, connection):
        self.connection = connection

    async def __aenter__(self):
        self.connection.events.append('begin')

    async def __aexit__(self, kind, value, tb):
        self.connection.events.append('rollback' if kind else 'commit')


class FakeConnection:
    def __init__(self, *, nonempty=None, fail=False):
        self.events = []
        self.nonempty = nonempty
        self.fail = fail

    def transaction(self):
        return FakeTransaction(self)

    async def execute(self, sql, *args):
        self.events.append(sql)
        if self.fail:
            raise RuntimeError('secret value')

    async def fetchval(self, sql):
        self.events.append(sql)
        return self.nonempty is not None and f'"{self.nonempty}"' in sql


@pytest.fixture
def empty():
    return {table: [] for table in TABLE_ORDER}


def test_locks_before_checking_all_tables(empty):
    connection = FakeConnection()
    assert asyncio.run(check_empty_target(connection, empty)) == {table: 0 for table in TABLE_ORDER}
    assert connection.events[0] == 'begin'
    assert 'pg_advisory_xact_lock' in connection.events[1]
    assert connection.events[2].startswith('LOCK TABLE ')
    assert len(connection.events[3:-1]) == 16
    assert connection.events[-1] == 'commit'


def test_nonempty_target_rolls_back(empty):
    connection = FakeConnection(nonempty='session_import_markers')
    with pytest.raises(TransactionGateError, match='target_not_empty'):
        asyncio.run(check_empty_target(connection, empty))
    assert connection.events[-1] == 'rollback'


def test_sessions_rejected_before_connection(empty):
    empty['users'] = [dict(id=1, username='x', email='x', password_hash='x',
                           subscription_until=None, subscription_plan=None, is_admin=False)]
    empty['sessions'] = [dict(id=1, user_id=1, session_token='x',
                              created_at='2026-01-01T00:00:00+00:00')]
    connection = FakeConnection()
    with pytest.raises(TransactionGateError, match='sessions_unsupported'):
        asyncio.run(check_empty_target(connection, empty))
    assert connection.events == []


def test_database_failure_is_visible_and_redacted(empty):
    connection = FakeConnection(fail=True)
    with pytest.raises(TransactionGateError, match='transaction_gate_failed') as exc:
        asyncio.run(check_empty_target(connection, empty))
    assert exc.value.__suppress_context__
    assert connection.events[-1] == 'rollback'


class ExperimentTransaction:
    def __init__(self, connection):
        self.connection = connection

    async def start(self):
        self.connection.events.append('begin')

    async def rollback(self):
        self.connection.events.append('rollback')


class ExperimentConnection(FakeConnection):
    def __init__(self, *, mismatch=False, insert_failure=False, active=False, nonempty=None):
        super().__init__(nonempty=nonempty)
        self.rows = {table: [] for table in TABLE_ORDER}
        self.mismatch = mismatch
        self.insert_failure = insert_failure
        self.active = active

    def is_in_transaction(self):
        return self.active

    def transaction(self):
        return ExperimentTransaction(self)

    async def executemany(self, sql, args):
        self.events.append(sql)
        if self.insert_failure:
            raise RuntimeError('secret value')
        table = next(table for table in TABLE_ORDER if f'public."{table}"' in sql)
        columns = [column.name for column in TABLE_MAPPINGS[table].columns]
        self.rows[table] = [dict(zip(columns, row)) for row in args]

    async def fetch(self, sql):
        self.events.append(sql)
        table = next(table for table in TABLE_ORDER if f'public."{table}"' in sql)
        return [] if self.mismatch and table == 'users' else self.rows[table]


@pytest.fixture
def synthetic(empty):
    empty['users'] = [dict(id=1, username='synthetic', email='synthetic', password_hash='synthetic',
                           subscription_until=None, subscription_plan=None, is_admin=False)]
    return empty


def test_experiment_locks_checks_inserts_compares_and_rolls_back(synthetic):
    connection = ExperimentConnection()
    counts = asyncio.run(experiment_import_rollback_only(connection, synthetic))
    events = connection.events
    assert counts['users'] == 1
    assert events[0] == 'begin'
    assert 'pg_advisory_xact_lock' in events[1]
    assert events[2].startswith('LOCK TABLE ')
    assert all(event.startswith('SELECT EXISTS') for event in events[3:19])
    assert events[19].startswith('INSERT INTO public."users"')
    assert '$1' in events[19] and 'synthetic' not in events[19]
    assert len(events[20:-1]) == len(TABLE_ORDER)
    assert all(event.startswith('SELECT ') for event in events[20:-1])
    assert events[-1] == 'rollback' and 'commit' not in events


def test_experiment_insert_failure_rolls_back_and_redacts(synthetic):
    connection = ExperimentConnection(insert_failure=True)
    with pytest.raises(TransactionGateError, match='^transaction_experiment_failed$') as exc:
        asyncio.run(experiment_import_rollback_only(connection, synthetic))
    assert exc.value.__suppress_context__
    assert connection.events[-1] == 'rollback'


def test_experiment_mismatch_rolls_back(synthetic):
    connection = ExperimentConnection(mismatch=True)
    with pytest.raises(TransactionGateError, match='^comparison_failed$'):
        asyncio.run(experiment_import_rollback_only(connection, synthetic))
    assert connection.events[-1] == 'rollback'


def test_experiment_sessions_rejected_before_connection(synthetic):
    synthetic['sessions'] = [dict(id=1, user_id=1, session_token='x',
                                  created_at='2026-01-01T00:00:00+00:00')]
    connection = ExperimentConnection()
    with pytest.raises(TransactionGateError, match='^sessions_unsupported$'):
        asyncio.run(experiment_import_rollback_only(connection, synthetic))
    assert connection.events == []


def test_experiment_rejects_external_transaction(synthetic):
    connection = ExperimentConnection(active=True)
    with pytest.raises(TransactionGateError, match='^external_transaction_unsupported$'):
        asyncio.run(experiment_import_rollback_only(connection, synthetic))
    assert connection.events == []


def test_experiment_nonempty_target_under_lock_rolls_back(synthetic):
    connection = ExperimentConnection(nonempty='session_import_markers')
    with pytest.raises(TransactionGateError, match='^target_not_empty$'):
        asyncio.run(experiment_import_rollback_only(connection, synthetic))
    assert connection.events[2].startswith('LOCK TABLE ')
    assert connection.events[-1] == 'rollback'
    assert not any(event.startswith('INSERT ') for event in connection.events)


def test_experiment_cancellation_after_insertion_rolls_back(synthetic):
    class CancelledConnection(ExperimentConnection):
        async def executemany(self, sql, args):
            await super().executemany(sql, args)
            raise asyncio.CancelledError()

    connection = CancelledConnection()
    with pytest.raises(asyncio.CancelledError):
        asyncio.run(experiment_import_rollback_only(connection, synthetic))
    assert any(event.startswith('INSERT ') for event in connection.events)
    assert connection.events[-1] == 'rollback'
