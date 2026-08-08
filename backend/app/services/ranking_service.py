# backend/app/services/ranking_service.py

import json
import logging
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User, UserRole
from app.services.github_service import fetch_github_data
from app.services.leetcode_service import (
    fetch_leetcode_data,
    get_empty_leetcode_data,
)
from app.services.resume_parser import parse_resume
from app.services.scoring_service import calculate_score

logger = logging.getLogger(__name__)


async def score_candidate(user: User, db: AsyncSession) -> dict:
    errors = []

    # ── GitHub ────────────────────────────────────────────────────
    github_data = {
        "github_followers": 0,
        "github_public_repos": 0,
        "github_language_diversity": 0,
        "github_account_age_days": 0,
    }
    if user.github_username:
        try:
            github_data = await fetch_github_data(user.github_username)
        except Exception as e:
            errors.append(f"GitHub: {str(e)}")
    else:
        errors.append("GitHub username not set")

    # ── LeetCode (with graceful fallback) ─────────────────────────
    leetcode_data = get_empty_leetcode_data()
    if user.leetcode_username:
        try:
            leetcode_data = await fetch_leetcode_data(user.leetcode_username)
        except Exception as e:
            errors.append(f"LeetCode: {str(e)} — using 0 values")
            leetcode_data = get_empty_leetcode_data()
    else:
        errors.append("LeetCode username not set")

    # ── CV Pipeline ───────────────────────────────────────────────
    cv_features = {
        "cv_skills": 0,
        "cv_projects": 0,
        "cv_internships": 0,
        "cv_certifications": 0,
        "cv_cgpa": 0.0,
    }
    cv_details = {}
    if user.resume_url:
        try:
            cv_result = await parse_resume(user.resume_url)
            cv_features = cv_result.get("features", cv_features)
            cv_details = cv_result.get("_details", {})
        except Exception as e:
            logger.exception(
                "[cv] parse_resume failed user_id=%s object=%s",
                user.id,
                user.resume_url,
            )
            errors.append(f"CV Parser: {str(e)}")
    else:
        errors.append("Resume not uploaded")

    # ── Score ─────────────────────────────────────────────────────
    final_score, breakdown = calculate_score(
        github_data, leetcode_data, cv_features
    )

    # ── Store ─────────────────────────────────────────────────────
    user.ranking_score = final_score
    user.github_data = json.dumps(github_data)
    user.leetcode_data = json.dumps(leetcode_data)
    user.resume_text = json.dumps(cv_features)
    user.shap_values = json.dumps(breakdown)
    user.last_scored_at = datetime.utcnow()
    user.updated_at = datetime.utcnow()

    await db.flush()
    await db.refresh(user)

    return {
        "candidate_id": user.id,
        "score": final_score,
        "shap_breakdown": breakdown,
        "github_data": github_data,
        "leetcode_data": leetcode_data,
        "cv_features": cv_features,
        "cv_details": cv_details,
        "errors": errors,
    }


async def score_all_candidates(db: AsyncSession) -> dict:
    result = await db.execute(
        select(User).where(
            User.role == UserRole.candidate,
            User.profile_completed == True,
            User.is_active == True,
        )
    )
    candidates = result.scalars().all()

    results = []
    failed = []

    for candidate in candidates:
        try:
            scored = await score_candidate(candidate, db)
            results.append({
                "id": candidate.id,
                "name": candidate.full_name,
                "score": scored["score"],
                "errors": scored.get("errors", []),
            })
        except Exception as e:
            failed.append({
                "id": candidate.id,
                "name": candidate.full_name,
                "error": str(e),
            })

    return {
        "scored": len(results),
        "failed": len(failed),
        "results": results,
        "failures": failed,
    }