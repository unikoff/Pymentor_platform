"""ASGI contract coverage for the routes currently called by frontend features."""

from __future__ import annotations

import asyncio
import json as json_module
import os
import re
import types
from datetime import date
from datetime import datetime
from datetime import timedelta
from datetime import timezone
from pathlib import Path
from typing import Any
from typing import Union
from typing import get_args
from typing import get_origin
from uuid import uuid4
from urllib.parse import urlencode
from http.cookies import SimpleCookie

import pytest
from pydantic import BaseModel
from pydantic import TypeAdapter
from pydantic import ValidationError
from sqlalchemy.orm import sessionmaker

from pymentor_core.adapters.course_local.catalog import find_track
from pymentor_core.adapters.course_local.catalog import get_tracks_summary
from pymentor_core.app.dependencies import get_db
from pymentor_core.shared.api_contracts import LegacyErrorResponse
from pymentor_core.adapters.sql import models
from test_c2_1_4_auth_legacy import runtime_db
import test_c2_1_4_auth_legacy as http
app = None
from pymentor_core.modules.identity.api.schemas import ActivityCalendarResponse
from pymentor_core.modules.identity.api.schemas import ActivitySummaryResponse
from pymentor_core.modules.identity.api.schemas import ActivityVisitResponse
from pymentor_core.modules.identity.api.schemas import AuthResponse
from pymentor_core.modules.identity.api.schemas import CurrentUserResponse
from pymentor_core.modules.identity.api.schemas import LogoutResponse
from pymentor_core.modules.administration.api.schemas import AdminAccountsResponse
from pymentor_core.modules.administration.api.schemas import AdminOverviewResponse
from pymentor_core.modules.administration.api.schemas import AdminSlotEnvelope
from pymentor_core.modules.administration.api.schemas import AdminSlotsResponse
from pymentor_core.modules.administration.api.schemas import AdminUserEnvelope
from pymentor_core.modules.administration.api.schemas import DeletedIdResponse
from pymentor_core.modules.administration.api.schemas import StudentProfileEnvelope
from pymentor_core.modules.bookings.api.schemas import StudentSlotEnvelope
from pymentor_core.modules.bookings.api.schemas import StudentSlotsResponse
from pymentor_core.modules.learning.api import service as course_service
from pymentor_core.modules.learning.api.schemas import CodeRunResponse
from pymentor_core.modules.learning.api.schemas import CodeSubmitResponse
from pymentor_core.modules.learning.api.schemas import LearningCatalogResponse
from pymentor_core.modules.learning.api.schemas import LessonCompletionResponse
from pymentor_core.modules.learning.api.schemas import LessonMaterialResponse
from pymentor_core.modules.learning.api.schemas import LessonTheoryResponse
from pymentor_core.modules.learning.api.schemas import LessonsListResponse
from pymentor_core.modules.learning.api.schemas import ManualPracticeAnswerResponse
from pymentor_core.modules.learning.api.schemas import TracksResponse


ADMIN_SESSION_TOKEN = str(uuid4())
STUDENT_EMAIL = "baseline.student@example.test"
STUDENT_PASSWORD = "Baseline-only-Password-42"
STUDENT_USERNAME = "Synthetic Baseline Student"

