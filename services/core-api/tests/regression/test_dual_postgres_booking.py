"""Concurrency invariants against disposable local PostgreSQL, never real data."""

from concurrent.futures import ThreadPoolExecutor
from datetime import date
from datetime import timedelta
import os
import threading
import time
from uuid import uuid4

from fastapi import HTTPException
import pytest
from sqlalchemy import create_engine
from sqlalchemy import event
from sqlalchemy import text
from sqlalchemy.orm import Session

from sqlalchemy.engine import make_url
from pymentor_core.adapters.sql import models
from pymentor_core.modules.bookings.api import service


@pytest.fixture
def pg_engine():
    if os.getenv("KNOWI_PG02_INTEGRATION") != "1":
        pytest.fail("Target concurrency suite requires actual PostgreSQL/Redis")
    url = make_url(os.environ["KNOWI_TEST_PG_URL"]).set(drivername="postgresql+psycopg")
    assert (url.host, url.port, url.database, url.username) == ("127.0.0.1", 57382, "pymentor_test", "pymentor_test")
    from pymentor_core.app.wiring import configure_bindings
    configure_bindings()
    engine = create_engine(url, pool_size=4, max_overflow=0, pool_timeout=3,
                           connect_args={"connect_timeout": 3}, hide_parameters=True)
    try:
        with engine.connect() as conn:
            assert tuple(conn.execute(text("SELECT current_database(), current_user")).one()) == (
                "pymentor_test", "pymentor_test")
        yield engine
    finally:
        engine.dispose()


def unused_future_day(engine):
    start = date(2095, 1, 1) + timedelta(days=uuid4().int % 1000)
    with Session(engine) as db:
        for offset in range(1000):
            day = start + timedelta(days=offset)
            if not db.query(models.BookingSlot.id).filter_by(slot_date=day).first():
                return day
    raise AssertionError("No empty synthetic date found")


def run_with_observed_blocking(engine, first, second, lock_statement):
    """Hold the first real DB lock and prove the second backend waits on it."""
    leader_locked = threading.Event()
    release_leader = threading.Event()
    follower_ready = threading.Event()
    pids = {}

    def after_query(conn, cursor, statement, parameters, context, executemany):
        if (threading.current_thread().name == "dual-lock-leader" and not leader_locked.is_set()
                and lock_statement(" ".join(statement.lower().split()))):
            leader_locked.set()
            if not release_leader.wait(timeout=8):
                raise AssertionError("test did not release the first transaction")

    def invoke(label, operation):
        threading.current_thread().name = f"dual-lock-{label}"
        with Session(engine) as db:
            pids[label] = db.execute(text("SELECT pg_backend_pid()")).scalar_one()
            if label == "follower":
                follower_ready.set()
            try:
                operation(db)
                return 200
            except HTTPException as exc:
                db.rollback()
                return exc.status_code

    event.listen(engine, "after_cursor_execute", after_query)
    try:
        with ThreadPoolExecutor(max_workers=2) as executor:
            first_future = executor.submit(invoke, "leader", first)
            try:
                assert leader_locked.wait(timeout=5), "first transaction never acquired its expected lock"
                second_future = executor.submit(invoke, "follower", second)
                assert follower_ready.wait(timeout=5), "second transaction did not acquire a connection"
                deadline = time.monotonic() + 5
                with engine.connect() as observer:
                    while True:
                        blocked = observer.execute(text(
                            "SELECT :leader = ANY(pg_blocking_pids(:follower))"
                        ), pids).scalar_one()
                        if blocked:
                            break
                        if time.monotonic() >= deadline:
                            raise AssertionError("PostgreSQL did not report the expected lock wait")
                        time.sleep(0.03)
            finally:
                release_leader.set()
            return first_future.result(timeout=8), second_future.result(timeout=8)
    finally:
        release_leader.set()
        event.remove(engine, "after_cursor_execute", after_query)


