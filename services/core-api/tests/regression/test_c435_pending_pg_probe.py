"""Fake-only tests: no database, Docker, or external services."""
import asyncio
import importlib.util
from pathlib import Path
import sys

import pytest

SCRIPTS = Path(__file__).resolve().parents[4] / 'services/core-api/tools/lab'
sys.path.insert(0, str(SCRIPTS))
spec = importlib.util.spec_from_file_location('c435_pending_pg_probe', SCRIPTS / 'c435_pending_pg_probe.py')
probe = importlib.util.module_from_spec(spec)
spec.loader.exec_module(probe)


class Transaction:
    def __init__(self, conn):
        self.conn = conn

    async def start(self):
        self.before = self.conn.rows.copy()
        self.conn.events.append('start')

    async def rollback(self):
        self.conn.rows = self.before
        self.conn.events.append('rollback')

    async def __aenter__(self):
        await self.start()
        return self

    async def __aexit__(self, kind, value, tb):
        if kind:
            await self.rollback()
        else:
            self.conn.events.append('commit')


class FakeConnection:
    def __init__(self):
        self.rows = {}
        self.events = []
        self.closed = False

    def transaction(self, **_kwargs):
        return Transaction(self)

    async def fetch(self, sql):
        assert sql.startswith('SELECT id, state FROM pg_temp.')
        self.events.append('check')
        return [{'id': k, 'state': v} for k, v in sorted(self.rows.items())]

    async def fetchrow(self, sql):
        assert sql == 'SELECT current_database(), current_user, inet_server_port()'
        return (probe.target.lab.DATABASE, probe.target.lab.ADMIN_ROLE, 5432)

    async def execute(self, sql, *args):
        self.events.append('mutation')
        if sql.startswith('CREATE TEMP TABLE'):
            assert not args
        elif sql.startswith('INSERT'):
            assert 'pg_temp.' in sql and '$1' in sql
            self.rows.update(zip(args[::2], args[1::2]))
        elif sql.startswith('DELETE'):
            assert self.rows.get(args[0]) == args[1]
            del self.rows[args[0]]
        elif sql.startswith('UPDATE'):
            assert self.rows.get(args[1]) == args[2]
            self.rows[args[1]] = args[0]
        else:
            pytest.fail('unexpected SQL')

    async def close(self):
        self.closed = True


def test_scenario_commits_rolls_back_and_retry_does_not_mutate():
    conn = FakeConnection()
    asyncio.run(probe.experiment(conn))
    assert tuple(sorted(conn.rows.items())) == probe.DONE
    assert conn.events.count('rollback') == 1
    assert conn.events.count('commit') == 4
    assert conn.events.count('mutation') == 7
    for index, event in enumerate(conn.events):
        if event == 'mutation' and index > 1:
            assert conn.events[index - 1] == 'check'
    assert conn.events[-4:] == ['start', 'check', 'commit', 'check']


def test_bad_context_prevents_mutation():
    conn = FakeConnection()
    conn.rows = {1: 'active'}
    with pytest.raises(probe.ProbeError, match='context_mismatch'):
        asyncio.run(probe.activate(conn))
    assert 'mutation' not in conn.events


def test_guard_order_and_admin_temporary_connection(monkeypatch):
    tmp_path = Path('synthetic-root')
    events = []
    run_id = 'c232-012345abcdef'
    directory = tmp_path / run_id
    conn = FakeConnection()
    admin_conn = FakeConnection()
    monkeypatch.setattr(probe.target.lab, '_root', lambda: tmp_path)
    monkeypatch.setattr(probe.recovery, '_check_private_acl', lambda path: events.append(('acl', path)) or True)
    monkeypatch.setattr(probe.target, '_check_lab', lambda rid: (events.append(('lab', rid)) or (directory, {})))
    monkeypatch.setattr(probe.target.lab, '_read_secret', lambda *a: events.append(('secret',)) or 'private')

    async def connect(**kwargs):
        events.append(('connect', kwargs['user']))
        return conn if kwargs['user'] == probe.target.lab.MIGRATOR else admin_conn

    async def inspect(connection):
        assert connection is conn
        events.append(('inspect',))

    monkeypatch.setattr(probe.target, '_inspect_connection', inspect)
    asyncio.run(probe.probe(run_id, connect=connect))
    assert [event[0] for event in events] == ['acl', 'lab', 'secret', 'connect', 'inspect', 'secret', 'connect']
    assert conn.closed and admin_conn.closed


