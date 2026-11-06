import importlib.util
from dataclasses import FrozenInstanceError
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from types import SimpleNamespace

import pytest
import sqlalchemy as sa

from infrastructure.c232_mapping import TABLE_MAPPINGS, TABLE_ORDER, convert_row


@pytest.fixture(scope='module')
def migration_tables():
    path = Path(__file__).resolve().parents[1] / 'migrations/versions/c222_initial_pg_initial_postgresql_schema.py'
    spec = importlib.util.spec_from_file_location('c222_schema_for_mapping', path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    tables = {}
    def create_table(name, *items):
        tables[name] = [item for item in items if isinstance(item, sa.Column)]
    module.op = SimpleNamespace(create_table=create_table, create_index=lambda *a, **kw: None)
    module.upgrade()
    return tables


def test_mapping_matches_independent_alembic_ddl(migration_tables):
    assert len(migration_tables) == 15
    assert set(TABLE_MAPPINGS) == set(migration_tables)
    assert 'booking_reminders' in TABLE_MAPPINGS and 'attempts' not in TABLE_MAPPINGS
    for name, ddl_columns in migration_tables.items():
        table = TABLE_MAPPINGS[name]
        assert table.source == table.target == name
        assert [c.name for c in table.columns] == [c.name for c in ddl_columns]
        for mapped, ddl in zip(table.columns, ddl_columns):
            kind = ('boolean' if isinstance(ddl.type, sa.Boolean) else
                    'integer' if isinstance(ddl.type, sa.Integer) else
                    'timestamp' if isinstance(ddl.type, sa.DateTime) else
                    'date' if isinstance(ddl.type, sa.Date) else
                    'text' if isinstance(ddl.type, sa.Text) else
                    'string' if isinstance(ddl.type, sa.String) else None)
            assert mapped.kind == kind
            assert mapped.nullable == ddl.nullable
            assert mapped.length == getattr(ddl.type, 'length', None)
            assert mapped.references == next((fk.target_fullname for fk in ddl.foreign_keys), None)
            if kind == 'timestamp':
                assert ddl.type.timezone
            assert mapped.json_text == (name == 'landing_notification_outbox' and ddl.name == 'payload_json')


def test_order_and_immutable_schema(migration_tables):
    assert len(TABLE_ORDER) == len(set(TABLE_ORDER)) == 15
    for name, columns in migration_tables.items():
        for column in columns:
            for fk in column.foreign_keys:
                assert TABLE_ORDER.index(fk.target_fullname.split('.')[0]) < TABLE_ORDER.index(name)
    assert [t.source for t in TABLE_MAPPINGS.values() if t.requires_session_marker_protocol] == ['sessions']
    with pytest.raises(TypeError):
        TABLE_MAPPINGS['new'] = None
    with pytest.raises(FrozenInstanceError):
        TABLE_MAPPINGS['users'].columns[0].name = 'new'


def user(**changes):
    return dict({'id': 1, 'username': '', 'email': 'a', 'password_hash': 'x',
                 'subscription_until': None, 'subscription_plan': None, 'is_admin': 0}, **changes)


def test_null_empty_boolean_and_timestamps():
    row = convert_row('users', user(subscription_plan='', is_admin=1,
                                    subscription_until='2025-01-02T03:04:05+03:00'))
    assert row['username'] == row['subscription_plan'] == ''
    assert row['is_admin'] is True
    assert row['subscription_until'] == datetime(2025, 1, 2, 0, 4, 5, tzinfo=timezone.utc)
    assert convert_row('users', user())['subscription_plan'] is None
    with pytest.raises(ValueError):
        convert_row('users', user(subscription_until='2025-01-02 03:04:05'))
    assert convert_row('users', user(subscription_until='2025-01-02 03:04:05'),
                       assumed_timezone=timezone(timedelta(hours=3)))['subscription_until'] == row['subscription_until']
    slot = dict(id=1, slot_date='2025-01-02', start_time='09:30', duration_minutes=60,
                student_id=None, created_at='2025-01-02T00:00:00Z')
    assert convert_row('booking_slots', slot)['slot_date'] == date(2025, 1, 2)


def test_json_text_preserved_and_validated():
    row = {c.name: (None if c.nullable else
                     1 if c.kind == 'integer' else
                     '2025-01-01T00:00:00Z' if c.kind == 'timestamp' else 'x')
           for c in TABLE_MAPPINGS['landing_notification_outbox'].columns}
    row['payload_json'] = '{ "x": [1, null] }'
    assert convert_row('landing_notification_outbox', row)['payload_json'] == row['payload_json']
    row['payload_json'] = '{secret'
    with pytest.raises(ValueError, match='Invalid column value'):
        convert_row('landing_notification_outbox', row)


@pytest.mark.parametrize('changes', [
    {'id': 2**31}, {'id': -(2**31)-1}, {'id': True}, {'id': None},
    {'is_admin': 2}, {'is_admin': '1'}, {'username': 'a'*51},
    {'username': 'a\x00b'}, {'username': '\ud800'}, {'email': 10},
])
def test_bad_values_fail_closed(changes):
    with pytest.raises(ValueError):
        convert_row('users', user(**changes))


def test_integer_boundaries_and_length():
    assert convert_row('users', user(id=-(2**31), username='a'*50))['id'] == -(2**31)
    assert convert_row('users', user(id=2**31-1))['id'] == 2**31-1


def test_schema_drift_and_no_pii_in_errors():
    secret = 'PII_PASSWORD_TOKEN_PAYLOAD'
    cases = [('unknown_' + secret, user()), ('users', {**user(), secret: secret}),
             ('users', {k: v for k, v in user().items() if k != 'email'}),
             ('users', user(username=secret*10)), ('users', user(is_admin=secret))]
    for table, row in cases:
        with pytest.raises(ValueError) as error:
            convert_row(table, row)
        assert secret not in str(error.value)
        assert error.value.__cause__ is None
