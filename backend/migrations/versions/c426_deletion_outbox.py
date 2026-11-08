"""Persist account deletion events and Redis cleanup keys."""

from alembic import context, op
import sqlalchemy as sa


revision = "c426_deletion_outbox"
down_revision = "c435_login_operations"
branch_labels = None
depends_on = None


def _require_postgresql() -> None:
    if context.get_context().dialect.name != "postgresql":
        raise RuntimeError("account deletion outbox migration is PostgreSQL-only")


def upgrade() -> None:
    _require_postgresql()
    op.create_table(
        "account_deletion_events",
        sa.Column("lifecycle_id", sa.String(length=36), primary_key=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column(
            "deleted_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.CheckConstraint(
            "lifecycle_id ~ "
            "'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'",
            name="ck_account_deletion_events_lifecycle_id_uuid",
        ),
    )
    op.create_table(
        "account_deletion_redis_keys",
        sa.Column(
            "lifecycle_id",
            sa.String(length=36),
            sa.ForeignKey("account_deletion_events.lifecycle_id", ondelete="CASCADE"),
            primary_key=True,
            nullable=False,
        ),
        sa.Column("token_digest", sa.String(length=64), primary_key=True, nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column(
            "next_attempt_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "attempts",
            sa.Integer(),
            server_default=sa.text("0"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "token_digest ~ '^[0-9a-f]{64}$'",
            name="ck_account_deletion_redis_keys_token_digest_hex",
        ),
        sa.CheckConstraint(
            "attempts >= 0",
            name="ck_account_deletion_redis_keys_attempts_nonnegative",
        ),
    )
    op.create_index(
        "ix_account_deletion_redis_keys_next_attempt_expiry",
        "account_deletion_redis_keys",
        ["next_attempt_at", "expires_at"],
    )
    # This runs in the same transaction as deletion, before session rows and
    # login operations disappear. No bearer token is copied into the journal.
    op.execute("""
        CREATE FUNCTION pymentor_capture_account_deletion(p_user_id integer) RETURNS void AS $$
        DECLARE account_ref varchar(36);
        BEGIN
            INSERT INTO account_lifecycles(user_id, lifecycle_id)
            VALUES (p_user_id, gen_random_uuid()::text)
            ON CONFLICT (user_id) DO NOTHING;
            SELECT lifecycle_id INTO STRICT account_ref FROM account_lifecycles WHERE user_id = p_user_id;
            INSERT INTO account_deletion_events(lifecycle_id, user_id)
            VALUES (account_ref, p_user_id) ON CONFLICT (lifecycle_id) DO NOTHING;
            INSERT INTO account_deletion_redis_keys(lifecycle_id, token_digest, expires_at)
            SELECT account_ref, token_digest, clock_timestamp() + interval '30 days'
            FROM (
                SELECT CASE WHEN session_token ~ '^[0-9a-f]{64}$' THEN session_token
                       ELSE encode(sha256(convert_to(session_token, 'UTF8')), 'hex') END AS token_digest
                FROM sessions WHERE user_id = p_user_id
                UNION
                SELECT token_digest FROM login_operations WHERE user_id = p_user_id
            ) AS owned_tokens
            ON CONFLICT (lifecycle_id, token_digest) DO UPDATE
            SET expires_at = GREATEST(account_deletion_redis_keys.expires_at, EXCLUDED.expires_at);
        END;
        $$ LANGUAGE plpgsql
    """)
    op.execute("""
        CREATE FUNCTION pymentor_capture_account_deletion_trigger() RETURNS trigger AS $$
        BEGIN
            PERFORM pymentor_capture_account_deletion(OLD.id);
            RETURN OLD;
        END;
        $$ LANGUAGE plpgsql
    """)
    op.execute("""
        CREATE TRIGGER pymentor_account_deletion_event_v1 BEFORE DELETE ON users
        FOR EACH ROW EXECUTE FUNCTION pymentor_capture_account_deletion_trigger()
    """)


def downgrade() -> None:
    if context.is_offline_mode():
        raise RuntimeError("Refusing offline downgrade of account deletion outbox")
    _require_postgresql()

    connection = op.get_bind()
    connection.execute(
        sa.text(
            'LOCK TABLE "account_deletion_events", "account_deletion_redis_keys" '
            "IN ACCESS EXCLUSIVE MODE"
        )
    )
    if connection.execute(
        sa.text(
            'SELECT EXISTS (SELECT 1 FROM "account_deletion_events" LIMIT 1) '
            'OR EXISTS (SELECT 1 FROM "account_deletion_redis_keys" LIMIT 1)'
        )
    ).scalar():
        raise RuntimeError("Refusing downgrade: account deletion outbox is not empty")

    op.execute("DROP TRIGGER pymentor_account_deletion_event_v1 ON users")
    op.execute("DROP FUNCTION pymentor_capture_account_deletion_trigger()")
    op.execute("DROP FUNCTION pymentor_capture_account_deletion(integer)")
    op.drop_table("account_deletion_redis_keys")
    op.drop_table("account_deletion_events")
