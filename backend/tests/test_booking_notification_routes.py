from __future__ import annotations

from datetime import date
from types import SimpleNamespace
from unittest import TestCase
from unittest.mock import patch

from routers.bookings.router import book_slot, cancel_slot


class BookingNotificationRouteTests(TestCase):
    def setUp(self) -> None:
        self.db = object()
        self.user = SimpleNamespace(id=7, username="Никита", email="student@example.com")
        self.slot = SimpleNamespace(
            id=12,
            slot_date=date(2026, 10, 20),
            start_time="18:00",
            duration_minutes=60,
            student_id=7,
        )

    def test_booking_persists_notification_through_crud_without_background_task(self) -> None:
        with patch("routers.bookings.router.accounts.get_current_user", return_value=self.user), patch(
            "routers.bookings.router.service.book_slot", return_value=self.slot
        ) as create_booking:
            response = book_slot(slot_id=12, request=object(), db=self.db)

        create_booking.assert_called_once_with(
            slot_id=12,
            user_id=7,
            db=self.db,
            notification_username="Никита",
            notification_email="student@example.com",
        )
        self.assertEqual(response["slot"]["id"], 12)

    def test_cancellation_persists_notification_through_crud_without_background_task(self) -> None:
        self.slot.student_id = None
        with patch("routers.bookings.router.accounts.get_current_user", return_value=self.user), patch(
            "routers.bookings.router.service.cancel_booking", return_value=self.slot
        ) as cancel_booking:
            response = cancel_slot(slot_id=12, request=object(), db=self.db)

        cancel_booking.assert_called_once_with(
            slot_id=12,
            user_id=7,
            db=self.db,
            notification_username="Никита",
            notification_email="student@example.com",
        )
        self.assertEqual(response["slot"]["id"], 12)
