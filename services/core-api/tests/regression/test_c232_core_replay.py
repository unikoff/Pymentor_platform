from copy import deepcopy
from datetime import timedelta
import traceback

import pytest

from tools.lab.storage.c232_core_replay import classify_core_replay
from tools.lab.storage.c232_mapping import TABLE_MAPPINGS
from tools.lab.storage.c232_mapping import TABLE_ORDER
from test_c232_compare import samples


def inputs():
    source, target = samples()
    return dict(source=source, target=target,
                marker=dict(singleton=True, snapshot_digest='digest', transform_version='v1'),
                snapshot_digest='digest', transform_version='v1', session_import_markers=False)


def test_new_requires_all_empty():
    data = inputs()
    data['marker'] = None
    data['target'] = {table: [] for table in TABLE_ORDER}
    assert classify_core_replay(**data) == 'new'
    for table in TABLE_ORDER:
        bad = deepcopy(data)
        bad['target'][table] = [{}]
        with pytest.raises(ValueError):
            classify_core_replay(**bad)
    data['session_import_markers'] = True
    with pytest.raises(ValueError):
        classify_core_replay(**data)


@pytest.mark.parametrize('consumed', [False, True])
def test_complete_ignores_session_contents_and_preserves_inputs(consumed):
    data = inputs()
    data['target']['sessions'] = [{'session_token': 'synthetic_secret'}]
    data['session_import_markers'] = consumed
    before = deepcopy(data)
    assert classify_core_replay(**data) == 'core_complete'
    assert data == before


@pytest.mark.parametrize('change', [
    {'singleton': 1}, {'singleton': False}, {'snapshot_digest': 'other'},
    {'transform_version': 'other'}, {'snapshot_digest': None}, {'extra': 'x'},
])
def test_marker_must_match_exactly(change):
    data = inputs()
    data['marker'].update(change)
    with pytest.raises(ValueError):
        classify_core_replay(**data)


@pytest.mark.parametrize('table', [table for table in TABLE_ORDER if table != 'sessions'])
def test_each_core_table_rows_and_fields(table):
    data = inputs()
    for column in TABLE_MAPPINGS[table].columns:
        bad = deepcopy(data)
        row = bad['target'][table][0]
        value = row[column.name]
        row[column.name] = (False if type(value) is bool else
                            value + 1 if type(value) is int else
                            value + 'z' if type(value) is str else
                            value + timedelta(days=1) if value is not None else 'changed')
        with pytest.raises(ValueError):
            classify_core_replay(**bad)
    for mutation in ('missing', 'extra', 'duplicate', 'missing_field', 'extra_field'):
        bad = deepcopy(data)
        rows = bad['target'][table]
        if mutation == 'missing':
            rows.clear()
        elif mutation == 'extra':
            row = dict(rows[0]); key = 'destination_config_id' if table == 'landing_notification_delivery_state' else 'id'
            row[key] = row[key] + 1 if type(row[key]) is int else row[key] + 'z'
            rows.append(row)
        elif mutation == 'duplicate':
            rows.append(dict(rows[0]))
        elif mutation == 'missing_field':
            rows[0].pop(next(iter(rows[0])))
        else:
            rows[0]['extra'] = 'x'
        with pytest.raises(ValueError):
            classify_core_replay(**bad)


def test_invalid_shapes_and_full_source_preflight():
    for mutate in (
        lambda d: d['source'].pop('sessions'),
        lambda d: d['source']['sessions'][0].update(user_id=999),
        lambda d: d['source']['sessions'].append(dict(d['source']['sessions'][0])),
        lambda d: d['target'].pop('sessions'),
        lambda d: d['target'].update(sessions=None),
        lambda d: d.update(session_import_markers=1),
        lambda d: d.update(snapshot_digest=''),
        lambda d: d.update(transform_version=None),
        lambda d: d['marker'].pop('singleton'),
    ):
        data = inputs()
        mutate(data)
        before = deepcopy(data)
        with pytest.raises(ValueError):
            classify_core_replay(**data)
        assert data == before


def test_errors_do_not_expose_synthetic_secrets_even_in_tracebacks():
    secret = 'synthetic_secret_token_do_not_expose'
    for case in ('source', 'target', 'marker'):
        data = inputs()
        if case == 'source':
            data['source']['sessions'][0]['session_token'] = secret * 10
        elif case == 'target':
            data['target']['users'][0][secret] = secret
        else:
            data['marker']['snapshot_digest'] = secret
        with pytest.raises(ValueError) as error:
            classify_core_replay(**data)
        assert secret not in ''.join(traceback.format_exception(error.value))
