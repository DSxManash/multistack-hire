from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User

class UserRepository:

    def __init__(self, db: AsyncSession):
        # db session is injected — this class never creates its own session
        self.db = db

    async def get_by_email(self, email: str) -> User | None:
        """Find a user by email. Returns None if not found."""
        result = await self.db.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()

    async def get_by_id(self, user_id: str) -> User | None:
        """Find a user by ID. Returns None if not found."""
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()

    async def create(self, user_data: dict) -> User:
        """
        Create a new user row in the database.
        user_data is a plain dict of column values.
        """
        user = User(**user_data)
        self.db.add(user)
       
        await self.db.flush()
        await self.db.refresh(user)  # reload from DB to get generated values
        return user

    async def email_exists(self, email: str) -> bool:
        """Quick check if email is already registered."""
        user = await self.get_by_email(email)
        return user is not None