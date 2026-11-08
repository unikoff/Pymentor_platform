"""Persist idempotent login operation state in managed PostgreSQL schemas."""

from alembic import context, op
import sqlalchemy as sa


revision = "c435_login_operations"
down_revision = "c216_import_marker"
branch_labels = None
depends_on = None


def _require_postgresql() -> None:
    if context.get_context().dialect.name != "postgresql":
        raise RuntimeError("login operations migration is PostgreSQL-only")


def upgrade() -> None:
    _require_postgresql()
    op.create_table(
        "account_lifecycles",
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"),
                  primary_key=True, nullable=False),
        sa.Column("lifecycle_id", sa.String(length=36), nullable=False),
        sa.UniqueConstraint("lifecycle_id", name="uq_account_lifecycles_lifecycle_id"),
        sa.CheckConstraint(
            "lifecycle_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'",
            name="ck_account_lifecycles_uuid4",
        ),
    )
    op.create_table(
        "booking_notification_subjects",
        sa.Column("outbox_id", sa.Integer(),
                  sa.ForeignKey("booking_notification_outbox.id", ondelete="CASCADE"),
                  primary_key=True, nullable=False),
        sa.Column("lifecycle_id", sa.String(length=36), nullable=False),
    )
    op.create_index("ix_booking_notification_subject_lifecycle", "booking_notification_subjects", ["lifecycle_id"])
    op.execute("""
        CREATE FUNCTION pymentor_delete_booking_subjects() RETURNS trigger AS $$
        BEGIN
            PERFORM event.id FROM booking_notification_outbox AS event
            JOIN booking_notification_subjects AS subject ON subject.outbox_id = event.id
            JOIN account_lifecycles AS owner ON owner.lifecycle_id = subject.lifecycle_id
            WHERE owner.user_id = OLD.id ORDER BY event.id FOR UPDATE OF event;
            IF EXISTS (
                SELECT 1 FROM booking_notification_outbox AS event
                JOIN booking_notification_subjects AS subject ON subject.outbox_id = event.id
                JOIN account_lifecycles AS owner ON owner.lifecycle_id = subject.lifecycle_id
                WHERE owner.user_id = OLD.id AND event.status = 'processing'
            ) THEN
                RAISE EXCEPTION 'notification_delivery_active' USING ERRCODE = '55000';
            END IF;
            DELETE FROM booking_notification_outbox WHERE id IN (
                SELECT subject.outbox_id FROM booking_notification_subjects AS subject
                JOIN account_lifecycles AS owner ON owner.lifecycle_id = subject.lifecycle_id
                WHERE owner.user_id = OLD.id
            );
            RETURN OLD;
        END;
        $$ LANGUAGE plpgsql
    """)
    op.execute("""
        CREATE TRIGGER pymentor_user_booking_subject_delete_v1
        BEFORE DELETE ON users FOR EACH ROW EXECUTE FUNCTION pymentor_delete_booking_subjects()
    """)
    op.create_table(
        "login_operations",
        sa.Column("operation_id", sa.String(length=36), primary_key=True, nullable=False),
        sa.Column(
            "user_id",
            sa.Integer(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("token_digest", sa.String(length=64), nullable=False),
        sa.Column("status", sa.String(length=16), nullable=False),
        sa.Column("pending_expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "session_id",
            sa.Integer(),
            sa.ForeignKey("sessions.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("committed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("key_version", sa.SmallInteger(), nullable=False),
        sa.CheckConstraint(
            "operation_id ~ "
            "'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'",
            name="ck_login_operations_operation_id_canonical",
        ),
        sa.CheckConstraint(
            "token_digest ~ '^[0-9a-f]{64}$'",
            name="ck_login_operations_token_digest_hex",
        ),
        sa.CheckConstraint(
            "status IN ('pending', 'committed', 'revoked')",
            name="ck_login_operations_status",
        ),
        sa.CheckConstraint(
            "(status IN ('pending', 'revoked') AND session_id IS NULL AND committed_at IS NULL) "
            "OR (status = 'committed' AND committed_at IS NOT NULL)",
            name="ck_login_operations_state",
        ),
        sa.UniqueConstraint("token_digest", name="uq_login_operations_token_digest"),
    )
    op.create_index(
        "ix_login_operations_user_id", "login_operations", ["user_id"]
    )


def downgrade() -> None:
    if context.is_offline_mode():
        raise RuntimeError("Refusing offline downgrade of login operations")
    _require_postgresql()

    connection = op.get_bind()
    connection.execute(
        sa.text('LOCK TABLE "account_lifecycles", "booking_notification_subjects", "login_operations" IN ACCESS EXCLUSIVE MODE')
    )
    if connection.execute(
        sa.text('SELECT EXISTS (SELECT 1 FROM "login_operations" LIMIT 1) '
                'OR EXISTS (SELECT 1 FROM "account_lifecycles" LIMIT 1) '
                'OR EXISTS (SELECT 1 FROM "booking_notification_subjects" LIMIT 1)')
    ).scalar():
        raise RuntimeError("Refusing downgrade: login operations are not empty")
    op.execute('DROP TRIGGER pymentor_user_booking_subject_delete_v1 ON users')
    op.execute('DROP FUNCTION pymentor_delete_booking_subjects()')
    op.drop_table("booking_notification_subjects")
    op.drop_table("login_operations")
    op.drop_table("account_lifecycles")
