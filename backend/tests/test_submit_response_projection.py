"""ASGI contract tests for the staged submit projection; runner/DB are stubbed."""

from __future__ import annotations

import asyncio
import importlib.util
import json
import os
from pathlib import Path
import sys
from types import ModuleType, SimpleNamespace

from fastapi import FastAPI
import pytest


STAGE_ROOT = Path(__file__).resolve().parents[2]
SOURCE_BACKEND = Path(
    os.environ.get("PYMENTOR_SOURCE_BACKEND", Path(__file__).resolve().parents[1])
)
_MISSING = object()


def _load_as(module_name: str, path: Path, monkeypatch):
    spec = importlib.util.spec_from_file_location(module_name, path)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    monkeypatch.setitem(sys.modules, module_name, module)
    spec.loader.exec_module(module)
    return module


def _stub(name: str, **attrs):
    module = ModuleType(name)
    for key, value in attrs.items():
        setattr(module, key, value)
    return module


async def _asgi_request(app, method: str, path: str, payload: dict):
    request_body = json.dumps(payload).encode("utf-8")
    request_messages = [{"type": "http.request", "body": request_body, "more_body": False}]
    sent = []

    async def receive():
        if request_messages:
            return request_messages.pop(0)
        return {"type": "http.disconnect"}

    async def send(message):
        sent.append(message)

    scope = {
        "type": "http",
        "asgi": {"version": "3.0", "spec_version": "2.3"},
        "http_version": "1.1",
        "method": method,
        "scheme": "http",
        "path": path,
        "raw_path": path.encode("ascii"),
        "query_string": b"",
        "root_path": "",
        "headers": [
            (b"host", b"testserver"),
            (b"content-type", b"application/json"),
            (b"content-length", str(len(request_body)).encode("ascii")),
        ],
        "server": ("testserver", 80),
        "client": ("testclient", 123),
    }
    await app(scope, receive, send)
    response_start = next(message for message in sent if message["type"] == "http.response.start")
    response_body = b"".join(message.get("body", b"") for message in sent if message["type"] == "http.response.body")
    return SimpleNamespace(
        status_code=response_start["status"],
        headers=dict(response_start.get("headers", [])),
        content=response_body,
        text=response_body.decode("utf-8"),
        json=lambda: json.loads(response_body),
    )