FRONTEND_OPERATIONS = {
    ("POST", "/api/user/register"),
    ("POST", "/api/user/login"),
    ("GET", "/api/user/me"),
    ("POST", "/api/user/logout"),
    ("POST", "/api/user/activity/visit"),
    ("GET", "/api/user/activity"),
    ("GET", "/api/user/activity/summary"),
    ("GET", "/api/user/slots"),
    ("POST", "/api/user/slots/{slot_id}/book"),
    ("POST", "/api/user/slots/{slot_id}/cancel"),
    ("GET", "/api/admin/users"),
    ("GET", "/api/admin/overview"),
    ("GET", "/api/admin/users/{user_id}/profile"),
    ("PATCH", "/api/admin/users/{user_id}/subscription"),
    ("POST", "/api/admin/users/{user_id}/quota"),
    ("DELETE", "/api/admin/users/{user_id}"),
    ("GET", "/api/admin/slots"),
    ("POST", "/api/admin/slots"),
    ("DELETE", "/api/admin/slots/{slot_id}"),
    ("GET", "/api/learning/tracks"),
    ("GET", "/api/learning/catalog"),
    ("GET", "/api/learning/lessons"),
    ("GET", "/api/learning/lessons/{lesson_id}"),
    ("GET", "/api/learning/lessons/{lesson_id}/theory"),
    ("GET", "/api/learning/lessons/{lesson_id}/manual-practice/{exercise_index}/tasks/{task_index}/answer"),
    ("POST", "/api/learning/lessons/{lesson_id}/complete"),
    ("POST", "/api/learning/tasks/{task_id}/run"),
    ("POST", "/api/learning/interpreter/run"),
    ("POST", "/api/learning/tasks/{task_id}/submit"),
}


@pytest.fixture(autouse=True)
def contract_app(runtime_db):
    global app
    app = http._client.app


@pytest.fixture
def clients(monkeypatch, runtime_db):
    global app
    app = http._client.app
    sessions = runtime_db
    monkeypatch.setattr(course_service, "SessionLocal", sessions)
    monkeypatch.setenv("PYMENTOR_PUBLIC_RUNNER_ENABLED", "1")
    with sessions() as db:
        db.add(models.User(username="Core Contract Admin", email="c2-1-3-admin@example.test",
                           password="Core-contract-admin-password", is_admin=True))
        db.commit()
    admin = RawASGIClient()
    response = admin.post("/api/user/login", json={"email": "c2-1-3-admin@example.test", "password": "Core-contract-admin-password"})
    assert response.status_code == 200
    yield RawASGIClient(), admin, sessions


class RawASGIResponse:
    def __init__(self, status_code: int, headers: dict[str, str], body: Any) -> None:
        self.status_code = status_code
        self.headers = headers
        self._body = body
        parsed_cookies = SimpleCookie()
        parsed_cookies.load(headers.get("set-cookie", ""))
        self.cookies = {name: morsel.value for name, morsel in parsed_cookies.items()}

    def json(self) -> Any:
        return self._body


class RawASGIClient:
    """Small in-process ASGI client; it needs no optional Starlette test extra."""

    def __init__(self, cookies: dict[str, str] | None = None) -> None:
        self.cookies = cookies or {}

    def get(self, path: str, *, params=None, cookies=None):
        return self.request("GET", path, params=params, cookies=cookies)

    def post(self, path: str, *, json=None, params=None, cookies=None):
        return self.request("POST", path, json=json, params=params, cookies=cookies)

    def patch(self, path: str, *, json=None, params=None, cookies=None):
        return self.request("PATCH", path, json=json, params=params, cookies=cookies)

    def delete(self, path: str, *, params=None, cookies=None):
        return self.request("DELETE", path, params=params, cookies=cookies)

    def request(self, method, path, *, json=None, params=None, cookies=None):
        query = urlencode(params or {})
        if query: path += "?" + query
        merged = {**self.cookies, **(cookies or {})}
        headers = {"Cookie": "; ".join(f"{key}={value}" for key, value in merged.items())} if merged else {}
        if path == "/api/user/login": headers["Idempotency-Key"] = str(uuid4())
        reply = http.call(method, path, body=json, headers=headers)
        response = RawASGIResponse(reply.status, dict(reply.headers), reply.data)
        self.cookies.update(response.cookies)
        return response


def _validate(model: type[Any], body: Any) -> None:
    encoded = json_module.dumps(body, ensure_ascii=False)
    TypeAdapter(model).validate_json(encoded, strict=True)
    _assert_documented_fields(model, body)


