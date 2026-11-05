import re
import unittest
from pathlib import Path

from content import catalog
from content.materials import chapter_05


class Chapter05ScaffoldTests(unittest.TestCase):
    def test_catalog_and_frontend_routes_match(self):
        root = Path(__file__).resolve().parents[2]
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
                self.assertFalse(catalog._is_countable(lesson))
                self.assertEqual([], lesson["manual_practice"])
                self.assertEqual([], lesson["tasks"])
                source = lesson["source_file"].removeprefix("chapter_05/")
                self.assertIn(source, routes)
                page = root / "frontend/src/lessons/chapter_05" / (routes[source] + ".tsx")
                self.assertTrue(page.is_file())
                self.assertIn(f"export function {page.stem}(", page.read_text(encoding="utf-8"))

    def test_old_practice_is_not_registered(self):
        self.assertEqual({}, chapter_05.OVERVIEW_PRACTICE)
        self.assertEqual({}, chapter_05.MANUAL_PRACTICE)
        self.assertEqual({}, chapter_05.CODE_TASKS)


if __name__ == "__main__":
    unittest.main()
