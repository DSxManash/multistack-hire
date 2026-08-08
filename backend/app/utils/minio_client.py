
import io
import uuid
from datetime import datetime
from minio import Minio
from minio.error import S3Error
from app.core.config import settings
import asyncio
from functools import partial


def _get_client(*, public: bool = False) -> Minio:
    """Create MinIO client — called fresh each time to avoid connection issues."""
    if public and settings.MINIO_PUBLIC_ENDPOINT:
        endpoint = settings.MINIO_PUBLIC_ENDPOINT
        secure = (
            settings.MINIO_SECURE
            if settings.MINIO_PUBLIC_SECURE is None
            else settings.MINIO_PUBLIC_SECURE
        )
    else:
        endpoint = settings.MINIO_ENDPOINT
        secure = settings.MINIO_SECURE

    return Minio(
        endpoint=endpoint,
        access_key=settings.MINIO_ACCESS_KEY,
        secret_key=settings.MINIO_SECRET_KEY,
        secure=secure,
    )


def _ensure_bucket(client: Minio) -> None:
    """Create the configured bucket if it does not exist."""
    bucket = settings.MINIO_BUCKET_NAME
    if client.bucket_exists(bucket):
        return
    try:
        client.make_bucket(bucket)
    except S3Error as exc:
        # Concurrent create from another worker is fine.
        if exc.code not in {"BucketAlreadyOwnedByYou", "BucketAlreadyExists"}:
            raise


def ensure_bucket_ready() -> dict:
    """
    Ensure MinIO is reachable and the app bucket exists (create if missing).
    Used on startup, health checks, and before uploads.
    """
    client = _get_client()
    bucket = settings.MINIO_BUCKET_NAME
    created = False
    if not client.bucket_exists(bucket):
        _ensure_bucket(client)
        created = True
    return {
        "status": "ok",
        "bucket": bucket,
        "bucket_exists": True,
        "created": created,
    }


def _upload_file_sync(
    file_bytes: bytes,
    filename: str,
    content_type: str,
) -> str:
    """
    Synchronous upload — runs in thread pool.
    Returns the object path stored in MinIO.
    """
    client = _get_client()
    _ensure_bucket(client)

    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    unique_id = str(uuid.uuid4())[:8]
    # Keep resumes namespaced inside the bucket
    object_name = f"resumes/{unique_id}_{timestamp}_{filename}"

    client.put_object(
        bucket_name=settings.MINIO_BUCKET_NAME,
        object_name=object_name,
        data=io.BytesIO(file_bytes),
        length=len(file_bytes),
        content_type=content_type,
    )

    return object_name


def _get_presigned_url_sync(object_name: str) -> str:
    """
    Generate a temporary URL to access the file.
    URL expires after 1 hour.
    Presigned URLs let the browser download directly from MinIO
    without exposing credentials.
    """
    from datetime import timedelta
    # Sign against the public host so browsers can reach the object.
    client = _get_client(public=True)
    url = client.presigned_get_object(
        bucket_name=settings.MINIO_BUCKET_NAME,
        object_name=object_name,
        expires=timedelta(hours=1),
    )
    return url


async def upload_resume(
    file_bytes: bytes,
    filename: str,
    content_type: str = "application/pdf",
) -> str:
    """
    Async wrapper for file upload.
    Runs sync MinIO call in thread pool so FastAPI event loop isn't blocked.
    """
    loop = asyncio.get_running_loop()
    object_name = await loop.run_in_executor(
        None,
        partial(_upload_file_sync, file_bytes, filename, content_type)
    )
    return object_name


async def get_resume_url(object_name: str) -> str:
    """Async wrapper for presigned URL generation."""
    loop = asyncio.get_running_loop()
    url = await loop.run_in_executor(
        None,
        partial(_get_presigned_url_sync, object_name)
    )
    return url


def _get_object_bytes_sync(object_name: str) -> tuple[bytes, str]:
    """Fetch object bytes and content type from MinIO (internal endpoint)."""
    client = _get_client()
    response = None
    try:
        response = client.get_object(
            bucket_name=settings.MINIO_BUCKET_NAME,
            object_name=object_name,
        )
        data = response.read()
        content_type = (
            getattr(response, "headers", {}) or {}
        ).get("Content-Type", "application/pdf")
        return data, content_type or "application/pdf"
    finally:
        if response is not None:
            response.close()
            response.release_conn()


async def get_resume_bytes(object_name: str) -> tuple[bytes, str]:
    """Async wrapper — return (bytes, content_type) for a stored resume object."""
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(
        None,
        partial(_get_object_bytes_sync, object_name),
    )


async def ensure_storage_ready() -> dict:
    """Async wrapper — create bucket if needed."""
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, ensure_bucket_ready)