def _assert_documented_fields(annotation: Any, value: Any) -> None:
    """Reject extra keys in actual response JSON, allowing only declared pass-through DTOs."""
    if value is None:
        return
    if isinstance(annotation, type) and issubclass(annotation, BaseModel):
        if not isinstance(value, dict):
            return
        model_fields = annotation.model_fields
        permits_extra = annotation.model_config.get("extra") == "allow"
        if not permits_extra:
            assert set(value) <= set(model_fields), (
                f"{annotation.__name__} response has undocumented fields: "
                f"{sorted(set(value) - set(model_fields))}"
            )
        for name, model_field in model_fields.items():
            if name in value:
                _assert_documented_fields(model_field.annotation, value[name])
        return

    origin = get_origin(annotation)
    args = get_args(annotation)
    if origin in (Union, types.UnionType):
        for candidate in args:
            if candidate is not type(None):
                _assert_documented_fields(candidate, value)
        return
    if origin in (list, tuple, set, frozenset) and args:
        for item in value:
            _assert_documented_fields(args[0], item)
        return
    if origin is dict and len(args) == 2:
        for item in value.values():
            _assert_documented_fields(args[1], item)


def test_contract_dtos_reject_coercion_and_undocumented_fields_and_allow_null():
    _validate(ActivityVisitResponse, {"activity_date": "2026-11-04", "visited_at": None})
    with pytest.raises(ValidationError):
        _validate(ActivityVisitResponse, {"activity_date": 20261104, "visited_at": None})
    with pytest.raises(ValidationError):
        _validate(ActivityVisitResponse, {
            "activity_date": "2026-11-04",
            "visited_at": None,
            "unexpected": "field",
        })
    with pytest.raises(AssertionError, match="undocumented fields"):
        _validate(CodeRunResponse, {
            "ok": True,
            "stdout": "",
            "unexpected": "field",
        })


def _target_course_case() -> tuple[str, dict[str, Any], dict[str, Any]]:
    track_id = get_tracks_summary()[1]["id"]
    track = find_track(track_id)
    lesson = next(
        lesson
        for lesson in track["lessons"]
        if lesson.get("source_file", "").startswith("chapter_02/block_05/")
        and lesson.get("tasks")
        and lesson.get("manual_practice")
    )
    return track_id, lesson, lesson["tasks"][0]


def _solution_for(task: dict[str, Any]) -> str:
    expected = task["tests"][0]["expected"]
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


def _response_fixture(response, *, catalog: bool = False, track_id: str | None = None) -> dict[str, Any]:
    headers = response.headers
    safe_headers = {"content-type": headers.get("content-type", "")}
    if "set-cookie" in headers:
        cookie = re.sub(r"(?i)(session=)[^;]*", r"\1<session-token>", headers["set-cookie"])
        safe_headers["set-cookie"] = re.sub(r"(?i)(expires=)[^;]*", r"\1<expiry>", cookie)
    body = response.json()
    if catalog:
        assert track_id is not None
        body = {
            "default_track": body["default_track"],
            "content_revision": body["content_revision"],
            "track": next(track for track in body["tracks"] if track["id"] == track_id),
            "lessons": body["courses"][track_id],
        }
    else:
        body = json_module.loads(json_module.dumps(body, ensure_ascii=False))
    if isinstance(body, dict) and "user" in body:
        body["user"]["id"] = "<synthetic-user-id>"
        # Historical fixture predates the additive email verification flag.
        body["user"].pop("verified", None)
        if body["user"].get("subscription_until") is not None:
            body["user"]["subscription_until"] = "<utc-iso8601>"
    return {"status": response.status_code, "headers": safe_headers, "body": body}


