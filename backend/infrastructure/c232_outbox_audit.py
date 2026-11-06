"""Conservative, read-only status audit before a future outbox migration.

Every unsent record requires reconciliation before any worker is enabled.
Even a recorded 'sent' status does not prove delivery to an external recipient.
This module checks only the records supplied; it does not prove snapshot
completeness or exclude concurrent workers. It neither reads a database nor
starts, controls or authorizes a worker.
"""
from collections.abc import Mapping

_QUEUES = frozenset({'booking_notification_outbox', 'landing_notification_outbox'})
_STATUSES = frozenset({'pending', 'processing', 'sent', 'failed'})
_LIMIT = 10_000


def audit_outboxes(queues):
    if not isinstance(queues, Mapping) or set(queues) != _QUEUES:
        raise ValueError('outbox_input_invalid')
    sent = review = 0
    for records in queues.values():
        if not isinstance(records, (list, tuple)) or len(records) > _LIMIT:
            raise ValueError('outbox_input_invalid')
        for record in records:
            if (not isinstance(record, Mapping) or type(record.get('status')) is not str
                    or record['status'] not in _STATUSES):
                raise ValueError('outbox_input_invalid')
            if record['status'] == 'sent':
                sent += 1
            else:
                review += 1
    return {'sent_records': sent, 'requires_review': review}


def require_no_unsent_statuses(queues):
    """Require no unsent status in the supplied records, not a worker-start decision."""
    counts = audit_outboxes(queues)
    if counts['requires_review']:
        raise ValueError('outbox_reconciliation_required')
    return counts
