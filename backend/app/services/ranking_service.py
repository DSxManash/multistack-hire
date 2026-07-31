# backend/app/services/ranking_service.py

import json
from datetime import datetime

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User, UserRole
from app.services.github_service import fetch_github_data
from app.services.leetcode_service import fetch_leetcode_data
from app.services.resume_parser import parse_resume
from app.services.scoring_service import calculate_score

async def score_candidate(user: User, db: AsyncSession) -> dict:
    """
    Full ML scoring pipeline.

    1. Fetch GitHub data
    2. Fetch LeetCode data
    3. Parse Resume
    4. Predict score
    5. Save results
    """

    errors = []

    print("\n" + "=" * 70)
    print(f"Scoring candidate: {user.full_name}")
    print(f"GitHub username   : {user.github_username}")
    print(f"LeetCode username : {user.leetcode_username}")
    print(f"Resume URL        : {user.resume_url}")
    print("=" * 70)

    # ==========================================================
    # Step 1 — GitHub
    # ==========================================================
    github_data = {}

    if user.github_username:
        try:
            github_data = await fetch_github_data(user.github_username)
            print("\nGitHub fetched successfully")
            print(json.dumps(github_data, indent=2))
        except Exception as e:
            print(f"\nGitHub ERROR: {e}")
            errors.append(f"GitHub: {str(e)}")
    else:
        print("\nGitHub username missing")
        errors.append("GitHub username not set")

    # ==========================================================
    # Step 2 — LeetCode
    # ==========================================================
    leetcode_data = {}

    if user.leetcode_username:
        try:
            leetcode_data = await fetch_leetcode_data(user.leetcode_username)
            print("\nLeetCode fetched successfully")
            print(json.dumps(leetcode_data, indent=2))
        except Exception as e:
            print(f"\nLeetCode ERROR: {e}")
            errors.append(f"LeetCode: {str(e)}")
    else:
        print("\nLeetCode username missing")
        errors.append("LeetCode username not set")

    # ==========================================================
    # Step 3 — Resume
    # ==========================================================
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

            print("\nResume parsed successfully")
            print(json.dumps(cv_features, indent=2))

        except Exception as e:
            print(f"\nResume ERROR: {e}")
            errors.append(f"CV Parser: {str(e)}")
    else:
        print("\nResume missing")
        errors.append("Resume not uploaded")

    print("\n" + "-" * 70)
    print("DATA SENT TO ML MODEL")
    print("-" * 70)
    print("GitHub:")
    print(json.dumps(github_data, indent=2))
    print()

    print("LeetCode:")
    print(json.dumps(leetcode_data, indent=2))
    print()

    print("CV:")
    print(json.dumps(cv_features, indent=2))
    print("-" * 70)

    # ==========================================================
    # Step 4 — ML Prediction
    # ==========================================================
    final_score, breakdown = calculate_score(
        github_data,
        leetcode_data,
        cv_features,
    )

    print("\nPrediction")
    print("Score:", final_score)
    print("Breakdown:", breakdown)

    # ==========================================================
    # Step 5 — Save
    # ==========================================================
    user.ranking_score = final_score
    user.github_data = json.dumps(github_data)
    user.leetcode_data = json.dumps(leetcode_data)
    user.resume_text = json.dumps(cv_features)
    user.shap_values = json.dumps(breakdown)
    user.last_scored_at = datetime.utcnow()
    user.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(user)

    print("\nSaved successfully")
    print("=" * 70 + "\n")

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
    """
    Admin endpoint.

    Score every active candidate
    whose profile is complete.
    """

    result = await db.execute(
        select(User).where(
            User.role == UserRole.candidate,
            User.profile_completed == True,
            User.is_active == True,
        )
    )

    candidates = result.scalars().all()

    results = []
    failures = []

    for candidate in candidates:
        try:
            scored = await score_candidate(candidate, db)

            results.append(
                {
                    "id": candidate.id,
                    "name": candidate.full_name,
                    "score": scored["score"],
                }
            )

        except Exception as e:
            failures.append(
                {
                    "id": candidate.id,
                    "name": candidate.full_name,
                    "error": str(e),
                }
            )

    return {
        "scored": len(results),
        "failed": len(failures),
        "results": results,
        "failures": failures,
    }