def _without_content_revision(response_fixture: dict[str, Any]) -> dict[str, Any]:
    comparable = json_module.loads(json_module.dumps(response_fixture, ensure_ascii=False))
    if isinstance(comparable.get("body"), dict):
        comparable["body"].pop("content_revision", None)
        # These aggregates follow the evolving live curriculum, not the API contract.
        track = comparable["body"].get("track")
        if isinstance(track, dict):
            assert 0 <= track["lessons_completed"] <= track["lessons_countable"]
            track.pop("lessons_completed")
            track.pop("lessons_countable")
            for block in track.get("blocks", []):
                assert 0 <= block["completed"] <= block["total"]
                block.pop("completed")
                block.pop("total")
    return comparable


def test_frontend_route_inventory_and_openapi_compatibility():
    baseline_path = (
        Path(__file__).resolve().parents[4]
        / "docs"
        / "stage-02-core"
        / "c2-1-3-openapi-baseline.json"
    )
    baseline = json_module.loads(baseline_path.read_text(encoding="utf-8"))
    current = app.openapi()

    registered = {
        (method.upper(), path)
        for path, path_item in current["paths"].items()
        for method in path_item
        if method in {"get", "post", "put", "patch", "delete"}
    }
    assert FRONTEND_OPERATIONS <= registered
    assert len(FRONTEND_OPERATIONS) == 29

    for method, path in FRONTEND_OPERATIONS:
        operation = current["paths"][path][method.lower()]
        assert "200" in operation["responses"]
        assert operation["responses"]["200"].get("content", {}).get("application/json", {}).get("schema")

    for path, old_path_item in baseline["paths"].items():
        # The fallback is / when no frontend exists; with a built frontend the
        # same root is served by the SPA catch-all instead (see test_web_fallback).
        if path == "/" and "/{full_path}" in current["paths"]:
            assert (Path(__file__).resolve().parents[4] / "frontend" / "dist" / "index.html").is_file()
            continue
        assert path in current["paths"]
        new_path_item = current["paths"][path]
        for method, old_operation in old_path_item.items():
            if method not in {"get", "post", "put", "patch", "delete"}:
                continue
            new_operation = new_path_item[method]
            assert new_operation["operationId"] == old_operation["operationId"]
            parameters = new_operation.get("parameters", [])
            if method == "post" and path in {"/user/login", "/api/user/login"}:
                retry_headers = [p for p in parameters if p.get("name") == "Idempotency-Key"]
                assert len(retry_headers) == 1
                assert retry_headers[0]["in"] == "header" and retry_headers[0]["required"] is False
                parameters = [p for p in parameters if p.get("name") != "Idempotency-Key"]
            if method == "delete" and path in {"/admin/users/{user_id}", "/api/admin/users/{user_id}"}:
                generation_headers = [p for p in parameters if p.get("name") == "X-Account-Ref"]
                assert len(generation_headers) == 1
                assert generation_headers[0]["in"] == "header" and generation_headers[0]["required"] is False
                parameters = [p for p in parameters if p.get("name") != "X-Account-Ref"]
            assert parameters == old_operation.get("parameters", [])
            assert new_operation.get("requestBody") == old_operation.get("requestBody")
            for status_code, old_response in old_operation.get("responses", {}).items():
                if not status_code.startswith("2"):
                    continue
                old_schema = old_response.get("content", {}).get("application/json", {}).get("schema")
                if old_schema not in (None, {}):
                    new_schema = (
                        new_operation["responses"][status_code]
                        .get("content", {})
                        .get("application/json", {})
                        .get("schema")
                    )
                    assert new_schema == old_schema

    assert not any(path.startswith("/api/v") for path in current["paths"])
    assert "LegacyErrorResponse" in current["components"]["schemas"]
    assert "AuthResponse" in current["components"]["schemas"]
    assert "LearningCatalogResponse" in current["components"]["schemas"]
    for path, method, status_code in (
        ("/api/user/me", "get", "401"),
        ("/api/admin/overview", "get", "403"),
        ("/api/learning/tasks/{task_id}/submit", "post", "409"),
        ("/api/learning/interpreter/run", "post", "503"),
    ):
        error_schema = current["paths"][path][method]["responses"][status_code]["content"]["application/json"]["schema"]
        assert error_schema["$ref"] == "#/components/schemas/LegacyErrorResponse"
    assert "Retry-After" in current["paths"]["/api/learning/interpreter/run"]["post"]["responses"]["503"]["headers"]
    validation_schema = current["paths"]["/api/user/login"]["post"]["responses"]["422"]["content"]["application/json"]["schema"]
    assert validation_schema["$ref"] == "#/components/schemas/HTTPValidationError"