def test_concurrent_bookings_never_exceed_one_granted_slot(pg_engine, monkeypatch):
    email = f"dual-booking-{uuid4().hex}@example.test"
    day = unused_future_day(pg_engine)
    user_id = None
    slot_ids = []
    barrier = threading.Barrier(2)
    original = service.get_quota_status

    def synchronized_quota(*args, **kwargs):
        result = original(*args, **kwargs)
        try:
            barrier.wait(timeout=1.5)
        except threading.BrokenBarrierError:
            pass
        return result

    monkeypatch.setattr(service, "get_quota_status", synchronized_quota)
    try:
        with Session(pg_engine) as db:
            user = models.User(username="Synthetic Booking", email=email, _password_hash="synthetic")
            db.add(user)
            db.flush()
            user_id = user.id
            db.add(models.BookingQuota(user_id=user_id, year=day.year, month=day.month, granted_slots=1))
            slots = [models.BookingSlot(slot_date=day, start_time=start, duration_minutes=60)
                     for start in ("10:00", "14:00")]
            db.add_all(slots)
            db.commit()
            slot_ids = [slot.id for slot in slots]

        def book(slot_id):
            with Session(pg_engine) as db:
                try:
                    service.book_slot(slot_id, user_id, db,
                                      notification_username="Synthetic Booking", notification_email=email)
                    return 200
                except HTTPException as exc:
                    db.rollback()
                    return exc.status_code

        with ThreadPoolExecutor(max_workers=2) as executor:
            results = list(executor.map(book, slot_ids))
        assert sorted(results) == [200, 403]
        with Session(pg_engine) as db:
            assert db.query(models.BookingSlot).filter(models.BookingSlot.id.in_(slot_ids),
                                                       models.BookingSlot.student_id == user_id).count() == 1
    finally:
        with Session(pg_engine) as db:
            if slot_ids:
                db.query(models.BookingNotificationOutbox).filter(
                    models.BookingNotificationOutbox.slot_id.in_(slot_ids)).delete(synchronize_session=False)
                db.query(models.BookingSlot).filter(models.BookingSlot.id.in_(slot_ids)).delete(synchronize_session=False)
            if user_id is not None:
                db.query(models.BookingQuota).filter_by(user_id=user_id).delete(synchronize_session=False)
                db.query(models.User).filter_by(id=user_id, email=email).delete(synchronize_session=False)
            db.commit()


def test_concurrent_overlapping_slot_creation_has_one_winner(pg_engine):
    day = unused_future_day(pg_engine)
    barrier = threading.Barrier(2)
    created_ids = []
    created_lock = threading.Lock()

    def after_query(conn, cursor, statement, parameters, context, executemany):
        normalized = statement.lower()
        if "from booking_slots" in normalized and "slot_date" in normalized and "for update" in normalized:
            try:
                barrier.wait(timeout=1.5)
            except threading.BrokenBarrierError:
                pass

    def create(start):
        with Session(pg_engine) as db:
            try:
                slot = service.create_slot(day, start, 60, db)
                with created_lock:
                    created_ids.append(slot.id)
                return 200
            except HTTPException as exc:
                db.rollback()
                return exc.status_code

    event.listen(pg_engine, "after_cursor_execute", after_query)
    try:
        with ThreadPoolExecutor(max_workers=2) as executor:
            results = list(executor.map(create, ("10:00", "10:30")))
        assert sorted(results) == [200, 409]
    finally:
        event.remove(pg_engine, "after_cursor_execute", after_query)
        if created_ids:
            with Session(pg_engine) as db:
                db.query(models.BookingSlot).filter(models.BookingSlot.id.in_(created_ids)).delete(
                    synchronize_session=False)
                db.commit()


