import asyncio
import importlib.util
import sys
from datetime import datetime, timezone
from pathlib import Path
from types import SimpleNamespace
from uuid import uuid4

import pytest

SCRIPT = Path(__file__).resolve().parents[2] / 'scripts' / 'c232_session_runner.py'
spec = importlib.util.spec_from_file_location('c232_session_runner_test', SCRIPT)
runner = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = runner
spec.loader.exec_module(runner)


class Result:
    def __init__(self, value):
        self.value = value

    def mappings(self):
        return self

    def all(self):
        return self.value

    def one_or_none(self):
        return self.value


class FakeDatabase:
    def __init__(self, *, rows=(), marker=None, consumed=False, user_exists=True):
        self.rows, self.marker, self.consumed = list(rows), marker, consumed
        self.user_exists = user_exists
        self.events = []

    def unit_of_work(self):
        db = self

        class Unit:
            session = None

            async def __aenter__(self):
                db.events.append('begin')
                self.session = self
                return self

            async def __aexit__(self, *args):
                db.events.append('close')

            async def scalar(self, statement, params):
                query = str(statement)
                db.events.append(query)
                if 'FOR UPDATE' in query:
                    return params['id'] if db.user_exists else None
                return db.consumed

            async def execute(self, statement, params):
                query = str(statement)
                db.events.append(query)
                return Result(db.marker if 'session_operations' in query else db.rows)

        return Unit()


def sample():
    return {'id': 1, 'user_id': 7, 'session_token': str(uuid4()),
            'created_at': datetime(2026, 1, 1, tzinfo=timezone.utc)}


def test_new_and_complete_checked_under_user_lock():
    expected = [sample()]
    db = FakeDatabase()
    assert asyncio.run(runner.read_session_state(db, 7, expected)) == 'new'
    assert 'FOR UPDATE' in db.events[1] and db.events[-1] == 'close'
    db = FakeDatabase(rows=expected, marker={'snapshot_id': runner.SNAPSHOT_ID,
        'operation_id': runner.operation_id(7), 'user_id': 7}, consumed=True)
    assert asyncio.run(runner.read_session_state(db, 7, expected)) == 'complete'


def test_missing_user_and_bad_rows_fail_closed_without_values():
    expected = [sample()]
    db = FakeDatabase(user_exists=False)
    with pytest.raises(runner.SessionStateError, match='^session_state_unavailable$'):
        asyncio.run(runner.read_session_state(db, 7, expected))
    db = FakeDatabase(rows=[dict(expected[0], session_token=str(uuid4()))])
    with pytest.raises(runner.SessionStateError, match='^session_state_unavailable$') as error:
        asyncio.run(runner.read_session_state(db, 7, expected))
    assert error.value.__suppress_context__ and expected[0]['session_token'] not in str(error.value)
    assert db.events[-1] == 'close'
