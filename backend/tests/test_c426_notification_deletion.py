"""Synthetic checks for reliably linked booking notifications on deletion."""

from datetime import date
from types import SimpleNamespace

import pytest
from fastapi import HTTPException
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError

from db import models
from routers.admin import service
from routers.bookings import service as bookings
from test_account_progress_deletion import add_user, database


def test_booking_and_cancellation_link_new_notifications_to_account_generation(database):
    _, factory = database
    with factory() as db:
        user_id = add_user(db, "target")
        slot = models.BookingSlot(slot_date=date(2099, 1, 1), start_time="10:00", duration_minutes=60)
        db.add_all([slot, models.BookingQuota(user_id=user_id, year=2099, month=1, granted_slots=1)])
        db.commit()
        slot_id = slot.id
        bookings.book_slot(slot_id, user_id, db, notification_username="target", notification_email="target@example.test")
        bookings.cancel_booking(slot_id, user_id, db, notification_username="target", notification_email="target@example.test")
        ref = db.scalar(text("SELECT lifecycle_id FROM account_lifecycles WHERE user_id=:id"), {"id": user_id})
        links = db.execute(text("SELECT lifecycle_id FROM booking_notification_subjects ORDER BY outbox_id")).scalars().all()
        assert links == [ref, ref]


def _linked_event(db, user_id, email, status="pending"):
    ref = db.scalar(text("SELECT lifecycle_id FROM account_lifecycles WHERE user_id=:id"), {"id": user_id})
    event = models.BookingNotificationOutbox(event_type="booking_created", slot_id=42,
        username="synthetic", email=email, slot_date=date(2099, 1, 1), start_time="10:00", status=status)
    db.add(event)
    db.flush()
    db.execute(text("INSERT INTO booking_notification_subjects(outbox_id, lifecycle_id) VALUES (:id, :ref)"),
               {"id": event.id, "ref": ref})
    db.commit()
    return event.id, ref


def test_guarded_delete_removes_only_notifications_with_proven_owner(database, monkeypatch):
    _, factory = database
    monkeypatch.setattr(service, "require_admin", lambda *_: SimpleNamespace(id=99999))
    with factory() as db:
        target, other = add_user(db, "target"), add_user(db, "other")
        event_id, reference = _linked_event(db, target, "target@example.test")
        other_id, _ = _linked_event(db, other, "other@example.test")
        assert service.delete_user(target, None, db, expected_account_ref=reference) == {"deleted": target}
        assert db.get(models.BookingNotificationOutbox, event_id) is None
        assert db.get(models.BookingNotificationOutbox, other_id) is not None
        assert db.scalar(text("SELECT count(*) FROM booking_notification_subjects WHERE outbox_id=:id"),
                         {"id": event_id}) == 0


def test_active_delivery_blocks_delete_without_losing_user_or_progress(database, monkeypatch):
    _, factory = database
    monkeypatch.setattr(service, "require_admin", lambda *_: SimpleNamespace(id=99999))
    with factory() as db:
        target = add_user(db, "target")
        event_id, reference = _linked_event(db, target, "target@example.test", status="processing")
        with pytest.raises(HTTPException) as error:
            service.delete_user(target, None, db, expected_account_ref=reference)
        assert error.value.status_code == 409
        db.rollback()
        assert db.get(models.User, target) is not None
        assert db.get(models.BookingNotificationOutbox, event_id) is not None
        assert db.query(models.UserLessonProgress).filter_by(user_id=target).count() == 1


def test_direct_sqlite_delete_is_blocked_while_linked_delivery_is_active(database):
    engine, factory = database
    with factory() as db:
        target = add_user(db, "target")
        _linked_event(db, target, "target@example.test", status="processing")
    with pytest.raises(IntegrityError):
        with engine.begin() as connection:
            connection.execute(text("DELETE FROM users WHERE id=:id"), {"id": target})
    with factory() as db:
        assert db.get(models.User, target) is not None


def test_direct_sqlite_delete_removes_linked_pending_notification(database):
    engine, factory = database
    with factory() as db:
        target = add_user(db, "target")
        event_id, _ = _linked_event(db, target, "target@example.test")
    with engine.begin() as connection:
        connection.execute(text("DELETE FROM users WHERE id=:id"), {"id": target})
    with factory() as db:
        assert db.get(models.BookingNotificationOutbox, event_id) is None
        assert db.scalar(text("SELECT count(*) FROM booking_notification_subjects WHERE outbox_id=:id"),
                         {"id": event_id}) == 0


def test_historical_unlinked_notification_is_not_guessed_from_email(database, monkeypatch):
    _, factory = database
    monkeypatch.setattr(service, "require_admin", lambda *_: SimpleNamespace(id=99999))
    with factory() as db:
        target = add_user(db, "target")
        reference = db.scalar(text("SELECT lifecycle_id FROM account_lifecycles WHERE user_id=:id"), {"id": target})
        historical = models.BookingNotificationOutbox(event_type="booking_created", slot_id=43,
            username="target", email="target@example.test", slot_date=date(2099, 1, 1), start_time="11:00")
        db.add(historical)
        db.commit()
        historical_id = historical.id
        service.delete_user(target, None, db, expected_account_ref=reference)
        # No generation reference exists, so this is deliberately unresolved.
        assert db.get(models.BookingNotificationOutbox, historical_id) is not None
