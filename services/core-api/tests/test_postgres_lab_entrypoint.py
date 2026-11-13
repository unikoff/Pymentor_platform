"""The disposable lab delegates to the sole serving composition after guards."""
import os
import sys
from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest

from tools.lab import postgres_runtime as lab
from pymentor_core.app.schema_policy import SCHEMA_REVISION


def test_lab_without_opt_in_never_opens_a_database(monkeypatch):
    probe = MagicMock()
    monkeypatch.setattr(lab, 'create_engine', probe)
    monkeypatch.delenv('PYMENTOR_DUAL_LOCAL_TEST', raising=False)
    with pytest.raises(RuntimeError, match='opt-in'):
        lab.create_app()
    probe.assert_not_called()


def test_guarded_lab_uses_canonical_factory_without_a_second_lifespan(monkeypatch):
    probe = MagicMock()
    probe.connect.return_value.__enter__.return_value.execute.side_effect = [
        SimpleNamespace(one=lambda: ('pymentor_test', 'pymentor_app')),
        SimpleNamespace(scalar_one=lambda: SCHEMA_REVISION),
    ]
    monkeypatch.setattr(lab, 'create_engine', MagicMock(return_value=probe))
    monkeypatch.delitem(sys.modules, 'pymentor_core.app.database', raising=False)
    monkeypatch.delitem(sys.modules, 'main', raising=False)
    for key, value in {
        'PYMENTOR_DUAL_LOCAL_TEST': '1',
        'PYMENTOR_TEST_PG_URL': 'postgresql+asyncpg://pymentor_app@127.0.0.1:57152/pymentor_test',
        'PYMENTOR_TEST_REDIS_URL': 'redis://127.0.0.1:57146/0',
        'PYMENTOR_TEST_REDIS_PREFIX': 'lab-synthetic:',
        'PYMENTOR_TEST_LOGIN_RECOVERY_KEY': '42' * 32,
    }.items():
        monkeypatch.setenv(key, value)
    from pymentor_core.app import factory
    canonical = MagicMock(return_value=object())
    monkeypatch.setattr(factory, 'create_app', canonical)
    assert lab.create_app() is canonical.return_value
    canonical.assert_called_once_with()
    assert 'PYMENTOR_DUAL_LOCAL_TEST' not in os.environ
    assert os.environ['REDIS_URL'] == 'redis://127.0.0.1:57146/0'
    assert os.environ['KNOWI_REDIS_PREFIX'] == 'lab-synthetic:'
    assert os.environ['KNOWI_LOGIN_RECOVERY_KEY'] == '42' * 32
    probe.dispose.assert_called_once()
