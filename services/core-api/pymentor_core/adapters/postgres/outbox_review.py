"""Prevent imported PostgreSQL outboxes from sending before manual review."""

from sqlalchemy import text
from pymentor_core.modules.notifications.review_policy import (
    ReviewState,
    enforce_review,
)


def _review_state(session, *, for_retry=False):
    """Leave legacy databases unchanged; fail closed for an imported lab."""
    if session.get_bind().dialect.name != "postgresql":
        return ReviewState(imported=False)
    marker = session.execute(
        text("SELECT to_regclass('c232_lab_control.import_marker')")
    ).scalar_one()
    if marker is None:
        return ReviewState(imported=False)
    review_table = session.execute(
        text("SELECT to_regclass('c232_lab_control.outbox_review')")
    ).scalar_one()
    if review_table is None:
        return ReviewState(imported=True, available=False)
    unresolved = session.execute(
        text("""SELECT EXISTS (
        SELECT 1 FROM c232_lab_control.outbox_review AS review
        LEFT JOIN public.booking_notification_outbox AS booking
            ON review.queue = 'booking_notification_outbox' AND booking.id = review.row_id
        LEFT JOIN public.landing_notification_outbox AS landing
            ON review.queue = 'landing_notification_outbox' AND landing.id = review.row_id
        WHERE NOT review.reviewed
           OR (review.queue = 'booking_notification_outbox'
               AND booking.status IN ('pending', 'processing'))
           OR (review.queue = 'landing_notification_outbox'
               AND landing.status IN ('pending', 'processing'))
           OR (review.reviewed AND review.decision = 'delivered'
               AND COALESCE(booking.status, landing.status, 'sent') <> 'sent')
           OR (review.reviewed AND review.decision = 'suppress'
               AND COALESCE(booking.status, landing.status, 'missing') <> 'failed')
           OR review.queue NOT IN ('booking_notification_outbox', 'landing_notification_outbox')
    )""")
    ).scalar_one()
    if unresolved:
        return ReviewState(imported=True, unresolved=True)
    if for_retry:
        failed = session.execute(
            text("""SELECT EXISTS (
            SELECT 1 FROM c232_lab_control.outbox_review AS review
            LEFT JOIN public.booking_notification_outbox AS booking
                ON review.queue = 'booking_notification_outbox' AND booking.id = review.row_id
            LEFT JOIN public.landing_notification_outbox AS landing
                ON review.queue = 'landing_notification_outbox' AND landing.id = review.row_id
            WHERE booking.status = 'failed' OR landing.status = 'failed'
        )""")
        ).scalar_one()
        if failed:
            return ReviewState(imported=True, failed=True)

    return ReviewState(imported=True)


def require_review_complete(session, *, for_retry=False):
    return enforce_review(
        _review_state(session, for_retry=for_retry), for_retry=for_retry
    )
