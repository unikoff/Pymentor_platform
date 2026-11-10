from copy import deepcopy
from datetime import datetime
from datetime import timedelta
from datetime import timezone
import traceback

import pytest

from tools.lab.session_models.c232_session_replay import classify_session_replay


TOKEN = '12345678-1234-4234-8234-123456789abc'
TOKEN2 = '12345678-1234-4234-8234-123456789abd'
NOW = datetime(2025, 1, 1, tzinfo=timezone.utc)


def inputs():
    rows = [dict(id=1, user_id=7, session_token=TOKEN, created_at=NOW),
            dict(id=2, user_id=7, session_token=TOKEN2, created_at=NOW)]
    return dict(snapshot_id='synthetic-snapshot', operation_id='synthetic-operation-v1', user_id=7, expected_sessions=rows,
                sql_rows=deepcopy(rows), marker=dict(snapshot_id='synthetic-snapshot', operation_id='synthetic-operation-v1', user_id=7),
                session_import_markers=True)


def test_new_and_complete_and_order_and_no_mutation():
    data = inputs()
    data['sql_rows'].reverse()
    before = deepcopy(data)
    assert classify_session_replay(**data) == 'complete'
    assert data == before
    data.update(sql_rows=[], marker=None, session_import_markers=False)
    before = deepcopy(data)
    assert classify_session_replay(**data) == 'new'
    assert data == before


@pytest.mark.parametrize('field,value', [
    ('id', 3), ('user_id', 8), ('session_token', '12345678-1234-4234-8234-123456789abe'),
    ('created_at', NOW + timedelta(microseconds=1)),
])
def test_changed_field_rejected(field, value):
    data = inputs()
    data['sql_rows'][0][field] = value
    with pytest.raises(ValueError):
        classify_session_replay(**data)


@pytest.mark.parametrize('change', ['missing', 'extra', 'duplicate_id', 'duplicate_token',
                                    'unknown_field', 'null', 'naive', 'non_utc', 'bad_uuid',
                                    'noncanonical_uuid', 'bool_id'])
@pytest.mark.parametrize('source', ['expected_sessions', 'sql_rows'])
def test_invalid_rows_rejected(change, source):
    data = inputs()
    rows = data[source]
    if change == 'missing':
        del rows[0]['id']
    elif change == 'extra':
        rows.pop()
        if source == 'expected_sessions':
            data['sql_rows'].append(dict(id=3, user_id=7, session_token='12345678-1234-4234-8234-123456789abe', created_at=NOW))
    elif change == 'duplicate_id':
        rows[1]['id'] = rows[0]['id']
    elif change == 'duplicate_token':
        rows[1]['session_token'] = rows[0]['session_token']
    elif change == 'unknown_field':
        rows[0]['unknown'] = 1
    elif change == 'null':
        rows[0]['created_at'] = None
    elif change == 'naive':
        rows[0]['created_at'] = NOW.replace(tzinfo=None)
    elif change == 'non_utc':
        rows[0]['created_at'] = NOW.astimezone(timezone(timedelta(hours=1)))
    elif change == 'bad_uuid':
        rows[0]['session_token'] = 'invalid'
    elif change == 'noncanonical_uuid':
        rows[0]['session_token'] = TOKEN.upper()
    else:
        rows[0]['id'] = True
    with pytest.raises(ValueError):
        classify_session_replay(**data)


@pytest.mark.parametrize('patch', [
    {'expected_sessions': []}, {'snapshot_id': ''}, {'operation_id': ''}, {'user_id': True},
    {'marker': {'snapshot_id': 'synthetic-snapshot', 'operation_id': 'other-operation', 'user_id': 7}},
    {'marker': None}, {'marker': {'snapshot_id': 'other', 'user_id': 7}},
    {'marker': {'snapshot_id': 'synthetic-snapshot', 'user_id': 8}},
    {'marker': {'snapshot_id': 'synthetic-snapshot', 'user_id': 7, 'extra': 1}},
    {'session_import_markers': False}, {'session_import_markers': 1},
    {'sql_rows': []},
    {'marker': None, 'sql_rows': [], 'session_import_markers': True},
    {'marker': None, 'session_import_markers': False},
    {'sql_rows': [], 'session_import_markers': False},
])
def test_bad_identity_marker_or_state_rejected(patch):
    data = inputs()
    data.update(patch)
    with pytest.raises(ValueError):
        classify_session_replay(**data)


def test_traceback_does_not_include_token():
    data = inputs()
    data['sql_rows'][0]['session_token'] = TOKEN + '-malformed'
    try:
        classify_session_replay(**data)
    except ValueError as exc:
        assert TOKEN not in ''.join(traceback.format_exception(exc))
    else:
        pytest.fail('invalid token accepted')
