"""Initial PostgreSQL schema: fourteen ORM tables plus preserved legacy booking_reminders.

This historical revision is intentionally explicit. It does not import application
models, metadata, database configuration, or legacy data. Application-side defaults
remain application-side; only ORM server defaults are expressed in DDL.

Legacy SQLite rows require a separate, reviewed import: the inventory contains one
orphan user_lesson_progress FK and some timestamps of uncertain timezone.
"""

from typing import Sequence, Union

from alembic import context, op
import sqlalchemy as sa


revision: str = "c222_initial_pg"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("username", sa.String(length=50), nullable=False),
        sa.Column("email", sa.String(length=100), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("subscription_until", sa.DateTime(timezone=True), nullable=True),
        sa.Column("subscription_plan", sa.String(length=32), nullable=True),
        sa.Column("is_admin", sa.Boolean(), server_default=sa.text("false"), nullable=False),
    )
    op.create_index("ix_users_id", "users", ["id"])
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_subscription_until", "users", ["subscription_until"])

    op.create_table(
        "admins",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("username", sa.String(length=50), nullable=False),
        sa.Column("email", sa.String(length=100), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
    )
    op.create_index("ix_admins_id", "admins", ["id"])
    op.create_index("ix_admins_email", "admins", ["email"], unique=True)

    op.create_table(
        "landings",
        sa.Column("id", sa.String(length=36), primary_key=True, nullable=False),
        sa.Column("slug", sa.String(length=80), nullable=False),
        sa.Column("title", sa.String(length=120), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("telegram_enabled", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("version", sa.Integer(), server_default=sa.text("1"), nullable=False),
        sa.Column("config_version", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("slug", name="uq_landings_slug"),
    )

    op.create_table(
        "sessions",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("session_token", sa.String(length=64), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_sessions_id", "sessions", ["id"])
    op.create_index("ix_sessions_user_id", "sessions", ["user_id"])
    op.create_index("ix_sessions_session_token", "sessions", ["session_token"], unique=True)

    op.create_table(
        "user_activity_days",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("activity_date", sa.Date(), nullable=False),
        sa.Column("visited_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("user_id", "activity_date", name="uq_user_activity_day"),
    )
    op.create_index("ix_user_activity_days_id", "user_activity_days", ["id"])
    op.create_index("ix_user_activity_days_user_id", "user_activity_days", ["user_id"])
    op.create_index("ix_user_activity_days_activity_date", "user_activity_days", ["activity_date"])

    op.create_table(
        "user_lesson_progress",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("lesson_id", sa.String(length=40), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("user_id", "lesson_id", name="uq_user_lesson_progress"),
    )
    op.create_index("ix_user_lesson_progress_id", "user_lesson_progress", ["id"])
    op.create_index("ix_user_lesson_progress_user_id", "user_lesson_progress", ["user_id"])
    op.create_index("ix_user_lesson_progress_lesson_id", "user_lesson_progress", ["lesson_id"])
    op.create_index("ix_user_lesson_progress_completed_at", "user_lesson_progress", ["completed_at"])

    op.create_table(
        "user_task_progress",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("task_id", sa.String(length=160), nullable=False),
        sa.Column("task_revision", sa.String(length=64), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("user_id", "task_id", name="uq_user_task_progress"),
    )
    op.create_index("ix_user_task_progress_id", "user_task_progress", ["id"])
    op.create_index("ix_user_task_progress_user_id", "user_task_progress", ["user_id"])
    op.create_index("ix_user_task_progress_task_id", "user_task_progress", ["task_id"])

    op.create_table(
        "booking_slots",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("slot_date", sa.Date(), nullable=False),
        sa.Column("start_time", sa.String(length=5), nullable=False),
        sa.Column("duration_minutes", sa.Integer(), nullable=False),
        sa.Column("student_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("slot_date", "start_time", name="uq_booking_slot_datetime"),
    )
    op.create_index("ix_booking_slots_id", "booking_slots", ["id"])
    op.create_index("ix_booking_slots_slot_date", "booking_slots", ["slot_date"])
    op.create_index("ix_booking_slots_student_id", "booking_slots", ["student_id"])

    op.create_table(
        "booking_quotas",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("year", sa.Integer(), nullable=False),
        sa.Column("month", sa.Integer(), nullable=False),
        sa.Column("granted_slots", sa.Integer(), nullable=False),
        sa.UniqueConstraint("user_id", "year", "month", name="uq_booking_quota_month"),
    )
    op.create_index("ix_booking_quotas_id", "booking_quotas", ["id"])
    op.create_index("ix_booking_quotas_user_id", "booking_quotas", ["user_id"])

    # Preserved from the SQLite inventory; intentionally absent from current ORM.
    op.create_table(
        "booking_reminders",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("slot_id", sa.Integer(), sa.ForeignKey("booking_slots.id"), nullable=False),
        sa.Column("chat_id", sa.String(length=64), nullable=False),
        sa.Column("remind_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_booking_reminders_id", "booking_reminders", ["id"])
    op.create_index("ix_booking_reminders_slot_id", "booking_reminders", ["slot_id"], unique=True)
    op.create_index("ix_booking_reminders_remind_at", "booking_reminders", ["remind_at"])

    op.create_table(
        "booking_notification_outbox",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("event_id", sa.String(length=36), nullable=False),
        sa.Column("event_type", sa.String(length=32), nullable=False),
        sa.Column("slot_id", sa.Integer(), nullable=False),
        sa.Column("username", sa.String(length=50), nullable=False),
        sa.Column("email", sa.String(length=100), nullable=False),
        sa.Column("slot_date", sa.Date(), nullable=False),
        sa.Column("start_time", sa.String(length=5), nullable=False),
        sa.Column("status", sa.String(length=16), nullable=False),
        sa.Column("attempts", sa.Integer(), nullable=False),
        sa.Column("next_attempt_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("locked_until", sa.DateTime(timezone=True), nullable=True),
        sa.Column("lock_token", sa.String(length=36), nullable=True),
        sa.Column("last_error", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("event_id"),
    )
    op.create_index("ix_booking_notification_ready", "booking_notification_outbox", ["status", "next_attempt_at"])
    op.create_index("ix_booking_notification_slot_order", "booking_notification_outbox", ["slot_id", "id"])
    op.create_index("ix_booking_notification_retention", "booking_notification_outbox", ["status", "sent_at"])

    op.create_table(
        "booking_notification_delivery_state",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("blocked_until", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "landing_telegram_configs",
        sa.Column("id", sa.String(length=36), primary_key=True, nullable=False),
        sa.Column("landing_id", sa.String(length=36), sa.ForeignKey("landings.id", ondelete="CASCADE"), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("secret_ref", sa.String(length=128), nullable=False),
        sa.Column("chat_id", sa.String(length=128), nullable=False),
        sa.Column("bot_username", sa.String(length=64), nullable=False),
        sa.Column("status", sa.String(length=16), nullable=False),
        sa.Column("verified_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("landing_id", "version", name="uq_landing_telegram_config_version"),
    )
    # Also preserve this snapshot index even though the ORM defines only the UQ.
    op.create_index("ix_landing_telegram_config_landing", "landing_telegram_configs", ["landing_id", "version"])

    op.create_table(
        "landing_notification_outbox",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("landing_id", sa.String(length=36), sa.ForeignKey("landings.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("destination_config_id", sa.String(length=36), sa.ForeignKey("landing_telegram_configs.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("event_id", sa.String(length=128), nullable=False),
        sa.Column("event_type", sa.String(length=64), nullable=False),
        sa.Column("schema_version", sa.Integer(), nullable=False),
        sa.Column("payload_json", sa.Text(), nullable=False),
        sa.Column("payload_sha256", sa.String(length=64), nullable=False),
        sa.Column("status", sa.String(length=16), nullable=False),
        sa.Column("attempts", sa.Integer(), nullable=False),
        sa.Column("manual_retry_count", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("next_attempt_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("locked_until", sa.DateTime(timezone=True), nullable=True),
        sa.Column("lock_token", sa.String(length=36), nullable=True),
        sa.Column("last_error", sa.String(length=500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("landing_id", "event_id", name="uq_landing_notification_event"),
    )
    op.create_index("ix_landing_notification_ready", "landing_notification_outbox", ["status", "next_attempt_at"])
    op.create_index("ix_landing_notification_retention", "landing_notification_outbox", ["status", "sent_at"])
    # Also preserve this snapshot index even though the ORM defines only the UQ.
    op.create_index("ix_landing_notification_landing_event", "landing_notification_outbox", ["landing_id", "event_id"])

    op.create_table(
        "landing_notification_delivery_state",
        sa.Column(
            "destination_config_id",
            sa.String(length=36),
            sa.ForeignKey("landing_telegram_configs.id", ondelete="CASCADE"),
            primary_key=True,
            nullable=False,
        ),
        sa.Column("blocked_until", sa.DateTime(timezone=True), nullable=False),
    )


def downgrade() -> None:
    # Even a disposable local DB may acquire data: refuse any destructive downgrade
    # until every application table is locked and confirmed empty in this transaction.
    if context.is_offline_mode():
        raise RuntimeError("Refusing offline downgrade: table contents cannot be checked")
    connection = op.get_bind()
    tables = (
        "landing_notification_delivery_state", "landing_notification_outbox",
        "landing_telegram_configs", "booking_notification_delivery_state",
        "booking_notification_outbox", "booking_reminders", "booking_quotas",
        "booking_slots", "user_task_progress", "user_lesson_progress",
        "user_activity_days", "sessions", "landings", "admins", "users",
    )
    for name in tables:
        connection.execute(sa.text(f'LOCK TABLE "{name}" IN ACCESS EXCLUSIVE MODE'))
    for name in tables:
        if connection.execute(sa.text(f'SELECT EXISTS (SELECT 1 FROM "{name}" LIMIT 1)')).scalar():
            raise RuntimeError(f"Refusing to downgrade non-empty table: {name}")
    op.drop_table("landing_notification_delivery_state")
    op.drop_table("landing_notification_outbox")
    op.drop_table("landing_telegram_configs")
    op.drop_table("booking_notification_delivery_state")
    op.drop_table("booking_notification_outbox")
    op.drop_table("booking_reminders")
    op.drop_table("booking_quotas")
    op.drop_table("booking_slots")
    op.drop_table("user_task_progress")
    op.drop_table("user_lesson_progress")
    op.drop_table("user_activity_days")
    op.drop_table("sessions")
    op.drop_table("landings")
    op.drop_table("admins")
    op.drop_table("users")
