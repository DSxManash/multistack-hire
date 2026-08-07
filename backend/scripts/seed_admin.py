"""Idempotent seed for the default admin account (used by Docker entrypoint)."""

from __future__ import annotations

import asyncio
import uuid

from app.auth.password import hash_password
from app.core.database import AsyncSessionLocal
from app.models import company as company_model  # noqa: F401
from app.models import job as job_model  # noqa: F401
from app.models import refresh_token as refresh_token_model  # noqa: F401
from app.models import user as user_model  # noqa: F401
from app.models.user import UserRole
from app.repositories.user_repo import UserRepository

ADMIN_EMAIL = "admin@multistackhire.com"
ADMIN_PASSWORD = "password123"
ADMIN_FULL_NAME = "System Admin"


async def seed_admin() -> None:
    async with AsyncSessionLocal() as session:
        repo = UserRepository(session)
        existing = await repo.get_by_email(ADMIN_EMAIL)

        if existing:
            changed = False
            if existing.role != UserRole.admin:
                existing.role = UserRole.admin
                changed = True
            if not existing.is_active:
                existing.is_active = True
                changed = True
            if changed:
                await session.commit()
                print(f"Admin account restored: {ADMIN_EMAIL}")
            else:
                print(f"Admin account already present: {ADMIN_EMAIL}")
            return

        await repo.create(
            {
                "id": str(uuid.uuid4()),
                "full_name": ADMIN_FULL_NAME,
                "email": ADMIN_EMAIL,
                "password_hash": hash_password(ADMIN_PASSWORD),
                "role": UserRole.admin,
                "is_active": True,
            }
        )
        await session.commit()
        print(f"Admin account seeded: {ADMIN_EMAIL}")


if __name__ == "__main__":
    asyncio.run(seed_admin())
