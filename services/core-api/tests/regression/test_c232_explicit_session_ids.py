from types import SimpleNamespace
from uuid import uuid4

import pytest

from tools.lab.session_models.c232_explicit_session_ids import assign_fixture_ids


def test_assigns_exact_fixture_ids_independent_of_record_order():
    tokens = [str(uuid4()), str(uuid4())]
    source = [{'id': 4, 'user_id': 1, 'session_token': tokens[0]},
              {'id': 7, 'user_id': 1, 'session_token': tokens[1]}]
    records = [SimpleNamespace(id=None, user_id=1, session_token=token) for token in reversed(tokens)]
    assert assign_fixture_ids(records, source, user_id=1) == 7
    assert [record.id for record in records] == [7, 4]


@pytest.mark.parametrize('mutation', ['unknown_token', 'wrong_user', 'existing_id', 'duplicate_id', 'duplicate_token'])
def test_rejects_inconsistent_inputs_before_any_mutation(mutation):
    tokens = [str(uuid4()), str(uuid4())]
    source = [{'id': 4, 'user_id': 1, 'session_token': tokens[0]},
              {'id': 7, 'user_id': 1, 'session_token': tokens[1]}]
    records = [SimpleNamespace(id=None, user_id=1, session_token=token) for token in tokens]
    if mutation == 'unknown_token':
        records[1].session_token = str(uuid4())
    elif mutation == 'wrong_user':
        records[1].user_id = 2
    elif mutation == 'existing_id':
        records[1].id = 9
    elif mutation == 'duplicate_id':
        source[1]['id'] = 4
    else:
        source[1]['session_token'] = source[0]['session_token']
    before = [record.id for record in records]
    with pytest.raises(ValueError, match='^synthetic_session_ids_invalid$') as error:
        assign_fixture_ids(records, source, user_id=1)
    assert [record.id for record in records] == before
    assert all(token not in str(error.value) for token in tokens)
