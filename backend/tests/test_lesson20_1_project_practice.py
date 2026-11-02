"""The final project practice must be available without losing prior progress."""

import unittest
from unittest.mock import patch

from fastapi import HTTPException

from content.catalog import find_lesson, find_task, get_public_lessons
from routers.courses import progress, service


LESSON_ID = "lesson-fa661256326bd13784d1c88d"
OLD_TASK_REVISION = "fc0a533cfbb824248e6d6f6031e019045c4a77c07030a920a0e226a6953c5675"
OLD_TASK_ID = f"{LESSON_ID}-task-01"


class FinalProjectPracticeTests(unittest.TestCase):
    def setUp(self):
        self.lesson = find_lesson(LESSON_ID)
        assert self.lesson is not None

    def test_project_practice_is_available_and_answers_are_not_public(self):
        public = next(item for item in get_public_lessons(self.lesson["track"]) if item["id"] == LESSON_ID)
        self.assertTrue(public["self_check"])
        self.assertEqual(len(public["manual_practice"][0]["tasks"]), 7)
        self.assertTrue(all("answer" not in task for task in public["manual_practice"][0]["tasks"]))
        self.assertEqual(public["tasks"], [])
        self.assertEqual(self.lesson["tasks"], [])
        self.assertIsNone(find_task(OLD_TASK_ID))

    def test_requested_answer_requires_access_and_returns_only_the_requested_step(self):
        with patch.object(service, "get_optional_user", return_value=object()), patch.object(
            service, "get_lesson_access", return_value=(True, None)
        ):
            result = service.manual_practice_answer(LESSON_ID, 0, 0, request=None, db=None)
            self.assertEqual(result["answer"], self.lesson["manual_practice"][0]["tasks"][0]["answer"])
            with self.assertRaises(HTTPException) as missing:
                service.manual_practice_answer(LESSON_ID, 0, 7, request=None, db=None)
            self.assertEqual(missing.exception.status_code, 404)
        with patch.object(service, "get_optional_user", return_value=None), patch.object(
            service, "get_lesson_access", return_value=(False, "Недоступно")
        ):
            with self.assertRaises(HTTPException) as denied:
                service.manual_practice_answer(LESSON_ID, 0, 0, request=None, db=None)
            self.assertEqual(denied.exception.status_code, 403)

    def test_project_completion_and_old_task_completion_are_distinct(self):
        self.assertIn(OLD_TASK_ID, service._lesson_progress_task_ids(self.lesson))
        self.assertFalse(service._lesson_completion_status(self.lesson, set(), {}))
        self.assertFalse(service._lesson_completion_status(self.lesson, set(), {OLD_TASK_ID: "new-revision"}))
        self.assertTrue(service._lesson_completion_status(self.lesson, set(), {OLD_TASK_ID: OLD_TASK_REVISION}))
        marker = progress.chapter_one_completion_task_id(LESSON_ID)
        revision = progress.chapter_one_completion_revision(self.lesson)
        self.assertTrue(service._lesson_completion_status(self.lesson, set(), {marker: revision}))
        self.assertTrue(service._lesson_completion_status(self.lesson, {LESSON_ID}, {}))


if __name__ == "__main__":
    unittest.main()
