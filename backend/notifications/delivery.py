"""Drain durable booking notifications from SQLite and deliver them to Telegram."""
from __future__ import annotations
import errno
import logging
import os
import random
import sqlite3
import time
import threading
from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Callable
from urllib.error import URLError
from uuid import uuid4
from sqlalchemy import and_, func, or_, select, text
from sqlalchemy.orm import Session, aliased, sessionmaker
from db.engine import SessionLocal, engine
from core.config import BACKEND_ROOT
from db import models
from notifications.telegram import (
    TelegramDeliveryError,
    send_booking_cancelled_notification,
    send_booking_created_notification,
)
logger = logging.getLogger("booking_notification_worker")
MAX_ATTEMPTS = 8
MAX_BATCH_SIZE = 20
RUN_BUDGET_SECONDS = 45.0
LEASE_SECONDS = 60
SENT_RETENTION_DAYS = 30
MAX_PRUNED_PER_RUN = 500
BACKOFF_SECONDS = (60, 120, 300, 900, 1800, 3600, 3600, 3600)
LOCK_PATH = BACKEND_ROOT / ".notification-worker.lock"
LOG_PATH = BACKEND_ROOT / "notification-worker.log"



def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


@dataclass(frozen=True)
class ClaimedNotification:
    id: int
    event_id: str
    event_type: str
    username: str
    email: str
    slot_date: date
    start_time: str
    attempts: int
    lock_token: str


def _ensure_outbox_table() -> None:
    models.BookingNotificationOutbox.__table__.create(bind=engine, checkfirst=True)
    models.BookingNotificationDeliveryState.__table__.create(bind=engine, checkfirst=True)


