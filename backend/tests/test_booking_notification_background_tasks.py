from __future__ import annotations

from datetime import date
from types import SimpleNamespace
from unittest import IsolatedAsyncioTestCase
from unittest.mock import patch

from fastapi import BackgroundTasks

from routers.user.routers import book_slot, cancel_slot
from services.telegram import notify_booking_cancelled, notify_booking_created


class BookingNotificationBackgroundTaskTests(IsolatedAsyncioTestCase):
    async def test_booking_response_queues_notification_without_waiting_for_telegram(self) -> None:
        user = SimpleNamespace(id=7, username="Никита", email="student@example.com")
        slot = SimpleNamespace(
            id=12,
            slot_date=date(2026, 9, 15),
            start_time="18:00",
            duration_minutes=60,
            student_id=7,
        )
        background_tasks = BackgroundTasks()

        with patch("routers.user.routers.crud.get_current_user", return_value=user), patch(
            "routers.user.routers.crud.book_slot", return_value=slot
        ):
            await book_slot(slot_id=12, request=object(), background_tasks=background_tasks, db=object())

        self.assertEqual(len(background_tasks.tasks), 1)
        task = background_tasks.tasks[0]
        self.assertIs(task.func, notify_booking_created)
        self.assertEqual(
            task.kwargs,
            {
                "username": "Никита",
                "email": "student@example.com",
                "slot_date": date(2026, 9, 15),
                "start_time": "18:00",
            },
        )

    async def test_cancellation_response_queues_notification_without_waiting_for_telegram(self) -> None:
        user = SimpleNamespace(id=7, username="Никита", email="student@example.com")
        slot = SimpleNamespace(
            id=12,
            slot_date=date(2026, 9, 15),
            start_time="18:00",
            duration_minutes=60,
            student_id=None,
        )
        background_tasks = BackgroundTasks()

        with patch("routers.user.routers.crud.get_current_user", return_value=user), patch(
            "routers.user.routers.crud.cancel_booking", return_value=slot
        ):
            await cancel_slot(slot_id=12, request=object(), background_tasks=background_tasks, db=object())

        self.assertEqual(len(background_tasks.tasks), 1)
        task = background_tasks.tasks[0]
        self.assertIs(task.func, notify_booking_cancelled)
        self.assertEqual(
            task.kwargs,
            {
                "username": "Никита",
                "email": "student@example.com",
                "slot_date": date(2026, 9, 15),
                "start_time": "18:00",
            },
        )