@pytest.fixture
def api_harness(monkeypatch):
    # Import only empty package initializers; replace content/DB/access dependencies
    # before the real staged service module is imported.
    original_sys_path = tuple(sys.path)
    monkeypatch.syspath_prepend(str(SOURCE_BACKEND))
    import content
    import content.practice
    import content.practice.runner
    import core
    import db
    import routers.accounts
    import routers.courses

    package_bindings = [
        (content, "catalog"),
        (content.practice.runner, "python"),
        (content.practice.runner, "executor"),
        (routers.courses, "progress"),
        (routers.courses, "access"),
        (routers.courses, "schemas"),
        (routers.courses, "service"),
        (routers.courses, "router"),
        (routers.accounts, "service"),
        (db, "models"),
        (db, "engine"),
        (core, "dependencies"),
    ]
    original_package_attrs = [
        (parent, name, getattr(parent, name, _MISSING))
        for parent, name in package_bindings
    ]
    tracked_modules = (
        "content.catalog",
        "content.practice.runner.python",
        "content.practice.runner.executor",
        "routers.courses.progress",
        "routers.courses.access",
        "routers.courses.schemas",
        "routers.courses.service",
        "routers.courses.router",
        "routers.accounts.service",
        "db.models",
        "db.engine",
        "core.dependencies",
    )
    original_modules = {name: sys.modules.get(name, _MISSING) for name in tracked_modules}

    run_task_sentinel = object()
    run_preview_sentinel = object()
    catalog = _stub(
        "content.catalog",
        default_track_id=lambda: None,
        find_lesson=lambda *_args, **_kwargs: None,
        find_lesson_by_task=lambda *_args, **_kwargs: None,
        find_task=lambda *_args, **_kwargs: None,
        get_content_revision=lambda: "synthetic",
        find_track=lambda *_args, **_kwargs: None,
        get_public_lessons=lambda *_args, **_kwargs: [],
        get_tracks_summary=lambda: [],
    )
    fake_runner_python = _stub(
        "content.practice.runner.python",
        run_python_code=object(),
        run_python_preview=run_preview_sentinel,
        run_python_task=run_task_sentinel,
    )

    class RunnerBusy(Exception):
        pass

    class RunnerUnavailable(Exception):
        pass

    executor = _stub(
        "content.practice.runner.executor",
        RunnerBusy=RunnerBusy,
        RunnerUnavailable=RunnerUnavailable,
        get_runner_executor=lambda: None,
    )
    fake_progress = _stub("routers.courses.progress")
    fake_access = _stub(
        "routers.courses.access",
        get_optional_user=lambda **_kwargs: None,
        get_lesson_access=lambda *_args, **_kwargs: (True, None),
    )
    account_service = _stub("routers.accounts.service")
    fake_models = _stub("db.models", User=type("User", (), {}))

    class DummySession:
        def __enter__(self):
            return self

        def __exit__(self, *_args):
            return False

    fake_engine = _stub("db.engine", SessionLocal=DummySession)

    def get_db():
        yield None

    fake_dependencies = _stub(
        "core.dependencies", get_db=get_db,
        get_request_context=lambda: SimpleNamespace(uow=None),
    )
    for parent, name, module in (
        (content, "catalog", catalog),
        (content.practice.runner, "python", fake_runner_python),
        (content.practice.runner, "executor", executor),
        (routers.courses, "progress", fake_progress),
        (routers.courses, "access", fake_access),
        (routers.accounts, "service", account_service),
        (db, "models", fake_models),
        (core, "dependencies", fake_dependencies),
    ):
        monkeypatch.setitem(sys.modules, module.__name__, module)
        monkeypatch.setattr(parent, name, module, raising=False)
    monkeypatch.setitem(sys.modules, "db.engine", fake_engine)
    monkeypatch.setattr(db, "engine", fake_engine, raising=False)

    schemas = _load_as(
        "routers.courses.schemas",
        STAGE_ROOT / "backend" / "routers" / "courses" / "schemas.py",
        monkeypatch,
    )
    monkeypatch.setattr(routers.courses, "schemas", schemas, raising=False)
    service = _load_as(
        "routers.courses.service",
        STAGE_ROOT / "backend" / "routers" / "courses" / "service.py",
        monkeypatch,
    )
    monkeypatch.setattr(routers.courses, "service", service, raising=False)
    router = _load_as(
        "routers.courses.router",
        STAGE_ROOT / "backend" / "routers" / "courses" / "router.py",
        monkeypatch,
    )
    monkeypatch.setattr(routers.courses, "router", router, raising=False)

    state = SimpleNamespace(
        source_file="chapter_01/block_01/synthetic.md",
        mode="solve",
        result={},
        events=[],
        calls=[],
        preview_tests=[{"name": "synthetic preview sample", "expected": "sample-only"}],
        omit_source_file=False,
    )

    def resolved_task(task_id, _user):
        return {
            "id": task_id,
            "revision": "a" * 64,
            "mode": state.mode,
            "tests": state.preview_tests,
        }

    def resolved_lesson(_task_id):
        lesson = {"id": "synthetic-lesson"}
        if not state.omit_source_file:
            lesson["source_file"] = state.source_file
        return lesson

    async def execute(function, code, task):
        state.calls.append((function, code, task))
        return state.result

    monkeypatch.setattr(service, "_require_runner_enabled", lambda: None)
    monkeypatch.setattr(service, "get_optional_user", lambda **_kwargs: SimpleNamespace(id=7))
    monkeypatch.setattr(service, "_get_available_task", resolved_task)
    monkeypatch.setattr(service, "find_lesson_by_task", resolved_lesson)
    monkeypatch.setattr(service, "_execute_task", execute)
    monkeypatch.setattr(service, "_save_task_progress", lambda _context: state.events.append("progress"))
    monkeypatch.setattr(service, "SessionLocal", DummySession)

    app = FastAPI()
    app.include_router(router.learning_router)
    yield SimpleNamespace(
        app=app,
        service=service,
        state=state,
        run_task_sentinel=run_task_sentinel,
        run_preview_sentinel=run_preview_sentinel,
        import_snapshot=SimpleNamespace(
            sys_path=original_sys_path,
            modules=original_modules,
            package_attrs=original_package_attrs,
        ),
    )


def _submit(harness, task_id="synthetic-resolved-task"):
    return asyncio.run(_asgi_request(
        harness.app,
        "POST",
        f"/tasks/{task_id}/submit",
        {"code": "print('synthetic only')", "task_revision": "a" * 64},
    ))


