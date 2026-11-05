"""Golden behavior for the existing practice progress write workflow."""

from contextlib import contextmanager
from unittest.mock import sentinel

import pytest

from routers.courses import service


@pytest.mark.parametrize(
    "source,mixed,complete,expected",
    [
        ("foundations/block_03/lesson.py", False, True, ["task", "lesson"]),
        ("foundations/block_03/lesson.py", False, False, ["task"]),
        ("foundations/block_03/lesson.py", True, True, ["task"]),
        ("chapter_01/lesson.py", False, True, ["task"]),
        ("other/lesson.py", False, True, ["lesson"]),
        ("other/lesson.py", True, True, []),
    ],
)
def test_progress_write_order_and_course_rules(monkeypatch, source, mixed, complete, expected):
    events = []

    @contextmanager
    def session():
        events.append("open")
        try:
            yield sentinel.db
        finally:
            events.append("close")

    monkeypatch.setattr(service, "SessionLocal", session)
    monkeypatch.setattr(service, "_lesson_tasks_are_complete", lambda *args: complete)
    monkeypatch.setattr(service.progress, "mark_task_completed", lambda **kw: events.append("task"))
    monkeypatch.setattr(service.progress, "mark_lesson_completed", lambda **kw: events.append("lesson"))
    lesson = {"id": "stable-lesson", "source_file": source, "tasks": [{"id": "t"}]}
    if mixed:
        lesson["manual_practice"] = [{}]
    service._save_task_progress({"user_id": 3, "task": {"id": "t", "revision": "r"}, "lesson": lesson})
    assert events == ["open", *expected, "close"]


@pytest.mark.parametrize("user_id,lesson", [(None, {"id": "l"}), (3, None)])
def test_missing_user_or_lesson_does_not_open_database(monkeypatch, user_id, lesson):
    monkeypatch.setattr(service, "SessionLocal", lambda: pytest.fail("opened a session"))
    service._save_task_progress({"user_id": user_id, "task": {"id": "t"}, "lesson": lesson})


def test_write_failure_propagates_and_closes_session(monkeypatch):
    events = []

    @contextmanager
    def session():
        try:
            yield sentinel.db
        finally:
            events.append("closed")

    def fail(**kwargs):
        raise RuntimeError("synthetic write error")

    monkeypatch.setattr(service, "SessionLocal", session)
    monkeypatch.setattr(service.progress, "mark_task_completed", fail)
    with pytest.raises(RuntimeError, match="synthetic write error"):
        service._save_task_progress({
            "user_id": 3, "task": {"id": "t", "revision": "r"},
            "lesson": {"id": "l", "source_file": "chapter_01/example", "tasks": []},
        })
    assert events == ["closed"]
