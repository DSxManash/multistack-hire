
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import AsyncSessionLocal


# This is a dependency function
# The "yield" makes it a context manager:
#   - Everything before yield = setup (open session)
#   - Everything after yield = teardown (close session)
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session         # FastAPI injects this into the route
            await session.commit()
        except Exception:
            await session.rollback() 
            raise