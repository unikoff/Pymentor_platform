"""Track both confirmations of an email change without changing user fields."""
from alembic import op
import sqlalchemy as sa

revision = "c503_dual_email_change"
down_revision = "c502_email_change"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "email_change_requests",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("active", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("old_confirmed", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("new_confirmed", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("completed", sa.Boolean(), nullable=False, server_default=sa.false()),
    )


def downgrade() -> None:
    raise RuntimeError("Refusing to discard pending email-change confirmations")
