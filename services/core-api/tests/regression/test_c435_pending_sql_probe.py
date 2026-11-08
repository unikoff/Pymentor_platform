"""Offline checks for the synthetic probe's fail-closed contract."""
import asyncio
from datetime import datetime
from datetime import timezone
import importlib.util
from pathlib import Path
import sys

import pytest

scripts = Path(__file__).resolve().parents[4] / 'services/core-api/tools/lab'
sys.path.insert(0, str(scripts))
spec = importlib.util.spec_from_file_location('c435_pending_sql_probe', scripts / 'c435_pending_sql_probe.py')
probe = importlib.util.module_from_spec(spec)
spec.loader.exec_module(probe)


def test_fixed_fake_digests_are_distinct_sha256_shapes():
    assert len(set(probe.DIGESTS)) == 7
    assert all(len(d) == 64 and set(d) <= set('0123456789abcdef') for d in probe.DIGESTS)


def test_wait_coordinator_releases_only_after_block_and_sql_expiry():
    async def scenario():
        events = []
        released = asyncio.Event()
        async def activate():
            try:
                events.append('activate')
                await released.wait()
                return False
            finally:
                events.append('finished')
        async def observe():
            events.append('blocked')
            return True, events.count('blocked') > 1
        async def release():
            events.append('release')
            released.set()
        assert await probe.coordinate_expiry(activate(), observe, release, 1) is False
        assert events == ['activate', 'blocked', 'blocked', 'release', 'finished']
    asyncio.run(scenario())


def test_wait_coordinator_cancels_before_releasing_on_failure():
    async def scenario():
        events = []
        async def activate():
            try:
                await asyncio.Event().wait()
            finally:
                events.append('cancelled')
        async def observe():
            await asyncio.sleep(0)
            raise RuntimeError('observation failed')
        async def release():
            events.append('release')
        with pytest.raises(RuntimeError):
            await probe.coordinate_expiry(activate(), observe, release, 1)
        assert events == ['cancelled', 'release']
    asyncio.run(scenario())


@pytest.mark.parametrize('observations', [[(True, False), (True, True)], [(False, False), (True, False), (True, True)]])
def test_wait_coordinator_requires_block_and_expiry_together(observations):
    async def scenario():
        released = asyncio.Event()
        calls = []
        async def activate():
            await released.wait()
            return False
        async def observe():
            result = observations[len(calls)]
            calls.append(result)
            return result
        async def release():
            released.set()
        assert await probe.coordinate_expiry(activate(), observe, release, 1) is False
        assert calls == observations
    asyncio.run(scenario())


def test_wait_coordinator_rejects_block_first_seen_after_expiry():
    async def scenario():
        events = []
        async def activate():
            try:
                await asyncio.Event().wait()
            finally:
                events.append('cancelled')
        async def observe():
            return True, True
        async def release():
            events.append('release')
        with pytest.raises(probe.ProbeError, match='block_not_observed_before_expiry'):
            await probe.coordinate_expiry(activate(), observe, release, 1)
        assert events == ['cancelled', 'release']
    asyncio.run(scenario())


def test_wait_coordinator_timeout_cancels_and_releases():
    async def scenario():
        events = []
        async def activate():
            try:
                await asyncio.Event().wait()
            finally:
                events.append('cancelled')
        async def observe():
            return False, False
        async def release():
            events.append('release')
        with pytest.raises(TimeoutError):
            await probe.coordinate_expiry(activate(), observe, release, 0.12)
        assert events == ['cancelled', 'release']
    asyncio.run(scenario())


def test_wait_coordinator_external_cancel_joins_and_releases():
    async def scenario():
        events = []
        started = asyncio.Event()
        async def activate():
            try:
                started.set()
                await asyncio.Event().wait()
            finally:
                events.append('cancelled')
        async def observe():
            return False, False
        async def release():
            events.append('release')
        coordinator = asyncio.create_task(probe.coordinate_expiry(activate(), observe, release, 1))
        await started.wait()
        coordinator.cancel()
        with pytest.raises(asyncio.CancelledError):
            await coordinator
        assert events == ['cancelled', 'release']
    asyncio.run(scenario())


