import builtins
from copy import deepcopy
import socket
import traceback

import pytest

from infrastructure.c232_mapping import TABLE_MAPPINGS, TABLE_ORDER
from infrastructure.c232_preflight import MAX_ROWS_PER_TABLE, preflight


@pytest.fixture
def dataset():
    result = {}
    defaults = {'integer': 1, 'boolean': False, 'string': 'x', 'text': '',
                'date': '2026-01-01', 'timestamp': '2026-01-01T00:00:00+00:00'}
    for table in TABLE_ORDER:
        result[table] = [{c.name: (None if c.nullable else
                                   '{}' if c.json_text else defaults[c.kind])
                          for c in TABLE_MAPPINGS[table].columns}]
    return result


def test_repeatable_pure_all_tables(dataset, monkeypatch):
    original = deepcopy(dataset)
    def forbidden(*args, **kwargs):
        raise AssertionError('IO attempted')
    monkeypatch.setattr(builtins, 'open', forbidden)
    monkeypatch.setattr(socket, 'socket', forbidden)
    expected = {table: 1 for table in TABLE_ORDER}
    assert preflight(dataset) == expected
    assert preflight(dataset) == expected
    assert dataset == original


@pytest.mark.parametrize('table,column', [
    (table, column.name) for table, spec in TABLE_MAPPINGS.items()
    for column in spec.columns if column.references
])
def test_every_foreign_key_rejects_orphan(dataset, table, column):
    value = dataset[table][0][column]
    dataset[table][0][column] = 999 if isinstance(value, int) or value is None else 'orphan'
    with pytest.raises(ValueError, match='Foreign key'):
        preflight(dataset)


@pytest.mark.parametrize('table', TABLE_ORDER)
def test_every_primary_key_rejects_duplicates(dataset, table):
    dataset[table].append(deepcopy(dataset[table][0]))
    with pytest.raises(ValueError, match='Duplicate key'):
        preflight(dataset)


@pytest.mark.parametrize('table', [
    'users', 'admins', 'landings', 'sessions', 'user_activity_days',
    'user_lesson_progress', 'user_task_progress', 'booking_slots',
    'booking_quotas', 'booking_reminders', 'booking_notification_outbox',
    'landing_telegram_configs', 'landing_notification_outbox',
])
def test_unique_constraints_with_distinct_pk(dataset, table):
    row = deepcopy(dataset[table][0])
    row['id'] = 2 if type(row['id']) is int else 'other'
    dataset[table].append(row)
    with pytest.raises(ValueError, match='Duplicate key'):
        preflight(dataset)


def test_nullable_and_empty_text_and_separate_table_keys(dataset):
    # Both users and admins may have the same id/email; nullable student_id
    # does not require a parent and empty text is a valid PostgreSQL value.
    dataset['users'][0]['username'] = ''
    dataset['landings'][0]['description'] = ''
    dataset['booking_slots'][0]['student_id'] = None
    assert preflight(dataset)['users'] == 1


@pytest.mark.parametrize('table,column,value', [
    ('landing_notification_outbox', 'payload_json', '{bad secret'),
    ('sessions', 'created_at', '2026-01-01T00:00:00'),
    ('users', 'subscription_until', '2025-01-01T00:00:00.1234569Z'),
    ('users', 'email', None),
])
def test_invalid_values_are_redacted(dataset, table, column, value):
    dataset[table][0][column] = value
    with pytest.raises(ValueError) as exc:
        preflight(dataset)
    assert str(exc.value) == 'Invalid row'
    assert 'bad secret' not in ''.join(traceback.format_exception(exc.value))
    assert exc.value.__suppress_context__


@pytest.mark.parametrize('kind', ['missing_table', 'extra_table', 'missing_column', 'extra_column'])
def test_schema_drift(dataset, kind):
    if kind == 'missing_table':
        del dataset['users']
    elif kind == 'extra_table':
        dataset['secret extra table'] = []
    elif kind == 'missing_column':
        del dataset['users'][0]['email']
    else:
        dataset['users'][0]['secret extra column'] = 'sensitive value'
    with pytest.raises(ValueError) as exc:
        preflight(dataset)
    formatted = ''.join(traceback.format_exception(exc.value))
    assert 'secret extra' not in formatted and 'sensitive value' not in formatted


def test_limit_rejected_before_row_processing(dataset):
    dataset['users'] = [None] * (MAX_ROWS_PER_TABLE + 1)
    with pytest.raises(ValueError, match='limit'):
        preflight(dataset)


def test_limit_boundary_is_accepted(dataset):
    template = dataset['users'][0]
    dataset['users'] = [dict(template, id=i, email=f'{i}@example.test')
                        for i in range(1, MAX_ROWS_PER_TABLE + 1)]
    assert preflight(dataset)['users'] == MAX_ROWS_PER_TABLE


def test_non_sequence_rows_rejected(dataset):
    dataset['users'] = iter(dataset['users'])
    with pytest.raises(ValueError, match='table rows'):
        preflight(dataset)


def test_no_fake_outbox_slot_fk(dataset):
    dataset['booking_notification_outbox'][0]['slot_id'] = 999
    assert preflight(dataset)['booking_notification_outbox'] == 1