def test_email_actions_have_explicit_success_and_error_contracts():
    schema = app.openapi()
    for suffix in ("email-verification/request", "email-verification/confirm", "password-change/request", "password-reset/confirm"):
        operation = schema["paths"][f"/api/user/{suffix}"]["post"]
        assert operation["responses"]["200"]["content"]["application/json"]["schema"]["$ref"] == "#/components/schemas/EmailActionResponse"
    reset = schema["paths"]["/api/user/password-reset/request"]["post"]
    assert reset["responses"]["202"]["content"]["application/json"]["schema"]["$ref"] == "#/components/schemas/EmailActionResponse"
    assert "400" in schema["paths"]["/api/user/password-reset/confirm"]["post"]["responses"]


def test_all_frontend_operations_asgi_contracts_and_legacy_errors(clients):
    client, admin, sessions = clients
    observed_baseline_responses = {}

    def record(name: str, response, *, catalog: bool = False, track_id: str | None = None) -> None:
        observed_baseline_responses[name] = _response_fixture(
            response,
            catalog=catalog,
            track_id=track_id,
        )

    year_month = date.today().replace(day=1)
    year, month = year_month.year, year_month.month

    response = client.get("/api/user/me")
    assert response.status_code == 401
    assert response.json() == {"detail": "No session token found"}
    _validate(LegacyErrorResponse, response.json())
    record("unauthorized_me", response)

    response = client.post("/api/user/login", json={"email": "bad"})
    assert response.status_code == 422
    assert isinstance(response.json()["detail"], list)
    _validate(LegacyErrorResponse, response.json())

    response = client.post(
        "/api/user/register",
        json={"username": STUDENT_USERNAME, "email": STUDENT_EMAIL, "password": STUDENT_PASSWORD},
    )
    assert response.status_code == 200
    registered = response.json()
    assert set(registered) == {"message", "user"}
    assert registered["message"] == "Registration successful"
    assert registered["user"]["subscription_until"] is None
    assert registered["user"]["subscription_plan"] is None
    assert set(registered["user"]) == {
        "id", "username", "email", "subscription_until", "subscription_plan",
        "has_active_subscription", "is_admin", "verified",
    }
    assert registered["user"]["verified"] is False
    _validate(AuthResponse, registered)
    student_id = registered["user"]["id"]

    track_id, lesson, task = _target_course_case()
    track = find_track(track_id)
    prior_lesson = next(item for item in track["lessons"] if item["id"] != lesson["id"])
    prior_task = next(
        candidate
        for item in track["lessons"]
        if item.get("tasks")
        for candidate in item["tasks"]
        if candidate["id"] != task["id"]
    )
    fixed_progress_at = datetime(2026, 1, 2, 3, 4, 5, tzinfo=timezone.utc)
    with sessions() as db:
        db.add(models.UserLessonProgress(
            user_id=student_id,
            lesson_id=prior_lesson["id"],
            completed_at=fixed_progress_at,
        ))
        db.add(models.UserTaskProgress(
            user_id=student_id,
            task_id=prior_task["id"],
            task_revision=prior_task["revision"],
            completed_at=fixed_progress_at,
        ))
        db.commit()

    response = admin.patch(f"/api/admin/users/{student_id}/subscription", json={"days": 30})
    assert response.status_code == 200
    _validate(AdminUserEnvelope, response.json())

    response = client.post("/api/user/login", json={"email": STUDENT_EMAIL, "password": STUDENT_PASSWORD})
    assert response.status_code == 200
    login_body = response.json()
    assert set(login_body) == {"message", "user"}
    assert login_body["message"] == "Login successful"
    _validate(AuthResponse, login_body)
    record("login", response)
    student_token = response.cookies.get("session")
    assert student_token
    student_cookies = {"session": student_token}

    response = client.get("/api/user/me", cookies=student_cookies)
    assert response.status_code == 200
    assert set(response.json()) == {"user"}
    assert response.json()["user"] == login_body["user"]
    _validate(CurrentUserResponse, response.json())

    response = client.get("/api/admin/overview", cookies=student_cookies)
    assert response.status_code == 403
    assert response.json() == {"detail": "Требуются права администратора"}
    _validate(LegacyErrorResponse, response.json())

    # Admin routes used by the current admin screen; all writes target only this test DB.
    response = admin.get("/api/admin/overview")
    assert response.status_code == 200
    assert set(response.json()) == {
        "total_students", "active_students_7d", "inactive_students_7d",
        "active_subscriptions_count", "lessons_completed_7d",
        "expiring_subscriptions_count", "expiring_subscriptions", "slots_30d",
        "slots_7d", "upcoming_bookings", "most_active_students",
        "daily_active_students", "daily_lessons_completed",
    }
    _validate(AdminOverviewResponse, response.json())

    response = admin.get("/api/admin/users", params={"year": year, "month": month})
    assert response.status_code == 200
    assert set(response.json()) == {"completed_since", "users"}
    assert any(user["id"] == student_id for user in response.json()["users"])
    _validate(AdminAccountsResponse, response.json())

    response = admin.post(
        f"/api/admin/users/{student_id}/quota",
        json={"year": year, "month": month, "add": 2},
    )
    assert response.status_code == 200
    _validate(StudentProfileEnvelope, response.json())

    response = admin.get(
        f"/api/admin/users/{student_id}/profile",
        params={"year": year, "month": month},
    )
    assert response.status_code == 200
    _validate(StudentProfileEnvelope, response.json())

    # The admin overview's upcoming-bookings window is shorter than the slot
    # listing window, so keep this slot inside both runtime views.
    slot_date = date.today() + timedelta(days=3)
    response = admin.post(
        "/api/admin/slots",
        json={"slot_date": slot_date.isoformat(), "start_time": "10:00", "duration_minutes": 60},
    )
    assert response.status_code == 200
    _validate(AdminSlotEnvelope, response.json())
    slot_id = response.json()["slot"]["id"]

    response = admin.get("/api/admin/slots", params={"year": slot_date.year, "month": slot_date.month})
    assert response.status_code == 200
    _validate(AdminSlotsResponse, response.json())

    response = client.post(
        "/api/user/activity/visit",
        json={"activity_date": date.today().isoformat()},
        cookies=student_cookies,
    )
    assert response.status_code == 200
    assert set(response.json()) == {"activity_date", "visited_at"}
    _validate(ActivityVisitResponse, response.json())

    response = client.get("/api/user/activity", params={"year": year, "month": month}, cookies=student_cookies)
    assert response.status_code == 200
    assert set(response.json()) == {"days", "visits"}
    _validate(ActivityCalendarResponse, response.json())

    response = client.get("/api/user/activity/summary", cookies=student_cookies)
    assert response.status_code == 200
    _validate(ActivitySummaryResponse, response.json())

    response = client.get("/api/user/slots", params={"year": slot_date.year, "month": slot_date.month}, cookies=student_cookies)
    assert response.status_code == 200
    _validate(StudentSlotsResponse, response.json())
    assert any(item["id"] == slot_id and item["status"] == "free" for item in response.json()["slots"])

    response = client.post(f"/api/user/slots/{slot_id}/book", cookies=student_cookies)
    assert response.status_code == 200
    assert response.json()["slot"]["status"] == "mine"
    _validate(StudentSlotEnvelope, response.json())

    response = admin.get("/api/admin/slots", params={"year": slot_date.year, "month": slot_date.month})
    assert response.status_code == 200
    booked_slot = next(slot for slot in response.json()["slots"] if slot["id"] == slot_id)
    assert booked_slot["student"]["email"] == STUDENT_EMAIL
    _validate(AdminSlotsResponse, response.json())

    response = admin.get("/api/admin/overview")
    assert response.status_code == 200
    assert any(item["id"] == slot_id for item in response.json()["upcoming_bookings"])
    _validate(AdminOverviewResponse, response.json())

    response = admin.get(
        f"/api/admin/users/{student_id}/profile",
        params={"year": slot_date.year, "month": slot_date.month},
    )
    assert response.status_code == 200
    assert any(item["id"] == slot_id for item in response.json()["profile"]["bookings"])
    _validate(StudentProfileEnvelope, response.json())

    response = client.post(f"/api/user/slots/{slot_id}/cancel", cookies=student_cookies)
    assert response.status_code == 200
    assert response.json()["slot"]["status"] == "free"
    _validate(StudentSlotEnvelope, response.json())

    code = _solution_for(task)

    response = client.get("/api/learning/tracks", cookies=student_cookies)
    assert response.status_code == 200
    _validate(TracksResponse, response.json())

    response = client.get("/api/learning/catalog", cookies=student_cookies)
    assert response.status_code == 200
    catalog_before = response.json()
    assert set(catalog_before) == {"tracks", "courses", "default_track", "content_revision"}
    assert track_id in catalog_before["courses"]
    _validate(LearningCatalogResponse, catalog_before)
    record("catalog_before", response, catalog=True, track_id=track_id)

    response = client.get("/api/learning/lessons", params={"track": track_id}, cookies=student_cookies)
    assert response.status_code == 200
    assert set(response.json()) == {"track", "lessons", "access"}
    _validate(LessonsListResponse, response.json())

    response = client.get(f"/api/learning/lessons/{lesson['id']}", cookies=student_cookies)
    assert response.status_code == 200
    lesson_body = response.json()
    assert set(lesson_body) == {"lesson"}
    assert lesson_body["lesson"]["id"] == lesson["id"]
    _validate(LessonMaterialResponse, lesson_body)
    record("lesson", response)

    response = client.get(f"/api/learning/lessons/{lesson['id']}/theory", cookies=student_cookies)
    assert response.status_code == 200
    _validate(LessonTheoryResponse, response.json())

    response = client.get(
        f"/api/learning/lessons/{lesson['id']}/manual-practice/0/tasks/0/answer",
        cookies=student_cookies,
    )
    assert response.status_code == 200
    assert set(response.json()) == {"answer"}
    _validate(ManualPracticeAnswerResponse, response.json())
    record("manual_practice_answer", response)

    stale_revision = "0" * 64 if task["revision"] != "0" * 64 else "1" * 64
    response = client.post(
        f"/api/learning/tasks/{task['id']}/submit",
        json={"code": code, "task_revision": stale_revision},
        cookies=student_cookies,
    )
    assert response.status_code == 409
    assert set(response.json()) == {"detail"}
    _validate(LegacyErrorResponse, response.json())
    record("stale_revision_error", response)

    response = client.post(
        f"/api/learning/tasks/{task['id']}/submit",
        json={"code": "", "task_revision": task["revision"]},
        cookies=student_cookies,
    )
    assert response.status_code == 422
    assert isinstance(response.json()["detail"], list)
    _validate(LegacyErrorResponse, response.json())

    response = client.post(
        f"/api/learning/tasks/{task['id']}/run",
        json={"code": code, "task_revision": task["revision"]},
        cookies=student_cookies,
    )
    assert response.status_code == 200
    _validate(CodeRunResponse, response.json())

    response = client.post("/api/learning/interpreter/run", json={"code": "print('contract')"})
    assert response.status_code == 200
    assert response.json()["stdout"].strip() == "contract"
    _validate(CodeRunResponse, response.json())

    previous_runner_flag = os.environ.get("PYMENTOR_PUBLIC_RUNNER_ENABLED")
    os.environ["PYMENTOR_PUBLIC_RUNNER_ENABLED"] = "0"
    try:
        response = client.post("/api/learning/interpreter/run", json={"code": "print('disabled')"})
    finally:
        if previous_runner_flag is None:
            os.environ.pop("PYMENTOR_PUBLIC_RUNNER_ENABLED", None)
        else:
            os.environ["PYMENTOR_PUBLIC_RUNNER_ENABLED"] = previous_runner_flag
    assert response.status_code == 503
    assert response.headers["retry-after"] == "60"
    assert response.json() == {"detail": "Runner execution is temporarily disabled"}
    _validate(LegacyErrorResponse, response.json())

    response = client.post(
        f"/api/learning/tasks/{task['id']}/submit",
        json={"code": code, "task_revision": task["revision"]},
        cookies=student_cookies,
    )
    assert response.status_code == 200
    submission = response.json()
    assert submission["ok"] is True
    assert submission["score"] == 100
    _validate(CodeSubmitResponse, submission)
    assert set(submission) == {"ok", "score", "tests", "stdout", "stderr", "error", "traceback"}
    record("code_submit", response)

    response = client.post(f"/api/learning/lessons/{lesson['id']}/complete", cookies=student_cookies)
    assert response.status_code == 200
    assert response.json() == {"lesson_id": lesson["id"], "completed": True}
    _validate(LessonCompletionResponse, response.json())
    record("complete_lesson", response)

    response = client.get("/api/learning/catalog", cookies=student_cookies)
    assert response.status_code == 200
    current_lesson = next(item for item in response.json()["courses"][track_id] if item["id"] == lesson["id"])
    assert current_lesson["completed"] is True
    record("catalog_after", response, catalog=True, track_id=track_id)

    response = client.post("/api/user/logout", cookies=student_cookies)
    assert response.status_code == 200
    assert response.json() == {"message": "Logout successful"}
    _validate(LogoutResponse, response.json())
    record("logout", response)

    response = client.get("/api/user/me", cookies=student_cookies)
    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid session"}
    _validate(LegacyErrorResponse, response.json())
    record("unauthorized_after_logout", response)

    response = admin.delete(f"/api/admin/users/{student_id}")
    assert response.status_code == 200
    assert response.json() == {"deleted": student_id}
    _validate(DeletedIdResponse, response.json())

    response = admin.delete(f"/api/admin/slots/{slot_id}")
    assert response.status_code == 200
    assert response.json() == {"deleted": slot_id}
    _validate(DeletedIdResponse, response.json())

    historical_path = (
        Path(__file__).resolve().parents[4]
        / "docs"
        / "stage-01-k3s"
        / "reference"
        / "core-baseline-responses.json"
    )
    historical = json_module.loads(historical_path.read_text(encoding="utf-8"))
    for name, actual in observed_baseline_responses.items():
        expected = historical[name]
        if name in {"catalog_before", "catalog_after"}:
            assert _without_content_revision(actual) == _without_content_revision(expected)
        else:
            assert actual == expected


def test_landing_admin_openapi_responses_are_unchanged():
    """The Core contract update must not alter the unrelated landing API."""
    baseline_path = (
        Path(__file__).resolve().parents[4] / "docs" / "stage-02-core"
        / "c2-1-3-openapi-baseline.json"
    )
    baseline = json_module.loads(baseline_path.read_text(encoding="utf-8"))
    current = app.openapi()
    landing_paths = [path for path in baseline["paths"] if path.startswith(("/api/admin/landings", "/admin/landings"))]
    assert landing_paths
    for path in landing_paths:
        for method, operation in baseline["paths"][path].items():
            if method in {"get", "post", "put", "patch", "delete"}:
                assert current["paths"][path][method]["responses"] == operation["responses"]
