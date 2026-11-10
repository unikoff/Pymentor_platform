import importlib.util
from pathlib import Path
import sys

import pytest

SCRIPT = (Path(__file__).resolve().parents[4] / 'services/core-api/tools/lab/c232_variant_probe.py')
sys.path.insert(0, str(SCRIPT.parent))
spec = importlib.util.spec_from_file_location('c232_variant_probe_test', SCRIPT)
module = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = module
spec.loader.exec_module(module)


def _synthetic_source():
    """Build a small valid in-memory source without the ignored sandbox files."""
    from datetime import date
    from datetime import datetime
    from datetime import timezone

    from tools.lab.storage.c232_mapping import TABLE_MAPPINGS
    from tools.lab.storage.c232_mapping import TABLE_ORDER

    source = {table: [] for table in TABLE_ORDER}
    parent_values = {'users.id': 1, 'booking_slots.id': 1,
                     'landings.id': '00000000-0000-0000-0000-000000000001',
                     'landing_telegram_configs.id': '00000000-0000-0000-0000-000000000002'}
    for table in TABLE_ORDER:
        count = 2 if table == 'users' else 5 if table == 'admins' else 1
        for index in range(count):
            row = {}
            for column in TABLE_MAPPINGS[table].columns:
                if column.name == 'id':
                    value = parent_values.get(f'{table}.id', index + 1)
                    if table == 'users':
                        value = index + 1
                    elif table == 'admins':
                        value = index + 1
                elif column.references:
                    value = parent_values[column.references]
                elif column.kind == 'integer':
                    value = index + 1
                elif column.kind == 'boolean':
                    value = False
                elif column.kind == 'date':
                    value = date(2026, 1, 1)
                elif column.kind == 'timestamp':
                    value = datetime(2026, 1, 1, tzinfo=timezone.utc)
                elif column.json_text:
                    value = '{}'
                elif column.nullable:
                    value = None
                elif column.name == 'start_time':
                    value = '09:00'
                elif column.name == 'payload_sha256':
                    value = 'a' * 64
                else:
                    value = f's{index}_{table}_{column.name}'
                    if column.length is not None:
                        value = value[:column.length]
                row[column.name] = value
            source[table].append(row)
    # With sessions excluded, the table rows total 19 for the variant's fixed guard.
    source['sessions'] = []
    return source


def test_variant_preserves_extra_user_ids_and_foreign_keys(monkeypatch):
    monkeypatch.setattr(module.source_reader, 'load_pinned_source', _synthetic_source)
    source = module.synthetic_variant()
    assert sum(map(len, source.values())) == 22
    assert [row['id'] for row in source['users']] == [1, 2, 37]
    assert source['user_lesson_progress'][-1]['user_id'] == 37
    assert source['user_task_progress'][-1]['user_id'] == 37
    assert source['sessions'] == []
    source['user_lesson_progress'][-1]['user_id'] = 999
    with pytest.raises(ValueError, match='Foreign key violation'):
        module.commit.preflight(source)
