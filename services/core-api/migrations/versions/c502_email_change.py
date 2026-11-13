"""Remember consumed email-change links until they expire."""
from alembic import op
import sqlalchemy as sa

revision = "c502_email_change"
down_revision = "c501_verified"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table("consumed_email_changes",
                    sa.Column("token_hash", sa.String(64), primary_key=True),
                    sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False))


def downgrade() -> None:
    raise RuntimeError("Refusing to discard consumed email-change links")
