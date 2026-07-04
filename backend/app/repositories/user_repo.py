
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User, UserRole


class UserRepository:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_email(self, email: str) -> User | None:
        result = await self.db.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()

    async def get_by_id(self, user_id: str) -> User | None:
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()

    async def create(self, user_data: dict) -> User:
        user = User(**user_data)
        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)
        return user

    async def email_exists(self, email: str) -> bool:
        user = await self.get_by_email(email)
        return user is not None

    # ── New methods for recruiter search ─────────────────────────

    async def get_all_candidates(self, search: str | None = None) -> list[User]:
        """
        Return all users with role=candidate.
        Optional search filters by name or email.
        search is case-insensitive using ilike.
        """
        query = select(User).where(User.role == UserRole.candidate)

        if search:
            # ilike = case-insensitive LIKE in PostgreSQL
            # % wildcard matches anything before/after the search term
            pattern = f"%{search}%"
            query = query.where(
                User.full_name.ilike(pattern) |
                User.email.ilike(pattern)
            )

        query = query.order_by(User.created_at.desc())
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_all_users(self) -> list[User]:
        """Return all users — admin use only."""
        result = await self.db.execute(
            select(User).order_by(User.created_at.desc())
        )
        return list(result.scalars().all())

    async def set_active(self, user_id: str, is_active: bool) -> User | None:
        """Admin: activate or deactivate a user account."""
        user = await self.get_by_id(user_id)
        if user:
            user.is_active = is_active
            await self.db.flush()
        return user