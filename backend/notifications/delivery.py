"""Drain durable booking and landing notifications to Telegram."""
from __future__ import annotations
import errno
import json
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
    _get_landing_bot_token,
    send_landing_notification,
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


@dataclass(frozen=True)
class ClaimedLandingNotification:
    id: int
    event_id: str
    event_type: str
    landing_id: str
    landing_slug: str
    destination_config_id: str
    secret_ref: str
    chat_id: str
    payload: dict
    attempts: int
    lock_token: str


def _ensure_outbox_table() -> None:
    models.BookingNotificationOutbox.__table__.create(bind=engine, checkfirst=True)
    models.BookingNotificationDeliveryState.__table__.create(bind=engine, checkfirst=True)
    models.Landing.__table__.create(bind=engine, checkfirst=True)
    models.LandingTelegramConfig.__table__.create(bind=engine, checkfirst=True)
    models.LandingNotificationOutbox.__table__.create(bind=engine, checkfirst=True)
    models.LandingNotificationDeliveryState.__table__.create(bind=engine, checkfirst=True)


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


def _claim_next_landing(
    session: Session, now: datetime | None = None
) -> ClaimedLandingNotification | None:
    now = now or _utcnow()
    dialect = session.get_bind().dialect.name
    cooldown = aliased(models.LandingNotificationDeliveryState)
    due = or_(
        and_(
            models.LandingNotificationOutbox.status == "pending",
            models.LandingNotificationOutbox.next_attempt_at <= now,
        ),
        and_(
            models.LandingNotificationOutbox.status == "processing",
            models.LandingNotificationOutbox.locked_until <= now,
        ),
    )
    query = (
        session.query(models.LandingNotificationOutbox)
        .join(models.Landing, models.Landing.id == models.LandingNotificationOutbox.landing_id)
        .join(
            models.LandingTelegramConfig,
            models.LandingTelegramConfig.id == models.LandingNotificationOutbox.destination_config_id,
        )
        .outerjoin(
            cooldown,
            cooldown.destination_config_id == models.LandingNotificationOutbox.destination_config_id,
        )
        .filter(
            due,
            or_(cooldown.destination_config_id.is_(None), cooldown.blocked_until <= now),
        )
    )
    if dialect != "sqlite":
        query = query.with_for_update(of=models.LandingNotificationOutbox, skip_locked=True)

    while True:
        if dialect == "sqlite":
            session.execute(text("BEGIN IMMEDIATE"))
        event = query.order_by(models.LandingNotificationOutbox.id).first()
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

        try:
            payload = json.loads(event.payload_json)
        except (TypeError, json.JSONDecodeError):
            event.status = "failed"
            event.locked_until = None
            event.lock_token = None
            event.last_error = "Stored event payload is invalid"
            session.commit()
            continue
        landing = session.get(models.Landing, event.landing_id)
        config = session.get(models.LandingTelegramConfig, event.destination_config_id)
        if landing is None or config is None:
            event.status = "failed"
            event.locked_until = None
            event.lock_token = None
            event.last_error = "Stored destination is unavailable"
            session.commit()
            continue

        token = str(uuid4())
        event.status = "processing"
        event.attempts += 1
        event.locked_until = now + timedelta(seconds=LEASE_SECONDS)
        event.lock_token = token
        claimed = ClaimedLandingNotification(
            id=event.id,
            event_id=event.event_id,
            event_type=event.event_type,
            landing_id=event.landing_id,
            landing_slug=landing.slug,
            destination_config_id=event.destination_config_id,
            secret_ref=config.secret_ref,
            chat_id=config.chat_id,
            payload=payload,
            attempts=event.attempts,
            lock_token=token,
        )
        session.commit()
        return claimed


def _send_notification(event: ClaimedNotification | ClaimedLandingNotification) -> None:
    if isinstance(event, ClaimedLandingNotification):
        send_landing_notification(
            token=_get_landing_bot_token(event.secret_ref),
            chat_id=event.chat_id,
            landing_slug=event.landing_slug,
            event_id=event.event_id,
            event_type=event.event_type,
            payload=event.payload,
        )
        return

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


