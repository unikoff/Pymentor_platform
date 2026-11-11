from __future__ import annotations

import json
import os
import unittest
from copy import deepcopy
from unittest.mock import patch

from fastapi import FastAPI
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import sessionmaker

from pymentor_core.adapters.course_local.catalog import find_track as catalog_find_track
from pymentor_core.adapters.course_local.catalog import get_tracks_summary as catalog_get_tracks_summary
from pymentor_core.adapters.sql import models
from pymentor_core.app.database import Base
from pymentor_core.adapters.sql import administration as admin_service
from pymentor_core.modules.learning.api import service
from pymentor_core.modules.learning.api.router import learning_router


REVISION_A = "a" * 64
REVISION_B = "b" * 64
REVISION_B2 = "c" * 64
TASK_A = {"id": "chapter01-task-a", "revision": REVISION_A, "mode": "solve", "title": "A", "tests": []}
TASK_B = {"id": "chapter01-task-b", "revision": REVISION_B, "mode": "solve", "title": "B", "tests": []}


async def asgi_request(app, path: str, *, method: str = "GET", cookie: bool = False, body: dict | None = None):
    messages = []
    raw_body = json.dumps(body or {}).encode("utf-8")

    async def receive():
        return {"type": "http.request", "body": raw_body, "more_body": False}

    async def send(message):
        messages.append(message)

    headers = [(b"content-type", b"application/json")]
    if cookie:
        headers.append((b"cookie", b"session=chapter01-completion-test"))
    await app(
        {
            "type": "http",
            "asgi": {"version": "3.0", "spec_version": "2.4"},
            "http_version": "1.1",
            "method": method,
            "scheme": "http",
            "path": path,
            "raw_path": path.encode("utf-8"),
            "root_path": "",
            "query_string": b"",
            "headers": headers,
            "server": ("testserver", 80),
            "client": ("127.0.0.1", 12345),
        },
        receive,
        send,
    )
    start = next(message for message in messages if message["type"] == "http.response.start")
    response_body = b"".join(
        message.get("body", b"") for message in messages if message["type"] == "http.response.body"
    )
    return start["status"], json.loads(response_body), dict(start["headers"])


class FixedResultExecutor:
    """Return fixtures directly; never invoke the supplied runner or student code."""

    async def run(self, function, *, code: str, task: dict):
        if code == "success":
            return {"ok": True, "score": 100, "tests": [{"name": "fixed", "passed": True}]}
        if code == "failure":
            return {
                "ok": False,
                "score": 0,
                "tests": [{"name": "fixed", "passed": False, "expected": 1, "actual": 2}],
            }
        raise AssertionError("test fixture requested an unknown fixed result")


class ChapterOneCompletionTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        Base.metadata.create_all(self.engine)
        self.sessions = sessionmaker(bind=self.engine)
        with self.sessions() as db:
            user = models.User(username="completion-test", email="completion@example.test", password="$2b$test")
            db.add(user)
            db.flush()
            self.user_id = user.id
            db.add(models.Session(user_id=user.id, session_token="chapter01-completion-test"))
            db.commit()

        self.tasks = {TASK_A["id"]: deepcopy(TASK_A), TASK_B["id"]: deepcopy(TASK_B)}
        self.lesson = {
            "id": "chapter01-lesson-test",
            "module": "Chapter 01",
            "title": "Completion test",
            "access": "free",
            "source_file": "chapter_01/block_01/completion-test.md",
            "tasks": [self.tasks[TASK_A["id"]], self.tasks[TASK_B["id"]]],
            "manual_practice": [],
            "self_check": {"questions": ["fixed check"]},
        }
        self.track_id = "test-track"
        self.track = {"id": self.track_id, "lessons": [self.lesson]}
        self.executor = FixedResultExecutor()
        self.app = FastAPI()
        self.app.include_router(learning_router, prefix="/learning")

        def get_summary():
            return [{"id": self.track_id, "countable_lesson_ids": [self.lesson["id"]]}]

        self.patches = [
            patch.dict(os.environ, {service.RUNNER_ENABLED_ENV: "1"}),
            patch.object(service, "SessionLocal", self.sessions),
            patch('pymentor_core.app.dependencies.SessionLocal', self.sessions),
            patch.object(service, "find_task", side_effect=lambda task_id: self.tasks.get(task_id)),
            patch.object(service, "find_lesson_by_task", side_effect=lambda _task_id: self.lesson),
            patch.object(service, "find_lesson", side_effect=lambda lesson_id: self.lesson if lesson_id == self.lesson["id"] else None),
            patch.object(service, "get_runner_executor", return_value=self.executor),
            patch.object(service, "get_tracks_summary", side_effect=get_summary),
            patch.object(service, "find_track", side_effect=lambda track_id: self.track if track_id == self.track_id else None),
            patch.object(service, "default_track_id", return_value=self.track_id),
        ]
        for item in self.patches:
            item.start()

    def tearDown(self):
        for item in reversed(self.patches):
            item.stop()
        self.engine.dispose()

    async def submit(self, task_id: str, revision: str, result: str = "success"):
        return await asgi_request(
            self.app,
            f"/learning/tasks/{task_id}/submit",
            method="POST",
            cookie=True,
            body={"code": result, "task_revision": revision},
        )

    async def catalog_lesson(self):
        status, data, _ = await asgi_request(self.app, "/learning/catalog", cookie=True)
        self.assertEqual(200, status)
        return data["courses"][self.track_id][0]

    def admin_lesson(self):
        with patch.object(
            admin_service,
            "get_tracks_summary",
            side_effect=lambda: [{"id": self.track_id, "title": "Test track"}],
        ), patch.object(
            admin_service,
            "find_track",
            side_effect=lambda track_id: self.track if track_id == self.track_id else None,
        ):
            with self.sessions() as db:
                tracks, _ = admin_service._build_learning_progress(self.user_id, db)
        return tracks[0]["modules"][0]["lessons"][0]

    def progress_rows(self):
        with self.sessions() as db:
            task_rows = db.query(models.UserTaskProgress).filter_by(user_id=self.user_id).all()
            lesson_rows = db.query(models.UserLessonProgress).filter_by(user_id=self.user_id).all()
            return task_rows, lesson_rows

    async def test_overview_is_complete_immediately_in_catalog_and_admin(self):
        self.lesson.update(
            module="00 Обзор", source_file="chapter_01/block_00/План обучения.md",
            tasks=[], manual_practice=[], self_check=False,
        )
        for cookie in (False, True):
            status, data, _ = await asgi_request(self.app, "/learning/catalog", cookie=cookie)
            self.assertEqual(200, status)
            self.assertTrue(data["courses"][self.track_id][0]["completed"])
            track = data["tracks"][0]
            self.assertEqual(1, track["lessons_completed"])
            self.assertEqual((1, 1), (track["blocks"][0]["completed"], track["blocks"][0]["total"]))
            status, data, _ = await asgi_request(self.app, "/learning/tracks", cookie=cookie)
            self.assertEqual(200, status)
            self.assertEqual(1, data["tracks"][0]["lessons_completed"])
            with patch.object(service, "get_public_lessons", return_value=[deepcopy(self.lesson)]):
                status, data, _ = await asgi_request(self.app, "/learning/lessons", cookie=cookie)
            self.assertEqual(200, status)
            self.assertTrue(data["lessons"][0]["completed"])
        with patch.object(admin_service, "get_tracks_summary", return_value=[{"id": self.track_id, "title": "Test"}]), patch.object(admin_service, "find_track", return_value=self.track):
            with self.sessions() as db:
                tracks, count = admin_service._build_learning_progress(self.user_id, db)
        module = tracks[0]["modules"][0]
        self.assertEqual((1, 1, 1), (module["completed"], module["total"], count))
        self.assertTrue(module["lessons"][0]["completed"])
        self.assertTrue(module["lessons"][0]["countable"])
        self.assertEqual(([], []), self.progress_rows())

    def test_all_chapter_overviews_are_counted_without_counting_other_empty_lessons(self):
        for summary in catalog_get_tracks_summary():
            lessons = catalog_find_track(summary["id"])["lessons"]
            overviews = [lesson for lesson in lessons if "/block_00/" in lesson["source_file"]]
            self.assertTrue(overviews)
            for lesson in overviews:
                self.assertIn(lesson["id"], summary["countable_lesson_ids"])
                self.assertTrue(service._lesson_completion_status(lesson, set(), {}))
            for lesson in lessons:
                if "/block_00/" not in lesson["source_file"] and not lesson["tasks"] and not lesson.get("self_check"):
                    self.assertNotIn(lesson["id"], summary["countable_lesson_ids"])

    async def test_partial_repeat_all_current_revision_and_serialized_response(self):
        status, response, _ = await self.submit(TASK_A["id"], REVISION_A)
        self.assertEqual(200, status)
        self.assertEqual({"ok", "score", "tests", "stdout", "stderr", "error", "traceback"}, set(response))
        self.assertTrue(response["ok"])
        self.assertEqual(100, response["score"])
        self.assertEqual(
            [{"name": "Проверка 1", "passed": True, "expected": None, "actual": None, "error": None}],
            response["tests"],
        )
        self.assertFalse((await self.catalog_lesson())["completed"])
        self.assertFalse(self.admin_lesson()["completed"])
        task_rows, lesson_rows = self.progress_rows()
        self.assertEqual(1, len(task_rows))
        self.assertEqual([], lesson_rows)
        status, response, _ = await asgi_request(
            self.app,
            f"/learning/lessons/{self.lesson['id']}/complete",
            method="POST",
            cookie=True,
        )
        self.assertEqual(400, status)
        self.assertFalse(response.get("completed", False))

        # Repeating a successful card is idempotent and still does not finish the lesson.
        self.assertEqual(200, (await self.submit(TASK_A["id"], REVISION_A))[0])
        task_rows, lesson_rows = self.progress_rows()
        self.assertEqual(1, len(task_rows))
        self.assertEqual([], lesson_rows)

        status, response, _ = await self.submit(TASK_B["id"], REVISION_B)
        self.assertEqual(200, status)
        self.assertTrue(response["ok"])
        self.assertTrue((await self.catalog_lesson())["completed"])
        self.assertTrue(self.admin_lesson()["completed"])
        task_rows, lesson_rows = self.progress_rows()
        self.assertEqual(2, len(task_rows))
        self.assertEqual([], lesson_rows)

    def test_optional_mapping_targets_only_card_05_of_lesson_11(self):
        lesson = next(
            lesson
            for summary in catalog_get_tracks_summary()
            for lesson in catalog_find_track(summary["id"])["lessons"]
            if lesson.get("source_file", "").startswith("chapter_01/block_01/01.1 - ")
        )
        self.assertEqual(5, len(lesson["tasks"]))
        self.assertEqual("lesson-b504d05e6763add4db882bfe-task-05", lesson["tasks"][4]["id"])
        self.assertTrue(all(service.progress.is_task_required(task) for task in lesson["tasks"][:4]))
        self.assertFalse(service.progress.is_task_required(lesson["tasks"][4]))
        self.assertTrue(service.progress.is_task_required({"id": "chapter02-task"}))

    async def test_optional_card_does_not_block_or_revoke_chapter_one_completion(self):
        lesson_id = "lesson-b504d05e6763add4db882bfe"
        required_tasks = [
            {"id": f"{lesson_id}-task-0{number}", "revision": str(number) * 64,
             "mode": "solve", "title": f"Required {number}", "tests": []}
            for number in range(1, 5)
        ]
        optional_task = {
            "id": f"{lesson_id}-task-05", "revision": "5" * 64,
            "mode": "solve", "title": "Optional retry", "tests": [],
        }
        self.tasks = {task["id"]: task for task in [*required_tasks, optional_task]}
        self.lesson.update(
            id=lesson_id,
            source_file="chapter_01/block_01/01.1 - variables.md",
            tasks=[*required_tasks, optional_task],
        )

        for task in required_tasks:
            self.assertEqual(200, (await self.submit(task["id"], task["revision"]))[0])
        self.assertTrue((await self.catalog_lesson())["completed"])
        self.assertTrue(self.admin_lesson()["completed"])

        status, response, _ = await asgi_request(
            self.app,
            f"/learning/lessons/{self.lesson['id']}/complete",
            method="POST",
            cookie=True,
        )
        self.assertEqual(200, status)
        self.assertTrue(response["completed"])

        # Submitting or repeating the optional card leaves required completion intact.
        self.assertEqual(200, (await self.submit(optional_task["id"], optional_task["revision"]))[0])
        self.assertEqual(200, (await self.submit(optional_task["id"], optional_task["revision"]))[0])
        self.assertTrue((await self.catalog_lesson())["completed"])
        self.assertTrue(self.admin_lesson()["completed"])
        task_rows, lesson_rows = self.progress_rows()
        self.assertEqual(5, len(task_rows))
        self.assertEqual([], lesson_rows)

    async def test_failed_submit_does_not_advance_task_progress(self):
        status, response, _ = await self.submit(TASK_A["id"], REVISION_A, "failure")
        self.assertEqual(200, status)
        self.assertFalse(response["ok"])
        self.assertFalse((await self.catalog_lesson())["completed"])
        task_rows, lesson_rows = self.progress_rows()
        self.assertEqual([], task_rows)
        self.assertEqual([], lesson_rows)

    async def test_stale_task_revision_does_not_complete_after_definition_changes(self):
        await self.submit(TASK_A["id"], REVISION_A)
        await self.submit(TASK_B["id"], REVISION_B)
        self.assertTrue((await self.catalog_lesson())["completed"])

        self.tasks[TASK_B["id"]]["revision"] = REVISION_B2
        self.assertFalse((await self.catalog_lesson())["completed"])
        status, response, _ = await self.submit(TASK_B["id"], REVISION_B)
        self.assertEqual(409, status)
        self.assertIn("detail", response)
        task_rows, _ = self.progress_rows()
        self.assertEqual(2, len(task_rows))
        self.assertEqual(200, (await self.submit(TASK_B["id"], REVISION_B2))[0])
        self.assertTrue((await self.catalog_lesson())["completed"])

    async def test_mixed_lesson_needs_all_tasks_and_current_self_check(self):
        self.lesson["manual_practice"] = [{"title": "fixed manual item"}]
        await self.submit(TASK_A["id"], REVISION_A)
        self.assertFalse((await self.catalog_lesson())["completed"])
        await self.submit(TASK_B["id"], REVISION_B)
        self.assertFalse((await self.catalog_lesson())["completed"])

        status, response, _ = await asgi_request(
            self.app,
            f"/learning/lessons/{self.lesson['id']}/complete",
            method="POST",
            cookie=True,
        )
        self.assertEqual(200, status)
        self.assertTrue(response["completed"])
        self.assertTrue((await self.catalog_lesson())["completed"])
        task_rows, lesson_rows = self.progress_rows()
        self.assertEqual(3, len(task_rows))  # two cards plus the private self-check key
        self.assertEqual([], lesson_rows)

        self.lesson["self_check"] = {"questions": ["revised check"]}
        self.assertFalse((await self.catalog_lesson())["completed"])

    async def test_legacy_lesson_marker_stays_visible_without_task_rows(self):
        with self.sessions() as db:
            db.add(models.UserLessonProgress(user_id=self.user_id, lesson_id=self.lesson["id"]))
            db.commit()
        self.assertTrue((await self.catalog_lesson())["completed"])
        task_rows, lesson_rows = self.progress_rows()
        self.assertEqual([], task_rows)
        self.assertEqual(1, len(lesson_rows))

        # Preserve the legacy marker as a grandfathered completion when the
        # learner resumes; existing rows have no data to reclassify safely.
        await self.submit(TASK_A["id"], REVISION_A)
        self.assertTrue((await self.catalog_lesson())["completed"])
        task_rows, lesson_rows = self.progress_rows()
        self.assertEqual(1, len(task_rows))
        self.assertEqual(1, len(lesson_rows))

    async def test_other_chapter_keeps_legacy_single_card_behavior(self):
        self.lesson["source_file"] = "chapter_02/block_05/legacy.md"
        status, response, _ = await self.submit(TASK_A["id"], REVISION_A)
        self.assertEqual(200, status)
        self.assertTrue(response["ok"])
        self.assertTrue((await self.catalog_lesson())["completed"])
        task_rows, lesson_rows = self.progress_rows()
        self.assertEqual([], task_rows)
        self.assertEqual(1, len(lesson_rows))


if __name__ == "__main__":
    unittest.main()
