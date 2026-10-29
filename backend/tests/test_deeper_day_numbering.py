"""Regression coverage for Chapter 2 learning days and preserved identities."""

import hashlib
import re
import unittest
from pathlib import Path

from content import catalog as content
from content.materials import chapter_02 as course


OLD_NUMBERS = ["21","22","23","24","24.1","25","26","26.1","27","27.1","28","29","30","30.1","31","32","33","34","34.1","35","35.1","35.2","36","36.1","36.2","37","37.1","37.2","38","38.1","38.2","39","39.1","40","40.1","40.2","41","41.1","41.2","42","42.1","43","44"]
NEW_NUMBERS = ["21","21.1","21.2","22","22.1","23","24","24.1","25","25.1","26","26.1","27","27.1","28","28.1","28.2","29","29.1","30","30.1","30.2","31","31.1","32","32.1","33","33.1","34","34.1","35","36","36.1","37","37.1","37.2","37.3","38","38.1","39","39.1","39.2","40","40.1"]


class DeeperDayNumberingTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.track = content.find_track(course.TRACK_ID)
        cls.lessons = cls.track["lessons"][1:]
        cls.repo = Path(__file__).resolve().parents[2]

    def test_all_days_and_sublessons_are_ordered_and_grouped(self):
        self.assertEqual(len(self.track["lessons"]), 45)
        actual = [re.match(r"^(\d+(?:\.\d+)*)\.\s", lesson["title"])[1] for lesson in self.lessons]
        self.assertEqual(actual, NEW_NUMBERS)
        self.assertEqual(sum("." not in n for n in actual), 20)
        for block, count in zip(range(5, 9), (10, 12, 9, 13)):
            rows = [l for l in self.lessons if f"/block_{block:02d}/" in l["source_file"]]
            self.assertEqual(len(rows), count)
            parts = [content._lesson_number_parts(Path(l["source_file"]).name) for l in rows]
            self.assertEqual([p[0] for p in parts if len(p) == 1], list(range(block * 5 - 4, block * 5 + 1)))
        for day in range(21, 41):
            rows = [n for n in actual if int(n.split(".")[0]) == day]
            self.assertEqual(rows, [str(day)] + [f"{day}.{i}" for i in range(1, len(rows))])

    def test_existing_ids_and_positional_links_are_preserved(self):
        for old, lesson in zip(OLD_NUMBERS, [lesson for lesson in self.lessons if not lesson["title"].startswith("37.3. ")]):
            with self.subTest(original=old):
                suffix = Path(lesson["source_file"]).name.split(" - ", 1)[1]
                filename = f"{old} - {suffix}"
                if old == "42":
                    filename = "42 - Финальный проект 1, архитектура Persistent Planner.md"
                source = f"{course.TRACK_ID}/{filename}"
                digest = hashlib.sha256(source.encode()).hexdigest()[:24]
                expected_id = f"lesson-{digest}"
                self.assertEqual(lesson["id"], expected_id)
                if "." in old or old == "42":
                    expected_legacy = expected_id
                else:
                    index = int(old) - (21 if int(old) > 42 else 20)
                    expected_legacy = f"{course.TRACK_ID}-lesson-{index + 1:02d}"
                self.assertEqual(lesson["legacy_id"], expected_legacy)
                self.assertIs(content.find_lesson(expected_legacy), lesson)
                for index, task in enumerate(lesson["tasks"], 1):
                    self.assertEqual(task["id"], f"{expected_id}-task-{index:02d}")
                    self.assertIs(content.find_task(task["id"]), task)

    def test_practice_access_and_frontend_pages_match_the_numbered_sources(self):
        registry = (self.repo / "frontend/src/lessons/chapter_02/index.ts").read_text(encoding="utf-8")
        entries = dict(re.findall(r'"([^"]+\.md)": "([^"]+)"', registry))
        self.assertEqual(len(entries), 45)
        for number, lesson in zip(NEW_NUMBERS, self.lessons):
            with self.subTest(number=number):
                self.assertEqual(lesson["access"], "subscription")
                key = number if "." in number else int(number)
                self.assertEqual(len(lesson["tasks"]), len(course.CODE_TASKS.get(key, [])))
                relative = lesson["source_file"].removeprefix("chapter_02/")
                self.assertTrue((content.COURSE_ROOT / lesson["source_file"]).is_file())
                page = entries[relative]
                text = (self.repo / "frontend/src/lessons/chapter_02" / f"{page}.tsx").read_text(encoding="utf-8")
                self.assertIn(f"export function {page.split('/')[-1]}", text)
                self.assertRegex(text, r'<RichHero\b[\s\S]*?\btitle=')
        lessons = dict(zip(NEW_NUMBERS, self.lessons))
        self.assertTrue(lessons["23"]["manual_practice"])  # Mixed editor/project practice.
        self.assertTrue(lessons["39.1"]["manual_practice"])  # Reconnected SOLID/CLI lesson.
        self.assertFalse(lessons["29.1"]["tasks"])
        self.assertTrue(lessons["29.1"]["manual_practice"])  # JSON project practice is published.
        self.assertFalse(lessons["37.3"]["tasks"])
        self.assertTrue(lessons["37.3"]["manual_practice"])  # Local environment setup is published.
        self.assertEqual(sum(len(l["tasks"]) for l in self.lessons), 6)

    def test_concept_passports_and_menu_have_the_same_sequence(self):
        numbers = []
        for block in range(5, 9):
            text = (self.repo / f"docs/make les stage/1 stage/concept/chapter_02/BLOCK_{block}.md").read_text(encoding="utf-8")
            numbers.extend(re.findall(r"^### (\d+(?:\.\d+)*)\. ", text, re.M))
        self.assertEqual(numbers, NEW_NUMBERS)
        course_text = (self.repo / "docs/make les stage/1 stage/concept/chapter_02/COURSE.md").read_text(encoding="utf-8")
        self.assertEqual(re.findall(r"^\| \*\*(\d+(?:\.\d+)*)\. ", course_text, re.M), NEW_NUMBERS)

    def test_tenth_sublesson_is_sorted_numerically(self):
        names = ["22 - Next.md", "21.10 - Tenth.md", "21.1 - First.md", "21 - Main.md", "21.9 - Ninth.md"]
        paths = [content.COURSE_ROOT / "chapter_02/block_05" / n for n in names]
        ordered = sorted(paths, key=lambda p: content._sort_key(p, course.TRACK_ID))
        self.assertEqual([p.name for p in ordered], [names[i] for i in (3, 2, 4, 1, 0)])


if __name__ == "__main__":
    unittest.main()