def _finish_landing_success(
    session_factory: sessionmaker, event: ClaimedLandingNotification
) -> bool:
    session = session_factory()
    try:
        updated = (
            session.query(models.LandingNotificationOutbox)
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


def _finish_landing_failure(
    session_factory: sessionmaker,
    event: ClaimedLandingNotification,
    exc: Exception,
    *,
    now: datetime | None = None,
) -> str:
    now = now or _utcnow()
    retryable, retry_after, safe_error = _failure_details(exc)
    session = session_factory()
    try:
        row = (
            session.query(models.LandingNotificationOutbox)
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
            cooldown = session.get(models.LandingNotificationDeliveryState, event.destination_config_id)
            until = now + timedelta(seconds=retry_after)
            if cooldown is None:
                session.add(
                    models.LandingNotificationDeliveryState(
                        destination_config_id=event.destination_config_id,
                        blocked_until=until,
                    )
                )
            elif _as_utc(cooldown.blocked_until) < _as_utc(until):
                cooldown.blocked_until = until
        if not retryable:
            config = session.get(models.LandingTelegramConfig, event.destination_config_id)
            if config is not None:
                config.status = "invalid"
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
    send: Callable[[ClaimedNotification | ClaimedLandingNotification], None] = _send_notification,
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
        expired_landing_ids = (
            cleanup.query(models.LandingNotificationOutbox.id)
            .filter(
                models.LandingNotificationOutbox.status == "sent",
                models.LandingNotificationOutbox.sent_at < _utcnow() - timedelta(days=SENT_RETENTION_DAYS),
            )
            .order_by(models.LandingNotificationOutbox.sent_at)
            .limit(MAX_PRUNED_PER_RUN)
            .subquery()
        )
        cleanup.query(models.LandingNotificationOutbox).filter(
            models.LandingNotificationOutbox.id.in_(select(expired_landing_ids.c.id))
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
            if claimed_count % 2 == 0:
                event = _claim_next_landing(session) or _claim_next(session)
            else:
                event = _claim_next(session) or _claim_next_landing(session)
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
            outcome = (
                _finish_landing_failure(session_factory, event, exc)
                if isinstance(event, ClaimedLandingNotification)
                else _finish_failure(session_factory, event, exc)
            )
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
            succeeded = (
                _finish_landing_success(session_factory, event)
                if isinstance(event, ClaimedLandingNotification)
                else _finish_success(session_factory, event)
            )
            if succeeded:
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
        counts: dict[str, int] = {}
        for model in (models.BookingNotificationOutbox, models.LandingNotificationOutbox):
            for status, count in session.query(model.status, func.count(model.id)).group_by(model.status):
                counts[status] = counts.get(status, 0) + count
        oldest_booking = (
            session.query(func.min(models.BookingNotificationOutbox.created_at))
            .filter(models.BookingNotificationOutbox.status.in_(("pending", "processing")))
            .scalar()
        )
        oldest_landing = (
            session.query(func.min(models.LandingNotificationOutbox.created_at))
            .filter(models.LandingNotificationOutbox.status.in_(("pending", "processing")))
            .scalar()
        )
        oldest = min(
            (_as_utc(value) for value in (oldest_booking, oldest_landing) if value is not None),
            default=None,
        )
        oldest_age_seconds = (
            max(0, int((_utcnow() - oldest).total_seconds()))
            if oldest
            else None
        )
        booking_failures = [
            {
                "id": row.id,
                "event_type": row.event_type,
                "attempts": row.attempts,
                "error": row.last_error,
                "created_at": _as_utc(row.created_at),
            }
            for row in (
                session.query(models.BookingNotificationOutbox)
                .filter_by(status="failed")
                .order_by(models.BookingNotificationOutbox.id.desc())
                .limit(5)
            )
        ]
        landing_failures = [
            {
                "event_id": row.event_id,
                "landing_id": row.landing_id,
                "event_type": row.event_type,
                "attempts": row.attempts,
                "error": row.last_error,
                "created_at": _as_utc(row.created_at),
            }
            for row in (
                session.query(models.LandingNotificationOutbox)
                .filter_by(status="failed")
                .order_by(models.LandingNotificationOutbox.id.desc())
                .limit(5)
            )
        ]
        failures = sorted(
            booking_failures + landing_failures,
            key=lambda item: item["created_at"],
            reverse=True,
        )[:5]
        for item in failures:
            item.pop("created_at")
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
        landing_count = (
            session.query(models.LandingNotificationOutbox)
            .filter(
                models.LandingNotificationOutbox.status == "failed",
                models.LandingNotificationOutbox.manual_retry_count < 3,
            )
            .update(
                {
                    "status": "pending",
                    "attempts": 0,
                    "manual_retry_count": models.LandingNotificationOutbox.manual_retry_count + 1,
                    "next_attempt_at": now,
                    "locked_until": None,
                    "lock_token": None,
                    "last_error": None,
                },
                synchronize_session=False,
            )
        )
        session.commit()
        return count + landing_count
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
