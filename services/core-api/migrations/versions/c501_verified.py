"""Add the email verification flag to existing accounts."""

from alembic import op
import sqlalchemy as sa

revision = "c501_verified"
down_revision = "c426_deletion_outbox"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "users", sa.Column("verified", sa.Boolean(), nullable=False, server_default=sa.false())
    )


def downgrade() -> None:
    raise RuntimeError("Refusing to discard email verification state")
