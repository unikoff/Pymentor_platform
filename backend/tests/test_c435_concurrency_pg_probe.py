"""Unit-only guard and fault checks; these do not prove PostgreSQL concurrency."""
import asyncio
import importlib.util
from pathlib import Path
import sys

import pytest

SCRIPTS = Path(__file__).resolve().parents[2] / 'scripts'
sys.path.insert(0, str(SCRIPTS))
spec = importlib.util.spec_from_file_location('c435_concurrency_pg_probe', SCRIPTS / 'c435_concurrency_pg_probe.py')
probe = importlib.util.module_from_spec(spec)
spec.loader.exec_module(probe)


class Conn:
    def __init__(self, identity=None, close_error=False):
        self.identity = identity or (probe.target.lab.DATABASE, probe.target.lab.ADMIN_ROLE, 5432)
        self.closed = False
        self.terminated = False
        self.close_error = close_error

    async def fetchrow(self, sql):
        return self.identity

    async def close(self, timeout):
        self.closed = True
        if self.close_error:
            raise RuntimeError('secret driver detail')

    def terminate(self):
        self.terminated = True


@pytest.mark.parametrize('run_id,acl', [('invalid', True), ('c232-012345abcdef', False)])
def test_invalid_guard_never_connects(monkeypatch, run_id, acl):
    monkeypatch.setattr(probe.recovery, '_check_private_acl', lambda _: acl)
    async def connect(**kwargs):
        pytest.fail('connection must not be opened')
    with pytest.raises(probe.ProbeError):
        asyncio.run(probe._probe(run_id, connect))


def test_wrong_identity_closes_without_journal_write(monkeypatch):
    root = Path('synthetic-root')
    run_id = 'c232-012345abcdef'
    conn = Conn(('wrong', 'wrong', 5432))
    monkeypatch.setattr(probe.target.lab, '_root', lambda: root)
    monkeypatch.setattr(probe.recovery, '_check_private_acl', lambda _: True)
    monkeypatch.setattr(probe.target, '_check_lab', lambda _: (root / run_id, {}))
    monkeypatch.setattr(probe.target.lab, '_read_secret', lambda *_: 'secret')
    monkeypatch.setattr(probe.target.lab, '_state_update', lambda *a: pytest.fail('journal write'))
    async def connect(**kwargs):
        assert kwargs['host'] == '127.0.0.1' and kwargs['user'] == probe.target.lab.ADMIN_ROLE
        return conn
    with pytest.raises(probe.ProbeError, match='admin_identity_invalid'):
        asyncio.run(probe._probe(run_id, connect))
    assert conn.closed


def test_close_failure_redacted_and_terminated(monkeypatch):
    root = Path('synthetic-root')
    run_id = 'c232-012345abcdef'
    conn = Conn(('wrong', 'wrong', 5432), close_error=True)
    monkeypatch.setattr(probe.target.lab, '_root', lambda: root)
    monkeypatch.setattr(probe.recovery, '_check_private_acl', lambda _: True)
    monkeypatch.setattr(probe.target, '_check_lab', lambda _: (root / run_id, {}))
    monkeypatch.setattr(probe.target.lab, '_read_secret', lambda *_: 'secret')
    async def connect(**kwargs):
        return conn
    with pytest.raises(probe.ProbeError, match='^connection_close_failed$'):
        asyncio.run(probe._probe(run_id, connect))
    assert conn.closed and conn.terminated


def test_quarantine_precedes_first_sql_write_and_survives_failure(monkeypatch):
    root = Path('synthetic-root')
    run_id = 'c232-012345abcdef'
    events = []
    class FailingCreate(Conn):
        def __init__(self, pid):
            super().__init__()
            self.pid = pid
        async def fetchval(self, sql, *args):
            if sql == 'SELECT pg_backend_pid()':
                return self.pid
            return False
        async def execute(self, sql):
            events.append(('write', sql))
            raise RuntimeError('driver secret')
    connections = [FailingCreate(1), FailingCreate(2)]
    pending = iter(connections)
    monkeypatch.setattr(probe.target.lab, '_root', lambda: root)
    monkeypatch.setattr(probe.recovery, '_check_private_acl', lambda _: True)
    monkeypatch.setattr(probe.target, '_check_lab', lambda _: (root / run_id, {}))
    monkeypatch.setattr(probe.target.lab, '_read_secret', lambda *_: 'secret')
    monkeypatch.setattr(probe.target.lab, '_state_update', lambda _d, _s, phase: events.append(('journal', phase)))
    monkeypatch.setattr(probe.target.lab, '_load', lambda _: (root / run_id, {'phase': 'c435-concurrency-quarantined'}))
    monkeypatch.setattr(probe.target.lab, '_names', lambda _: {'source_volume': 'own-volume', 'source_container': 'own-container'})
    monkeypatch.setattr(probe.target.lab, '_assert_volume', lambda _: None)
    monkeypatch.setattr(probe.target.lab, '_assert_container', lambda *a, **kw: None)
    async def check(_):
        pass
    async def connect(**kwargs):
        return next(pending)
    monkeypatch.setattr(probe, 'check_target', check)
    with pytest.raises(RuntimeError):
        asyncio.run(probe._probe(run_id, connect))
    assert events == [('journal', 'c435-concurrency-quarantined'), ('write', 'CREATE SCHEMA c435_lab')]
    assert all(c.closed for c in connections)


@pytest.mark.parametrize('state,generation,unexpired', [('active', 0, True), ('revoked', 0, True),
    ('pending', 1, True), ('pending', 0, False)])
def test_activation_does_not_write_for_ineligible_state(state, generation, unexpired):
    class Locked:
        async def fetchval(self, sql):
            if 'FOR UPDATE' in sql:
                return 0
            assert sql == 'SELECT clock_timestamp()'
            return 'synthetic-clock'
        async def fetchrow(self, sql, clock):
            assert clock == 'synthetic-clock'
            return {'state': state, 'generation': generation, 'unexpired': unexpired}
        async def execute(self, *args):
            pytest.fail('unexpected write')
    asyncio.run(probe.apply_operation(Locked(), 'activate'))
