from __future__ import annotations

import ast
import asyncio
import importlib
import inspect
import json
from datetime import date
from datetime import datetime
from datetime import timedelta
from datetime import timezone
from importlib.util import resolve_name
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock

import pytest
from pg_business_support import runtime_db, attach_identity
from sqlalchemy.exc import IntegrityError


BACKEND_ROOT = (Path(__file__).resolve().parents[4] / 'backend')


def _module(name: str):
    try:
        return importlib.import_module(name)
    except ModuleNotFoundError as error:
        if error.name == name:
            pytest.fail(f"required module {name} has not been implemented")
        raise


def test_fake_adapters_exercise_clock_permissions_queue_and_external_api():
    fakes = _module('support_fakes')
    current_time = datetime(2026, 11, 4, 12, 30, tzinfo=timezone.utc)
    clock = fakes.FakeClock(current_time)
    permissions = fakes.FakePermissions({("student-7", "booking.read")})
    queue = fakes.FakeQueue()
    external_api = fakes.FakeExternalAPI(
        {("GET", "/profile"): {"display_name": "Student"}}
    )

    assert clock.now() == current_time
    assert permissions.allows("student-7", "booking.read")
    assert not permissions.allows("student-7", "booking.cancel")

    queue.enqueue("booking.created", {"slot_id": 12})
    assert queue.messages == [("booking.created", {"slot_id": 12})]

    response = external_api.request("GET", "/profile", timeout=2.0)
    assert response == {"display_name": "Student"}
    assert external_api.requests == [
        {"method": "GET", "url": "/profile", "payload": None, "timeout": 2.0}
    ]


def test_request_composition_creates_a_fresh_uow_around_the_supplied_session():
    composition = _module('pymentor_core.app.context')
    sqlalchemy_adapter = _module('pymentor_core.adapters.sql.unit_of_work')
    fakes = _module('support_fakes')
    dependencies = _module('pymentor_core.app.dependencies')

    clock = fakes.FakeClock(datetime(2026, 11, 4, tzinfo=timezone.utc))
    root = composition.CompositionRoot(
        uow_factory=sqlalchemy_adapter.SqlAlchemyUnitOfWork,
        clock=clock,
        permissions=fakes.FakePermissions(),
        queue=fakes.FakeQueue(),
        external_api=fakes.FakeExternalAPI(),
    )
    session = object()
    request = SimpleNamespace(
        app=SimpleNamespace(state=SimpleNamespace(composition_root=root))
    )

    first = dependencies.get_request_context(request=request, db=session)
    second = dependencies.get_request_context(request=request, db=session)

    assert first is not second
    assert first.uow is not second.uow
    assert first.uow.session is session
    assert first.clock is clock


def test_activity_recording_works_with_sql_and_fake_repository_adapters(runtime_db):
    activity = _module('pymentor_core.modules.identity.activity')
    sqlalchemy_adapter = _module('pymentor_core.adapters.sql.unit_of_work')
    fakes = _module('support_fakes')
    models = _module('pymentor_core.adapters.sql.models')
    db_engine = _module('pymentor_core.app.database')

    assert "uow" in inspect.signature(activity.record_activity_day).parameters
    assert "clock" in inspect.signature(activity.record_activity_day).parameters

    current_time = datetime(2026, 11, 4, 12, 30, tzinfo=timezone.utc)
    clock = fakes.FakeClock(current_time)
    activity_date = date(2026, 11, 4)
    session_factory = runtime_db

    with session_factory() as session:
        session.add(models.User(id=7, username="Ports", email="ports@example.test", _password_hash="test"))
        session.commit()
        sql_uow = sqlalchemy_adapter.SqlAlchemyUnitOfWork(session)
        saved_sql = activity.record_activity_day(
            7, activity_date, session, uow=sql_uow, clock=clock
        )
        repeated_sql = activity.record_activity_day(
            7,
            activity_date,
            session,
            visited_at=datetime(2026, 11, 5, tzinfo=timezone.utc),
            uow=sql_uow,
            clock=clock,
        )
        assert saved_sql.id == repeated_sql.id
        assert activity.serialize_activity_timestamp(repeated_sql.visited_at) == (
            "2026-11-04T12:30:00+00:00"
        )
        assert session.query(models.UserActivityDay).count() == 1
    memory = fakes.InMemoryDatabase()
    memory_uow = fakes.InMemoryUnitOfWork(memory)
    saved_fake = activity.record_activity_day(
        7, activity_date, None, uow=memory_uow, clock=clock
    )
    repeated_fake = activity.record_activity_day(
        7,
        activity_date,
        None,
        visited_at=datetime(2026, 11, 5, tzinfo=timezone.utc),
        uow=memory_uow,
        clock=clock,
    )
    assert saved_fake is repeated_fake
    assert activity.serialize_activity_timestamp(repeated_fake.visited_at) == (
        "2026-11-04T12:30:00+00:00"
    )
    assert len(memory.items(models.UserActivityDay)) == 1


