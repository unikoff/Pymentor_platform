"""Manual completion policy with real PostgreSQL/Redis HTTP and UoW paths."""
from __future__ import annotations

import os
import sys

import pytest
from fastapi import HTTPException

from pymentor_core.adapters.sql import models
from test_c2_1_4_auth_legacy import runtime_db
import test_c2_1_4_auth_legacy as http
from types import SimpleNamespace
from pymentor_core.app.dependencies import get_db, get_request_context
from pymentor_core.adapters.sql.unit_of_work import SqlAlchemyUnitOfWork
from pymentor_core.modules.learning import progress
from pymentor_core.modules.learning.api import service


TASK_ID = "lesson-stable-task-01"
REVISION = "a" * 64


@pytest.fixture
def world(monkeypatch, runtime_db):
    sessions = runtime_db
    with sessions() as db:
        db.add(models.User(id=9, username="Synthetic Student", email="complete@example.test", password=http.PASSWORD))
        db.commit()

    global _token
    _token = http.login(email="complete@example.test").cookie().value
    lessons = {
        "lesson-stable": {
            "id": "lesson-stable", "source_file": "chapter_02/block_05/demo.md",
            "access": "free", "self_check": {"questions": ["ok"]},
            "tasks": [], "manual_practice": [],
        },
        "chapter-one": {
            "id": "chapter-one", "source_file": "chapter_01/block_01/demo.md",
            "access": "free", "self_check": {"questions": ["ok"]},
            "tasks": [], "manual_practice": [{"title": "manual"}],
        },
    }
    monkeypatch.setattr(
        service, "find_lesson",
        lambda lesson_id: lessons.get("lesson-stable" if lesson_id == "old-position-id" else lesson_id),
    )
    yield sessions, lessons


def finish(db, lesson_id, *, uow_enabled=False, authenticated=True):
    app = http._client.app
    previous = app.dependency_overrides.copy()
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[get_request_context] = lambda: SimpleNamespace(
        uow=SqlAlchemyUnitOfWork(db) if uow_enabled else None)
    try:
        reply = http.call("POST", f"/api/learning/lessons/{lesson_id}/complete",
                          cookie=_token if authenticated else None)
        if reply.status >= 400:
            raise HTTPException(status_code=reply.status, detail=reply.data["detail"])
        return reply.data
    finally:
        app.dependency_overrides.clear()
        app.dependency_overrides.update(previous)


def rows(sessions):
    with sessions() as db:
        return (
            [(row.lesson_id, row.user_id) for row in db.query(models.UserLessonProgress).order_by(models.UserLessonProgress.id).all()],
            [(row.task_id, row.task_revision) for row in db.query(models.UserTaskProgress).order_by(models.UserTaskProgress.id).all()],
        )


@pytest.mark.parametrize("uow_enabled", [False, True])
def test_first_repeat_and_positional_alias_write_only_stable_id(world, uow_enabled):
    sessions, _ = world
    with sessions() as db:
        assert finish(db, "old-position-id", uow_enabled=uow_enabled) == {
            "lesson_id": "lesson-stable", "completed": True,
        }
        assert finish(db, "lesson-stable", uow_enabled=uow_enabled) == {
            "lesson_id": "lesson-stable", "completed": True,
        }
        assert db.query(models.UserLessonProgress).count() == 1
    assert rows(sessions) == ([("lesson-stable", 9)], [])


@pytest.mark.parametrize("uow_enabled", [False, True])
def test_auth_absent_and_lesson_absent_preserve_error_precedence(world, uow_enabled):
    sessions, _ = world
    with sessions() as db:
        with pytest.raises(HTTPException) as unauthenticated:
            finish(db, "missing", uow_enabled=uow_enabled, authenticated=False)
        assert (unauthenticated.value.status_code, unauthenticated.value.detail) == (
            401, "No session token found",
        )
        with pytest.raises(HTTPException) as missing:
            finish(db, "missing", uow_enabled=uow_enabled)
        assert (missing.value.status_code, missing.value.detail) == (404, "Lesson not found")
    assert rows(sessions) == ([], [])


@pytest.mark.parametrize("uow_enabled", [False, True])
def test_forbidden_precedes_missing_self_check(world, uow_enabled):
    sessions, lessons = world
    lessons["lesson-stable"]["access"] = "subscription"
    lessons["lesson-stable"]["self_check"] = None
    with sessions() as db:
        with pytest.raises(HTTPException) as denied:
            finish(db, "lesson-stable", uow_enabled=uow_enabled)
        assert (denied.value.status_code, denied.value.detail) == (
            403, "Нужна активная подписка. Продлите доступ, чтобы открыть это занятие.",
        )
    assert rows(sessions) == ([], [])


