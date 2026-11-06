import importlib.util
from pathlib import Path
import sys

import pytest

SCRIPT = Path(__file__).resolve().parents[2] / 'scripts' / 'c232_variant_probe.py'
sys.path.insert(0, str(SCRIPT.parent))
spec = importlib.util.spec_from_file_location('c232_variant_probe_test', SCRIPT)
module = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = module
spec.loader.exec_module(module)


def test_variant_preserves_extra_user_ids_and_foreign_keys():
    source = module.synthetic_variant()
    assert sum(map(len, source.values())) == 22
    assert [row['id'] for row in source['users']] == [1, 2, 37]
    assert source['user_lesson_progress'][-1]['user_id'] == 37
    assert source['user_task_progress'][-1]['user_id'] == 37
    assert source['sessions'] == []
    source['user_lesson_progress'][-1]['user_id'] = 999
    with pytest.raises(ValueError, match='Foreign key violation'):
        module.commit.preflight(source)