@pytest.mark.parametrize('run_id,acl,category', [
    ('invalid', True, 'run_id_invalid'),
    ('c232-012345abcdef', False, 'journal_acl_unverified'),
])
def test_rejected_before_secret_and_connect(monkeypatch, run_id, acl, category):
    tmp_path = Path('synthetic-root')
    monkeypatch.setattr(probe.target.lab, '_root', lambda: tmp_path)
    monkeypatch.setattr(probe.recovery, '_check_private_acl', lambda _: acl)
    monkeypatch.setattr(probe.target.lab, '_read_secret', lambda *a: pytest.fail('secret accessed'))
    with pytest.raises(probe.ProbeError, match=category):
        asyncio.run(probe.probe(run_id))


def test_driver_error_is_redacted_and_connection_closed(monkeypatch, capsys):
    tmp_path = Path('synthetic-root')
    run_id = 'c232-012345abcdef'
    conn = FakeConnection()
    monkeypatch.setattr(probe.target.lab, '_root', lambda: tmp_path)
    monkeypatch.setattr(probe.recovery, '_check_private_acl', lambda _: True)
    monkeypatch.setattr(probe.target, '_check_lab', lambda _: (tmp_path / run_id, {}))
    monkeypatch.setattr(probe.target.lab, '_read_secret', lambda *a: 'private')

    async def connect(**kwargs):
        return conn

    async def fail(_conn):
        raise RuntimeError('private password and journal')

    monkeypatch.setattr(probe.target, '_inspect_connection', fail)
    with pytest.raises(probe.ProbeError, match='^probe_failed$'):
        asyncio.run(probe.probe(run_id, connect=connect))
    assert conn.closed
    assert 'private' not in capsys.readouterr().out


def test_unexpected_admin_identity_prevents_temp_mutation(monkeypatch):
    root = Path('synthetic-root')
    run_id = 'c232-012345abcdef'
    migration_conn = FakeConnection()
    admin_conn = FakeConnection()
    async def wrong_identity(sql):
        return ('other-database', 'other-role', 5432)
    admin_conn.fetchrow = wrong_identity
    monkeypatch.setattr(probe.target.lab, '_root', lambda: root)
    monkeypatch.setattr(probe.recovery, '_check_private_acl', lambda _: True)
    monkeypatch.setattr(probe.target, '_check_lab', lambda _: (root / run_id, {}))
    monkeypatch.setattr(probe.target.lab, '_read_secret', lambda *args: 'private')
    async def inspect(_):
        pass
    async def connect(**kwargs):
        return migration_conn if kwargs['user'] == probe.target.lab.MIGRATOR else admin_conn
    monkeypatch.setattr(probe.target, '_inspect_connection', inspect)
    with pytest.raises(probe.ProbeError, match='admin_identity_invalid'):
        asyncio.run(probe.probe(run_id, connect=connect))
    assert not admin_conn.events and migration_conn.closed and admin_conn.closed


def test_connection_close_failure_is_not_reported_as_success(monkeypatch):
    root = Path('synthetic-root')
    run_id = 'c232-012345abcdef'
    conn = FakeConnection()
    async def fail_close():
        raise RuntimeError('private details')
    conn.close = fail_close
    monkeypatch.setattr(probe.target.lab, '_root', lambda: root)
    monkeypatch.setattr(probe.recovery, '_check_private_acl', lambda _: True)
    monkeypatch.setattr(probe.target, '_check_lab', lambda _: (root / run_id, {}))
    monkeypatch.setattr(probe.target.lab, '_read_secret', lambda *args: 'private')
    async def inspect(_):
        pass
    async def connect(**kwargs):
        return conn
    monkeypatch.setattr(probe.target, '_inspect_connection', inspect)
    with pytest.raises(probe.ProbeError, match='connection_close_failed') as error:
        asyncio.run(probe.probe(run_id, connect=connect))
    assert 'private details' not in str(error.value)
