# backend/app/services/resume_parser.py

import logging
import os
import asyncio
import tempfile
from functools import partial

from app.utils.minio_client import _get_object_bytes_sync

logger = logging.getLogger(__name__)


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
    Expects a MinIO object key (e.g. resumes/...), not a local path.
    """
    loop = asyncio.get_running_loop()

    logger.info("[cv] downloading resume object=%s", object_name)
    pdf_bytes, _content_type = await loop.run_in_executor(
        None,
        partial(_get_object_bytes_sync, object_name),
    )
    logger.info(
        "[cv] downloaded resume object=%s bytes=%s; starting NLP pipeline",
        object_name,
        len(pdf_bytes),
    )

    result = await loop.run_in_executor(
        None,
        partial(_run_cv_pipeline, pdf_bytes),
    )
    features = (result or {}).get("features") or {}
    logger.info(
        "[cv] pipeline complete object=%s features=%s",
        object_name,
        {k: features.get(k) for k in (
            "cv_skills",
            "cv_projects",
            "cv_internships",
            "cv_certifications",
            "cv_cgpa",
        )},
    )
    return result