def _assert_no_secrets(response):
    serialized = response.text
    for value in (
        "SYNTHETIC_HIDDEN_NAME",
        "SYNTHETIC_HIDDEN_EXPECTED",
        "SYNTHETIC_HIDDEN_ACTUAL",
        "SYNTHETIC_PARTIAL_STDOUT",
        "SYNTHETIC_STDERR_SECRET",
        "SYNTHETIC_TRACEBACK_SECRET",
        "SYNTHETIC_TOP_ERROR_SECRET",
        "SYNTHETIC_EXTRA_SECRET",
    ):
        assert value not in serialized


def test_asgi_chapter_one_success_saves_raw_progress_before_safe_serialization(api_harness, monkeypatch):
    harness = api_harness
    harness.state.mode = "solve"
    harness.state.result = {
        "ok": True,
        "score": 72,
        "tests": [{
            "name": "SYNTHETIC_HIDDEN_NAME",
            "passed": True,
            "expected": "SYNTHETIC_HIDDEN_EXPECTED",
            "actual": "SYNTHETIC_HIDDEN_ACTUAL",
            "error": "SYNTHETIC_TOP_ERROR_SECRET",
        }],
        "stdout": "SYNTHETIC_PARTIAL_STDOUT",
        "stderr": "SYNTHETIC_STDERR_SECRET",
        "traceback": "SYNTHETIC_TRACEBACK_SECRET",
        "unknown": "SYNTHETIC_EXTRA_SECRET",
    }
    original_projection = harness.service._project_chapter_one_submit_result

    def check_projection_order(raw):
        assert harness.state.events == ["progress"]
        return original_projection(raw)

    monkeypatch.setattr(harness.service, "_project_chapter_one_submit_result", check_projection_order)
    response = _submit(harness)
    assert response.status_code == 200
    body = response.json()
    assert body["ok"] is True and body["score"] == 72
    assert body["tests"] == [{
        "name": "Проверка 1", "passed": True, "expected": None, "actual": None, "error": None,
    }]
    assert body["stdout"] == "" and body["stderr"] is None and body["traceback"] is None
    assert harness.state.calls[0][0] is harness.run_task_sentinel
    _assert_no_secrets(response)


def test_asgi_chapter_one_failed_script_test_returns_generic_feedback(api_harness):
    harness = api_harness
    harness.state.mode = "script"
    harness.state.result = {
        "ok": False,
        "score": 25,
        "tests": [{
            "name": "SYNTHETIC_HIDDEN_NAME",
            "passed": False,
            "expected": "SYNTHETIC_HIDDEN_EXPECTED",
            "actual": "SYNTHETIC_HIDDEN_ACTUAL",
            "error": "SYNTHETIC_TOP_ERROR_SECRET",
        }],
        "stdout": "SYNTHETIC_PARTIAL_STDOUT",
    }
    response = _submit(harness)
    body = response.json()
    assert response.status_code == 200
    assert body["score"] == 25 and body["tests"][0]["passed"] is False
    assert body["tests"][0]["name"] == "Проверка 1"
    assert body["tests"][0]["error"] == "Одна из проверок не пройдена. Сверьте решение с условием задачи."
    assert harness.state.events == []
    assert harness.state.calls[0][0] is harness.run_task_sentinel
    _assert_no_secrets(response)


def test_asgi_chapter_one_top_level_error_after_partial_stdout_and_empty_tests_is_hidden(api_harness):
    harness = api_harness
    harness.state.result = {
        "ok": False,
        "score": 0,
        "tests": [],
        "error": "SYNTHETIC_TOP_ERROR_SECRET",
        "stdout": "SYNTHETIC_PARTIAL_STDOUT",
        "stderr": "SYNTHETIC_STDERR_SECRET",
        "traceback": "SYNTHETIC_TRACEBACK_SECRET",
        "unknown": "SYNTHETIC_EXTRA_SECRET",
    }
    response = _submit(harness)
    body = response.json()
    assert body["tests"] == []
    assert body["error"] == "Не удалось проверить решение. Проверьте код и попробуйте ещё раз."
    assert body["stdout"] == "" and body["stderr"] is None and body["traceback"] is None
    assert harness.state.events == []
    _assert_no_secrets(response)


def test_asgi_chapter_one_unknown_error_without_tests_is_also_generic(api_harness):
    harness = api_harness
    harness.state.result = {"ok": False, "score": 0, "tests": [], "stdout": "SYNTHETIC_PARTIAL_STDOUT"}
    response = _submit(harness)
    assert response.json()["error"] == "Не удалось проверить решение. Проверьте код и попробуйте ещё раз."
    _assert_no_secrets(response)


