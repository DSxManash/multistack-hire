import ssl
from urllib.parse import urlparse

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings


def build_ssl_context() -> ssl.SSLContext:
    """
    Encrypt the Postgres connection without failing on managed-provider
    certificate chains (Supabase / Render often trip default verification).
    """
    ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    return ctx


def build_connect_args() -> dict:
    args: dict = {}

    if settings.use_database_ssl:
        args["ssl"] = build_ssl_context()

    host = (urlparse(settings.async_database_url).hostname or "").lower()
    # Supabase pooler (PgBouncer) does not support prepared statements well.
    if "supabase" in host:
        args["statement_cache_size"] = 0

    return args


engine = create_async_engine(
    settings.async_database_url,
    echo=settings.APP_ENV == "development",
    pool_pre_ping=True,
    connect_args=build_connect_args(),
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass
