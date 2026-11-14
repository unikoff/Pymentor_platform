"""HTTP coverage for composed ports and their transaction boundaries."""

import asyncio
import json
from datetime import datetime
from datetime import timedelta
from datetime import timezone
from types import SimpleNamespace
from unittest.mock import Mock

import pytest
from pg_business_support import runtime_db, attach_identity
from fastapi import FastAPI
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from sqlalchemy.orm import sessionmaker

from pymentor_core.app.context import CompositionRoot
from pymentor_core.app.dependencies import get_db
from pymentor_core.adapters.sql import models
from support_fakes import FakeClock
from support_fakes import FakeExternalAPI
from support_fakes import FakePermissions
from support_fakes import FakeQueue
from pymentor_core.adapters.sql.unit_of_work import SqlAlchemyUnitOfWork
from pymentor_core.modules.identity.api.router import user_router
from pymentor_core.modules.administration.api.router import admin_router
from pymentor_core.modules.learning import progress
from pymentor_core.modules.learning.api import service as courses
from pymentor_core.modules.learning.api.router import learning_router


def make_root(factory):
    return CompositionRoot(
        uow_factory=factory,
        clock=FakeClock(datetime(2026, 11, 4, tzinfo=timezone.utc)),
        permissions=FakePermissions(),
        queue=FakeQueue(),
        external_api=FakeExternalAPI(),
    )


async def request(app, method, path, *, cookie=None, payload=None):
    body = json.dumps(payload).encode() if payload is not None else b""
    headers = [(b"content-type", b"application/json"), (b"content-length", str(len(body)).encode())]
    if cookie:
        headers.append((b"cookie", f"session={cookie}".encode()))
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

    await app({
        "type": "http", "asgi": {"version": "3.0", "spec_version": "2.4"},
        "http_version": "1.1", "method": method, "scheme": "http", "path": path,
        "raw_path": path.encode(), "root_path": "", "query_string": b"", "headers": headers,
        "server": ("testserver", 80), "client": ("127.0.0.1", 12345),
    }, receive, send)
    start = next(item for item in messages if item["type"] == "http.response.start")
    response = b"".join(item.get("body", b"") for item in messages if item["type"] == "http.response.body")
    return start["status"], json.loads(response)


@pytest.fixture
def repository_app():
    app = FastAPI()
    attach_identity(app, {"admin": 1, "student": 2})
    app.include_router(user_router, prefix="/user")
    app.include_router(admin_router, prefix="/admin")
    app.include_router(learning_router, prefix="/learning")
    student = SimpleNamespace(
        id=2, username="Student", email="student@example.test", is_admin=False, verified=False,
        subscription_until=datetime.now(timezone.utc) + timedelta(days=2), subscription_plan="pro",
    )
    administrator = SimpleNamespace(id=1, is_admin=True)
    repositories = {model: Mock() for model in (
        models.Session, models.User, models.UserLessonProgress, models.UserTaskProgress,
    )}
    repositories[models.Session].find_one.side_effect = lambda **criteria: {
        "admin": SimpleNamespace(user_id=1), "student": SimpleNamespace(user_id=2),
    }.get(criteria["session_token"])
    repositories[models.User].find_one.side_effect = lambda **criteria: {
        1: administrator, 2: student,
    }.get(criteria["id"])
    repositories[models.UserTaskProgress].find_one.return_value = None
    opened = []
    uows = []
    commit_effect = []

    def override_db():
        db = object()
        opened.append(db)
        yield db

    def make_uow(db):
        uow = Mock()
        uow.db = db
        uow.repository.side_effect = lambda entity_type: repositories[entity_type]
        if commit_effect:
            uow.commit.side_effect = list(commit_effect)
        uows.append(uow)
        return uow

    app.dependency_overrides[get_db] = override_db
    app.state.composition_root = make_root(make_uow)
    return SimpleNamespace(
        app=app, student=student, repositories=repositories,
        opened=opened, uows=uows, commit_effect=commit_effect,
    )


def test_http_identity_and_admin_use_substituted_repositories(repository_app):
    h = repository_app

    async def exercise():
        assert (await request(h.app, "GET", "/user/me"))[0] == 401
        assert (await request(h.app, "GET", "/user/me", cookie="invalid"))[0] == 401
        status, body = await request(h.app, "GET", "/user/me", cookie="student")
        assert status == 200 and body["user"]["id"] == 2
        h.repositories[models.User].find_one.reset_mock()
        status, _ = await request(
            h.app, "PATCH", "/admin/users/2/subscription", cookie="student", payload={"days": None}
        )
        assert status == 403
        h.repositories[models.User].find_one.assert_called_once_with(id=2)
        h.uows[-1].commit.assert_not_called()
        status, _ = await request(
            h.app, "PATCH", "/admin/users/99/subscription", cookie="admin", payload={"days": None}
        )
        assert status == 404
        h.uows[-1].commit.assert_not_called()
        status, body = await request(
            h.app, "PATCH", "/admin/users/2/subscription", cookie="admin", payload={"days": None}
        )
        assert status == 200 and body["user"]["subscription_until"] is None
        h.uows[-1].commit.assert_called_once_with()
        h.uows[-1].refresh.assert_called_once_with(h.student)
        assert len(h.opened) == len(h.uows)
        assert all(uow.db is db for uow, db in zip(h.uows, h.opened))

    asyncio.run(exercise())


def test_http_completion_uses_substituted_repositories_and_rolls_back_race(repository_app, monkeypatch):
    h = repository_app
    lesson = {
        "id": "lesson-stable", "access": "free", "source_file": "legacy/lesson.md",
        "self_check": True, "tasks": [], "manual_practice": [],
    }
    monkeypatch.setattr(courses, "find_lesson", lambda _lesson_id: lesson)

    async def exercise():
        assert (await request(h.app, "POST", "/learning/lessons/lesson-stable/complete"))[0] == 401
        status, body = await request(
            h.app, "POST", "/learning/lessons/lesson-stable/complete", cookie="student"
        )
        assert status == 200 and body == {"lesson_id": "lesson-stable", "completed": True}
        added = h.repositories[models.UserLessonProgress].add.call_args.args[0]
        assert (added.user_id, added.lesson_id) == (2, "lesson-stable")
        h.uows[-1].commit.assert_called_once_with()

        lesson.update(source_file="chapter_01/block_01/lesson.md", manual_practice=[{"title": "check"}])
        existing = SimpleNamespace(task_revision="old", completed_at=None)
        task_repo = h.repositories[models.UserTaskProgress]
        task_repo.find_one.side_effect = [None, existing]
        h.commit_effect[:] = [IntegrityError("insert", {}, RuntimeError("duplicate")), None]
        status, body = await request(
            h.app, "POST", "/learning/lessons/lesson-stable/complete", cookie="student"
        )
        assert status == 200 and body["completed"] is True
        added_task = task_repo.add.call_args.args[0]
        assert added_task.task_id == progress.chapter_one_completion_task_id("lesson-stable")
        assert existing.task_revision == progress.chapter_one_completion_revision(lesson)
        assert h.uows[-1].commit.call_count == 2
        h.uows[-1].rollback.assert_called_once_with()

    asyncio.run(exercise())


def test_http_admin_failed_commit_rolls_back_on_session_close(runtime_db):
    sessions = runtime_db
    engine = runtime_db.kw["bind"]
    with sessions() as db:
        db.add_all([
            models.User(id=1, username="Admin", email="admin@example.test", _password_hash="test", is_admin=True),
            models.User(id=2, username="Student", email="student@example.test", _password_hash="test",
                        subscription_until=datetime(2099, 1, 1, tzinfo=timezone.utc), subscription_plan="pro"),
        ])
        db.commit()
    closed = []

    class FailingSession(Session):
        def commit(self):
            self.flush()
            raise RuntimeError("forced commit failure")

    failing_sessions = sessionmaker(bind=engine, class_=FailingSession, autoflush=False)
    app = FastAPI()
    attach_identity(app, {"admin": 1, "student": 2})
    app.include_router(admin_router, prefix="/admin")
    app.state.composition_root = make_root(SqlAlchemyUnitOfWork)

    def override_db():
        with failing_sessions() as db:
            try:
                yield db
            finally:
                closed.append(db)

    app.dependency_overrides[get_db] = override_db
    with pytest.raises(RuntimeError, match="forced commit failure"):
        asyncio.run(request(
            app, "PATCH", "/admin/users/2/subscription", cookie="admin", payload={"days": None}
        ))
    assert len(closed) == 1
    with sessions() as db:
        user = db.query(models.User).filter_by(id=2).one()
        assert user.subscription_until is not None and user.subscription_plan == "pro"


def test_http_duplicate_completion_rolls_back_the_request_session(monkeypatch, runtime_db):
    sessions = runtime_db
    engine = runtime_db.kw["bind"]
    with sessions() as db:
        db.add(models.User(id=2, username="Student", email="student@example.test", _password_hash="test"))
        db.flush()
        db.add(models.UserLessonProgress(user_id=2, lesson_id="lesson-stable"))
        db.commit()
    rollbacks = []

    class TrackingUow(SqlAlchemyUnitOfWork):
        def rollback(self):
            rollbacks.append(self.session)
            super().rollback()

    app = FastAPI()
    attach_identity(app, {"admin": 1, "student": 2})
    app.include_router(learning_router, prefix="/learning")
    app.state.composition_root = make_root(TrackingUow)

    def override_db():
        with sessions() as db:
            db.add(models.BookingQuota(user_id=2, year=2026, month=11, granted_slots=3))
            yield db

    app.dependency_overrides[get_db] = override_db
    monkeypatch.setattr(courses, "find_lesson", lambda _: {
        "id": "lesson-stable", "access": "free", "source_file": "legacy/lesson.md",
        "self_check": True, "tasks": [], "manual_practice": [],
    })
    status, body = asyncio.run(request(
        app, "POST", "/learning/lessons/lesson-stable/complete", cookie="student"
    ))
    assert status == 200 and body["completed"] is True
    assert len(rollbacks) == 1
    with sessions() as db:
        assert db.query(models.UserLessonProgress).count() == 1
        assert db.query(models.BookingQuota).count() == 0


