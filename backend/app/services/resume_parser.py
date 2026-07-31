# backend/app/services/resume_parser.py

import io
import os
import asyncio
import tempfile
from functools import partial
from app.utils.minio_client import _get_client
from app.core.config import settings


def _download_from_minio(object_name: str) -> bytes:
    """Download PDF bytes from MinIO synchronously."""
    client = _get_client()
    response = client.get_object(
        bucket_name=settings.MINIO_BUCKET_NAME,
        object_name=object_name,
    )
    return response.read()


def _run_cv_pipeline(pdf_bytes: bytes) -> dict:
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp.write(pdf_bytes)
        tmp_path = tmp.name

    try:
        from app.ml.cv_processor import process_cv

        result = process_cv(tmp_path, verbose=True)
        return result

    except ValueError as e:
        raise ValueError(str(e))
    except Exception as e:
        raise RuntimeError(f"CV processing failed: {e}")
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


async def parse_resume(object_name: str) -> dict:
    """
    Async entry point — downloads from MinIO and runs CV pipeline.
    Returns dict with features + details.
    """
    loop = asyncio.get_event_loop()

    # Download from MinIO (sync → thread pool)
    pdf_bytes = await loop.run_in_executor(
        None,
        partial(_download_from_minio, object_name)
    )

    # Run CV pipeline (sync → thread pool)
    result = await loop.run_in_executor(
        None,
        partial(_run_cv_pipeline, pdf_bytes)
    )

    return result