from datetime import date
from datetime import datetime
from datetime import timedelta
from datetime import timezone
import unittest

from fastapi import HTTPException
import pytest
from test_c2_1_4_auth_legacy import runtime_db

from pymentor_core.adapters.sql import models
from pymentor_core.modules.bookings.api import service as crud


MOSCOW_TZ = timezone(timedelta(hours=3))


class BookingSlotsVisibilityTests(unittest.TestCase):
    @pytest.fixture(autouse=True)
    def database(self, runtime_db):
        self.sessions = runtime_db

    def setUp(self) -> None:
        self.session = self.sessions()
        self.session.add_all([models.User(id=uid, username="Synthetic", email=f"slot-{uid}@example.test", _password_hash="synthetic") for uid in (7,8)])
        self.session.commit()
        self.now = datetime(2026, 9, 11, 18, 0, tzinfo=MOSCOW_TZ)

    def tearDown(self) -> None:
        self.session.close()

    def _add_slot(self, day: date, start_time: str, student_id: int | None = None) -> models.BookingSlot:
        slot = models.BookingSlot(
            slot_date=day,
            start_time=start_time,
            duration_minutes=60,
            student_id=student_id,
        )
        self.session.add(slot)
        self.session.commit()
        self.session.refresh(slot)
        return slot

    def test_slot_lists_exclude_past_slots_for_admin_and_student(self) -> None:
        past_mine = self._add_slot(date(2026, 9, 11), "17:59", student_id=7)
        future_free = self._add_slot(date(2026, 9, 11), "18:01")
        future_mine = self._add_slot(date(2026, 9, 12), "10:00", student_id=7)
        future_other = self._add_slot(date(2026, 9, 12), "11:00", student_id=8)

        admin_slots = crud.list_slots_for_month_admin(2026, 9, self.session, now=self.now)
        student_slots = crud.list_bookable_slots(2026, 9, 7, self.session, now=self.now)

        self.assertEqual([future_free.id, future_mine.id, future_other.id], [slot["id"] for slot in admin_slots])
        self.assertEqual([future_free.id, future_mine.id], [slot["id"] for slot in student_slots])
        self.assertNotIn(past_mine.id, [slot["id"] for slot in admin_slots])
        self.assertNotIn(past_mine.id, [slot["id"] for slot in student_slots])

    def test_slot_starting_now_is_already_past(self) -> None:
        slot = models.BookingSlot(slot_date=date(2026, 9, 11), start_time="18:00", duration_minutes=60)

        self.assertTrue(crud._slot_is_past(slot, now=self.now))

    def test_admin_cannot_create_past_slot(self) -> None:
        with self.assertRaises(HTTPException) as error:
            crud.create_slot(date(2026, 9, 11), "17:59", 60, self.session, now=self.now)

        self.assertEqual(400, error.exception.status_code)
        self.assertEqual("Нельзя создать слот в уже прошедшее время", error.exception.detail)


if __name__ == "__main__":
    unittest.main()