def test_booking_listing_uses_the_injected_clock_without_changing_slot_visibility(runtime_db):
    booking_service = _module('pymentor_core.modules.bookings.api.service')
    fakes = _module('support_fakes')
    models = _module('pymentor_core.adapters.sql.models')
    db_engine = _module('pymentor_core.app.database')

    assert "clock" in inspect.signature(booking_service.list_bookable_slots).parameters

    session_factory = runtime_db
    now = datetime(2026, 11, 4, 15, 0, tzinfo=timezone.utc)

    with session_factory() as session:
        past = models.BookingSlot(
            slot_date=date(2026, 11, 4), start_time="17:59", duration_minutes=60
        )
        future = models.BookingSlot(
            slot_date=date(2026, 11, 4), start_time="18:01", duration_minutes=60
        )
        session.add_all([past, future])
        session.commit()
        visible = booking_service.list_bookable_slots(
            2026,
            11,
            7,
            session,
            clock=fakes.FakeClock(now),
        )
        assert [slot["id"] for slot in visible] == [future.id]


def test_fake_uow_rollback_restores_committed_values_and_entity_identity():
    fakes = _module('support_fakes')
    models = _module('pymentor_core.adapters.sql.models')
    memory = fakes.InMemoryDatabase()
    uow = fakes.InMemoryUnitOfWork(memory)
    repo = uow.repository(models.BookingQuota)
    quota = models.BookingQuota(user_id=7, year=2026, month=11, granted_slots=4)
    repo.add(quota)
    uow.commit()
    assert repo.find_one(user_id=7, year=2026, month=11) is quota

    quota.granted_slots = 99
    repo.add(models.BookingQuota(user_id=8, year=2026, month=11, granted_slots=1))
    assert memory.items(models.BookingQuota)[0].granted_slots == 4
    assert fakes.InMemoryUnitOfWork(memory).repository(models.BookingQuota).find_one(
        user_id=7, year=2026, month=11
    ).granted_slots == 4
    uow.rollback()

    assert repo.find_one(user_id=7, year=2026, month=11) is quota
    assert quota.granted_slots == 4
    assert repo.find_one(user_id=8, year=2026, month=11) is None
    assert fakes.InMemoryUnitOfWork(memory).repository(models.BookingQuota).find_one(
        user_id=7, year=2026, month=11
    ).granted_slots == 4


def test_identity_lookup_uses_authenticated_principal_and_user_repository():
    import anyio
    from types import SimpleNamespace
    from pg_business_support import IdentityStub
    accounts = _module('pymentor_core.modules.identity.api.accounts')
    models = _module('pymentor_core.adapters.sql.models')
    user = SimpleNamespace(id=7)
    repository = Mock()
    repository.find_one.return_value = user
    uow = Mock()
    uow.repository.return_value = repository
    request = SimpleNamespace(cookies={"session": "session-7"}, app=SimpleNamespace(
        state=SimpleNamespace(identity_sessions=IdentityStub({"session-7": 7}))))

    async def exercise():
        found = await anyio.to_thread.run_sync(lambda: accounts.get_current_user(request=request, db=None, uow=uow))
        assert found is user
    anyio.run(exercise)
    uow.repository.assert_called_once_with(models.User)
    repository.find_one.assert_called_once_with(id=7)
    uow.commit.assert_not_called()


def test_catalog_reads_a_stable_lesson_from_its_markdown_source_without_a_repository():
    catalog = _module('pymentor_core.adapters.course_local.catalog')
    track = catalog.find_track(catalog.default_track_id())

    assert track is not None
    lesson = track["lessons"][0]
    assert catalog.find_lesson(lesson["id"]) is lesson
    assert (catalog.COURSE_ROOT / lesson["source_file"]).is_file()


def test_learning_completion_uses_repository_and_rolls_back_repeat_completion():
    progress = _module('pymentor_core.modules.learning.progress')
    models = _module('pymentor_core.adapters.sql.models')
    repository = Mock()
    uow = Mock()
    uow.repository.return_value = repository
    uow.commit.side_effect = [None, IntegrityError("insert", {}, RuntimeError("duplicate"))]

    progress.mark_lesson_completed(7, "lesson-stable", None, uow=uow)
    progress.mark_lesson_completed(7, "lesson-stable", None, uow=uow)

    added = repository.add.call_args.args[0]
    assert isinstance(added, models.UserLessonProgress)
    assert (added.user_id, added.lesson_id) == (7, "lesson-stable")
    assert repository.add.call_count == 2
    assert uow.commit.call_count == 2
    uow.rollback.assert_called_once_with()


