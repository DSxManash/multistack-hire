import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import create_async_engine

from alembic import context

# Import your settings to get DATABASE_URL
from app.core.config import settings

# Import Base so Alembic can see all your models
# When you add new models later, import them here too
from app.core.database import Base
from app.models import user, refresh_token 
from app.models import job as job_model

# Alembic Config object — reads alembic.ini
config = context.config

# Setup Python logging from alembic.ini config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# This is what Alembic compares against your DB to find differences
# Base.metadata knows about all models imported above
target_metadata = Base.metadata

# Override the sqlalchemy.url from alembic.ini with our .env value.
# Escape % for ConfigParser (common in generated DB passwords).
config.set_main_option(
    "sqlalchemy.url",
    settings.async_database_url.replace("%", "%%"),
)


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
    Reuse the same SSL connect args as the app engine.
    """
    from app.core.database import build_connect_args

    connectable = create_async_engine(
        settings.async_database_url,
        poolclass=pool.NullPool,
        connect_args=build_connect_args(),
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


# Entry point — Alembic calls this when you run any alembic command
if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())