def backup_database(destination: Path) -> Path:
    if engine.dialect.name != "sqlite" or not engine.url.database:
        raise ValueError("Backup command requires a file-based SQLite database")
    source = Path(engine.url.database).resolve()
    destination = destination.resolve()
    if not source.is_file() or source == destination:
        raise ValueError("Invalid SQLite backup source or destination")
    # Exclusive creation prevents overwriting a previous backup.
    descriptor = os.open(destination, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
    os.close(descriptor)
    try:
        source_connection = sqlite3.connect(source.as_uri() + "?mode=ro", uri=True)
        try:
            target_connection = sqlite3.connect(destination)
            try:
                source_connection.backup(target_connection)
            finally:
                target_connection.close()
        finally:
            source_connection.close()
    except Exception:
        destination.unlink(missing_ok=True)
        raise
    return destination


def _worker_lock():
    """Take a nonblocking process lock so overlapping cron invocations do not compete."""
    LOCK_PATH.parent.mkdir(parents=True, exist_ok=True)
    handle = LOCK_PATH.open("a+b")
    try:
        if os.name == "nt":
            import msvcrt

            handle.seek(0)
            if handle.read(1) == b"":
                handle.seek(0)
                handle.write(b"\0")
                handle.flush()
            handle.seek(0)
            msvcrt.locking(handle.fileno(), msvcrt.LK_NBLCK, 1)
        else:
            import fcntl

            fcntl.flock(handle.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
    except OSError as exc:
        handle.close()
        if exc.errno in (errno.EACCES, errno.EAGAIN, errno.EDEADLK):
            return None
        raise
    return handle


def _release_worker_lock(handle) -> None:
    try:
        if os.name == "nt":
            import msvcrt

            handle.seek(0)
            msvcrt.locking(handle.fileno(), msvcrt.LK_UNLCK, 1)
        else:
            import fcntl

            fcntl.flock(handle.fileno(), fcntl.LOCK_UN)
    finally:
        handle.close()


def _claim_next(session: Session, now: datetime | None = None) -> ClaimedNotification | None:
    now = now or _utcnow()
    dialect = session.get_bind().dialect.name
    earlier = aliased(models.BookingNotificationOutbox)
    due = or_(
        and_(
            models.BookingNotificationOutbox.status == "pending",
            models.BookingNotificationOutbox.next_attempt_at <= now,
        ),
        and_(
            models.BookingNotificationOutbox.status == "processing",
            models.BookingNotificationOutbox.locked_until <= now,
        ),
    )
    has_earlier_unfinished = (
        session.query(earlier.id)
        .filter(
            earlier.slot_id == models.BookingNotificationOutbox.slot_id,
            earlier.id < models.BookingNotificationOutbox.id,
            earlier.status.in_(("pending", "processing")),
        )
        .exists()
    )
    query = session.query(models.BookingNotificationOutbox).filter(
        due, ~has_earlier_unfinished
    )
    if dialect != "sqlite":
        query = query.with_for_update(skip_locked=True)

    while True:
        if dialect == "sqlite":
            # Repeat after a commit of an exhausted lease as well.
            session.execute(text("BEGIN IMMEDIATE"))
        cooldown = session.get(models.BookingNotificationDeliveryState, 1)
        if cooldown is not None and _as_utc(cooldown.blocked_until) > _as_utc(now):
            session.commit()
            return None
        event = query.order_by(models.BookingNotificationOutbox.id).first()
        if event is None:
            session.commit()
            return None
        if event.attempts >= MAX_ATTEMPTS:
            event.status = "failed"
            event.locked_until = None
            event.lock_token = None
            event.last_error = "Worker stopped before completing the maximum number of attempts"
            session.commit()
            continue

        token = str(uuid4())
        event.status = "processing"
        event.attempts += 1
        event.locked_until = now + timedelta(seconds=LEASE_SECONDS)
        event.lock_token = token
        claimed = ClaimedNotification(
            id=event.id,
            event_id=event.event_id,
            event_type=event.event_type,
            username=event.username,
            email=event.email,
            slot_date=event.slot_date,
            start_time=event.start_time,
            attempts=event.attempts,
            lock_token=token,
        )
        session.commit()
        return claimed


def _send_notification(event: ClaimedNotification) -> None:
    send = {
        "booking_created": send_booking_created_notification,
        "booking_cancelled": send_booking_cancelled_notification,
    }.get(event.event_type)
    if send is None:
        raise TelegramDeliveryError("Unknown booking notification event type", retryable=False)
    send(
        username=event.username,
        email=event.email,
        slot_date=event.slot_date,
        start_time=event.start_time,
    )


def _retry_delay(attempt: int, retry_after: int | None = None) -> int:
    if retry_after is not None:
        base = retry_after
    else:
        base = BACKOFF_SECONDS[min(max(attempt - 1, 0), len(BACKOFF_SECONDS) - 1)]
    return base + random.randint(0, max(1, min(30, base // 10)))


def _finish_success(session_factory: sessionmaker, event: ClaimedNotification) -> bool:
    session = session_factory()
    try:
        updated = (
            session.query(models.BookingNotificationOutbox)
            .filter_by(id=event.id, status="processing", lock_token=event.lock_token)
            .update(
                {
                    "status": "sent",
                    "sent_at": _utcnow(),
                    "locked_until": None,
                    "lock_token": None,
                    "last_error": None,
                },
                synchronize_session=False,
            )
        )
        session.commit()
        return bool(updated)
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def _failure_details(exc: Exception) -> tuple[bool, int | None, str]:
    if isinstance(exc, TelegramDeliveryError):
        return exc.retryable, exc.retry_after_seconds, str(exc)[:500]
    if isinstance(exc, (OSError, URLError, TimeoutError, ValueError)):
        return True, None, f"Temporary delivery error ({type(exc).__name__})"
    return False, None, f"Unexpected delivery error ({type(exc).__name__})"


def _finish_failure(
    session_factory: sessionmaker,
    event: ClaimedNotification,
    exc: Exception,
    *,
    now: datetime | None = None,
) -> str:
    now = now or _utcnow()
    retryable, retry_after, safe_error = _failure_details(exc)
    session = session_factory()
    try:
        row = (
            session.query(models.BookingNotificationOutbox)
            .filter_by(id=event.id, status="processing", lock_token=event.lock_token)
            .first()
        )
        if row is None:
            session.commit()
            return "lease_lost"
        row.locked_until = None
        row.lock_token = None
        row.last_error = safe_error[:500]
        if retry_after is not None:
            cooldown = session.get(models.BookingNotificationDeliveryState, 1)
            until = now + timedelta(seconds=retry_after)
            if cooldown is None:
                session.add(models.BookingNotificationDeliveryState(id=1, blocked_until=until))
            elif _as_utc(cooldown.blocked_until) < _as_utc(until):
                cooldown.blocked_until = until
        if retryable and row.attempts < MAX_ATTEMPTS:
            row.status = "pending"
            row.next_attempt_at = now + timedelta(seconds=_retry_delay(row.attempts, retry_after))
            outcome = "retry"
        else:
            row.status = "failed"
            outcome = "failed"
        session.commit()
        return outcome
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def drain_notifications(
    *,
    session_factory: sessionmaker = SessionLocal,
    limit: int = MAX_BATCH_SIZE,
    budget_seconds: float = RUN_BUDGET_SECONDS,
    send: Callable[[ClaimedNotification], None] = _send_notification,
    stop_event: threading.Event | None = None,
) -> dict[str, int]:
    if not 1 <= limit <= MAX_BATCH_SIZE:
        raise ValueError(f"limit must be between 1 and {MAX_BATCH_SIZE}")
    cleanup = session_factory()
    try:
        expired_ids = (
            cleanup.query(models.BookingNotificationOutbox.id)
            .filter(
                models.BookingNotificationOutbox.status == "sent",
                models.BookingNotificationOutbox.sent_at < _utcnow() - timedelta(days=SENT_RETENTION_DAYS),
            )
            .order_by(models.BookingNotificationOutbox.sent_at)
            .limit(MAX_PRUNED_PER_RUN)
            .subquery()
        )
        cleanup.query(models.BookingNotificationOutbox).filter(
            models.BookingNotificationOutbox.id.in_(select(expired_ids.c.id))
        ).delete(synchronize_session=False)
        cleanup.commit()
    except Exception:
        cleanup.rollback()
        raise
    finally:
        cleanup.close()

    started = time.monotonic()
    counts = {"sent": 0, "retry": 0, "failed": 0, "lease_lost": 0}
    claimed_count = 0
    while claimed_count < limit:
        if stop_event is not None and stop_event.is_set():
            break
        if time.monotonic() - started >= budget_seconds:
            break
        session = session_factory()
        try:
            event = _claim_next(session)
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()
        if event is None:
            break
        claimed_count += 1

        send_started = time.monotonic()
        try:
            send(event)
        except Exception as exc:
            outcome = _finish_failure(session_factory, event, exc)
            counts[outcome] += 1
            logger.warning(
                "notification_delivery event_id=%s outcome=%s attempt=%s error_type=%s duration_ms=%.1f",
                event.event_id,
                outcome,
                event.attempts,
                type(exc).__name__,
                (time.monotonic() - send_started) * 1000,
            )
        else:
            if _finish_success(session_factory, event):
                counts["sent"] += 1
                logger.info(
                    "notification_delivery event_id=%s outcome=sent attempt=%s duration_ms=%.1f",
                    event.event_id,
                    event.attempts,
                    (time.monotonic() - send_started) * 1000,
                )
            else:
                counts["lease_lost"] += 1

    return counts


def queue_stats(session_factory: sessionmaker = SessionLocal) -> dict[str, object]:
    session = session_factory()
    try:
        counts = {
            status: count
            for status, count in session.query(
                models.BookingNotificationOutbox.status,
                func.count(models.BookingNotificationOutbox.id),
            ).group_by(models.BookingNotificationOutbox.status)
        }
        oldest = (
            session.query(func.min(models.BookingNotificationOutbox.created_at))
            .filter(models.BookingNotificationOutbox.status.in_(("pending", "processing")))
            .scalar()
        )
        oldest_age_seconds = (
            max(0, int((_utcnow() - _as_utc(oldest)).total_seconds()))
            if oldest
            else None
        )
        failures = [
            {
                "id": row.id,
                "event_type": row.event_type,
                "attempts": row.attempts,
                "error": row.last_error,
            }
            for row in (
                session.query(models.BookingNotificationOutbox)
                .filter_by(status="failed")
                .order_by(models.BookingNotificationOutbox.id.desc())
                .limit(5)
            )
        ]
        return {
            "counts": counts,
            "oldest_waiting_age_seconds": oldest_age_seconds,
            "recent_failures": failures,
        }
    finally:
        session.close()


def retry_failed(session_factory: sessionmaker = SessionLocal) -> int:
    session = session_factory()
    try:
        now = _utcnow()
        newer = aliased(models.BookingNotificationOutbox)
        newer_delivered = session.query(newer.id).filter(
            newer.slot_id == models.BookingNotificationOutbox.slot_id,
            newer.id > models.BookingNotificationOutbox.id,
            newer.status.in_(("sent", "processing")),
        ).exists()
        count = (
            session.query(models.BookingNotificationOutbox)
            .filter(models.BookingNotificationOutbox.status == "failed", ~newer_delivered)
            .update(
                {
                    "status": "pending",
                    "attempts": 0,
                    "next_attempt_at": now,
                    "locked_until": None,
                    "lock_token": None,
                    "last_error": None,
                },
                synchronize_session=False,
            )
        )
        session.commit()
        return count
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
