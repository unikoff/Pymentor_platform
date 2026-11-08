import importlib.util
import asyncio
from pathlib import Path
import sys

import pytest

SCRIPT = Path(__file__).resolve().parents[2] / 'scripts' / 'c232_commit_probe.py'
sys.path.insert(0, str(SCRIPT.parent))
spec = importlib.util.spec_from_file_location('c232_marker_probe_test', SCRIPT)
module = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = module
spec.loader.exec_module(module)


def test_marker_identity_defaults_and_explicit_variant():
    assert module.marker_identity(None, None) == (module.MARKER_DIGEST, module.MARKER_VERSION)
    assert module.marker_identity('a' * 64, 'synthetic_variant_v1') == ('a' * 64, 'synthetic_variant_v1')


@pytest.mark.parametrize('digest,version', [('secret', 'v1'), ('a' * 64, 'secret version'),
    ('A' * 64, 'v1'), ('a' * 64, ''), ('a' * 64, 'x' * 81)])
def test_marker_identity_rejects_bad_input_without_echo(digest, version):
    with pytest.raises(ValueError, match='^marker_identity_invalid$') as error:
        module.marker_identity(digest, version)
    assert 'secret' not in str(error.value)


def test_invalid_marker_never_opens_database(monkeypatch):
    async def connect(*args, **kwargs):
        pytest.fail('connection must not be opened')
    monkeypatch.setattr(module, 'connect', connect)
    with pytest.raises(ValueError, match='marker_identity_invalid'):
        asyncio.run(module.insert_and_commit(None, {}, marker_digest='bad'))


def test_invalid_fault_mode_never_opens_database(monkeypatch):
    async def connect(*args, **kwargs):
        pytest.fail('connection must not be opened')
    monkeypatch.setattr(module, 'connect', connect)
    with pytest.raises(ValueError, match='fault_mode_invalid'):
        asyncio.run(module.insert_and_commit(None, {}, inject='unsupported'))
