import asyncio
import importlib.util
import sys
from pathlib import Path

import pytest

SCRIPT = Path(__file__).resolve().parents[2] / 'scripts' / 'c232_commit_probe.py'
spec = importlib.util.spec_from_file_location('c232_bound_probe_test', SCRIPT)
module = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = module
spec.loader.exec_module(module)


def test_target_read_stops_on_table_over_limit(monkeypatch):
    monkeypatch.setattr(module, 'MAX_ROWS_PER_TABLE', 2)
    class Connection:
        async def fetch(self, query, limit):
            assert 'LIMIT $1' in query and limit == 3
            return [{}, {}, {}]
    with pytest.raises(RuntimeError, match='target_table_too_large'):
        asyncio.run(module.fetch_target(Connection()))