def test_practice_revision_write_rolls_back_a_duplicate_insert_then_saves_current_revision():
    progress = _module('pymentor_core.modules.learning.progress')
    existing = SimpleNamespace(task_revision="old-revision", completed_at=None)
    repository = Mock()
    repository.find_one.side_effect = [None, existing]
    uow = Mock()
    uow.repository.return_value = repository
    uow.commit.side_effect = [
        IntegrityError("insert", {}, RuntimeError("duplicate progress")),
        None,
    ]

    progress.mark_task_completed(
        7, "task-stable", "current-revision", None, uow=uow
    )

    repository.find_one.assert_any_call(user_id=7, task_id="task-stable")
    uow.rollback.assert_called_once_with()
    assert uow.commit.call_count == 2
    assert existing.task_revision == "current-revision"
    assert existing.completed_at.tzinfo is not None


def test_access_policy_uses_identity_and_catalog_values_without_owning_a_repository():
    access = _module('pymentor_core.modules.learning.api.access')
    anonymous_allowed = access.get_lesson_access(
        {"access": "subscription"}, None
    )
    subscriber = SimpleNamespace(
        subscription_until=datetime.now(timezone.utc) + timedelta(days=1)
    )

    assert anonymous_allowed[0] is False
    assert access.get_lesson_access({"access": "subscription"}, subscriber) == (
        True,
        None,
    )


def test_admin_subscription_change_uses_identity_and_user_repositories_with_one_commit():
    import anyio
    from pg_business_support import IdentityStub
    admin = _module('pymentor_core.modules.administration.api.service')
    models = _module('pymentor_core.adapters.sql.models')
    payloads = _module('pymentor_core.modules.administration.api.schemas')
    admin_user = SimpleNamespace(id=1, is_admin=True)
    target_user = SimpleNamespace(
        id=2,
        username="Student",
        email="student@example.test",
        subscription_until=datetime.now(timezone.utc) + timedelta(days=2),
        subscription_plan="pro",
        is_admin=False,
        verified=False,
    )
    users = {1: admin_user, 2: target_user}
    session_repository = Mock()
    session_repository.find_one.return_value = SimpleNamespace(user_id=1)
    user_repository = Mock()
    user_repository.find_one.side_effect = lambda **criteria: users.get(criteria["id"])
    uow = Mock()
    uow.repository.side_effect = lambda entity_type: {
        models.Session: session_repository,
        models.User: user_repository,
    }[entity_type]
    request = SimpleNamespace(cookies={"session": "admin-session"}, app=SimpleNamespace(
        state=SimpleNamespace(identity_sessions=IdentityStub({"admin-session": 1}))))

    async def exercise():
        return await anyio.to_thread.run_sync(lambda: admin.change_subscription(
            user_id=2, payload=payloads.SubscriptionChange(days=None), request=request, db=None, uow=uow))
    result = anyio.run(exercise)

    assert target_user.subscription_until is None
    assert target_user.subscription_plan is None
    assert result["user"]["has_active_subscription"] is False
    uow.commit.assert_called_once_with()
    uow.refresh.assert_called_once_with(target_user)


def test_each_example_module_accepts_a_stub_repository_without_a_database():
    from unittest.mock import Mock

    activity = _module('pymentor_core.modules.identity.activity')
    bookings = _module('pymentor_core.modules.bookings.api.service')
    fakes = _module('support_fakes')
    models = _module('pymentor_core.adapters.sql.models')
    instant = datetime(2026, 11, 4, 12, 30, tzinfo=timezone.utc)
    day = date(2026, 11, 4)

    existing = SimpleNamespace(user_id=7, activity_date=day, visited_at=instant)
    account_repo = Mock()
    account_repo.find_one.return_value = existing
    account_uow = Mock()
    account_uow.repository.return_value = account_repo
    result = activity.record_activity_day(7, day, None, uow=account_uow, clock=fakes.FakeClock(instant))
    assert result is existing
    account_uow.repository.assert_called_once_with(models.UserActivityDay)
    account_repo.find_one.assert_called_once_with(user_id=7, activity_date=day)
    account_uow.commit.assert_not_called()

    booking_repo = Mock()
    booking_repo.find_one.return_value = SimpleNamespace(granted_slots=4)
    booking_uow = Mock()
    booking_uow.repository.return_value = booking_repo
    assert bookings.get_quota(7, 2026, 11, None, uow=booking_uow) == 4
    booking_uow.repository.assert_called_once_with(models.BookingQuota)
    booking_repo.find_one.assert_called_once_with(user_id=7, year=2026, month=11)
    booking_uow.commit.assert_not_called()


