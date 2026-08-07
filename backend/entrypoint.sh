#!/bin/sh
set -e

echo "Waiting for database..."
python - <<'PY'
import asyncio
import os
import sys

import asyncpg


def dsn_from_env() -> str:
    url = os.environ.get("DATABASE_URL", "").strip()
    if not url:
        print("DATABASE_URL is not set", file=sys.stderr)
        sys.exit(1)
    return url.replace("postgresql+asyncpg://", "postgresql://", 1).replace(
        "postgres://", "postgresql://", 1
    )


async def wait_for_db(retries: int = 60, delay: float = 1.0) -> None:
    dsn = dsn_from_env()
    last_error = None
    for attempt in range(1, retries + 1):
        try:
            conn = await asyncpg.connect(dsn)
            await conn.close()
            print(f"Database is ready (attempt {attempt})")
            return
        except Exception as exc:  # noqa: BLE001 - keep retrying until ready
            last_error = exc
            print(f"Database not ready ({attempt}/{retries}): {exc}")
            await asyncio.sleep(delay)
    print(f"Database did not become ready: {last_error}", file=sys.stderr)
    sys.exit(1)


asyncio.run(wait_for_db())
PY

echo "Applying database migrations..."
alembic upgrade head
echo "Migrations complete."

echo "Seeding admin account..."
python -m scripts.seed_admin
echo "Admin seed complete."

exec "$@"