@pytest.mark.parametrize(
    ("source_file", "omit_source_file"),
    [
        (None, False),
        (None, True),
        ("", False),
        ("   ", False),
        (42, False),
    ],
)
def test_invalid_resolved_source_file_fails_closed_before_runner_or_progress(
    api_harness, source_file, omit_source_file
):
    harness = api_harness
    harness.state.source_file = source_file
    harness.state.omit_source_file = omit_source_file
    harness.state.result = {
        "ok": True,
        "score": 100,
        "tests": [{
            "name": "SYNTHETIC_HIDDEN_NAME",
            "passed": True,
            "expected": "SYNTHETIC_HIDDEN_EXPECTED",
            "actual": "SYNTHETIC_HIDDEN_ACTUAL",
        }],
        "stdout": "SYNTHETIC_PARTIAL_STDOUT",
        "stderr": "SYNTHETIC_STDERR_SECRET",
        "traceback": "SYNTHETIC_TRACEBACK_SECRET",
    }
    response = _submit(harness)
    body = response.json()
    assert response.status_code == 200
    assert body == {
        "ok": False,
        "score": 0,
        "tests": [],
        "stdout": "",
        "stderr": None,
        "error": "Не удалось проверить решение. Проверьте код и попробуйте ещё раз.",
        "traceback": None,
    }
    assert harness.state.calls == []
    assert harness.state.events == []
    _assert_no_secrets(response)


def test_asgi_chapter_two_retains_legacy_serialized_result(api_harness):
    harness = api_harness
    harness.state.source_file = "chapter_02/block_01/synthetic.md"
    harness.state.result = {
        "ok": False,
        "score": 0,
        "tests": [{"name": "legacy test name", "passed": False, "expected": "legacy expected", "actual": "legacy actual"}],
        "stdout": "legacy output",
    }
    response = _submit(harness, task_id="chapter-one-looking-client-id")
    assert response.status_code == 200
    body = response.json()
    assert body["tests"][0]["name"] == "legacy test name"
    assert body["tests"][0]["expected"] == "legacy expected"
    assert body["tests"][0]["actual"] == "legacy actual"
    assert body["stdout"] == "legacy output"


@pytest.mark.parametrize("source_file", ["chapter_01_archive/block_01/synthetic.md", "chapter_03/block_01/synthetic.md"])
def test_unrecognized_or_missing_source_file_does_not_expand_projection_scope(api_harness, source_file):
    harness = api_harness
    harness.state.source_file = source_file
    harness.state.result = {
        "ok": False,
        "score": 0,
        "tests": [{"name": "legacy name", "passed": False, "expected": "legacy expected"}],
        "stdout": "legacy output",
    }
    body = _submit(harness).json()
    assert body["tests"][0]["name"] == "legacy name"
    assert body["tests"][0]["expected"] == "legacy expected"
    assert body["stdout"] == "legacy output"


def test_asgi_preview_keeps_preview_executor_and_response_contract(api_harness):
    harness = api_harness
    harness.state.result = {"ok": True, "stdout": "synthetic preview output"}
    response = asyncio.run(_asgi_request(
        harness.app,
        "POST",
        "/tasks/synthetic-preview-task/run",
        {"code": "print('synthetic only')", "task_revision": "a" * 64},
    ))
    assert response.status_code == 200
    assert response.json() == {"ok": True, "stdout": "synthetic preview output", "stderr": None, "error": None, "traceback": None}
    function, _code, task = harness.state.calls[0]
    assert function is harness.run_preview_sentinel
    assert task["tests"][0]["name"] == "synthetic preview sample"


def test_asgi_stale_revision_still_stops_before_runner_or_progress(api_harness):
    harness = api_harness
    response = asyncio.run(_asgi_request(
        harness.app,
        "POST",
        "/tasks/stale-task/submit",
        {"code": "synthetic", "task_revision": "b" * 64},
    ))
    assert response.status_code == 409
    assert harness.state.calls == []
    assert harness.state.events == []


def test_fixture_restores_original_module_identities_and_sys_path(api_harness, monkeypatch):
    snapshot = api_harness.import_snapshot
    monkeypatch.undo()
    assert tuple(sys.path) == snapshot.sys_path
    for name, original in snapshot.modules.items():
        assert sys.modules.get(name, _MISSING) is original
    for parent, name, original in snapshot.package_attrs:
        assert getattr(parent, name, _MISSING) is original
