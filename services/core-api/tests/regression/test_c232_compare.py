from copy import deepcopy
from datetime import datetime
from datetime import timedelta
from datetime import timezone

import pytest

from tools.lab.storage.c232_compare import compare_rows
from tools.lab.storage.c232_mapping import TABLE_MAPPINGS
from tools.lab.storage.c232_mapping import TABLE_ORDER
from tools.lab.storage.c232_mapping import convert_row


def samples():
    source = {}
    for table, mapping in TABLE_MAPPINGS.items():
        row = {}
        for column in mapping.columns:
            row[column.name] = (None if column.nullable else
                                1 if column.kind in ('integer', 'boolean') else
                                '2025-01-02' if column.kind == 'date' else
                                '2025-01-02T03:04:05+03:00' if column.kind == 'timestamp' else
                                '{ "a": 1 }' if column.json_text else 'x')
        source[table] = [row]
    target = {table: [convert_row(table, row) for row in rows] for table, rows in source.items()}
    return source, target


def test_all_tables_and_timezone_equivalence_without_mutation():
    source, target = samples()
    before = deepcopy((source, target))
    assert len(source) == len(TABLE_ORDER) == 15
    target['users'][0]['subscription_until'] = datetime(2025, 1, 2, 3, 4, tzinfo=timezone(timedelta(hours=3)))
    source['users'][0]['subscription_until'] = '2025-01-02T00:04:00Z'
    before = deepcopy((source, target))
    assert compare_rows(source, target) is None
    assert (source, target) == before


@pytest.mark.parametrize('table', TABLE_ORDER)
def test_every_table_and_every_column_detects_changes(table):
    source, target = samples()
    for column in TABLE_MAPPINGS[table].columns:
        changed = deepcopy(target)
        value = changed[table][0][column.name]
        if value is None:
            value = {'integer': 2, 'boolean': True, 'string': '', 'text': '',
                     'date': datetime(2025, 1, 3).date(),
                     'timestamp': datetime(2025, 1, 3, tzinfo=timezone.utc)}[column.kind]
        elif type(value) is bool:
            value = not value
        elif type(value) is int:
            value += 1
        elif type(value) is str:
            value += 'z'
        else:
            value += timedelta(days=1)
        changed[table][0][column.name] = value
        with pytest.raises(ValueError):
            compare_rows(source, changed)


def test_order_missing_extra_duplicates_and_delivery_key():
    source, target = samples()
    row = dict(source['landing_notification_delivery_state'][0], destination_config_id='other')
    source['landing_notification_delivery_state'].append(row)
    target['landing_notification_delivery_state'].insert(0, convert_row('landing_notification_delivery_state', row))
    compare_rows(source, target)
    for mutation in ('missing', 'extra', 'duplicate'):
        bad = deepcopy(target)
        if mutation == 'missing':
            bad['landing_notification_delivery_state'].pop()
        elif mutation == 'extra':
            bad['landing_notification_delivery_state'].append(dict(bad['landing_notification_delivery_state'][0], destination_config_id='third'))
        else:
            bad['landing_notification_delivery_state'].append(dict(bad['landing_notification_delivery_state'][0]))
        with pytest.raises(ValueError):
            compare_rows(source, bad)


def test_null_json_text_schema_and_errors_do_not_expose_values():
    source, target = samples()
    secret = 'synthetic_secret_not_for_output'
    cases = []
    bad = deepcopy(target); bad['users'][0]['subscription_plan'] = ''; cases.append(bad)
    bad = deepcopy(target); bad['landing_notification_outbox'][0]['payload_json'] = '{"a":1}'; cases.append(bad)
    bad = deepcopy(target); bad['users'][0][secret] = secret; cases.append(bad)
    bad = deepcopy(target); del bad['users'][0]['email']; cases.append(bad)
    bad = deepcopy(target); bad[secret] = []; cases.append(bad)
    bad = deepcopy(target); bad['users'][0]['is_admin'] = 1; cases.append(bad)
    bad = deepcopy(target); bad['landings'][0]['created_at'] = datetime(2025, 1, 2); cases.append(bad)
    for bad in cases:
        with pytest.raises(ValueError) as error:
            compare_rows(source, bad)
        assert secret not in str(error.value)
        assert error.value.__cause__ is None