def test_concurrent_quota_grants_do_not_lose_an_increment(pg_engine):
    email = f"dual-quota-{uuid4().hex}@example.test"
    barrier = threading.Barrier(2)
    user_id = None

    def after_query(conn, cursor, statement, parameters, context, executemany):
        normalized = " ".join(statement.lower().split())
        if "from booking_quotas" in normalized and "where booking_quotas.user_id" in normalized:
            try:
                barrier.wait(timeout=1.5)
            except threading.BrokenBarrierError:
                pass

    def grant(_):
        with Session(pg_engine) as db:
            return service.add_quota(user_id, 2099, 1, 1, db)

    try:
        with Session(pg_engine) as db:
            user = models.User(username="Synthetic Quota", email=email, _password_hash="synthetic")
            db.add(user)
            db.commit()
            user_id = user.id
        event.listen(pg_engine, "after_cursor_execute", after_query)
        try:
            with ThreadPoolExecutor(max_workers=2) as executor:
                results = list(executor.map(grant, (1, 2)))
            assert sorted(results) == [1, 2]
        finally:
            event.remove(pg_engine, "after_cursor_execute", after_query)
        with Session(pg_engine) as db:
            assert service.get_quota(user_id, 2099, 1, db) == 2
    finally:
        if user_id is not None:
            with Session(pg_engine) as db:
                db.query(models.BookingQuota).filter_by(user_id=user_id).delete(synchronize_session=False)
                db.query(models.User).filter_by(id=user_id, email=email).delete(synchronize_session=False)
                db.commit()


def test_postgres_slot_write_refuses_stale_repeatable_read_snapshot(pg_engine):
    day = unused_future_day(pg_engine)
    created_id = None
    try:
        with pg_engine.connect().execution_options(isolation_level="REPEATABLE READ") as conn:
            with Session(bind=conn) as db:
                with pytest.raises(RuntimeError, match="READ COMMITTED"):
                    slot = service.create_slot(day, "09:00", 60, db)
                    created_id = slot.id
    finally:
        if created_id is not None:
            with Session(pg_engine) as db:
                db.query(models.BookingSlot).filter_by(id=created_id).delete(synchronize_session=False)
                db.commit()


def test_postgres_observes_user_lock_before_quota_recheck(pg_engine):
    email = f"dual-observed-{uuid4().hex}@example.test"
    day = unused_future_day(pg_engine)
    user_id, slot_ids = None, []
    try:
        with Session(pg_engine) as db:
            user = models.User(username="Synthetic Booking", email=email, _password_hash="synthetic")
            db.add(user)
            db.flush()
            user_id = user.id
            db.add(models.BookingQuota(user_id=user_id, year=day.year, month=day.month, granted_slots=1))
            slots = [models.BookingSlot(slot_date=day, start_time=start, duration_minutes=60)
                     for start in ("10:00", "14:00")]
            db.add_all(slots)
            db.commit()
            slot_ids = [slot.id for slot in slots]
        def book(slot_id):
            def operation(db):
                service.book_slot(slot_id, user_id, db,
                                  notification_username="Synthetic Booking", notification_email=email)
            return operation
        outcomes = run_with_observed_blocking(
            pg_engine, book(slot_ids[0]), book(slot_ids[1]),
            lambda sql: "from users" in sql and "for update" in sql,
        )
        assert outcomes == (200, 403)
    finally:
        with Session(pg_engine) as db:
            if slot_ids:
                db.query(models.BookingNotificationOutbox).filter(
                    models.BookingNotificationOutbox.slot_id.in_(slot_ids)).delete(synchronize_session=False)
                db.query(models.BookingSlot).filter(models.BookingSlot.id.in_(slot_ids)).delete(synchronize_session=False)
            if user_id is not None:
                db.query(models.BookingQuota).filter_by(user_id=user_id).delete(synchronize_session=False)
                db.query(models.User).filter_by(id=user_id, email=email).delete(synchronize_session=False)
            db.commit()


def test_postgres_observes_date_lock_before_overlap_recheck(pg_engine):
    day = unused_future_day(pg_engine)
    created_ids = []
    def create(start):
        def operation(db):
            slot = service.create_slot(day, start, 60, db)
            created_ids.append(slot.id)
        return operation
    try:
        outcomes = run_with_observed_blocking(
            pg_engine, create("10:00"), create("10:30"), lambda sql: "pg_advisory_xact_lock" in sql,
        )
        assert outcomes == (200, 409)
    finally:
        if created_ids:
            with Session(pg_engine) as db:
                db.query(models.BookingSlot).filter(models.BookingSlot.id.in_(created_ids)).delete(
                    synchronize_session=False)
                db.commit()
