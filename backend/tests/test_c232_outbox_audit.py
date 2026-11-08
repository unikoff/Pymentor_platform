from copy import deepcopy

import pytest

from infrastructure.c232_outbox_audit import audit_outboxes, require_no_unsent_statuses


def test_counts_sent_and_requires_review_for_all_unsent_without_mutation():
    queues = {
        'booking_notification_outbox': [{'status': 'sent'}, {'status': 'pending'}, {'status': 'failed'}],
        'landing_notification_outbox': [{'status': 'processing'}, {'status': 'sent'}],
    }
    original = deepcopy(queues)
    assert audit_outboxes(queues) == {'sent_records': 2, 'requires_review': 3}
    assert queues == original
    with pytest.raises(ValueError, match='^outbox_reconciliation_required$'):
        require_no_unsent_statuses(queues)


def test_only_sent_records_do_not_block_this_specific_check():
    queues = {'booking_notification_outbox': [{'status': 'sent'}], 'landing_notification_outbox': []}
    assert require_no_unsent_statuses(queues) == {'sent_records': 1, 'requires_review': 0}


@pytest.mark.parametrize('queue', ['booking_notification_outbox', 'landing_notification_outbox'])
@pytest.mark.parametrize('status', ['pending', 'processing', 'failed'])
def test_every_unsent_status_requires_review_even_after_attempts_reset(queue, status):
    queues = {'booking_notification_outbox': [], 'landing_notification_outbox': []}
    queues[queue].append({'status': status, 'attempts': 0})
    with pytest.raises(ValueError, match='^outbox_reconciliation_required$'):
        require_no_unsent_statuses(queues)


@pytest.mark.parametrize('queues', [
    {},
    {'booking_notification_outbox': [], 'landing_notification_outbox': [], 'secret': []},
    {'booking_notification_outbox': [{'status': 'unknown private value'}], 'landing_notification_outbox': []},
    {'booking_notification_outbox': [{'status': ['private value']}], 'landing_notification_outbox': []},
    {'booking_notification_outbox': [{'other': 'private value'}], 'landing_notification_outbox': []},
])
def test_invalid_input_is_rejected_without_exposing_values(queues):
    with pytest.raises(ValueError) as error:
        audit_outboxes(queues)
    assert 'private value' not in str(error.value)
