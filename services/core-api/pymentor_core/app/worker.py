"""Canonical notification CLI, configured before storage imports."""

import argparse
import json
import logging
import os
import sys
from logging.handlers import RotatingFileHandler
from pathlib import Path


def _parse_args(max_batch_size) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Send queued Pymentor notifications to Telegram"
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=max_batch_size,
        help="Maximum events per run (1-20)",
    )
    parser.add_argument(
        "--stats", action="store_true", help="Print queue counts without sending"
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="Check cron environment without sending messages",
    )
    parser.add_argument(
        "--backup-db",
        type=Path,
        help="Create a consistent SQLite backup before migrating",
    )
    parser.add_argument(
        "--retry-failed", action="store_true", help="Requeue permanently failed events"
    )
    return parser.parse_args()


def _run_worker() -> int:
    from pymentor_core.app.database import engine
    from pymentor_core.adapters.telegram.transport import _get_telegram_credentials
    from pymentor_core.adapters.telegram.transport import has_landing_bot_credentials
    from pymentor_core.adapters.sql.notification_outbox import MAX_BATCH_SIZE
    from pymentor_core.adapters.sql.notification_outbox import LOG_PATH
    from pymentor_core.adapters.sql.notification_outbox import logger
    from pymentor_core.adapters.sql.notification_outbox import backup_database
    from pymentor_core.adapters.sql.notification_outbox import _ensure_outbox_table
    from pymentor_core.adapters.sql.notification_outbox import _worker_lock
    from pymentor_core.adapters.sql.notification_outbox import _release_worker_lock
    from pymentor_core.adapters.sql.notification_outbox import queue_stats
    from pymentor_core.adapters.sql.notification_outbox import retry_failed
    from pymentor_core.adapters.sql.notification_outbox import drain_notifications

    log_to_stdout = os.getenv("PYMENTOR_LOG_TO_STDOUT", "").lower() in {
        "1",
        "true",
        "yes",
        "on",
    }
    if not log_to_stdout:
        LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    log_handler = (
        logging.StreamHandler(sys.stdout)
        if log_to_stdout
        else RotatingFileHandler(
            LOG_PATH, maxBytes=2_000_000, backupCount=3, encoding="utf-8"
        )
    )
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s",
        handlers=[log_handler],
    )
    args = _parse_args(MAX_BATCH_SIZE)
    if not 1 <= args.limit <= MAX_BATCH_SIZE:
        logger.error("limit must be between 1 and %s", MAX_BATCH_SIZE)
        return 2
    try:
        if args.backup_db is not None:
            print(
                json.dumps(
                    {"backup": str(backup_database(args.backup_db))}, ensure_ascii=False
                )
            )
            return 0
        _ensure_outbox_table()
        if args.check:
            configured = (
                _get_telegram_credentials() is not None or has_landing_bot_credentials()
            )
            lock = _worker_lock()
            lock_available = lock is not None
            if lock is not None:
                _release_worker_lock(lock)
            print(
                json.dumps(
                    {
                        "python": sys.executable,
                        "database": engine.url.database,
                        "telegram_configured": configured,
                        "worker_lock_available": lock_available,
                        "queue": queue_stats(),
                    },
                    ensure_ascii=False,
                )
            )
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
            if (
                _get_telegram_credentials() is None
                and not has_landing_bot_credentials()
            ):
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


def main(profile=None) -> int:
    from pymentor_core.app.paths import LEGACY_ROOT
    from pymentor_core.app.settings import Settings

    if profile == "legacy_sqlite" or os.getenv("PYMENTOR_PROFILE") == "legacy_sqlite":
        from dotenv import load_dotenv

        load_dotenv(LEGACY_ROOT / ".env")
    settings = Settings.from_environment(profile, legacy_root=LEGACY_ROOT)
    existing = sys.modules.get("pymentor_core.app.database")
    if existing is not None:
        from sqlalchemy.engine import make_url

        if existing.engine.url != make_url(settings.synchronous_database_url):
            raise RuntimeError("A different database profile requires a fresh process")
    os.environ["DATABASE_URL"] = settings.synchronous_database_url
    os.environ["PYMENTOR_PROFILE"] = settings.profile
    if settings.profile == "postgres_redis":
        os.environ["PYMENTOR_SCHEMA_MODE"] = "managed"
        os.environ["PYTHON_DOTENV_DISABLED"] = "1"
    if str(LEGACY_ROOT) not in sys.path:
        sys.path.insert(0, str(LEGACY_ROOT))
    from pymentor_core.app.database import engine

    try:
        return _run_worker()
    finally:
        engine.dispose()


if __name__ == "__main__":
    raise SystemExit(main())
