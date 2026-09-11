from datetime import date, datetime, timedelta, timezone
import unittest

from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from DataBase.engine import Base
from DataBase import model as models
from routers.user import crud


MOSCOW_TZ = timezone(timedelta(hours=3))


class BookingSlotsVisibilityTests(unittest.TestCase):
    def setUp(self) -> None:
        self.engine = create_engine("sqlite://")
        Base.metadata.create_all(self.engine)
        self.session = sessionmaker(bind=self.engine)()
        self.now = datetime(2026, 9, 11, 18, 0, tzinfo=MOSCOW_TZ)

    def tearDown(self) -> None:
        self.session.close()
        Base.metadata.drop_all(self.engine)
        self.engine.dispose()

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
