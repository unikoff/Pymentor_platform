"""Record completed legacy-session imports to prevent replay after revocation."""

from alembic import context, op
import sqlalchemy as sa

revision = "c216_import_marker"
down_revision = "c222_initial_pg"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "session_import_markers",
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"),
                  primary_key=True, nullable=False),
        sa.Column("consumed_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    if context.is_offline_mode():
        raise RuntimeError("Refusing offline downgrade of session import markers")
    connection = op.get_bind()
    connection.execute(sa.text('LOCK TABLE "session_import_markers" IN ACCESS EXCLUSIVE MODE'))
    if connection.execute(sa.text('SELECT EXISTS (SELECT 1 FROM "session_import_markers" LIMIT 1)')).scalar():
        raise RuntimeError("Refusing downgrade: session import markers are not empty")
    op.drop_table("session_import_markers")
