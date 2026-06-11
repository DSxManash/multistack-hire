import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

# Import your settings to get DATABASE_URL
from app.core.config import settings

# Import Base so Alembic can see all your models
# When you add new models later, import them here too
from app.core.database import Base
from app.models import user, refresh_token 

# Alembic Config object — reads alembic.ini
config = context.config

# Setup Python logging from alembic.ini config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# This is what Alembic compares against your DB to find differences
# Base.metadata knows about all models imported above
target_metadata = Base.metadata

# Override the sqlalchemy.url from alembic.ini with our .env value
# This way we never hardcode the DB URL in alembic.ini
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)


def run_migrations_offline() -> None:
    """
    Offline mode: generate SQL scripts without DB connection.
    Useful for reviewing what SQL will be run before applying.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    """Run migrations using an existing connection."""
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,  # detects column type changes too
    )

    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    """
    Online mode: connect to DB and run migrations directly.
    We use async engine because our app uses asyncpg.
    """
    # Build async engine from alembic config
    # (sqlalchemy.url is already set above from .env)
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,  # no connection pooling for migrations
    )

    async with connectable.connect() as connection:
        # run_sync bridges async connection into sync Alembic context
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


# Entry point — Alembic calls this when you run any alembic command
if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())