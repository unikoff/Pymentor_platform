from datetime import date, datetime, timezone
from unittest import TestCase
from unittest.mock import patch

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from db.engine import Base
from db import models as models
from routers.admin.router import list_users
from routers.bookings import service as crud


class AdminDashboardTests(TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite://")
        Base.metadata.create_all(self.engine)
        self.db = sessionmaker(bind=self.engine)()
        self.now = datetime(2026, 10, 22, 12, tzinfo=timezone.utc)
        self.active = self.add_user("Анна", datetime(2099, 1, 1, tzinfo=timezone.utc))
        self.expired = self.add_user("Борис", datetime(2001, 1, 1, tzinfo=timezone.utc))
        self.other = self.add_user("Вера", None)
        self.db.add_all([
            models.BookingQuota(user_id=self.active.id, year=2026, month=10, granted_slots=5),
            models.BookingQuota(user_id=self.expired.id, year=2026, month=10, granted_slots=1),
            models.BookingQuota(user_id=self.other.id, year=2026, month=10, granted_slots=8),
        ])
        for user in [self.active, self.expired]:
            for day in [10, 25]:
                self.db.add(models.BookingSlot(slot_date=date(2026, 10, day), start_time=f"{10 + user.id}:00", duration_minutes=60, student_id=user.id))
        self.db.commit()

    def tearDown(self):
        self.db.close()
        self.engine.dispose()

    def add_user(self, name, until):
        user = models.User(username=name, email=f"{name}@example.com", _password_hash="test-hash", subscription_until=until)
        self.db.add(user)
        self.db.commit()
        return user

    def accounts(self, search="", subscription="all", lessons="all", month=10):
        with patch("routers.admin.service.require_admin"), patch("routers.admin.service.bookings._now_moscow", return_value=self.now):
            return list_users(request=object(), search=search, subscription=subscription, lessons=lessons, year=2026, month=month, db=self.db)["users"]

    def test_balances_match_booking_quota_and_count_past_and_future_bookings(self):
        for account in self.accounts():
            self.assertEqual(crud.get_quota_status(account["id"], 2026, 10, self.db), account["quota"])
        self.assertEqual(3, self.accounts(search="Анна")[0]["quota"]["remaining"])
        self.assertEqual(0, self.accounts(search="Борис")[0]["quota"]["remaining"])

    def test_filters_combine_with_case_insensitive_search(self):
        self.assertEqual([self.active.id], [u["id"] for u in self.accounts("АННА", "active", "low")])
        self.assertEqual([], self.accounts("АННА", "inactive", "low"))
        self.assertEqual([self.other.id], [u["id"] for u in self.accounts(subscription="inactive", lessons="many")])
        self.assertEqual([self.expired.id], [u["id"] for u in self.accounts(lessons="none")])

    def test_month_without_grants_has_zero_balance(self):
        self.assertEqual(3, len(self.accounts(lessons="none", month=11)))
        self.assertEqual([], self.accounts(lessons="many", month=11))

    def test_filters_run_before_result_limit(self):
        for index in range(101):
            self.db.add(models.User(username=f"Без квоты {index}", email=f"empty-{index}@example.com", _password_hash="test-hash"))
        self.db.commit()
        target = self.add_user("Последний", None)
        self.db.add(models.BookingQuota(user_id=target.id, year=2026, month=10, granted_slots=10))
        self.db.commit()
        self.assertIn(target.id, [u["id"] for u in self.accounts(lessons="many")])
        self.assertEqual(100, len(self.accounts()))

    def test_admin_calendar_can_include_past_bookings_with_student_names(self):
        future = crud.list_slots_for_month_admin(2026, 10, self.db, now=self.now)
        calendar = crud.list_slots_for_month_admin(2026, 10, self.db, now=self.now, include_past=True)
        self.assertEqual(2, len(future))
        self.assertEqual(4, len(calendar))
        self.assertTrue(calendar[0]["is_past"])
        self.assertEqual("Анна", calendar[0]["student"]["username"])
        self.assertTrue(all(not slot["is_past"] for slot in future))
