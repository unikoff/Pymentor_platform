"""Required externally managed PostgreSQL schema; runtime never performs DDL."""

SCHEMA_REVISION = "c503_dual_email_change"
REQUIRED_TABLES = (
    "users",
    "consumed_email_changes",
    "email_change_requests",
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
