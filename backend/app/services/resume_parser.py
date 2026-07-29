# backend/app/services/resume_parser.py

import io
import re
import pdfplumber
from app.utils.minio_client import _get_client
from app.core.config import settings

# Common tech skills to look for in resume
TECH_SKILLS = {
    "python", "javascript", "typescript", "java", "c++", "c#", "go",
    "rust", "kotlin", "swift", "react", "vue", "angular", "node",
    "fastapi", "django", "flask", "spring", "express", "nextjs",
    "postgresql", "mysql", "mongodb", "redis", "elasticsearch",
    "docker", "kubernetes", "aws", "gcp", "azure", "terraform",
    "machine learning", "deep learning", "tensorflow", "pytorch",
    "scikit-learn", "pandas", "numpy", "xgboost", "data science",
    "git", "linux", "rest api", "graphql", "microservices",
}

def _download_from_minio(object_name: str) -> bytes:
    """Download PDF bytes from MinIO synchronously."""
    client = _get_client()
    response = client.get_object(
        bucket_name=settings.MINIO_BUCKET_NAME,
        object_name=object_name,
    )
    return response.read()


def _extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract all text from PDF using pdfplumber."""
    text = ""
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text.lower()


def _extract_skills(text: str) -> list[str]:
    """Find matching tech skills in resume text."""
    found = []
    for skill in TECH_SKILLS:
        if skill in text:
            found.append(skill)
    return found


def _extract_experience_years(text: str) -> float:
    """
    Try to find years of experience mentioned in text.
    Looks for patterns like '3 years', '5+ years experience'
    """
    patterns = [
        r'(\d+)\+?\s*years?\s*of\s*experience',
        r'(\d+)\+?\s*years?\s*experience',
        r'experience\s*of\s*(\d+)\+?\s*years?',
        r'(\d+)\+?\s*yrs?\s*experience',
    ]
    years = []
    for pattern in patterns:
        matches = re.findall(pattern, text)
        years.extend([int(m) for m in matches])
    return max(years) if years else 0.0


def _has_degree(text: str) -> bool:
    """Check if resume mentions a university degree."""
    degree_keywords = [
        "bachelor", "master", "phd", "b.sc", "m.sc", "b.tech",
        "m.tech", "b.e", "m.e", "degree", "university", "college",
        "graduate", "undergraduate",
    ]
    return any(kw in text for kw in degree_keywords)


async def parse_resume(object_name: str) -> dict:
    """
    Main entry point — downloads from MinIO and parses resume.
    Returns structured features for ML scoring.
    """
    import asyncio
    from functools import partial

    # Download PDF from MinIO in thread pool (sync operation)
    loop = asyncio.get_event_loop()
    pdf_bytes = await loop.run_in_executor(
        None,
        partial(_download_from_minio, object_name)
    )

    # Extract text
    text = _extract_text_from_pdf(pdf_bytes)

    # Extract features
    skills = _extract_skills(text)
    experience_years = _extract_experience_years(text)
    has_degree = _has_degree(text)

    return {
        "raw_text": text[:5000],         
        "skills_found": skills,
        "skills_count": len(skills),
        "experience_years": experience_years,
        "has_degree": has_degree,
        "page_count": len(text.split("\n\n")),
    }