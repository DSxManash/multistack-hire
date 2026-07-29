# backend/app/services/ranking_service.py

import json
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.services.github_service import fetch_github_data
from app.services.leetcode_service import fetch_leetcode_data
from app.services.resume_parser import parse_resume
from app.services.scoring_service import build_feature_vector, calculate_score
from fastapi import HTTPException, status


async def score_candidate(user: User, db: AsyncSession) -> dict:
    """
    Full ML scoring pipeline for one candidate.
    Fetches GitHub, LeetCode, parses resume, scores, stores result.
    """
    errors = []

    # ── Step 1: GitHub ────────────────────────────────────────────
    github_data = {}
    if user.github_username:
        try:
            github_data = await fetch_github_data(user.github_username)
        except Exception as e:
            errors.append(f"GitHub: {str(e)}")
            github_data = {}
    else:
        errors.append("GitHub username not set")

    # ── Step 2: LeetCode ──────────────────────────────────────────
    leetcode_data = {}
    if user.leetcode_username:
        try:
            leetcode_data = await fetch_leetcode_data(user.leetcode_username)
        except Exception as e:
            errors.append(f"LeetCode: {str(e)}")
            leetcode_data = {}
    else:
        errors.append("LeetCode username not set")

    # ── Step 3: Resume ────────────────────────────────────────────
    resume_data = {}
    if user.resume_url:
        try:
            resume_data = await parse_resume(user.resume_url)
        except Exception as e:
            errors.append(f"Resume: {str(e)}")
            resume_data = {}
    else:
        errors.append("Resume not uploaded")

    # ── Step 4: Profile data ──────────────────────────────────────
    profile_data = {
        "years_of_experience": user.years_of_experience or 0,
        "skills_count": len(user.get_skills()),
    }

    # ── Step 5: Build feature vector ──────────────────────────────
    feature_vector = build_feature_vector(
        github_data, leetcode_data, resume_data, profile_data
    )

    # ── Step 6: Score ─────────────────────────────────────────────
    final_score, shap_breakdown = calculate_score(feature_vector)

    # ── Step 7: Store in DB ───────────────────────────────────────
    user.ranking_score = final_score
    user.github_data = json.dumps(github_data)
    user.leetcode_data = json.dumps(leetcode_data)
    user.resume_text = resume_data.get("raw_text", "")
    user.shap_values = json.dumps(shap_breakdown)
    user.last_scored_at = datetime.utcnow()
    user.updated_at = datetime.utcnow()

    await db.flush()
    await db.refresh(user)

    return {
        "candidate_id": user.id,
        "score": final_score,
        "shap_breakdown": shap_breakdown,
        "github_data": github_data,
        "leetcode_data": leetcode_data,
        "resume_summary": {
            "skills_found": resume_data.get("skills_found", []),
            "experience_years": resume_data.get("experience_years", 0),
            "has_degree": resume_data.get("has_degree", False),
        },
        "errors": errors,
    }


async def score_all_candidates(db: AsyncSession) -> dict:
    """
    Admin endpoint — score all candidates with complete profiles.
    """
    result = await db.execute(
        select(User).where(
            User.role == "candidate",
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