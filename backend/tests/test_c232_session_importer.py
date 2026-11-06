import asyncio
import importlib.util
import sys
from datetime import datetime, timezone
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest

SCRIPT = Path(__file__).resolve().parents[2] / 'scripts' / 'c232_session_importer.py'
spec = importlib.util.spec_from_file_location('c232_session_importer_test', SCRIPT)
module = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = module
spec.loader.exec_module(module)


class Database:
    def unit_of_work(self):
        class Unit:
            async def __aenter__(self):
                self.session = self
                return self

            async def __aexit__(self, *args):
                pass

            async def scalar(self, _statement):
                return datetime(2026, 1, 2, tzinfo=timezone.utc)

        return Unit()


def sample():
    return [{'id': 1, 'user_id': 1, 'session_token': str(uuid4()),
             'created_at': '2026-01-01T00:00:00+00:00'}]


def test_complete_session_is_reconciled_only_when_frozen(monkeypatch):
    async def scenario():
        states = AsyncMock(return_value='complete')
        monkeypatch.setattr(module, 'read_session_state', states)
        monkeypatch.setattr(module, 'verify_redis_expiries', AsyncMock())
        service = SimpleNamespace(redis=SimpleNamespace(), reconcile_user=AsyncMock(),
                                  authenticate=AsyncMock(return_value=SimpleNamespace(user_id=1)))
        db = Database()
        with pytest.raises(module.SyntheticSessionImportError, match='^session_import_unavailable$'):
            await module.ensure_user_sessions(db, service, 1, sample(), frozen_lab_verified=False)
        assert states.await_count == 0 and service.reconcile_user.await_count == 0
        assert await module.ensure_user_sessions(db, service, 1, sample(), frozen_lab_verified=True) == 'complete'
        assert states.await_count == 2 and service.reconcile_user.await_count == 1
        assert service.authenticate.await_count == 1
    asyncio.run(scenario())


@pytest.mark.parametrize('difference,remaining,allowed', [(0, 10000, True), (0, 5000, False), (0, -2, False)])
def test_redis_expiry_must_match_the_expected_absolute_deadline(difference, remaining, allowed):
    from datetime import timedelta
    from identity.legacy_session_import import LegacySession

    async def scenario():
        now = datetime(2026, 1, 2, tzinfo=timezone.utc)
        candidate = LegacySession(str(uuid4()), now - timedelta(days=30) + timedelta(seconds=10))
        seconds = int(now.timestamp())

        class Client:
            async def time(self):
                return seconds, 0

            async def pttl(self, key):
                assert key.startswith('synthetic:token:')
                return remaining + difference if remaining >= 0 else remaining

        redis = SimpleNamespace(_client=Client(), _prefix='synthetic:', _digest=lambda token: 'digest')
        if allowed:
            await module.verify_redis_expiries(redis, [candidate])
        else:
            with pytest.raises(ValueError, match='^session_expiry_unverified$'):
                await module.verify_redis_expiries(redis, [candidate])

    asyncio.run(scenario())


def test_invalid_user_and_expired_session_fail_before_reconcile(monkeypatch):
    async def scenario():
        monkeypatch.setattr(module, 'read_session_state', AsyncMock(return_value='complete'))
        service = SimpleNamespace(reconcile_user=AsyncMock(), authenticate=AsyncMock())
        with pytest.raises(module.SyntheticSessionImportError):
            await module.ensure_user_sessions(Database(), service, 2, sample(), frozen_lab_verified=True)
        expired = sample(); expired[0]['created_at'] = '2025-01-01T00:00:00+00:00'
        with pytest.raises(module.SyntheticSessionImportError):
            await module.ensure_user_sessions(Database(), service, 1, expired, frozen_lab_verified=True)
        service.reconcile_user.assert_not_awaited()
    asyncio.run(scenario())
