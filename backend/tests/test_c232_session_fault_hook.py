import asyncio
import importlib.util
import sys
from pathlib import Path

import pytest
from sqlalchemy.exc import SQLAlchemyError

SCRIPT = Path(__file__).resolve().parents[2] / 'scripts' / 'c232_sessions_e2e_probe.py'
spec = importlib.util.spec_from_file_location('c232_sessions_probe_test', SCRIPT)
probe = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = probe
spec.loader.exec_module(probe)


class FakeSession:
    async def execute(self, statement, values):
        assert 'session_operations' in str(statement)
        assert values['uid'] == 1


def test_fault_is_recorded_only_after_commit_returns():
    async def scenario():
        state = {'injected': False}

        async def successful_commit():
            return None

        with pytest.raises(SQLAlchemyError):
            await probe.commit_with_synthetic_marker(FakeSession(), successful_commit, 1, 'operation', state, 'after_commit')
        assert state['injected'] is True

        state['injected'] = False

        async def failed_commit():
            raise SQLAlchemyError('unexpected failure')

        with pytest.raises(SQLAlchemyError):
            await probe.commit_with_synthetic_marker(FakeSession(), failed_commit, 1, 'operation', state, 'after_commit')
        assert state['injected'] is False

        await probe.commit_with_synthetic_marker(FakeSession(), successful_commit, 1, 'operation', state, None)
        assert state['injected'] is False

    asyncio.run(scenario())


def test_injected_precommit_failure_never_calls_commit():
    async def scenario():
        state = {'injected': False}
        called = False

        async def commit():
            nonlocal called
            called = True

        with pytest.raises(SQLAlchemyError):
            await probe.commit_with_synthetic_marker(FakeSession(), commit, 1, 'operation', state, 'before_commit')
        assert state['injected'] is True and called is False

    asyncio.run(scenario())


def test_connection_fault_records_only_observed_driver_result():
    async def scenario():
        stopped = asyncio.Event()

        class Driver:
            def get_server_pid(self):
                return 42

            def terminate(self):
                stopped.set()

        class AsyncConnection:
            async def get_raw_connection(self):
                from types import SimpleNamespace
                return SimpleNamespace(driver_connection=Driver())

        class Session(FakeSession):
            async def connection(self):
                return AsyncConnection()

        async def commit():
            await stopped.wait()
            raise SQLAlchemyError('synthetic disconnected driver')

        state = {'injected': False}
        with pytest.raises(SQLAlchemyError):
            await asyncio.wait_for(probe.commit_with_synthetic_marker(
                Session(), commit, 1, 'operation', state, 'disconnect'), timeout=1)
        assert state == {'injected': True, 'backend_pid': 42, 'driver_result': 'driver_error'}

    asyncio.run(scenario())


def test_fixture_uow_assigns_explicit_ids_before_adding():
    from types import SimpleNamespace
    from uuid import uuid4

    async def scenario():
        token = str(uuid4())
        recorded = []

        class Inner:
            def __init__(self):
                self.session = SimpleNamespace(add_all=lambda rows: recorded.extend(rows))
                self.exited = False

            async def __aenter__(self):
                return self

            async def __aexit__(self, *args):
                self.exited = True

        inner = Inner()
        source = [{'id': 9, 'user_id': 1, 'session_token': token}]
        record = SimpleNamespace(id=None, user_id=1, session_token=token)
        async with probe.FixtureIdUnitOfWork(inner, source, 1) as uow:
            uow.session.add_all([record])
            assert record.id == 9 and recorded == [record]
        assert inner.exited

    asyncio.run(scenario())


def test_sequence_restart_is_before_commit_for_explicit_source_id():
    async def scenario():
        events = []

        class Result:
            def __init__(self, value):
                self.value = value

            def mappings(self):
                return self

            def one(self):
                return self.value

        class Session:
            async def scalar(self, statement):
                return 'public.sessions_id_seq'

            async def execute(self, statement, values=None):
                query = str(statement)
                events.append(query)
                if 'pg_catalog.pg_sequences' in query:
                    return Result({'sequenceowner': 'pymentor_test', 'min_value': 1, 'max_value': 1000,
                                   'increment_by': 1, 'cycle': False, 'cache_size': 1})
                if 'SELECT last_value' in query:
                    return Result({'last_value': 1, 'is_called': False})

        async def commit():
            events.append('commit')

        await probe.commit_with_synthetic_marker(Session(), commit, 1, 'operation',
                                                  {'injected': False}, None, source_max_id=9)
        assert any('ALTER SEQUENCE public.sessions_id_seq RESTART WITH 10' in event for event in events)
        assert events[-1] == 'commit'

    asyncio.run(scenario())
