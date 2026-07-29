# backend/app/routers/ranking.py

from fastapi import APIRouter, Depends, HTTPException, status
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
        "last_scored_at": current_user.last_scored_at,
    }


@router.get("/job/{job_id}")
async def get_ranked_applicants(
    job_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.recruiter])),
):
    """
    Recruiter gets all applicants for a job ranked by ML score.
    """
    from app.models.job import Application, Job
    from sqlalchemy.orm import selectinload

    # Verify job belongs to recruiter
    job_result = await db.execute(
        select(Job).where(
            Job.id == job_id,
            Job.recruiter_id == current_user.id
        )
    )
    job = job_result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Get applications with candidate data
    apps_result = await db.execute(
        select(Application)
        .options(selectinload(Application.candidate))
        .where(Application.job_id == job_id)
    )
    applications = apps_result.scalars().all()

    # Build ranked list
    ranked = []
    for app in applications:
        candidate = app.candidate
        ranked.append({
            "application_id": app.id,
            "status": app.status.value,
            "applied_at": app.applied_at,
            "candidate": {
                "id": candidate.id,
                "full_name": candidate.full_name,
                "email": candidate.email,
                "ranking_score": candidate.ranking_score,
                "github_username": candidate.github_username,
                "leetcode_username": candidate.leetcode_username,
                "skills": candidate.get_skills(),
                "shap_breakdown": json.loads(candidate.shap_values)
                    if candidate.shap_values else None,
            }
        })

    # Sort by ranking score descending (unscored at bottom)
    ranked.sort(
        key=lambda x: x["candidate"]["ranking_score"] or -1,
        reverse=True
    )

    return {
        "job_id": job_id,
        "job_title": job.title,
        "total_applicants": len(ranked),
        "applicants": ranked,
    }


@router.post("/score/all")
async def score_all(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.admin])),
):
    """Admin triggers scoring for all candidates with complete profiles."""
    return await score_all_candidates(db)