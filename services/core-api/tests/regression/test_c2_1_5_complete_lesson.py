"""Golden contract for the legacy manual completion endpoint (C2.1.5).

All data lives in an isolated in-memory SQLite database.
"""
from __future__ import annotations

import os
import sys

import pytest
from fastapi import HTTPException
from fastapi import Request
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Refuse any persistent database even if this test is run in isolation.
configured_db = os.getenv("DATABASE_URL")
if configured_db not in (None, "sqlite://", "sqlite:///:memory:"):
    raise RuntimeError("Complete-lesson golden tests require synthetic in-memory SQLite")
os.environ.setdefault("DATABASE_URL", "sqlite://")
if 'pymentor_core.app.database' in sys.modules:
    db_url = sys.modules['pymentor_core.app.database'].engine.url
    assert db_url.get_backend_name() == "sqlite" and db_url.database in (None, ":memory:")

from pymentor_core.adapters.sql import models
from pymentor_core.app.database import Base
from pymentor_core.adapters.sql.unit_of_work import SqlAlchemyUnitOfWork
from pymentor_core.modules.learning import progress
from pymentor_core.modules.learning.api import service


TASK_ID = "lesson-stable-task-01"
REVISION = "a" * 64


@pytest.fixture
def world(monkeypatch):
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    sessions = sessionmaker(bind=engine, autoflush=False)
    with sessions() as db:
        db.add(models.User(id=9, username="Synthetic Student", email="complete@example.test", _password_hash="synthetic"))
        db.add(models.Session(user_id=9, session_token="synthetic-session"))
        db.commit()

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
    try:
        yield sessions, lessons
    finally:
        engine.dispose()


def make_request(authenticated=True):
    headers = [(b"cookie", b"session=synthetic-session")] if authenticated else []
    return Request({"type": "http", "method": "POST", "path": "/learning/lessons/complete", "headers": headers})


def finish(db, lesson_id, *, uow_enabled=False, authenticated=True):
    kwargs = {"uow": SqlAlchemyUnitOfWork(db)} if uow_enabled else {}
    return service.complete_lesson(lesson_id, make_request(authenticated), db, **kwargs)


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
def test_duplicate_legacy_completion_rolls_back_pending_sqlite_transaction(world, uow_enabled):
    sessions, _ = world
    with sessions() as db:
        assert finish(db, "lesson-stable", uow_enabled=uow_enabled)["completed"] is True
    with sessions() as db:
        # A duplicate completion causes a real SQLite integrity violation on commit.
        # The existing progress writer must roll back all pending changes.
        db.add(models.BookingQuota(user_id=9, year=2026, month=11, granted_slots=2))
        assert finish(db, "lesson-stable", uow_enabled=uow_enabled)["completed"] is True
        assert db.query(models.BookingQuota).count() == 0
        assert db.query(models.UserLessonProgress).count() == 1
    assert rows(sessions) == ([("lesson-stable", 9)], [])
