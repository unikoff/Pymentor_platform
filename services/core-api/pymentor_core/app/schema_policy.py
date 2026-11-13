"""Choose legacy SQLite bootstrap or externally managed migrations explicitly."""

DUAL_LOCAL_SCHEMA_REVISION = "c426_deletion_outbox"
DUAL_LOCAL_REQUIRED_TABLES = (
    "users",
    "admins",
    "sessions",
    "user_activity_days",
    "user_lesson_progress",
    "user_task_progress",
    "booking_slots",
    "booking_quotas",
    "booking_reminders",
    "booking_notification_outbox",
    "booking_notification_delivery_state",
    "landings",
    "landing_telegram_configs",
    "landing_notification_outbox",
    "landing_notification_delivery_state",
    "session_import_markers",
    "login_operations",
    "account_lifecycles",
    "booking_notification_subjects",
    "account_deletion_events",
    "account_deletion_redis_keys",
)


def compatible_schema_revision(actual: str, expected: str) -> bool:
    """Allow only the tested additive email schema during the release bridge."""
    return actual == expected or (expected == "c426_deletion_outbox" and actual == "c503_dual_email_change")


def should_run_legacy_bootstrap(database_backend: str, mode: str | None) -> bool:
    selected = (mode or "legacy").strip().lower()
    if selected not in {"legacy", "managed"}:
        raise RuntimeError("PYMENTOR_SCHEMA_MODE must be legacy or managed")
    if selected == "legacy":
        if database_backend != "sqlite":
            raise RuntimeError("Legacy schema bootstrap is only available for SQLite")
        return True
    if database_backend not in {"sqlite", "postgresql"}:
        raise RuntimeError("Managed schema mode supports SQLite or PostgreSQL only")
    return False
