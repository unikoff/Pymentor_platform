"""Worker checks on a separately migrated, task-owned PostgreSQL database."""
import json
import os
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor
from datetime import date, datetime, timedelta, timezone
from threading import Barrier
from unittest.mock import Mock, patch

import pytest
from sqlalchemy import create_engine, text
from sqlalchemy import event as sqlalchemy_event
from sqlalchemy.engine import make_url
from sqlalchemy.orm import sessionmaker

from pymentor_core.adapters.sql import models, notification_outbox as delivery
from pymentor_core.adapters.sql import bookings
from pymentor_core.adapters.sql import landings


@pytest.fixture
def worker_database():
    if os.getenv("KNOWI_PG02_INTEGRATION") != "1":
        pytest.skip("requires the task-owned worker PostgreSQL")
    url = make_url(os.environ["KNOWI_TEST_PG_URL"])
    assert (url.host, url.port, url.database, url.username) == (
        "127.0.0.1", 57382, "pymentor_test", "pymentor_test")
    engine = create_engine(url.set(database="pg05_worker_test"))
    def clear():
        with engine.begin() as connection:
            assert connection.execute(text("SELECT current_database(),current_user")).one() == ("pg05_worker_test", "pymentor_test")
            connection.execute(text("TRUNCATE users, booking_slots, booking_notification_outbox, booking_notification_delivery_state, landings, landing_notification_outbox, landing_notification_delivery_state RESTART IDENTITY CASCADE"))
    clear()
    try:
        yield sessionmaker(bind=engine), engine
    finally:
        clear()
        engine.dispose()


def enqueue(sessions, *, slot_id=42, **kwargs):
    with sessions() as db:
        event = models.BookingNotificationOutbox(event_type="booking_created", slot_id=slot_id,
            username="synthetic", email="pg05@example.invalid", slot_date=date(2099, 1, 1), start_time="10:00", **kwargs)
        db.add(event)
        db.commit()
        return event.id


def test_stats_uses_managed_schema_and_never_calls_transport(worker_database):
    sessions, engine = worker_database
    enqueue(sessions)
    env = os.environ.copy()
    env.update(DATABASE_URL=engine.url.render_as_string(hide_password=False), REDIS_URL=os.environ["KNOWI_TEST_REDIS_URL"],
               KNOWI_REDIS_PREFIX="pg05:stats:", KNOWI_LOGIN_RECOVERY_KEY="ab" * 32, PYMENTOR_LOG_TO_STDOUT="1")
    env.pop("PYMENTOR_PROFILE", None)
    code = """
from pymentor_core.adapters.sql import notification_outbox as delivery
def forbidden(event): raise AssertionError('stats attempted delivery')
delivery._send_notification = forbidden
from pymentor_core.app.worker import main
raise SystemExit(main())
"""
    result = subprocess.run([sys.executable, "-c", code, "--stats"], env=env, capture_output=True, text=True, timeout=15)
    assert result.returncode == 0, result.stderr + result.stdout
    assert json.loads(result.stdout)["counts"] == {"pending": 1}
    with sessions() as db:
        assert db.query(models.BookingNotificationOutbox).one().attempts == 0


def test_producer_commit_failure_rolls_back_booking_and_outbox(worker_database):
    sessions, _ = worker_database
    with sessions() as db:
        user = models.User(username="synthetic", email="producer@example.invalid", _password_hash="synthetic")
        slot = models.BookingSlot(slot_date=date(2099, 1, 1), start_time="10:00")
        db.add_all([user, slot])
        db.flush()
        uid, sid = user.id, slot.id
        db.add(models.BookingQuota(user_id=uid, year=2099, month=1, granted_slots=1))
        db.commit()
        with patch.object(db, "commit", side_effect=RuntimeError("synthetic failed commit")):
            with pytest.raises(RuntimeError, match="failed commit"):
                bookings.book_slot(sid, uid, db, notification_username="synthetic", notification_email="producer@example.invalid")
        db.rollback()
        assert db.get(models.BookingSlot, sid).student_id is None
        assert db.query(models.BookingNotificationOutbox).count() == 0


def test_two_claimers_never_claim_the_same_event(worker_database):
    sessions, _ = worker_database
    ids = {enqueue(sessions, slot_id=1), enqueue(sessions, slot_id=2)}
    barrier = Barrier(2)
    def claim():
        with sessions() as db:
            barrier.wait(timeout=5)
            return delivery._claim_next(db).id
    with ThreadPoolExecutor(max_workers=2) as pool:
        assert set(pool.map(lambda _: claim(), range(2))) == ids


