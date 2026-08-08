
import io
import logging
import uuid
from datetime import datetime
from minio import Minio
from minio.error import S3Error
from app.core.config import settings
import asyncio
from functools import partial

logger = logging.getLogger(__name__)


def _normalize_endpoint(endpoint: str | None) -> str | None:
    """Strip scheme and trailing slash so Minio() gets host[:port] only."""
    if not endpoint:
        return None
    value = endpoint.strip()
    for prefix in ("https://", "http://"):
        if value.lower().startswith(prefix):
            value = value[len(prefix):]
            break
    return value.rstrip("/") or None


def _internal_endpoint() -> tuple[str, bool]:
    endpoint = _normalize_endpoint(settings.MINIO_ENDPOINT) or "minio:9000"
    return endpoint, bool(settings.MINIO_SECURE)


def _public_endpoint() -> tuple[str, bool]:
    public = _normalize_endpoint(settings.MINIO_PUBLIC_ENDPOINT)
    if public:
        secure = (
            settings.MINIO_SECURE
            if settings.MINIO_PUBLIC_SECURE is None
            else bool(settings.MINIO_PUBLIC_SECURE)
        )
        return public, secure
    return _internal_endpoint()


def _get_client(*, public: bool = False) -> Minio:
    """Create MinIO client — called fresh each time to avoid connection issues."""
    if public:
        endpoint, secure = _public_endpoint()
    else:
        endpoint, secure = _internal_endpoint()

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
        logger.info("[minio] created bucket=%s", bucket)
    except S3Error as exc:
        # Concurrent create from another worker is fine.
        if exc.code not in {"BucketAlreadyOwnedByYou", "BucketAlreadyExists"}:
            logger.error(
                "[minio] make_bucket failed bucket=%s code=%s message=%s",
                bucket,
                exc.code,
                exc.message,
            )
            raise


def ensure_bucket_ready() -> dict:
    """
    Ensure MinIO is reachable and the app bucket exists (create if missing).
    Used on startup, health checks, and before uploads.
    """
    endpoint, secure = _internal_endpoint()
    try:
        client = _get_client()
        bucket = settings.MINIO_BUCKET_NAME
        created = False
        if not client.bucket_exists(bucket):
            _ensure_bucket(client)
            created = True
        logger.info(
            "[minio] bucket ready endpoint=%s secure=%s bucket=%s created=%s",
            endpoint,
            secure,
            bucket,
            created,
        )
        return {
            "status": "ok",
            "bucket": bucket,
            "bucket_exists": True,
            "created": created,
            "endpoint": endpoint,
        }
    except S3Error as exc:
        logger.error(
            "[minio] ensure_bucket_ready failed endpoint=%s code=%s message=%s",
            endpoint,
            exc.code,
            exc.message,
        )
        raise RuntimeError(
            f"MinIO unavailable at {endpoint}: {exc.code or type(exc).__name__}"
        ) from exc
    except Exception as exc:
        logger.error(
            "[minio] ensure_bucket_ready failed endpoint=%s error=%s",
            endpoint,
            exc,
        )
        raise


def _upload_file_sync(
    file_bytes: bytes,
    filename: str,
    content_type: str,
) -> str:
    """
    Synchronous upload — runs in thread pool.
    Returns the object path stored in MinIO.
    """
    endpoint, _ = _internal_endpoint()
    bucket = settings.MINIO_BUCKET_NAME
    client = _get_client()
    _ensure_bucket(client)

    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    unique_id = str(uuid.uuid4())[:8]
    # Keep resumes namespaced inside the bucket
    object_name = f"resumes/{unique_id}_{timestamp}_{filename}"

    try:
        client.put_object(
            bucket_name=bucket,
            object_name=object_name,
            data=io.BytesIO(file_bytes),
            length=len(file_bytes),
            content_type=content_type,
        )
    except S3Error as exc:
        logger.error(
            "[minio] put_object failed endpoint=%s bucket=%s object=%s "
            "bytes=%s code=%s message=%s",
            endpoint,
            bucket,
            object_name,
            len(file_bytes),
            exc.code,
            exc.message,
        )
        raise RuntimeError(
            f"Failed to store resume in MinIO ({exc.code}): {object_name}"
        ) from exc

    logger.info(
        "[minio] put_object ok endpoint=%s bucket=%s object=%s bytes=%s",
        endpoint,
        bucket,
        object_name,
        len(file_bytes),
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

    endpoint, secure = _public_endpoint()
    client = _get_client(public=True)
    try:
        url = client.presigned_get_object(
            bucket_name=settings.MINIO_BUCKET_NAME,
            object_name=object_name,
            expires=timedelta(hours=1),
        )
    except S3Error as exc:
        logger.error(
            "[minio] presign failed endpoint=%s secure=%s object=%s code=%s",
            endpoint,
            secure,
            object_name,
            exc.code,
        )
        raise RuntimeError(
            f"Failed to presign resume URL ({exc.code}): {object_name}"
        ) from exc

    # Log host only — omit query (contains signature)
    host = url.split("?", 1)[0]
    logger.info(
        "[minio] presign ok endpoint=%s secure=%s object=%s url_base=%s",
        endpoint,
        secure,
        object_name,
        host,
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
    endpoint, _ = _internal_endpoint()
    bucket = settings.MINIO_BUCKET_NAME
    client = _get_client()
    response = None
    try:
        response = client.get_object(
            bucket_name=bucket,
            object_name=object_name,
        )
        data = response.read()
        content_type = (
            getattr(response, "headers", {}) or {}
        ).get("Content-Type", "application/pdf")
        logger.info(
            "[minio] get_object ok endpoint=%s bucket=%s object=%s bytes=%s",
            endpoint,
            bucket,
            object_name,
            len(data),
        )
        return data, content_type or "application/pdf"
    except S3Error as exc:
        logger.error(
            "[minio] get_object failed endpoint=%s bucket=%s object=%s code=%s",
            endpoint,
            bucket,
            object_name,
            exc.code,
        )
        raise RuntimeError(
            f"Failed to fetch resume from MinIO ({exc.code}): {object_name}"
        ) from exc
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
