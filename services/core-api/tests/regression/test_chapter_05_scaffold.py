import re
import unittest
from pathlib import Path
from unittest.mock import patch

from fastapi import HTTPException

from pymentor_core.adapters.course_local import catalog
from content.materials import chapter_05
from pymentor_core.modules.learning.api import service


class Chapter05ScaffoldTests(unittest.TestCase):
    def test_catalog_and_frontend_routes_match(self):
        root = Path(__file__).resolve().parents[4]
        track = catalog.find_track(chapter_05.TRACK_ID)
        lessons = track["lessons"]
        self.assertEqual(41, len(lessons))  # overview and 40 lesson passports
        self.assertEqual(41, len({lesson["id"] for lesson in lessons}))
        other_ids = {lesson["id"] for lesson in catalog.LESSONS if lesson["track"] != chapter_05.TRACK_ID}
        manifest = (root / "frontend/src/lessons/chapter_05/index.ts").read_text(encoding="utf-8")
        routes = dict(re.findall(r'^  "([^"]+)": "([^"]+)",?$', manifest, re.MULTILINE))
        self.assertEqual(41, len(routes))
        counts = {"block_17": 10, "block_18": 10, "block_19": 11, "block_20": 9}
        for block, count in counts.items():
            self.assertEqual(count, sum(lesson["source_file"].startswith(f"chapter_05/{block}/") for lesson in lessons))
        for lesson in lessons:
            with self.subTest(source=lesson["source_file"]):
                self.assertNotIn(lesson["id"], other_ids)
                self.assertEqual(lesson["id"], lesson["legacy_id"])
                self.assertIs(catalog.find_lesson(lesson["id"]), lesson)
                active = lesson["source_file"].startswith("chapter_05/block_17/")
                self.assertEqual(active or lesson["source_file"].startswith("chapter_05/block_00/"), catalog._is_countable(lesson))
                self.assertEqual(active, bool(lesson["manual_practice"]))
                self.assertEqual([], lesson["tasks"])
                source = lesson["source_file"].removeprefix("chapter_05/")
                self.assertIn(source, routes)
                page = root / "frontend/src/lessons/chapter_05" / (routes[source] + ".tsx")
                self.assertTrue(page.is_file())
                self.assertIn(f"export function {page.stem}(", page.read_text(encoding="utf-8"))

    def test_only_accepted_block_practice_is_registered(self):
        self.assertEqual({}, chapter_05.OVERVIEW_PRACTICE)
        self.assertEqual({81, "81.1", 82, "82.1", 83, "83.1", 84, "84.1", 85, "85.1"}, set(chapter_05.MANUAL_PRACTICE))
        self.assertEqual({}, chapter_05.CODE_TASKS)

    def test_manual_cards_have_separate_condition_requirements_and_hidden_walkthrough(self):
        for number, exercises in chapter_05.MANUAL_PRACTICE.items():
            self.assertTrue(exercises)
            for exercise in exercises:
                self.assertTrue(exercise["task"])
                self.assertNotIn("steps", exercise)
                self.assertTrue(exercise["tasks"])
                for index, task in enumerate(exercise["tasks"]):
                    with self.subTest(lesson=number, task=index):
                        for field in ("title", "task", "requirements", "result", "hint"):
                            self.assertTrue(task[field], field)
                        answer = task["answer"]
                        self.assertTrue(answer["explanation"])
                        self.assertIsInstance(answer["steps"], list)
                        self.assertTrue(answer["steps"])

    def test_block17_answers_are_private_and_request_scoped(self):
        lessons = [lesson for lesson in catalog.find_track(chapter_05.TRACK_ID)["lessons"]
                   if lesson["source_file"].startswith("chapter_05/block_17/")]
        public = {lesson["id"]: lesson for lesson in catalog.get_public_lessons(chapter_05.TRACK_ID)}
        self.assertEqual(10, len(lessons))
        for lesson in lessons:
            with self.subTest(lesson=lesson["id"]):
                for exercise in public[lesson["id"]]["manual_practice"]:
                    self.assertTrue(all("answer" not in task for task in exercise["tasks"]))
                with patch.object(service, "get_optional_user", return_value=object()), patch.object(
                    service, "get_lesson_access", return_value=(True, None)
                ):
                    for exercise_index, exercise in enumerate(lesson["manual_practice"]):
                        for task_index, task in enumerate(exercise["tasks"]):
                            result = service.manual_practice_answer(lesson["id"], exercise_index, task_index, request=None, db=None)
                            self.assertEqual({"answer": task["answer"]}, result)
                            result["answer"]["explanation"] = "changed response"
                            self.assertNotEqual("changed response", task["answer"]["explanation"])
                    for exercise_index, task_index in ((-1, 0), (len(lesson["manual_practice"]), 0), (0, -1), (0, 999)):
                        with self.assertRaises(HTTPException) as missing:
                            service.manual_practice_answer(lesson["id"], exercise_index, task_index, request=None, db=None)
                        self.assertEqual(404, missing.exception.status_code)
                with patch.object(service, "get_optional_user", return_value=None), patch.object(
                    service, "get_lesson_access", return_value=(False, "locked")
                ):
                    with self.assertRaises(HTTPException) as denied:
                        service.manual_practice_answer(lesson["id"], 0, 0, request=None, db=None)
                    self.assertEqual(403, denied.exception.status_code)


if __name__ == "__main__":
    unittest.main()
