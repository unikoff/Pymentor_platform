import asyncio
import json
from contextlib import contextmanager
from pathlib import Path
import sys
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[4] / 'services/core-api/tools/lab'))
import tools.lab.c435_pending_service_probe as probe


def test_check_lab_rejects_invalid_run_id_before_access(monkeypatch):
    monkeypatch.setattr(probe.target.lab, '_load', lambda _: pytest.fail('journal accessed'))
    with pytest.raises(probe.ProbeError, match='run_id_invalid'):
        probe.check_lab('../other')


def test_redis_volume_must_match_the_known_test_volume(monkeypatch):
    import tools.lab.c232_sessions_e2e_probe as redis_probe
    monkeypatch.setattr(redis_probe, 'verify_redis', lambda: None)
    def docker(*args):
        if args[0] == 'inspect':
            return json.dumps([{'Mounts': [{'Name': 'different-volume'}]}])
        pytest.fail('unexpected volume lookup')
    monkeypatch.setattr(probe.target.lab, '_docker', docker)
    with pytest.raises(probe.ProbeError, match='redis_volume_invalid'):
        probe.verify_redis_lab()


def test_redis_preflight_failure_happens_before_sql_probe(monkeypatch):
    sql = AsyncMock()
    monkeypatch.setattr(probe.sql_probe, '_probe', sql)
    def fail():
        raise probe.ProbeError('redis_volume_invalid')
    monkeypatch.setattr(probe, 'verify_redis_lab', fail)
    with pytest.raises(probe.ProbeError, match='redis_volume_invalid'):
        asyncio.run(probe.experiment('c232-0123456789ab', None))
    sql.assert_not_awaited()


def test_fault_proxy_lost_response_calls_real_prepare_first():
    async def run():
        store = type('Store', (), {})()
        store.prepare_session = AsyncMock()
        proxy = probe.RedisFault(store, 'lost')
        with pytest.raises(RuntimeError):
            await proxy.prepare_session(435, 'digest', 60)
        store.prepare_session.assert_awaited_once_with(435, 'digest', 60)
    asyncio.run(run())


def test_fault_proxy_goes_unavailable_after_real_owner_read():
    async def run():
        store = type('Store', (), {})()
        store.get_user = AsyncMock(return_value=435)
        proxy = probe.RedisFault(store, 'after_gate')
        assert await proxy.get_user('fake') == 435
        with pytest.raises(RuntimeError):
            await proxy.get_user('fake')
        store.get_user.assert_awaited_once_with('fake')
    asyncio.run(run())


def test_cleanup_checks_identity_before_deletion(monkeypatch):
    async def run():
        monkeypatch.setattr(probe, 'check_lab', lambda *_: None)
        client = type('Client', (), {})()
        client.eval = AsyncMock(return_value=0)
        client.mget = AsyncMock()
        store = type('Store', (), {'_client': client})()
        with pytest.raises(probe.ProbeError, match='cleanup_identity_invalid'):
            await probe.cleanup(store, 'prefix', ('key',), 'run')
        client.mget.assert_not_awaited()
    asyncio.run(run())


def test_probe_holds_one_mutex_across_experiment(monkeypatch):
    calls = []
    @contextmanager
    def mutex(run_id):
        calls.append(('enter', run_id))
        try:
            yield
        finally:
            calls.append(('exit', run_id))

    async def experiment(run_id, connect):
        assert calls == [('enter', run_id)]
        calls.append(('experiment', run_id))

    monkeypatch.setattr(probe, 'synthetic_lab_mutex', mutex)
    monkeypatch.setattr(probe, 'experiment', experiment)
    monkeypatch.setitem(sys.modules, 'asyncpg', SimpleNamespace(connect=object()))
    asyncio.run(probe.probe('c232-0123456789ab'))
    assert [item[0] for item in calls] == ['enter', 'experiment', 'exit']
