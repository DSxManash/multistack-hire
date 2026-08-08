"""restore users created_at updated_at

Revision ID: a1b2c3d4e5f6
Revises: ed99b97ec472
Create Date: 2026-07-11 00:00:00.000000+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, None] = "ed99b97ec472"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    existing = {col["name"] for col in inspect(bind).get_columns("users")}

    if "created_at" not in existing:
        op.add_column(
            "users",
            sa.Column(
                "created_at",
                sa.DateTime(),
                nullable=False,
                server_default=sa.text("CURRENT_TIMESTAMP"),
            ),
        )
    if "updated_at" not in existing:
        op.add_column(
            "users",
            sa.Column(
                "updated_at",
                sa.DateTime(),
                nullable=False,
                server_default=sa.text("CURRENT_TIMESTAMP"),
            ),
        )


def downgrade() -> None:
    bind = op.get_bind()
    existing = {col["name"] for col in inspect(bind).get_columns("users")}
    if "updated_at" in existing:
        op.drop_column("users", "updated_at")
    if "created_at" in existing:
        op.drop_column("users", "created_at")
