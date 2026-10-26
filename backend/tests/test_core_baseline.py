from __future__ import annotations

import asyncio
import json
import os
import re
from datetime import datetime, timedelta, timezone
from pathlib import Path
import unittest
from unittest.mock import patch

from fastapi import FastAPI
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from content.catalog import find_track, get_tracks_summary
from core.dependencies import get_db
from db import models
from db.engine import Base
from routers.accounts.router import user_router
from routers.courses import service as course_service
from routers.courses.router import learning_router


FAKE_EMAIL = "baseline.student@example.test"
FAKE_PASSWORD = "Baseline-only-Password-42"
TRACK_ID = get_tracks_summary()[1]["id"]
TRACK = find_track(TRACK_ID)
TARGET_LESSON = next(
    lesson for lesson in TRACK["lessons"]
    if lesson.get("source_file", "").startswith("chapter_02/block_05/")
    and lesson.get("tasks") and lesson.get("manual_practice")
)
TARGET_TASK = TARGET_LESSON["tasks"][0]
PRIOR_LESSON = next(lesson for lesson in TRACK["lessons"] if lesson["id"] != TARGET_LESSON["id"])
PRIOR_TASK = next(
    task for lesson in TRACK["lessons"] if lesson["tasks"]
    for task in lesson["tasks"] if task["id"] != TARGET_TASK["id"]
)
OPENAPI_PATHS = (
    "/user/login", "/user/me", "/user/logout",
    "/learning/catalog", "/learning/lessons/{lesson_id}",
    "/learning/lessons/{lesson_id}/manual-practice/{exercise_index}/tasks/{task_index}/answer",
    "/learning/lessons/{lesson_id}/complete", "/learning/tasks/{task_id}/submit",
)


def _relevant_openapi(schema: dict) -> dict:
    return {
        "openapi": schema["openapi"],
        "info": schema["info"],
        "paths": {path: schema["paths"][path] for path in OPENAPI_PATHS},
        "components": {"schemas": schema["components"]["schemas"]},
    }


def _response_fixture(status: int, headers: dict[str, str], body, *, catalog=False) -> dict:
    safe_headers = {"content-type": headers.get("content-type", "")}
    if "set-cookie" in headers:
        cookie = re.sub(
            r"(?i)(session=)[^;]*", r"\1<session-token>", headers["set-cookie"]
        )
        safe_headers["set-cookie"] = re.sub(r"(?i)(expires=)[^;]*", r"\1<expiry>", cookie)
    if catalog:
        body = {
            "default_track": body["default_track"],
            "content_revision": body["content_revision"],
            "track": next(track for track in body["tracks"] if track["id"] == TRACK_ID),
            "lessons": body["courses"][TRACK_ID],
        }
    else:
        body = json.loads(json.dumps(body))
    if isinstance(body, dict) and "user" in body:
        body["user"]["id"] = "<synthetic-user-id>"
        if body["user"].get("subscription_until") is not None:
            body["user"]["subscription_until"] = "<utc-iso8601>"
    return {"status": status, "headers": safe_headers, "body": body}


def _local_answer_code() -> str:
    expected = TARGET_TASK["tests"][0]["expected"]
    notice, question = expected[0].split(":", 1)[0], expected[1].split(":", 1)[0]
    return (
        "def solve(first_message, second_message):\n"
        "    def make_labeler(prefix):\n"
        "        def label(message):\n"
        "            return f'{prefix}: {message}'\n"
        "        return label\n"
        f"    notice = make_labeler({notice!r})\n"
        f"    question = make_labeler({question!r})\n"
        "    return [notice(first_message), question(second_message), notice(second_message)]\n"
    )


async def _request(app, method: str, path: str, *, payload=None, cookie: str | None = None):
    body = json.dumps(payload).encode("utf-8") if payload is not None else b""
    headers = [(b"content-length", str(len(body)).encode())]
    if payload is not None:
        headers.append((b"content-type", b"application/json"))
    if cookie:
        headers.append((b"cookie", cookie.encode("latin-1")))
    messages = []
    delivered = False

    async def receive():
        nonlocal delivered
        if delivered:
            return {"type": "http.disconnect"}
        delivered = True
        return {"type": "http.request", "body": body, "more_body": False}

    async def send(message):
        messages.append(message)

    await app(
        {"type": "http", "asgi": {"version": "3.0", "spec_version": "2.4"},
         "http_version": "1.1", "method": method, "scheme": "http", "path": path,
         "raw_path": path.encode(), "root_path": "", "query_string": b"", "headers": headers,
         "server": ("testserver", 80), "client": ("127.0.0.1", 12345)},
        receive, send,
    )
    start = next(item for item in messages if item["type"] == "http.response.start")
    response_body = b"".join(
        item.get("body", b"") for item in messages if item["type"] == "http.response.body"
    )
    response_headers = {key.decode().lower(): value.decode("latin-1") for key, value in start["headers"]}
    return start["status"], response_headers, json.loads(response_body) if response_body else None


class CoreBaselineTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        legacy_runner = patch.dict("os.environ", {"PYMENTOR_PUBLIC_RUNNER_ENABLED": "1"})
        legacy_runner.start()
        self.addCleanup(legacy_runner.stop)
        self.engine = create_engine(
            "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
        )
        Base.metadata.create_all(self.engine)
        self.sessions = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        fixed_progress_at = datetime(2026, 1, 2, 3, 4, 5, tzinfo=timezone.utc)
        with self.sessions() as db:
            user = models.User(
                username="Synthetic Baseline Student",
                email=FAKE_EMAIL,
                password=FAKE_PASSWORD,
                subscription_until=datetime.now(timezone.utc) + timedelta(days=30),
                subscription_plan="pro",
            )
            db.add(user)
            db.flush()
            db.add(models.UserLessonProgress(
                user_id=user.id, lesson_id=PRIOR_LESSON["id"], completed_at=fixed_progress_at
            ))
            db.add(models.UserTaskProgress(
                user_id=user.id, task_id=PRIOR_TASK["id"],
                task_revision=PRIOR_TASK["revision"], completed_at=fixed_progress_at,
            ))
            db.commit()
            self.synthetic_user_id = user.id

        def override_get_db():
            with self.sessions() as db:
                yield db

        app = FastAPI()
        app.include_router(user_router, prefix="/user")
        app.include_router(learning_router, prefix="/learning")
        app.dependency_overrides[get_db] = override_get_db
        self.app = app
        self.session_patch = patch.object(course_service, "SessionLocal", self.sessions)
        self.session_patch.start()

    def tearDown(self):
        self.session_patch.stop()
        self.engine.dispose()

    async def test_openapi_auth_catalog_manual_code_progress(self):
        sessions, synthetic_user_id = self.sessions, self.synthetic_user_id
        response_fixtures = {}

        def record(name, status, headers, body, *, catalog=False):
            response_fixtures[name] = _response_fixture(status, headers, body, catalog=catalog)

        status, _, schema = await _request(self.app, "GET", "/openapi.json")
        self.assertEqual(status, 200)
        paths = schema["paths"]
        fixture_path = Path(__file__).resolve().parents[2] / "docs" / "core-baseline-openapi.json"
        expected_openapi = json.loads(fixture_path.read_text(encoding="utf-8"))
        self.assertEqual(_relevant_openapi(schema), expected_openapi)
        self.assertFalse(any("attempt" in table.lower() for table in Base.metadata.tables))
        self.assertIn("/user/login", paths)
        self.assertIn("/user/logout", paths)
        self.assertNotIn("/user/refresh", paths)
        self.assertIn("/learning/catalog", paths)
        self.assertIn("/learning/lessons/{lesson_id}", paths)
        self.assertIn("/learning/lessons/{lesson_id}/manual-practice/{exercise_index}/tasks/{task_index}/answer", paths)
        self.assertIn("/learning/tasks/{task_id}/submit", paths)

        status, headers, unauthorized = await _request(self.app, "GET", "/user/me")
        record("unauthorized_me", status, headers, unauthorized)
        self.assertEqual(status, 401)
        self.assertEqual(unauthorized, {"detail": "No session token found"})

        status, login_headers, login = await _request(
            self.app, "POST", "/user/login", payload={"email": FAKE_EMAIL, "password": FAKE_PASSWORD}
        )
        self.assertEqual(status, 200)
        self.assertEqual(login["message"], "Login successful")
        self.assertEqual(login["user"]["id"], synthetic_user_id)
        self.assertIsNotNone(login["user"]["subscription_until"])
        self.assertRegex(login["user"]["subscription_until"], r"\+00:00$")
        cookie = login_headers["set-cookie"].lower()
        self.assertTrue("session=" in cookie and "httponly" in cookie and "samesite=lax" in cookie)
        record("login", status, login_headers, login)
        session_cookie = cookie.split(";", 1)[0]

        stale_revision = "0" * 64 if TARGET_TASK["revision"] != "0" * 64 else "1" * 64
        status, headers, stale_response = await _request(
            self.app, "POST", f"/learning/tasks/{TARGET_TASK['id']}/submit",
            payload={"code": _local_answer_code(), "task_revision": stale_revision},
            cookie=session_cookie,
        )
        record("stale_revision_error", status, headers, stale_response)
        self.assertEqual(status, 409)

        status, headers, catalog = await _request(self.app, "GET", "/learning/catalog", cookie=session_cookie)
        record("catalog_before", status, headers, catalog, catalog=True)
        self.assertEqual(status, 200)
        self.assertIn(TRACK_ID, catalog["courses"])
        listed = next(item for item in catalog["courses"][TRACK_ID] if item["id"] == TARGET_LESSON["id"])
        self.assertIs(listed["is_available"], True)
        self.assertIs(listed["completed"], False)

        status, headers, material = await _request(self.app, "GET", f"/learning/lessons/{TARGET_LESSON['id']}", cookie=session_cookie)
        record("lesson", status, headers, material)
        self.assertEqual(status, 200)
        self.assertEqual(material["lesson"]["id"], TARGET_LESSON["id"])
        self.assertEqual(len(material["lesson"]["manual_practice"]), 1)

        status, headers, answer = await _request(
            self.app, "GET", f"/learning/lessons/{TARGET_LESSON['id']}/manual-practice/0/tasks/0/answer",
            cookie=session_cookie,
        )
        record("manual_practice_answer", status, headers, answer)
        self.assertEqual(status, 200)
        self.assertEqual(set(answer), {"answer"})
        self.assertTrue({"explanation", "steps"}.issubset(answer["answer"]))

        local_code = _local_answer_code()
        self.assertNotRegex(local_code, r"\b(import|open|exec|eval|__import__)\b")
        status, headers, submission = await _request(
            self.app, "POST", f"/learning/tasks/{TARGET_TASK['id']}/submit",
            payload={"code": local_code, "task_revision": TARGET_TASK["revision"]},
            cookie=session_cookie,
        )
        record("code_submit", status, headers, submission)
        self.assertEqual(status, 200)
        self.assertIs(submission["ok"], True, submission)
        self.assertEqual(submission["score"], 100)

        # Mixed manual+editor practice requires the explicit completion action after practice.
        status, headers, completion = await _request(
            self.app, "POST", f"/learning/lessons/{TARGET_LESSON['id']}/complete",
            cookie=session_cookie,
        )
        record("complete_lesson", status, headers, completion)
        self.assertEqual(status, 200)
        self.assertEqual(completion, {"lesson_id": TARGET_LESSON["id"], "completed": True})
        status, headers, after = await _request(self.app, "GET", "/learning/catalog", cookie=session_cookie)
        record("catalog_after", status, headers, after, catalog=True)
        listed_after = next(item for item in after["courses"][TRACK_ID] if item["id"] == TARGET_LESSON["id"])
        self.assertIs(listed_after["completed"], True)
        with sessions() as db:
            self.assertEqual(db.query(models.UserLessonProgress).filter_by(user_id=synthetic_user_id).count(), 2)
            self.assertEqual(db.query(models.UserTaskProgress).filter_by(user_id=synthetic_user_id).count(), 1)
            self.assertEqual(db.query(models.UserTaskProgress).filter_by(user_id=synthetic_user_id, task_id=TARGET_TASK["id"]).count(), 0)
            completed_at = db.query(models.UserLessonProgress.completed_at).filter_by(
                user_id=synthetic_user_id, lesson_id=PRIOR_LESSON["id"]
            ).one()[0]
            self.assertEqual(completed_at.replace(tzinfo=timezone.utc), datetime(2026, 1, 2, 3, 4, 5, tzinfo=timezone.utc))

        status, logout_headers, logout = await _request(self.app, "POST", "/user/logout", cookie=session_cookie)
        record("logout", status, logout_headers, logout)
        self.assertEqual(status, 200)
        self.assertEqual(logout, {"message": "Logout successful"})
        self.assertIn('session=""', logout_headers["set-cookie"].lower())
        status, headers, after_logout = await _request(self.app, "GET", "/user/me", cookie=session_cookie)
        record("unauthorized_after_logout", status, headers, after_logout)
        self.assertEqual(status, 401)

        response_fixture_path = Path(__file__).resolve().parents[2] / "docs" / "core-baseline-responses.json"
        if os.getenv("PYMENTOR_CAPTURE_CORE_FIXTURES") == "1":
            response_fixture_path.write_text(
                json.dumps(response_fixtures, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
                encoding="utf-8",
            )
        else:
            expected_responses = json.loads(response_fixture_path.read_text(encoding="utf-8"))
            self.assertEqual(response_fixtures, expected_responses)
