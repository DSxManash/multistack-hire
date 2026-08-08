"""add jobs applicants_ranked_at

Revision ID: b7e4a91c2d0f
Revises: 46530351ee7c
Create Date: 2026-08-08 20:25:00.000000+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b7e4a91c2d0f"
down_revision: Union[str, None] = "46530351ee7c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "jobs",
        sa.Column("applicants_ranked_at", sa.DateTime(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("jobs", "applicants_ranked_at")