def test_booking_quota_uses_both_sql_and_fake_repository_adapters(runtime_db):
    bookings = _module('pymentor_core.modules.bookings.api.service')
    fakes = _module('support_fakes')
    sql = _module('pymentor_core.adapters.sql.unit_of_work')
    models = _module('pymentor_core.adapters.sql.models')
    db_engine = _module('pymentor_core.app.database')
    sessions = runtime_db

    with sessions() as db:
        db.add(models.User(id=7, username="Quota", email="quota@example.test", _password_hash="test"))
        db.commit()
        db.add_all([
            models.BookingQuota(user_id=7, year=2026, month=11, granted_slots=4),
            models.BookingQuota(user_id=7, year=2026, month=12, granted_slots=9),
        ])
        db.commit()
        sql_uow = sql.SqlAlchemyUnitOfWork(db)
        assert bookings.get_quota(7, 2026, 11, db) == 4
        assert bookings.get_quota(7, 2026, 11, db, uow=sql_uow) == 4
        assert bookings.get_quota(8, 2026, 11, db, uow=sql_uow) == 0
    memory = fakes.InMemoryDatabase()
    writer = fakes.InMemoryUnitOfWork(memory)
    repo = writer.repository(models.BookingQuota)
    repo.add(models.BookingQuota(user_id=7, year=2026, month=11, granted_slots=4))
    repo.add(models.BookingQuota(user_id=7, year=2026, month=12, granted_slots=9))
    writer.commit()
    reader = fakes.InMemoryUnitOfWork(memory)
    assert bookings.get_quota(7, 2026, 11, None, uow=reader) == 4
    assert bookings.get_quota(8, 2026, 11, None, uow=reader) == 0


def test_request_routes_share_overridden_session_with_request_uow(runtime_db):
    from fastapi import FastAPI

    account_router = _module('pymentor_core.modules.identity.api.router')
    booking_router = _module('pymentor_core.modules.bookings.api.router')
    dependencies = _module('pymentor_core.app.dependencies')
    composition = _module('pymentor_core.app.context')
    sql = _module('pymentor_core.adapters.sql.unit_of_work')
    fakes = _module('support_fakes')
    models = _module('pymentor_core.adapters.sql.models')
    db_engine = _module('pymentor_core.app.database')
    sessions = runtime_db
    with sessions() as db:
        user = models.User(username="Test Student", email="ports@example.test", password="test-password")
        db.add(user)
        db.flush()
        db.add(models.BookingQuota(user_id=user.id, year=2026, month=11, granted_slots=3))
        db.add(models.BookingSlot(slot_date=date(2026, 11, 4), start_time="18:01", duration_minutes=60))
        db.commit()
        user_id = user.id

    opened = []
    uows = []
    repository_types = []

    def get_test_db():
        with sessions() as db:
            opened.append(db)
            yield db

    class TrackingUnitOfWork(sql.SqlAlchemyUnitOfWork):
        def repository(self, entity_type):
            repository_types.append(entity_type)
            return super().repository(entity_type)

    def make_uow(db):
        uow = TrackingUnitOfWork(db)
        uows.append(uow)
        return uow

    app = FastAPI()
    attach_identity(app, {"ports-test-session": user_id})
    app.include_router(account_router.user_router, prefix="/user")
    app.include_router(booking_router.booking_router, prefix="/user")
    app.dependency_overrides[dependencies.get_db] = get_test_db
    app.state.composition_root = composition.CompositionRoot(
        uow_factory=make_uow,
        clock=fakes.FakeClock(datetime(2026, 11, 4, 15, tzinfo=timezone.utc)),
        permissions=fakes.FakePermissions(),
        queue=fakes.FakeQueue(),
        external_api=fakes.FakeExternalAPI(),
    )

    async def request(method, path, query=b"", body=b""):
        delivered = False
        sent = []

        async def receive():
            nonlocal delivered
            if delivered:
                return {"type": "http.disconnect"}
            delivered = True
            return {"type": "http.request", "body": body, "more_body": False}

        async def send(message):
            sent.append(message)

        await app({
            "type": "http", "asgi": {"version": "3.0", "spec_version": "2.4"},
            "http_version": "1.1", "method": method, "scheme": "http", "path": path,
            "raw_path": path.encode(), "root_path": "", "query_string": query,
            "headers": [(b"cookie", b"session=ports-test-session"),
                        (b"content-type", b"application/json"),
                        (b"content-length", str(len(body)).encode())],
            "server": ("testserver", 80), "client": ("127.0.0.1", 12345),
        }, receive, send)
        start = next(item for item in sent if item["type"] == "http.response.start")
        payload = b"".join(item.get("body", b"") for item in sent if item["type"] == "http.response.body")
        return start["status"], json.loads(payload)

    async def exercise():
        status, slots = await request("GET", "/user/slots", b"year=2026&month=11")
        assert status == 200
        assert slots["quota"] == {"granted": 3, "used": 0, "remaining": 3}
        assert len(slots["slots"]) == 1
        status, visit = await request("POST", "/user/activity/visit", body=b"{}")
        assert status == 200
        assert visit == {"activity_date": "2026-11-04", "visited_at": "2026-11-04T15:00:00+00:00"}

    asyncio.run(exercise())
    assert len(opened) == len(uows) == 2
    assert uows[0].session is opened[0]
    assert uows[1].session is opened[1]
    assert opened[0] is not opened[1]
    assert repository_types == [models.BookingQuota, models.UserActivityDay]
    with sessions() as db:
        assert db.query(models.UserActivityDay).filter_by(user_id=user_id).count() == 1


