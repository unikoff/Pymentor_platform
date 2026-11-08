import asyncio
import importlib.util
import sys
from contextlib import contextmanager
from pathlib import Path
from unittest.mock import AsyncMock
from types import SimpleNamespace

import pytest

SCRIPT = Path(__file__).resolve().parents[2] / 'scripts' / 'c232_resumable_lab.py'
spec = importlib.util.spec_from_file_location('c232_resumable_lab_test', SCRIPT)
module = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = module
spec.loader.exec_module(module)


def test_inventory_rejects_unexpected_session_user():
    async def scenario():
        connection = type('Connection', (), {'fetch': AsyncMock(side_effect=[
            [{'user_id': 1}], [{'user_id': 1}], [{'user_id': 2}]
        ])})()
        with pytest.raises(ValueError, match='unexpected_session_inventory'):
            await module._check_session_inventory(connection, {1})
    asyncio.run(scenario())


@pytest.mark.parametrize('abandoned', [False, True])
def test_resume_always_rechecks_state_inside_mutex(monkeypatch, abandoned):
    held = []
    @contextmanager
    def mutex(run_id):
        assert run_id == 'c232-123456abcdef'
        held.append(True)
        try:
            yield type('State', (), {'abandoned': abandoned})()
        finally:
            held.pop()
    async def check(run_id):
        assert held == [True]
        return {'checked': True}
    monkeypatch.setattr(module, 'synthetic_lab_mutex', mutex)
    monkeypatch.setattr(module, '_resume', check)
    assert asyncio.run(module.resume('c232-123456abcdef')) == {'checked': True}
    assert not held


def test_bad_fixture_fails_before_target_checks(monkeypatch):
    monkeypatch.setattr(module.source_reader, 'load_pinned_source', lambda: {})
    inspect = AsyncMock()
    monkeypatch.setattr(module.guard, 'inspect', inspect)
    with pytest.raises(ValueError, match='fixture_invalid'):
        asyncio.run(module._resume('c232-123456abcdef'))
    inspect.assert_not_awaited()


@pytest.mark.parametrize('index_ttl,index_members,prepared', [(-1, ['digest'], 'none'),
    (10000, ['unexpected'], 'none'), (10000, ['digest'], 'string'),
    (900000000000, ['digest'], 'none')])
def test_redis_preflight_rejects_ambiguous_known_keys(index_ttl, index_members, prepared):
    async def scenario():
        class Client:
            async def time(self):
                return 1767312000, 0
            async def type(self, key):
                if ':user:' in key:
                    return 'zset'
                return prepared if ':prepared:' in key else 'string'
            async def pttl(self, key):
                return index_ttl if ':user:' in key else 10000
            async def zrange(self, key, start, end):
                return index_members
            async def get(self, key):
                return '1'
        store = SimpleNamespace(_client=Client(), _prefix='test:', _digest=lambda token: 'digest')
        with pytest.raises(ValueError):
            await module._check_known_redis_state(store, [{'user_id': 1, 'session_token': 'fixture',
                'created_at': '2026-01-01T00:00:00+00:00'}])
    asyncio.run(scenario())


def test_all_users_are_classified_before_session_import(monkeypatch):
    rows = [{'id': 1, 'user_id': 1, 'created_at': '2026-01-01T00:00:00+00:00'},
            {'id': 2, 'user_id': 2, 'created_at': '2026-01-01T00:00:00+00:00'}]
    classifier = AsyncMock(side_effect=['new', ValueError('invalid second user')])
    monkeypatch.setattr(module, 'read_session_state', classifier)
    with pytest.raises(ValueError, match='invalid second user'):
        asyncio.run(module._check_all_session_states(object(), rows))
    assert classifier.await_count == 2
