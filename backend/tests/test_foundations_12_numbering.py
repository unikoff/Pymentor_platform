"""Day numbering must not detach existing lessons, practice, or progress."""

import hashlib
import re
import unittest
from pathlib import Path

from learning import content
from learning.course_content import chapter_01 as course
from learning.course_content.chapter_01.numbering import LESSON_NUMBERS


class Foundations12NumberingTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.track = content.find_track(course.TRACK_ID)
        cls.lessons = cls.track["lessons"][1:]

    def test_day_order_and_five_main_lessons_per_block(self):
        expected = (
            "1 1.1 2 2.1 3 3.1 4 4.1 5 5.1 "
            "6 6.1 7 7.1 7.2 8 8.1 9 9.1 10 10.1 10.2 "
            "11 11.1 11.2 12 12.1 13 13.1 13.2 14 14.1 14.2 15 15.1 "
            "16 16.1 17 17.1 18 18.1 19 19.1 20 20.1"
        ).split()
        self.assertEqual(len(self.track["lessons"]), 46)  # Includes the overview.
        self.assertEqual(list(LESSON_NUMBERS.values()), expected)
        self.assertEqual([re.match(r"^(\d+(?:\.\d+)*)\.", l["title"])[1] for l in self.lessons], expected)
        for block, count in enumerate((10, 12, 13, 10), 1):
            group = [l for l in self.lessons if f"/block_{block:02d}/" in l["source_file"]]
            parts = [content._lesson_number_parts(Path(l["source_file"]).name) for l in group]
            self.assertEqual(len(group), count)
            self.assertEqual([p[0] for p in parts if len(p) == 1], list(range(block * 5 - 4, block * 5 + 1)))

    def test_numeric_sorting_keeps_tenth_sublesson_after_ninth(self):
        names = ["02 - Next.md", "01.10 - Tenth.md", "01.1 - First.md", "01 - Main.md", "01.9 - Ninth.md"]
        paths = [content.COURSE_ROOT / "chapter_01/block_01" / n for n in names]
        ordered = sorted(paths, key=lambda p: content._sort_key(p, course.TRACK_ID))
        self.assertEqual([p.name for p in ordered], [names[i] for i in (3, 2, 4, 1, 0)])

    def test_original_hashes_links_and_task_ids_are_preserved(self):
        for ordinal, lesson in enumerate(self.lessons, 1):
            with self.subTest(ordinal=ordinal):
                filename = Path(lesson["source_file"]).name
                original_name = f"{ordinal:02d} - {filename.split(' - ', 1)[1]}"
                original_source = f"{course.TRACK_ID}/{original_name}"
                digest = hashlib.sha256(original_source.encode()).hexdigest()[:24]
                self.assertEqual(lesson["id"], f"lesson-{digest}")
                legacy_id = f"{course.TRACK_ID}-lesson-{ordinal + 1:02d}"
                self.assertEqual(lesson["legacy_id"], legacy_id)
                self.assertIs(content.find_lesson(legacy_id), lesson)
                self.assertIs(content.find_lesson(lesson["id"]), lesson)
                for index, task in enumerate(lesson["tasks"], 1):
                    self.assertEqual(task["id"], f"lesson-{digest}-task-{index:02d}")
                    self.assertIs(content.find_task(task["id"]), task)

    def test_practice_access_and_frontend_bindings_follow_the_same_lesson(self):
        repo = Path(__file__).resolve().parents[2]
        registry = (repo / "frontend/src/lessons/chapter_01/index.ts").read_text(encoding="utf-8")
        bindings = dict(re.findall(r'"([^"]+\.md)": "([^"]+)"', registry))
        self.assertEqual(len(bindings), 46)
        for ordinal, lesson in enumerate(self.lessons, 1):
            with self.subTest(ordinal=ordinal):
                expected_access = "free" if ordinal <= 10 else "registered" if ordinal <= 22 else "subscription"
                self.assertEqual(lesson["access"], expected_access)
                filename = Path(lesson["source_file"]).name
                parts = content._lesson_number_parts(filename)
                number = ".".join(map(str, parts))
                practice_key = int(number) if len(parts) == 1 else number
                self.assertIn(practice_key, course.MANUAL_PRACTICE)
                self.assertIn(practice_key, course.CODE_TASKS)
                self.assertEqual(len(lesson["tasks"]), len(course.CODE_TASKS[practice_key]))
                self.assertTrue(lesson["tasks"] or lesson["manual_practice"])
                relative = lesson["source_file"].removeprefix("chapter_01/")
                page = bindings[relative]
                source = repo / "frontend/src/lessons/chapter_01" / f"{page}.tsx"
                text = source.read_text(encoding="utf-8")
                self.assertIn(f"export function {page.split('/')[-1]}", text)
                self.assertRegex(text, rf'<RichHero\b[\s\S]*?\btitle="{re.escape(number)}\. ')


if __name__ == "__main__":
    unittest.main()