@pytest.mark.parametrize("uow_enabled", [False, True])
def test_missing_self_check_is_400_without_writes(world, uow_enabled):
    sessions, lessons = world
    lessons["lesson-stable"]["self_check"] = None
    with sessions() as db:
        with pytest.raises(HTTPException) as error:
            finish(db, "lesson-stable", uow_enabled=uow_enabled)
        assert (error.value.status_code, error.value.detail) == (
            400, "Этот урок засчитывается автоматически после решения практики.",
        )
    assert rows(sessions) == ([], [])


@pytest.mark.parametrize("uow_enabled", [False, True])
def test_incomplete_tasks_require_current_revision_before_chapter_one_marker(world, uow_enabled):
    sessions, lessons = world
    lesson = lessons["chapter-one"]
    lesson["tasks"] = [{"id": TASK_ID, "revision": REVISION, "mode": "solve"}]
    with sessions() as db:
        with pytest.raises(HTTPException) as missing:
            finish(db, "chapter-one", uow_enabled=uow_enabled)
        assert (missing.value.status_code, missing.value.detail) == (
            400, "Сначала завершите все редакторские задания.",
        )
        db.add(models.UserTaskProgress(user_id=9, task_id=TASK_ID, task_revision="old"))
        db.commit()
        with pytest.raises(HTTPException) as stale:
            finish(db, "chapter-one", uow_enabled=uow_enabled)
        assert (stale.value.status_code, stale.value.detail) == (
            400, "Сначала завершите все редакторские задания.",
        )
        db.query(models.UserTaskProgress).filter_by(task_id=TASK_ID).one().task_revision = REVISION
        db.commit()
        assert finish(db, "chapter-one", uow_enabled=uow_enabled) == {
            "lesson_id": "chapter-one", "completed": True,
        }
    _, task_rows = rows(sessions)
    assert task_rows == [
        (TASK_ID, REVISION),
        (progress.chapter_one_completion_task_id("chapter-one"), progress.chapter_one_completion_revision(lesson)),
    ]


@pytest.mark.parametrize("uow_enabled", [False, True])
def test_chapter_one_manual_self_check_is_repeatable_and_revision_bound(world, uow_enabled):
    sessions, lessons = world
    lesson = lessons["chapter-one"]
    marker_id = progress.chapter_one_completion_task_id("chapter-one")
    with sessions() as db:
        assert finish(db, "chapter-one", uow_enabled=uow_enabled)["completed"] is True
        assert finish(db, "chapter-one", uow_enabled=uow_enabled)["completed"] is True
        assert rows(sessions) == ([], [(marker_id, progress.chapter_one_completion_revision(lesson))])
        lesson["self_check"] = {"questions": ["revised"]}
        assert finish(db, "chapter-one", uow_enabled=uow_enabled)["completed"] is True
    assert rows(sessions) == ([], [(marker_id, progress.chapter_one_completion_revision(lesson))])


@pytest.mark.parametrize("uow_enabled", [False, True])
def test_chapter_one_editor_only_returns_success_without_writing_completion(world, uow_enabled):
    sessions, lessons = world
    lessons["chapter-one"]["manual_practice"] = []
    lessons["chapter-one"]["tasks"] = [{"id": TASK_ID, "revision": REVISION}]
    with sessions() as db:
        db.add(models.UserTaskProgress(user_id=9, task_id=TASK_ID, task_revision=REVISION))
        db.commit()
        assert finish(db, "chapter-one", uow_enabled=uow_enabled) == {
            "lesson_id": "chapter-one", "completed": True,
        }
    assert rows(sessions) == ([], [(TASK_ID, REVISION)])


@pytest.mark.parametrize("uow_enabled", [False, True])
def test_duplicate_legacy_completion_rolls_back_pending_postgresql_transaction(world, uow_enabled):
    sessions, _ = world
    with sessions() as db:
        assert finish(db, "lesson-stable", uow_enabled=uow_enabled)["completed"] is True
    with sessions() as db:
        # A duplicate completion causes a real PostgreSQL integrity violation on commit.
        # The existing progress writer must roll back all pending changes.
        db.add(models.BookingQuota(user_id=9, year=2026, month=11, granted_slots=2))
        assert finish(db, "lesson-stable", uow_enabled=uow_enabled)["completed"] is True
        assert db.query(models.BookingQuota).count() == 0
        assert db.query(models.UserLessonProgress).count() == 1
    assert rows(sessions) == ([("lesson-stable", 9)], [])
