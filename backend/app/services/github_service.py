# backend/app/services/github_service.py

import httpx
import json
from typing import Optional

GITHUB_API = "https://api.github.com"

async def fetch_github_data(username: str) -> dict:
    """
    Fetch candidate's GitHub profile and repository data.
    Returns structured dict ready for feature engineering.
    """
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "multistack-hire-app",
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        # Fetch user profile
        profile_resp = await client.get(
            f"{GITHUB_API}/users/{username}",
            headers=headers
        )

        if profile_resp.status_code == 404:
            raise ValueError(f"GitHub user '{username}' not found")
        if profile_resp.status_code != 200:
            raise ValueError(f"GitHub API error: {profile_resp.status_code}")

        profile = profile_resp.json()

        # Fetch repositories
        repos_resp = await client.get(
            f"{GITHUB_API}/users/{username}/repos",
            headers=headers,
            params={
                "sort": "updated",
                "per_page": 100,
                "type": "owner",
            }
        )
        repos = repos_resp.json() if repos_resp.status_code == 200 else []

    # Extract meaningful features
    total_stars = sum(r.get("stargazers_count", 0) for r in repos)
    total_forks = sum(r.get("forks_count", 0) for r in repos)

    # Get language distribution
    languages = {}
    for repo in repos:
        lang = repo.get("language")
        if lang:
            languages[lang] = languages.get(lang, 0) + 1

    # Count repos with meaningful content (has description + stars)
    quality_repos = sum(
        1 for r in repos
        if r.get("stargazers_count", 0) > 0 or r.get("description")
    )

    # Recent activity — repos updated in last 6 months
    from datetime import datetime, timedelta
    six_months_ago = datetime.utcnow() - timedelta(days=180)
    recent_repos = sum(
        1 for r in repos
        if r.get("updated_at") and
        datetime.fromisoformat(
            r["updated_at"].replace("Z", "+00:00")
        ).replace(tzinfo=None) > six_months_ago
    )

    return {
        "username": username,
        "public_repos": profile.get("public_repos", 0),
        "public_gists": profile.get("public_gists", 0),
        "followers": profile.get("followers", 0),
        "following": profile.get("following", 0),
        "total_stars": total_stars,
        "total_forks": total_forks,
        "quality_repos": quality_repos,
        "recent_repos": recent_repos,
        "languages": languages,
        "top_language": max(languages, key=languages.get) if languages else None,
        "language_count": len(languages),
        "account_age_days": (
            datetime.utcnow() -
            datetime.fromisoformat(
                profile["created_at"].replace("Z", "+00:00")
            ).replace(tzinfo=None)
        ).days if profile.get("created_at") else 0,
    }