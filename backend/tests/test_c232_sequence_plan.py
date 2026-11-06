import pytest

from infrastructure.c232_sequence_plan import next_restart_value


def test_never_rewinds_an_advanced_unused_sequence():
    assert next_restart_value(last_value=100, is_called=False, max_id=5,
                              increment=1, minimum=1, maximum=1000, cache=1, cycle=False) == 100


def test_respects_called_sequence_and_imported_ids():
    assert next_restart_value(last_value=100, is_called=True, max_id=5,
                              increment=1, minimum=1, maximum=1000, cache=1, cycle=False) == 101
    assert next_restart_value(last_value=1, is_called=False, max_id=40,
                              increment=1, minimum=1, maximum=1000, cache=1, cycle=False) == 41


def test_empty_import_preserves_next_sequence_value():
    assert next_restart_value(last_value=7, is_called=True, max_id=None,
                              increment=1, minimum=1, maximum=1000, cache=1, cycle=False) == 8


@pytest.mark.parametrize('changes', [
    {'last_value': True}, {'is_called': 1}, {'max_id': True}, {'increment': 2},
    {'cache': 10}, {'cycle': True}, {'minimum': -1}, {'last_value': 0},
    {'last_value': 1000, 'is_called': True}, {'max_id': 1000}, {'max_id': -1},
])
def test_unsupported_or_exhausted_sequences_fail_closed(changes):
    params = dict(last_value=1, is_called=False, max_id=2, increment=1,
                  minimum=1, maximum=1000, cache=1, cycle=False)
    params.update(changes)
    with pytest.raises(ValueError, match='Invalid sequence state'):
        next_restart_value(**params)
