from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

# pool_pre_ping=True means it checks if connection is alive before using it
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.APP_ENV == "development",  # logs SQL queries in dev only
    pool_pre_ping=True,
)


# A session = one unit of work with the database
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,  
)

# Base class that all SQLAlchemy models will inherit from
class Base(DeclarativeBase):
    pass