def test_core_infrastructure_and_two_example_modules_have_no_import_cycles():
    module_files = {name: BACKEND_ROOT.parent / relative for name,relative in {'pymentor_core.shared.ports': 'services/core-api/pymentor_core/shared/ports.py', 'pymentor_core.app.context': 'services/core-api/pymentor_core/app/context.py', 'pymentor_core.app.paths': 'services/core-api/pymentor_core/app/paths.py', 'pymentor_core.app.dependencies': 'services/core-api/pymentor_core/app/dependencies.py', 'pymentor_core.app.wiring': 'services/core-api/pymentor_core/app/wiring.py', 'pymentor_core.app.database': 'services/core-api/pymentor_core/app/database.py', 'pymentor_core.adapters.sql.models': 'services/core-api/pymentor_core/adapters/sql/models.py', 'pymentor_core.adapters.sql.unit_of_work': 'services/core-api/pymentor_core/adapters/sql/unit_of_work.py', 'support_fakes': 'services/core-api/tests/regression/support_fakes.py', 'pymentor_core.app.defaults': 'services/core-api/pymentor_core/app/defaults.py', 'pymentor_core.modules.identity.activity': 'services/core-api/pymentor_core/modules/identity/activity.py', 'pymentor_core.modules.identity.api.router': 'services/core-api/pymentor_core/modules/identity/api/router.py', 'pymentor_core.modules.identity.api.schemas': 'services/core-api/pymentor_core/modules/identity/api/schemas.py', 'pymentor_core.modules.identity.api.accounts': 'services/core-api/pymentor_core/modules/identity/api/accounts.py', 'pymentor_core.modules.bookings.api.router': 'services/core-api/pymentor_core/modules/bookings/api/router.py', 'pymentor_core.modules.bookings.api.schemas': 'services/core-api/pymentor_core/modules/bookings/api/schemas.py', 'pymentor_core.modules.bookings.api.service': 'services/core-api/pymentor_core/modules/bookings/api/service.py'}.items()}
    edges = {name: set() for name in module_files}

    for name, path in module_files.items():
        assert path.is_file(), f"missing architecture module: {path}"
        tree = ast.parse(path.read_text(encoding="utf-8"), filename=str(path))
        for node in ast.walk(tree):
            imported = []
            if isinstance(node, ast.Import):
                imported.extend(alias.name for alias in node.names)
            elif isinstance(node, ast.ImportFrom):
                base = node.module or ""
                if node.level:
                    base = resolve_name("." * node.level + base, name.rpartition(".")[0])
                if base:
                    imported.append(base)
                    imported.extend(f"{base}.{alias.name}" for alias in node.names if alias.name != "*")
            edges[name].update(
                target for target in module_files if any(
                    module == target or module.startswith(target + ".")
                    for module in imported
                )
            )

    visiting: set[str] = set()
    visited: set[str] = set()

    def visit(name: str) -> None:
        assert name not in visiting, f"import cycle reaches {name}"
        if name in visited:
            return
        visiting.add(name)
        for target in edges[name]:
            visit(target)
        visiting.remove(name)
        visited.add(name)

    for module_name in module_files:
        visit(module_name)