def test_http_submit_uses_a_fresh_worker_session_and_substituted_task_repository(monkeypatch, runtime_db):
    sessions = runtime_db
    engine = runtime_db.kw["bind"]
    with sessions() as db:
        db.add(models.User(id=2, username="Student", email="student@example.test", _password_hash="test"))
        db.commit()
    active, opened, writers, repositories, commits = [], [], [], [], []

    class Scope:
        def __enter__(self):
            self.db = sessions()
            active.append(self.db)
            opened.append(self.db)
            return self.db

        def __exit__(self, *_args):
            active.remove(self.db)
            self.db.close()

    class TrackingUow(SqlAlchemyUnitOfWork):
        def __init__(self, session):
            super().__init__(session)
            writers.append(session)

        def repository(self, entity_type):
            repository = Mock(wraps=super().repository(entity_type))
            repositories.append((entity_type, repository))
            return repository

        def commit(self):
            commits.append(self.session)
            super().commit()

    task = {"id": "task-stable", "revision": "a" * 64}
    lesson = {
        "id": "lesson-stable", "access": "registered", "source_file": "chapter_01/block_01/lesson.md",
        "tasks": [task], "manual_practice": [{"title": "manual"}],
    }
    monkeypatch.setattr(courses, "SessionLocal", Scope)
    monkeypatch.setattr(courses, "find_task", lambda _: task)
    monkeypatch.setattr(courses, "find_lesson_by_task", lambda _: lesson)
    monkeypatch.setenv(courses.RUNNER_ENABLED_ENV, "1")
    executions = []
    state = SimpleNamespace(success=True)

    async def execute(_function, _code, _task):
        assert active == []
        executions.append(True)
        return {"ok": state.success, "score": 100 if state.success else 0, "tests": [], "stdout": ""}

    monkeypatch.setattr(courses, "_execute_task", execute)
    app = FastAPI()
    attach_identity(app, {"admin": 1, "student": 2})
    app.include_router(learning_router, prefix="/learning")
    app.state.composition_root = make_root(TrackingUow)
    async def exercise():
        body = {"code": "pass", "task_revision": task["revision"]}
        assert (await request(app, "POST", "/learning/tasks/task-stable/submit", payload=body))[0] == 403
        assert executions == [] and writers == []
        status, response = await request(
            app, "POST", "/learning/tasks/task-stable/submit", cookie="student", payload=body
        )
        assert status == 200 and response["ok"] is True
        status, response = await request(
            app, "POST", "/learning/tasks/task-stable/submit", cookie="student", payload=body
        )
        assert status == 200 and response["ok"] is True
        state.success = False
        status, response = await request(
            app, "POST", "/learning/tasks/task-stable/submit", cookie="student", payload=body
        )
        assert status == 200 and response["ok"] is False
        state.success = True
        task.update(id="second-task", revision="b" * 64)
        lesson.update(source_file="foundations/block_03/lesson.md", manual_practice=[])
        status, response = await request(
            app, "POST", "/learning/tasks/second-task/submit", cookie="student",
            payload={"code": "pass", "task_revision": task["revision"]},
        )
        assert status == 200 and response["ok"] is True
    asyncio.run(exercise())
    assert len(opened) == 8 and len(writers) == 3
    assert writers[0] is opened[2] and opened[1] is not opened[2]
    assert writers[1] is opened[4] and opened[3] is not opened[4]
    assert writers[2] is opened[7] and opened[6] is not opened[7]
    assert commits == [writers[0], writers[2], writers[2]]
    assert active == []
    assert [kind for kind, _ in repositories] == [
        models.UserTaskProgress, models.UserTaskProgress,
        models.UserTaskProgress, models.UserLessonProgress,
    ]
    repositories[0][1].find_one.assert_called_once_with(user_id=2, task_id="task-stable")
    repositories[0][1].add.assert_called_once()
    repositories[1][1].add.assert_not_called()
    with sessions() as db:
        saved = {row.task_id: row.task_revision for row in db.query(models.UserTaskProgress).all()}
        assert saved == {"task-stable": "a" * 64, "second-task": "b" * 64}
        assert db.query(models.UserLessonProgress).filter_by(user_id=2, lesson_id="lesson-stable").count() == 1
