import hashlib
import asyncio
import json
import re
import tempfile
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch
from urllib.parse import urlencode

from fastapi import FastAPI

from learning import content, rich_code_tasks, rich_practice
from learning.code_runner import run_python_task
from learning.course_content import (
    async_api,
    database_api,
    deeper,
    deployment,
    foundations,
    lms,
    personal_api,
    planner_api,
    postgresql,
)
from learning.course_content.planner_api import block_09, block_10, block_11, block_12
from learning.practice_helpers import merge_lesson_maps, validate_block
from routers.learning import routers


class PracticeCatalogMigrationTests(unittest.TestCase):
    def test_every_course_uses_block_packages_and_keeps_legacy_exports(self):
        courses = (
            ("foundations", "FOUNDATIONS", foundations, ((1, 5, "block_01"), (6, 10, "block_02"), (11, 15, "block_03"), (16, 20, "block_04"))),
            ("deeper", "DEEPER", deeper, ((21, 26, "block_05"), (27, 32, "block_06"), (33, 38, "block_07"), (39, 44, "block_08"))),
            ("planner_api", "PLANNER_API", planner_api, ((45, 50, "block_09"), (51, 56, "block_10"), (57, 62, "block_11"), (63, 68, "block_12"))),
            ("database_api", "DATABASE_API", database_api, ((69, 74, "block_13"), (75, 80, "block_14"), (81, 86, "block_15"), (87, 92, "block_16"))),
            ("personal_api", "PERSONAL_API", personal_api, ((93, 98, "block_17"), (99, 104, "block_18"), (105, 110, "block_19"), (111, 116, "block_20"))),
            ("postgresql", "POSTGRESQL", postgresql, ((117, 122, "block_21"), (123, 128, "block_22"), (129, 134, "block_23"), (135, 140, "block_24"))),
            ("async_api", "ASYNC", async_api, ((141, 146, "block_25"), (147, 152, "block_26"), (153, 158, "block_27"), (159, 164, "block_28"))),
            ("deployment", "DEPLOY", deployment, ((165, 170, "block_29"), (171, 176, "block_30"), (177, 182, "block_31"), (183, 188, "block_32"))),
            ("lms", "LMS", lms, ((189, 194, "block_33"), (195, 200, "block_34"), (201, 206, "block_35"), (207, 212, "block_36"))),
        )
        for slug, prefix, package, ranges in courses:
            with self.subTest(course=slug):
                course_dir = content.COURSE_ROOT / slug
                self.assertTrue(course_dir.is_dir())
                self.assertEqual(package.TRACK_ID, content._load_track_meta(course_dir)["id"])
                self.assertIn(package.TRACK_ID, package.TRACK_ALIASES)
                self.assertIs(getattr(rich_practice, f"{prefix}_OVERVIEW_PRACTICE"), package.OVERVIEW_PRACTICE)
                self.assertIs(getattr(rich_practice, f"{prefix}_PRACTICE"), package.MANUAL_PRACTICE)
                self.assertIs(getattr(rich_code_tasks, f"{prefix}_CODE_TASKS"), package.CODE_TASKS)
                self.assertEqual("learning.course_content." + slug, package.__name__)
                for first, last, block_name in ranges:
                    block = getattr(package, block_name)
                    validate_block(first, last, block.MANUAL_PRACTICE, block.CODE_TASKS)
                    for kind, local, merged, getter in (
                        ("manual", block.MANUAL_PRACTICE, package.MANUAL_PRACTICE, rich_practice.get_manual_practice),
                        ("code", block.CODE_TASKS, package.CODE_TASKS, rich_code_tasks.get_code_tasks),
                    ):
                        self.assertEqual(
                            set(local),
                            {
                                key
                                for key in merged
                                if first
                                <= (int(key.split(".", 1)[0]) if isinstance(key, str) else key)
                                <= last
                            },
                        )
                        for number, tasks in local.items():
                            self.assertIs(tasks, merged[number])
                            for alias in package.TRACK_ALIASES:
                                self.assertIs(tasks, getter(alias, f"{number} - lesson.md"), (kind, alias, number))

    def test_all_moved_lessons_keep_stable_ids_and_access_rules(self):
        for track in content.TRACKS:
            for lesson in track["lessons"]:
                source = lesson["source_file"]
                identity_source = content._lesson_identity_source(source)
                layout = content.LEGACY_COURSE_LAYOUTS[Path(source).parts[0]]
                legacy_module = layout["source_dirs"][Path(source).parts[1]]
                expected_source = "/".join(
                    part for part in (layout["track_id"], legacy_module, Path(source).name) if part
                )
                expected_module = legacy_module or content.RICH_TRACK_MODULE_LABELS[track["id"]][Path(source).name]
                expected_id = "lesson-" + hashlib.sha256(identity_source.encode("utf-8")).hexdigest()[:24]
                with self.subTest(track=track["id"], source=source):
                    self.assertEqual(layout["track_id"], track["id"])
                    self.assertEqual(expected_source, identity_source)
                    self.assertEqual(expected_module, lesson["module"])
                    self.assertEqual(expected_id, lesson["id"])
                    self.assertTrue((content.COURSE_ROOT / source).is_file())
        first_course = content.find_track(foundations.TRACK_ID)
        self.assertEqual("free", first_course["lessons"][0]["access"])
        numbered = [
            (int(match.group(1)), lesson)
            for lesson in first_course["lessons"]
            if (match := re.match(r"^(\d+)", Path(lesson["source_file"]).name))
        ]
        self.assertTrue(all(lesson["access"] == "free" for number, lesson in numbered if 1 <= number <= 5))
        self.assertTrue(all(lesson["access"] == "registered" for number, lesson in numbered if 6 <= number <= 10))
        for track in content.TRACKS:
            if track["id"] == foundations.TRACK_ID:
                continue
            for lesson in track["lessons"]:
                expected_access = "free" if Path(lesson["source_file"]).name == "План обучения.md" else "subscription"
                self.assertEqual(expected_access, lesson["access"], (track["id"], lesson["source_file"]))

    def test_course_and_blocks_use_normal_python_package_names(self):
        self.assertEqual("learning.course_content.planner_api", planner_api.__name__)
        root = content.COURSE_ROOT / "planner_api"
        self.assertFalse((content.COURSE_ROOT / "practice").exists())
        for directory in root.iterdir():
            if directory.is_dir():
                self.assertTrue(directory.name.isidentifier(), directory.name)
        self.assertEqual(planner_api.TRACK_ID, content._load_track_meta(root)["id"])

    def test_old_exports_reference_new_catalogs(self):
        self.assertIs(rich_practice.PLANNER_API_PRACTICE, planner_api.MANUAL_PRACTICE)
        self.assertIs(rich_practice.PLANNER_API_OVERVIEW_PRACTICE, planner_api.OVERVIEW_PRACTICE)
        self.assertIs(rich_code_tasks.PLANNER_API_CODE_TASKS, planner_api.CODE_TASKS)
        self.assertEqual(rich_practice.PLANNER_API_TRACK, planner_api.TRACK_ID)
        self.assertEqual((planner_api.TRACK_ID,), planner_api.TRACK_ALIASES)

    def test_each_block_retains_its_entries_and_list_identity(self):
        for block, first, last in (
            (block_09, 45, 50), (block_10, 51, 56),
            (block_11, 57, 62), (block_12, 63, 68),
        ):
            validate_block(first, last, block.MANUAL_PRACTICE, block.CODE_TASKS)
            for local, assembled in (
                (block.MANUAL_PRACTICE, planner_api.MANUAL_PRACTICE),
                (block.CODE_TASKS, planner_api.CODE_TASKS),
            ):
                self.assertEqual({key for key in assembled if first <= key <= last}, set(local))
                for number, tasks in local.items():
                    self.assertIs(tasks, assembled[number])
                    getter = (rich_practice.get_manual_practice if local is block.MANUAL_PRACTICE
                              else rich_code_tasks.get_code_tasks)
                    self.assertIs(tasks, getter(planner_api.TRACK_ID, f"{number} - lesson.md"))

    def test_merge_rejects_duplicates_even_for_equal_values(self):
        with self.assertRaisesRegex(ValueError, "45"):
            merge_lesson_maps({45: []}, {45: []})

    def test_range_validation_rejects_wrong_numbers_and_types(self):
        for number in (44, 51, "45", 45.0, True):
            with self.subTest(number=number), self.assertRaises(ValueError):
                validate_block(45, 50, {number: []})

    def test_empty_catalogs_and_separate_modes_are_allowed(self):
        validate_block(45, 50, {}, {})
        validate_block(45, 50, {45: []}, {45: []})
        self.assertEqual({}, merge_lesson_maps({}, {}))

    def test_overviews_and_unknown_keys_keep_old_getter_behavior(self):
        for filename, practice in planner_api.OVERVIEW_PRACTICE.items():
            self.assertIs(practice, rich_practice.get_manual_practice(planner_api.TRACK_ID, filename))
            self.assertEqual([], rich_code_tasks.get_code_tasks(planner_api.TRACK_ID, filename))
        for track, filename in (
            ("unknown", "45 - lesson.md"), (planner_api.TRACK_ID, "unknown.md"),
            (planner_api.TRACK_ID, "999 - lesson.md"),
        ):
            self.assertEqual([], rich_practice.get_manual_practice(track, filename))
            self.assertEqual([], rich_code_tasks.get_code_tasks(track, filename))

    def test_service_packages_with_markdown_do_not_become_courses(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            for directory in ("__pycache__", "sample-course"):
                folder = root / directory
                folder.mkdir()
                (folder / "README-extra.md").write_text("# Example\n", encoding="utf-8")
            with patch.object(content, "COURSE_ROOT", root):
                tracks = content._load_tracks()
            self.assertEqual(["sample-course"], [track["id"] for track in tracks])

    def test_moved_markdown_keeps_lesson_ids_and_module_labels(self):
        track = content.find_track(planner_api.TRACK_ID)
        self.assertIsNotNone(track)
        self.assertEqual(26, len(track["lessons"]))
        for lesson in track["lessons"]:
            source = lesson["source_file"]
            filename = Path(source).name
            old_source = f"{planner_api.TRACK_ID}/{filename}"
            expected_id = "lesson-" + hashlib.sha256(old_source.encode("utf-8")).hexdigest()[:24]
            with self.subTest(filename=filename):
                self.assertEqual(3, len(Path(source).parts))
                self.assertTrue((content.COURSE_ROOT / source).is_file())
                self.assertEqual(old_source, content._lesson_identity_source(source))
                self.assertEqual(expected_id, lesson["id"])
                self.assertEqual(expected_id, content._stable_lesson_id(old_source))
                self.assertEqual(content.PLANNER_API_MODULE_LABELS[filename], lesson["module"])
                self.assertIs(lesson, content.find_lesson(expected_id))
                self.assertIs(lesson, content.find_lesson(lesson["legacy_id"]))

    def test_source_aliases_do_not_collapse_unrelated_paths(self):
        self.assertEqual("another/45 - example.md", content._lesson_identity_source("another/45 - example.md"))
        unexpected = f"{planner_api.TRACK_ID}/Other/45 - new topic.md"
        self.assertEqual(unexpected, content._lesson_identity_source(unexpected))

    def test_relative_markdown_images_still_resolve_after_move(self):
        for lesson in content.find_track(planner_api.TRACK_ID)["lessons"]:
            path = content.COURSE_ROOT / lesson["source_file"]
            for target in re.findall(r"!\[[^\]]*\]\(([^)]+)\)", path.read_text(encoding="utf-8-sig")):
                if target.startswith(("https://", "http://", "/")):
                    continue
                with self.subTest(lesson=path.name, image=target):
                    self.assertTrue((path.parent / target).resolve().is_file())

    def test_editor_still_has_priority_over_manual_practice(self):
        track_dir = content.COURSE_ROOT / "planner_api"
        path = next(track_dir.rglob("45 - *.md"))
        task = {"title": "Example", "prompt": "Example", "tests": []}
        with patch.object(content, "get_code_tasks", return_value=[task]), \
                patch.object(content, "get_manual_practice", side_effect=AssertionError("must be skipped")):
            lesson = content._build_lesson(path, 2, 26, planner_api.TRACK_ID, track_dir)
        self.assertEqual([], lesson["manual_practice"])
        self.assertEqual(1, len(lesson["tasks"]))

    def test_public_code_tasks_do_not_expose_tests_or_reference_solutions(self):
        for lesson in content.get_public_lessons(planner_api.TRACK_ID):
            for task in lesson["tasks"]:
                self.assertNotIn("tests", task)
                self.assertNotIn("reference_code", task)
                self.assertIsNotNone(content.find_task(task["id"]))

    def test_all_moved_reference_solutions_pass_and_bad_code_fails(self):
        for number, tasks in planner_api.CODE_TASKS.items():
            for index, task in enumerate(tasks):
                with self.subTest(lesson=number, task=index):
                    result = run_python_task(task["reference_code"], task)
                    self.assertTrue(result["ok"], result)
                    bad_result = run_python_task('raise ValueError("wrong solution")', task)
                    self.assertFalse(bad_result["ok"], bad_result)


class PracticeMigrationAPITests(unittest.TestCase):
    def setUp(self):
        app = FastAPI()
        app.include_router(routers.learning_router, prefix="/learning")
        app.dependency_overrides[routers.get_db] = lambda: None
        self.app = app
        self.track = content.find_track(planner_api.TRACK_ID)

    def test_first_course_keeps_free_overview_and_first_block(self):
        with patch.object(routers, "get_optional_user", AsyncMock(return_value=None)):
            status, response = self.request(
                "/learning/lessons", params={"track": foundations.TRACK_ID}
            )
        self.assertEqual(200, status)
        available = {
            lesson["source_file"]
            for lesson in response["lessons"]
            if lesson["is_available"]
        }
        expected = {
            lesson["source_file"]
            for lesson in content.find_track(foundations.TRACK_ID)["lessons"]
            if Path(lesson["source_file"]).name in {"План обучения.md", "Теория месяца.md"}
            or (match := re.match(r"^(\d+)", Path(lesson["source_file"]).name))
            and 1 <= int(match.group(1)) <= 5
        }
        self.assertEqual(expected, available)

    def request(self, path, params=None):
        """Exercise the ASGI routes without a live DB or extra client dependency."""
        async def run():
            messages = []

            async def receive():
                return {"type": "http.request", "body": b"", "more_body": False}

            async def send(message):
                messages.append(message)

            await self.app({
                "type": "http", "asgi": {"version": "3.0", "spec_version": "2.4"},
                "http_version": "1.1", "method": "GET", "scheme": "http",
                "path": path, "raw_path": path.encode("utf-8"), "root_path": "",
                "query_string": urlencode(params or {}).encode("utf-8"), "headers": [],
                "server": ("testserver", 80), "client": ("127.0.0.1", 12345),
            }, receive, send)
            status = next(item["status"] for item in messages if item["type"] == "http.response.start")
            body = b"".join(item.get("body", b"") for item in messages if item["type"] == "http.response.body")
            return status, json.loads(body)

        return asyncio.run(run())

    def test_api_returns_all_blocks_and_preserves_subscription_checks(self):
        user = SimpleNamespace(id=1, subscription_until=datetime.now(timezone.utc) + timedelta(days=1))
        with patch.object(routers, "get_optional_user", AsyncMock(return_value=user)), \
                patch.object(routers.user_crud, "get_completed_lesson_ids", return_value=set()):
            status, response = self.request("/learning/lessons", params={"track": planner_api.TRACK_ID})
        self.assertEqual(200, status)
        lessons = response["lessons"]
        self.assertEqual(26, len(lessons))
        self.assertTrue(all(lesson["is_available"] for lesson in lessons))
        for actual, original in zip(lessons, self.track["lessons"]):
            self.assertEqual(original["id"], actual["id"])
            self.assertEqual(original["manual_practice"], actual["manual_practice"])
            for task in actual["tasks"]:
                self.assertNotIn("tests", task)
                self.assertNotIn("reference_code", task)
        with patch.object(routers, "get_optional_user", AsyncMock(return_value=None)):
            status, guest = self.request("/learning/lessons", params={"track": planner_api.TRACK_ID})
        self.assertEqual(200, status)
        self.assertEqual(["Карта обучения"], [lesson["title"] for lesson in guest["lessons"]
                                              if lesson["is_available"]])
        for lesson in guest["lessons"]:
            if not lesson["is_available"]:
                self.assertEqual([], lesson["manual_practice"])
                self.assertEqual([], lesson["tasks"])

    def test_theory_is_available_by_preserved_id_and_forbidden_to_guest(self):
        lesson = next(lesson for lesson in self.track["lessons"] if Path(lesson["source_file"]).name.startswith("45 - "))
        user = SimpleNamespace(id=1, subscription_until=datetime.now(timezone.utc) + timedelta(days=1))
        endpoint = f"/learning/lessons/{lesson['id']}/theory"
        with patch.object(routers, "get_optional_user", AsyncMock(return_value=user)):
            status, response = self.request(endpoint)
        self.assertEqual(200, status)
        self.assertEqual(lesson["theory_markdown"], response["theory_markdown"])
        with patch.object(routers, "get_optional_user", AsyncMock(return_value=None)):
            self.assertEqual(403, self.request(endpoint)[0])


if __name__ == "__main__":
    unittest.main()