def test_lease_expiry_reclaims_once_and_stale_completion_cannot_overwrite(worker_database):
    sessions, _ = worker_database
    event_id = enqueue(sessions)
    with sessions() as db:
        original = delivery._claim_next(db)
    with sessions() as db:
        db.get(models.BookingNotificationOutbox, event_id).locked_until = datetime.now(timezone.utc) - timedelta(seconds=1)
        db.commit()
    with sessions() as db:
        retried = delivery._claim_next(db)
    assert retried.id == original.id and retried.lock_token != original.lock_token
    assert delivery._finish_success(sessions, original) is False
    assert delivery._finish_success(sessions, retried) is True


@pytest.mark.parametrize("error,outcome", [(OSError("synthetic lost reply"), "retry"), (RuntimeError("synthetic permanent"), "failed")])
def test_transport_failure_has_bounded_retry_and_no_raw_error(worker_database, error, outcome):
    sessions, _ = worker_database
    event_id = enqueue(sessions)
    sink = Mock(side_effect=error)
    result = delivery.drain_notifications(session_factory=sessions, send=sink)
    assert result[outcome] == 1 and sink.call_count == 1
    with sessions() as db:
        event = db.get(models.BookingNotificationOutbox, event_id)
        assert event.attempts == 1 and "synthetic" not in event.last_error
        if outcome == "retry":
            assert event.next_attempt_at > datetime.now(timezone.utc)


def test_exhausted_lease_is_not_sent_again(worker_database):
    sessions, _ = worker_database
    enqueue(sessions, status="processing", attempts=delivery.MAX_ATTEMPTS,
            locked_until=datetime.now(timezone.utc) - timedelta(seconds=1))
    sink = Mock()
    delivery.drain_notifications(session_factory=sessions, send=sink)
    sink.assert_not_called()
    with sessions() as db:
        assert db.query(models.BookingNotificationOutbox).one().status == "failed"


def test_unreviewed_import_never_replays_unknown_delivery(worker_database):
    sessions, engine = worker_database
    enqueue(sessions, status="processing", locked_until=datetime.now(timezone.utc) - timedelta(seconds=1))
    with engine.begin() as connection:
        connection.execute(text("CREATE SCHEMA c232_lab_control"))
        connection.execute(text("CREATE TABLE c232_lab_control.import_marker(id integer)"))
    sink = Mock()
    try:
        with pytest.raises(RuntimeError, match="imported_outbox_review_unavailable"):
            delivery.drain_notifications(session_factory=sessions, send=sink)
        sink.assert_not_called()
    finally:
        with engine.begin() as connection:
            connection.execute(text("DROP SCHEMA c232_lab_control CASCADE"))


def test_landing_enqueue_is_idempotent_and_sink_uses_original_destination(worker_database):
    sessions, _ = worker_database
    with sessions() as db:
        landing = landings.create_landing(db, slug="pg05", title="Synthetic", description="Worker test")
        first = landings.configure_landing_telegram(db, landing.id, secret_ref="pg05-v1", chat_id="synthetic-one", bot_username="synthetic")
        event, was_duplicate = landings.enqueue_landing_event(db, landing_id=landing.id, event_id="pg05-event", event_type="telegram_connection_test.v1", payload={})
        event_id, config_id, landing_id = event.id, first.id, landing.id
        again, duplicate = landings.enqueue_landing_event(db, landing_id=landing_id, event_id="pg05-event", event_type="telegram_connection_test.v1", payload={})
        assert was_duplicate is False and duplicate is True and again.id == event_id
        landings.configure_landing_telegram(db, landing_id, secret_ref="pg05-v2", chat_id="synthetic-two", bot_username="synthetic")
        landings.disable_landing_telegram(db, landing_id)
    sink = Mock()
    assert delivery.drain_notifications(session_factory=sessions, send=sink)["sent"] == 1
    claimed = sink.call_args.args[0]
    assert claimed.destination_config_id == config_id and claimed.chat_id == "synthetic-one"
    with sessions() as db:
        assert db.get(models.LandingNotificationOutbox, event_id).status == "sent"


def test_schema_check_only_reads_and_wrong_revision_refuses_worker(worker_database):
    _, engine = worker_database
    from pymentor_core.app.wiring import ensure_notification_schema
    statements = []
    def record(conn, cursor, statement, params, context, executemany):
        statements.append(statement.lstrip().split()[0].upper())
    sqlalchemy_event.listen(engine, "before_cursor_execute", record)
    try:
        ensure_notification_schema(engine)
    finally:
        sqlalchemy_event.remove(engine, "before_cursor_execute", record)
    assert statements and set(statements) <= {"SELECT"}
    with engine.begin() as connection:
        previous = connection.execute(text("SELECT version_num FROM alembic_version")).scalar_one()
        connection.execute(text("UPDATE alembic_version SET version_num='pg05_wrong'"))
    try:
        with pytest.raises(RuntimeError, match="migration required"):
            ensure_notification_schema(engine)
    finally:
        with engine.begin() as connection:
            connection.execute(text("UPDATE alembic_version SET version_num=:revision"), {"revision": previous})
