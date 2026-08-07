
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
    """Create bucket if it doesn't exist."""
    bucket = settings.MINIO_BUCKET_NAME
    if not client.bucket_exists(bucket):
        client.make_bucket(bucket)


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

    # Generate unique filename to avoid conflicts
    # Format: resumes/{user_id}/{timestamp}_{original_name}
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    unique_id = str(uuid.uuid4())[:8]
    object_name = f"{unique_id}_{timestamp}_{filename}"

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
    loop = asyncio.get_event_loop()
    object_name = await loop.run_in_executor(
        None,
        partial(_upload_file_sync, file_bytes, filename, content_type)
    )
    return object_name


async def get_resume_url(object_name: str) -> str:
    """Async wrapper for presigned URL generation."""
    loop = asyncio.get_event_loop()
    url = await loop.run_in_executor(
        None,
        partial(_get_presigned_url_sync, object_name)
    )
    return url