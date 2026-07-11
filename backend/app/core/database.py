from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from urllib.parse import urlparse

from app.core.config import settings


def _needs_ssl(database_url: str) -> bool:
    host = (urlparse(database_url).hostname or "").lower()
    if host in {"localhost", "127.0.0.1", "db", "postgres"}:
        return False
    return True


connect_args = {}
if _needs_ssl(settings.async_database_url):
    # asyncpg requires an explicit SSL flag for Render / managed Postgres.
    connect_args["ssl"] = True

engine = create_async_engine(
    settings.async_database_url,
    echo=settings.APP_ENV == "development",
    pool_pre_ping=True,
    connect_args=connect_args,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass
