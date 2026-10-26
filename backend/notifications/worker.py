"""Command-line entry point for durable booking notifications."""
import argparse
import json
import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path
from db.engine import engine
from .telegram import _get_telegram_credentials
from .delivery import (
    MAX_BATCH_SIZE,
    LOG_PATH,
    logger,
    backup_database,
    _ensure_outbox_table,
    _worker_lock,
    _release_worker_lock,
    queue_stats,
    retry_failed,
    drain_notifications,
)


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Send queued booking notifications to Telegram")
    parser.add_argument("--limit", type=int, default=MAX_BATCH_SIZE, help="Maximum events per run (1-20)")
    parser.add_argument("--stats", action="store_true", help="Print queue counts without sending")
    parser.add_argument("--check", action="store_true", help="Check cron environment without sending messages")
    parser.add_argument("--backup-db", type=Path, help="Create a consistent SQLite backup before migrating")
    parser.add_argument("--retry-failed", action="store_true", help="Requeue permanently failed events")
    return parser.parse_args()


def main() -> int:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s",
        handlers=[RotatingFileHandler(LOG_PATH, maxBytes=2_000_000, backupCount=3, encoding="utf-8")],
    )
    args = _parse_args()
    if not 1 <= args.limit <= MAX_BATCH_SIZE:
        logger.error("limit must be between 1 and %s", MAX_BATCH_SIZE)
        return 2
    try:
        if args.backup_db is not None:
            print(json.dumps({"backup": str(backup_database(args.backup_db))}, ensure_ascii=False))
            return 0
        _ensure_outbox_table()
        if args.check:
            import sys

            configured = _get_telegram_credentials() is not None
            lock = _worker_lock()
            lock_available = lock is not None
            if lock is not None:
                _release_worker_lock(lock)
            print(json.dumps({
                "python": sys.executable,
                "database": engine.url.database,
                "telegram_configured": configured,
                "worker_lock_available": lock_available,
                "queue": queue_stats(),
            }, ensure_ascii=False))
            return 0 if configured and lock_available else 1
        if args.stats:
            print(json.dumps(queue_stats(), ensure_ascii=False))
            return 0
        if args.retry_failed:
            lock = _worker_lock()
            if lock is None:
                logger.info("worker_already_running")
                return 0
            try:
                print(json.dumps({"requeued": retry_failed()}, ensure_ascii=False))
            finally:
                _release_worker_lock(lock)
            return 0
        lock = _worker_lock()
        if lock is None:
            logger.info("worker_already_running")
            return 0
        try:
            if _get_telegram_credentials() is None:
                logger.error("telegram_credentials_missing queue_preserved=true")
                return 1
            counts = drain_notifications(limit=args.limit)
            logger.info("worker_result %s", json.dumps(counts, ensure_ascii=False))
        finally:
            _release_worker_lock(lock)
    except Exception as exc:
        logger.error("notification_worker_failed error_type=%s", type(exc).__name__)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
