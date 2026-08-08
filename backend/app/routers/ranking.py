# backend/app/routers/ranking.py

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.dependencies import get_db
from app.core.security import get_current_user
from app.models.user import User, UserRole
from app.services.ranking_service import score_candidate, score_all_candidates
import json

router = APIRouter()


def require_role(allowed: list[UserRole]):
    def checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access restricted"
            )
        return current_user
    return checker


def _candidate_payload(
    candidate: User,
    *,
    score=None,
    shap=None,
    include_scores: bool = True,
) -> dict:
    """Build candidate dict. When include_scores is False, hide recruiter AI fields."""
    if include_scores:
        ranking_score = score if score is not None else candidate.ranking_score
        shap_breakdown = (
            shap
            if shap is not None
            else (json.loads(candidate.shap_values) if candidate.shap_values else None)
        )
    else:
        ranking_score = None
        shap_breakdown = None

    return {
        "id": candidate.id,
        "full_name": candidate.full_name,
        "email": candidate.email,
        "ranking_score": ranking_score,
        "github_username": candidate.github_username,
        "leetcode_username": candidate.leetcode_username,
        "has_resume": bool(candidate.resume_url),
        "skills": candidate.get_skills(),
        "shap_breakdown": shap_breakdown,
    }


@router.post("/score/me")
async def score_myself(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.candidate])),
):
    """
    Candidate triggers their own scoring.
    Fetches GitHub, LeetCode, parses resume, calculates score.
    """
    if not current_user.profile_completed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Complete your profile first (GitHub, LeetCode, Resume required)"
        )
    return await score_candidate(current_user, db)


@router.get("/score/me")
async def get_my_score(
    current_user: User = Depends(require_role([UserRole.candidate])),
):
    """Get candidate's current score and breakdown."""
    return {
        "score": current_user.ranking_score,
        "shap_breakdown": json.loads(current_user.shap_values) if current_user.shap_values else None,
        "github_data": json.loads(current_user.github_data) if current_user.github_data else None,
        "leetcode_data": json.loads(current_user.leetcode_data) if current_user.leetcode_data else None,
        "cv_features": json.loads(current_user.resume_text) if current_user.resume_text else None,
        "last_scored_at": current_user.last_scored_at,
    }


@router.get("/job/{job_id}")
async def get_ranked_applicants(
    job_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.recruiter])),
):
    """
    Recruiter gets all applicants for a job.
    AI scores are only returned after this job has been ranked
    (jobs.applicants_ranked_at is set).
    """
    from app.models.job import Application, Job
    from sqlalchemy.orm import selectinload

    job_result = await db.execute(
        select(Job).where(
            Job.id == job_id,
            Job.recruiter_id == current_user.id
        )
    )
    job = job_result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    apps_result = await db.execute(
        select(Application)
        .options(selectinload(Application.candidate))
        .where(Application.job_id == job_id)
    )
    applications = apps_result.scalars().all()

    is_ranked = job.applicants_ranked_at is not None

    ranked = []
    for app in applications:
        candidate = app.candidate
        ranked.append({
            "application_id": app.id,
            "status": app.status.value,
            "applied_at": app.applied_at,
            "candidate": _candidate_payload(
                candidate,
                include_scores=is_ranked,
            ),
        })

    if is_ranked:
        ranked.sort(
            key=lambda x: (
                x["candidate"]["ranking_score"]
                if x["candidate"]["ranking_score"] is not None
                else -1
            ),
            reverse=True,
        )

    return {
        "job_id": job_id,
        "job_title": job.title,
        "total_applicants": len(ranked),
        "ranked": is_ranked,
        "applicants": ranked,
    }


@router.get("/job/{job_id}/applicant/{application_id}/resume")
async def get_applicant_resume(
    job_id: str,
    application_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.recruiter])),
):
    """
    Stream an applicant's resume for the owning recruiter.
    Uses internal MinIO so the browser never needs a public presigned URL.
    """
    from app.models.job import Application, Job
    from sqlalchemy.orm import selectinload
    from app.utils.minio_client import get_resume_bytes

    job_result = await db.execute(
        select(Job).where(
            Job.id == job_id,
            Job.recruiter_id == current_user.id,
        )
    )
    job = job_result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    app_result = await db.execute(
        select(Application)
        .options(selectinload(Application.candidate))
        .where(
            Application.id == application_id,
            Application.job_id == job_id,
        )
    )
    application = app_result.scalar_one_or_none()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    object_name = application.candidate.resume_url
    if not object_name:
        raise HTTPException(status_code=404, detail="Resume not found")

    try:
        data, content_type = await get_resume_bytes(object_name)
    except Exception:
        raise HTTPException(status_code=404, detail="Resume not found") from None

    return Response(
        content=data,
        media_type=content_type or "application/pdf",
        headers={
            "Content-Disposition": 'inline; filename="resume.pdf"',
            "Cache-Control": "private, max-age=300",
        },
    )


@router.post("/score/all")
async def score_all(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.admin])),
):
    """Admin triggers scoring for all candidates with complete profiles."""
    return await score_all_candidates(db)


@router.post("/score/job/{job_id}")
async def score_job_applicants(
    job_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.recruiter])),
):
    """
    Recruiter scores ALL candidates who applied to their job.
    Marks the job as ranked so GET returns AI scores thereafter.
    """
    from app.models.job import Application, Job
    from sqlalchemy.orm import selectinload

    job_result = await db.execute(
        select(Job).where(
            Job.id == job_id,
            Job.recruiter_id == current_user.id
        )
    )
    job = job_result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    apps_result = await db.execute(
        select(Application)
        .options(selectinload(Application.candidate))
        .where(Application.job_id == job_id)
    )
    applications = apps_result.scalars().all()

    scored = []
    failed = []

    for app in applications:
        candidate = app.candidate
        if not candidate.profile_completed:
            failed.append({
                "id": candidate.id,
                "name": candidate.full_name,
                "error": "Profile incomplete",
            })
            continue
        try:
            result = await score_candidate(candidate, db)
            scored.append({
                "application_id": app.id,
                "status": app.status.value,
                "candidate": _candidate_payload(
                    candidate,
                    score=result["score"],
                    shap=result.get("shap_breakdown"),
                    include_scores=True,
                ),
                "applied_at": app.applied_at.isoformat(),
            })
        except Exception as e:
            failed.append({
                "id": candidate.id,
                "name": candidate.full_name,
                "error": str(e),
            })

    scored.sort(
        key=lambda x: (
            x["candidate"]["ranking_score"]
            if x["candidate"]["ranking_score"] is not None
            else -1
        ),
        reverse=True,
    )

    scored_ids = {entry["candidate"]["id"] for entry in scored}
    remaining = []
    for app in applications:
        candidate = app.candidate
        if candidate.id in scored_ids:
            continue
        remaining.append({
            "application_id": app.id,
            "status": app.status.value,
            "candidate": _candidate_payload(candidate, include_scores=True),
            "applied_at": app.applied_at.isoformat() if app.applied_at else None,
        })

    applicants = scored + remaining

    # Job-level gate: recruiter has run Rank Candidates for this job
    job.applicants_ranked_at = datetime.utcnow()
    await db.flush()

    return {
        "job_id": job_id,
        "job_title": job.title,
        "total": len(applications),
        "scored": len(scored),
        "failed": len(failed),
        "ranked": True,
        "applicants": applicants,
        "failures": failed,
    }