def test_wait_coordinator_rejects_early_completion():
    async def scenario():
        events = []
        async def activate():
            return False
        async def observe():
            pytest.fail('must reject early completion')
        async def release():
            events.append('release')
        with pytest.raises(probe.ProbeError, match='activation_finished_before_expiry'):
            await probe.coordinate_expiry(activate(), observe, release, 1)
        assert events == ['release']
    asyncio.run(scenario())


@pytest.mark.parametrize('sql', ['SELECT id FROM users WHERE id=1 FOR UPDATE',
    'SELECT id FROM sessions WHERE id=1', 'DELETE FROM sessions WHERE id=1',
    'INSERT INTO sessions (user_id) VALUES (1)'])
def test_unqualified_public_table_rejected(sql):
    with pytest.raises(probe.ProbeError, match='unqualified_public_table'):
        probe.Trace('activate').statement(sql)


def test_activation_writes_require_second_sql_clock_after_sessions_lock():
    trace = probe.Trace('activate')
    class Result:
        def scalar_one(self):
            return 'clock-value'
    class Db:
        async def execute(self, stmt):
            assert str(stmt) == 'SELECT clock_timestamp()'
            return Result()
    with pytest.raises(probe.ProbeError, match='clock_before_row_locks'):
        asyncio.run(trace.clock(Db()))
    for table in ('public.users', 'c435_lab.owner_generation', 'c435_lab.pending'):
        trace.statement(f'SELECT id FROM {table} WHERE id=1 FOR UPDATE')
    asyncio.run(trace.clock(Db()))
    with pytest.raises(probe.ProbeError, match='clock_order_invalid'):
        trace.statement('DELETE FROM public.sessions WHERE id=1')
    trace.statement('SELECT id FROM public.sessions WHERE user_id=1 FOR UPDATE')
    with pytest.raises(probe.ProbeError, match='clock_order_invalid'):
        trace.statement('DELETE FROM public.sessions WHERE id=1')
    asyncio.run(trace.clock(Db()))
    trace.statement('DELETE FROM public.sessions WHERE id=1')


def test_retry_write_is_rejected_before_execution():
    trace = probe.Trace('retry')
    trace.clocks = 1
    with pytest.raises(probe.ProbeError, match='retry_write_attempted'):
        trace.statement("UPDATE c435_lab.pending SET status='active'")


def test_invalid_run_id_never_connects():
    async def connect(**_kwargs):
        pytest.fail('unexpected connection')
    with pytest.raises(probe.ProbeError, match='run_id_invalid'):
        asyncio.run(probe._probe('invalid', connect))


