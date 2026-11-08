import asyncio
import importlib.util
import sys
from contextlib import asynccontextmanager
from pathlib import Path

import pytest

from tools.lab.storage.c232_mapping import TABLE_ORDER
from test_c232_compare import samples

SCRIPT = (Path(__file__).resolve().parents[4] / 'services/core-api/tools/migration/c232_core_runner.py')
spec = importlib.util.spec_from_file_location('c232_core_runner_test', SCRIPT)
runner = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = runner
spec.loader.exec_module(runner)


class Connection:
    def __init__(self, *, marker=None, consumed=False, operations=False):
        self.marker, self.consumed, self.operations = marker, consumed, operations
        self.events = []

    @asynccontextmanager
    async def transaction(self):
        self.events.append('begin')
        try:
            yield
        finally:
            self.events.append('close')

    async def fetch(self, query):
        self.events.append(query)
        return [] if self.marker is None else [self.marker]

    async def fetchval(self, query):
        self.events.append(query)
        return self.operations if 'session_operations' in query else self.consumed


def install_fakes(monkeypatch, target, calls):
    async def lock(_connection):
        calls.append('lock')

    async def fetch(_connection):
        calls.append('fetch')
        return target

    async def sequences(_connection, source, *, restart):
        assert not source['sessions'] and restart is False
        calls.append('sequences')

    monkeypatch.setattr(runner.commit_probe, 'lock_and_check', lock)
    monkeypatch.setattr(runner.commit_probe, 'fetch_target', fetch)
    monkeypatch.setattr(runner.commit_probe, 'sequence_states', sequences)


def test_new_and_complete_never_confuse_session_rows(monkeypatch):
    source, target = samples()
    calls = []
    empty = {name: [] for name in TABLE_ORDER}
    install_fakes(monkeypatch, empty, calls)
    connection = Connection()
    assert asyncio.run(runner.read_core_state(connection, source)) == 'new'
    assert calls == ['lock', 'fetch'] and connection.events[-1] == 'close'
    calls.clear()
    install_fakes(monkeypatch, target, calls)
    marker = {'singleton': True, 'snapshot_digest': runner.commit_probe.MARKER_DIGEST,
              'transform_version': runner.commit_probe.MARKER_VERSION}
    connection = Connection(marker=marker, consumed=True, operations=True)
    assert asyncio.run(runner.read_core_state(connection, source)) == 'core_complete'
    assert calls == ['lock', 'fetch', 'sequences']


def test_new_rejects_stray_operation_or_rows(monkeypatch):
    source, _target = samples()
    install_fakes(monkeypatch, {name: [] for name in TABLE_ORDER}, [])
    with pytest.raises(runner.CoreStateError, match='^core_state_unavailable$') as error:
        asyncio.run(runner.read_core_state(Connection(operations=True), source))
    assert error.value.__suppress_context__
