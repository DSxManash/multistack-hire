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

echo "Waiting for MinIO / object storage..."
python - <<'PY'
import os
import sys
import time

from app.utils.minio_client import ensure_bucket_ready


def wait_for_minio(retries: int = 60, delay: float = 1.0) -> None:
    last_error = None
    endpoint = os.environ.get("MINIO_ENDPOINT", "minio:9000")
    bucket = os.environ.get("MINIO_BUCKET_NAME", "multistack-hire-resumes")
    for attempt in range(1, retries + 1):
        try:
            info = ensure_bucket_ready()
            print(
                f"MinIO is ready (attempt {attempt}): "
                f"endpoint={endpoint} bucket={info.get('bucket', bucket)} "
                f"created={info.get('created', False)}"
            )
            return
        except Exception as exc:  # noqa: BLE001
            last_error = exc
            print(f"MinIO not ready ({attempt}/{retries}): {type(exc).__name__}: {exc}")
            time.sleep(delay)
    print(f"MinIO did not become ready: {last_error}", file=sys.stderr)
    sys.exit(1)


wait_for_minio()
PY

echo "Applying database migrations..."
alembic upgrade head
echo "Migrations complete."

echo "Seeding admin account..."
python -m scripts.seed_admin
echo "Admin seed complete."

exec "$@"