def test_quarantine_and_rechecks_precede_first_write_and_failure_closes(monkeypatch):
    import tools.lab.c435_concurrency_pg_probe as concurrency
    run_id = 'c232-012345abcdef'
    root = Path('synthetic-root')
    directory = root / run_id
    events = []
    names = {'source_volume': 'v', 'source_container': 'c', 'restore_volume': 'rv', 'restore_container': 'rc'}
    state = {'run_id': run_id, 'names': names, 'database': probe.target.lab.DATABASE,
             'migrator': probe.target.lab.MIGRATOR, 'port': probe.target.lab.PORT,
             'image': probe.target.lab.IMAGE}
    class Transaction:
        async def __aenter__(self):
            return self
        async def __aexit__(self, *args):
            return False
    class Connection:
        async def fetchval(self, *_):
            return False
        def transaction(self):
            return Transaction()
        async def execute(self, statement):
            events.append(('write', statement))
            raise RuntimeError('redacted driver failure')
        async def close(self, **_):
            events.append(('closed',))
    async def connect(**kwargs):
        assert kwargs['host'] == '127.0.0.1'
        if kwargs['user'] == probe.target.lab.MIGRATOR:
            class Preflight:
                async def close(self, **_):
                    pass
            return Preflight()
        assert kwargs['user'] == probe.target.lab.ADMIN_ROLE
        return Connection()
    async def check(*_args, **_kwargs):
        pass
    monkeypatch.setattr(concurrency, 'check_target', check)
    monkeypatch.setattr(probe.target, '_inspect_connection', check)
    monkeypatch.setattr(probe.target, '_check_lab', lambda _: (directory, state))
    monkeypatch.setattr(probe.target.lab, '_root', lambda: root)
    monkeypatch.setattr(probe.target.lab, '_read_secret', lambda *_: 'private')
    monkeypatch.setattr(probe.target.lab, '_names', lambda _: names)
    monkeypatch.setattr(probe.target.lab, '_state_update', lambda *args: events.append(('journal', args[2])))
    monkeypatch.setattr(probe.target.lab, '_load', lambda _: (directory, dict(state, phase=probe.PHASE)))
    monkeypatch.setattr(probe.target.lab, '_resource_names', lambda _: ())
    monkeypatch.setattr(probe.target.lab, '_assert_volume', lambda *_: events.append(('volume',)))
    monkeypatch.setattr(probe.target.lab, '_assert_container', lambda *a, **kw: events.append(('container',)))
    monkeypatch.setattr(probe.recovery, '_check_private_acl', lambda _: events.append(('acl',)) or True)
    with pytest.raises(RuntimeError):
        asyncio.run(probe._probe(run_id, connect))
    assert events == [('acl',), ('journal', probe.PHASE), ('acl',), ('volume',), ('container',),
                      ('write', 'ALTER ROLE pymentor_test NOLOGIN'), ('closed',)]


def test_effective_privileges_reject_unrelated_and_extra_column_access():
    class Admin:
        def __init__(self):
            self.extra_table = False
            self.extra_column = False

        async def fetch(self, sql):
            if "c.relkind='S'" in sql:
                return [('sessions_id_seq', True, True, False), ('users_id_seq', False, False, False)]
            if 'pg_attribute' in sql:
                return [('public', 'users', 'id', True, False, True, False),
                        ('public', 'sessions', 'id', True, True, True, False),
                        ('c435_lab', 'pending', 'status', True, True, True, False),
                        ('c435_lab', 'owner_generation', 'generation', True, False, True, False),
                        ('c435_lab', 'logout_operations', 'operation_id', True, True, False, False),
                        ('public', 'admins', 'id', self.extra_column, False, False, False)]
            return [('public', 'users', True, False, False, False, False, False, False),
                    ('public', 'sessions', True, True, False, True, False, False, False),
                    ('c435_lab', 'pending', True, True, False, False, False, False, False),
                    ('c435_lab', 'owner_generation', True, False, False, False, False, False, False),
                    ('c435_lab', 'logout_operations', True, True, False, False, False, False, False),
                    ('public', 'admins', self.extra_table, False, False, False, False, False, False)]

    admin = Admin()
    asyncio.run(probe.verify_privileges(admin))
    admin.extra_table = True
    with pytest.raises(probe.ProbeError, match='table_privileges_invalid'):
        asyncio.run(probe.verify_privileges(admin))
    admin.extra_table = False
    admin.extra_column = True
    with pytest.raises(probe.ProbeError, match='column_privileges_invalid'):
        asyncio.run(probe.verify_privileges(admin))


@pytest.mark.parametrize('valid_roles', [True, False])
def test_app_connection_only_after_transaction_and_role_checks(monkeypatch, valid_roles):
    import tools.lab.c435_concurrency_pg_probe as concurrency
    import sqlalchemy.engine
    import sqlalchemy.ext.asyncio

    run_id = 'c232-012345abcdef'
    directory = Path('synthetic-root') / run_id
    names = {'source_volume': 'v', 'source_container': 'c', 'restore_volume': 'rv', 'restore_container': 'rc'}
    state = {'run_id': run_id, 'names': names, 'database': probe.target.lab.DATABASE,
             'migrator': probe.target.lab.MIGRATOR, 'port': probe.target.lab.PORT,
             'image': probe.target.lab.IMAGE}
    events = []

    class Transaction:
        async def __aenter__(self):
            events.append('begin')
        async def __aexit__(self, exc_type, *_):
            events.append('rollback' if exc_type else 'commit')

    class Connection:
        async def fetchval(self, sql, *_):
            if sql == 'SELECT clock_timestamp()':
                return datetime.now(timezone.utc)
            return False
        async def fetchrow(self, _sql):
            return (True, True, False, False, False, True, True) if valid_roles else (True, True, True, False, False, True, True)
        def transaction(self):
            return Transaction()
        async def execute(self, sql, *_):
            events.append(sql)
        async def close(self, **_):
            events.append('close')

    async def connect(**_kwargs):
        return Connection()
    async def check(*_args, **_kwargs):
        pass
    async def experiment(engine, _expiry, _connect, _directory):
        events.append(('experiment', engine))
    class Engine:
        async def dispose(self):
            events.append('dispose')
    def create_engine(url, **kwargs):
        assert url.username == probe.target.lab.APP_ROLE
        assert url.password == 'app-private'
        assert kwargs['hide_parameters'] is True
        events.append('engine')
        return Engine()

    monkeypatch.setattr(concurrency, 'check_target', check)
    monkeypatch.setattr(probe.target, '_inspect_connection', check)
    monkeypatch.setattr(probe, 'verify_privileges', check)
    monkeypatch.setattr(probe, 'experiment', experiment)
    monkeypatch.setattr(sqlalchemy.ext.asyncio, 'create_async_engine', create_engine)
    monkeypatch.setattr(probe.target, '_check_lab', lambda _: (directory, state))
    monkeypatch.setattr(probe.target.lab, '_root', lambda: directory.parent)
    monkeypatch.setattr(probe.target.lab, '_read_secret', lambda _, name: 'app-private' if name == 'app_password' else 'other-private')
    monkeypatch.setattr(probe.target.lab, '_names', lambda _: names)
    monkeypatch.setattr(probe.target.lab, '_state_update', lambda *_: events.append('quarantine'))
    monkeypatch.setattr(probe.target.lab, '_load', lambda _: (directory, dict(state, phase=probe.PHASE)))
    monkeypatch.setattr(probe.target.lab, '_resource_names', lambda _: ())
    monkeypatch.setattr(probe.target.lab, '_assert_volume', lambda *_: None)
    monkeypatch.setattr(probe.target.lab, '_assert_container', lambda *_, **__: None)
    monkeypatch.setattr(probe.recovery, '_check_private_acl', lambda _: True)
    if valid_roles:
        asyncio.run(probe._probe(run_id, connect))
        assert events.index('quarantine') < events.index('begin') < events.index('commit') < events.index('engine')
        assert events.index('REVOKE ALL ON ALL TABLES IN SCHEMA public FROM pymentor_app') < events.index('GRANT SELECT ON public.users, public.sessions TO pymentor_app')
        for statement in (
            'ALTER ROLE pymentor_test NOLOGIN',
            'ALTER ROLE pymentor_app LOGIN CONNECTION LIMIT 1',
            'REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM pymentor_app',
            'GRANT UPDATE (id) ON public.users, public.sessions TO pymentor_app',
            'GRANT INSERT, DELETE ON public.sessions TO pymentor_app',
            'GRANT USAGE, SELECT ON public.sessions_id_seq TO pymentor_app',
            'GRANT UPDATE (generation) ON c435_lab.owner_generation TO pymentor_app',
            'GRANT UPDATE (status) ON c435_lab.pending TO pymentor_app',
        ):
            assert events.index('begin') < events.index(statement) < events.index('commit')
        assert any(isinstance(event, tuple) and event[0] == 'experiment' for event in events)
    else:
        with pytest.raises(probe.ProbeError, match='role_isolation_invalid'):
            asyncio.run(probe._probe(run_id, connect))
        assert 'rollback' in events and 'engine' not in events
