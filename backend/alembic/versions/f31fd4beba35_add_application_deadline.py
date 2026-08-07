"""add application deadline

Revision ID: f31fd4beba35
Revises: 25ebe907ee6c
Create Date: 2026-08-07 07:11:07.415613+00:00
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "f31fd4beba35"
down_revision: Union[str, None] = "25ebe907ee6c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Step 1: Add the column as nullable
    op.add_column(
        "jobs",
        sa.Column(
            "application_deadline",
            sa.DateTime(),
            nullable=True,
        ),
    )

    # Step 2: Populate existing rows
    op.execute("""
        UPDATE jobs
        SET application_deadline = created_at + interval '30 days'
        WHERE application_deadline IS NULL
    """)

    # Step 3: Make the column NOT NULL
    op.alter_column(
        "jobs",
        "application_deadline",
        nullable=False,
    )


def downgrade() -> None:
    op.drop_column("jobs", "application_deadline")