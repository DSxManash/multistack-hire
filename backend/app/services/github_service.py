# backend/app/services/github_service.py

import httpx
from datetime import datetime, timedelta
from app.core.config import settings


def _build_headers() -> dict:
    """
    Build GitHub API headers.
    Adds Authorization if token is configured in .env.
    Without token: 60 requests/hour (public API)
    With token:    5000 requests/hour
    """
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "multistack-hire-app",
    }
    if settings.GITHUB_API_TOKEN:
        headers["Authorization"] = f"Bearer {settings.GITHUB_API_TOKEN}"
    return headers


async def fetch_github_data(username: str) -> dict:
    """
    Fetch candidate GitHub profile and repository statistics.

    Uses settings.GITHUB_API_URL and settings.GITHUB_API_TOKEN from .env.
    Gracefully handles rate limits and missing data.

    Returns structured dict matching model feature names:
      github_followers, github_public_repos, github_language_diversity,
      github_account_age_days
    """
    headers = _build_headers()

    async with httpx.AsyncClient(
        timeout=settings.GITHUB_API_TIMEOUT
    ) as client:

        # ── Profile ───────────────────────────────────────────────
        profile_resp = await client.get(
            f"{settings.GITHUB_API_URL}/users/{username}",
            headers=headers,
        )

        if profile_resp.status_code == 404:
            raise ValueError(f"GitHub user '{username}' not found")

        if profile_resp.status_code == 403:
            # Rate limit hit
            reset_time = profile_resp.headers.get("X-RateLimit-Reset", "unknown")
            raise ValueError(
                f"GitHub API rate limit exceeded. "
                f"Reset at: {reset_time}. "
                f"Set GITHUB_API_TOKEN in .env to increase limit to 5000/hour."
            )

        if profile_resp.status_code != 200:
            raise ValueError(
                f"GitHub API error: {profile_resp.status_code} "
                f"for user '{username}'"
            )

        profile = profile_resp.json()

        # ── Repositories ──────────────────────────────────────────
        repos_resp = await client.get(
            f"{settings.GITHUB_API_URL}/users/{username}/repos",
            headers=headers,
            params={
                "sort": "updated",
                "per_page": 100,
                "type": "owner",
            },
        )
        repos = (
            repos_resp.json()
            if repos_resp.status_code == 200
            else []
        )
        # Guard: if repos is not a list (API error dict), use empty
        if not isinstance(repos, list):
            repos = []

    # ── Feature Extraction ────────────────────────────────────────

    total_stars = sum(r.get("stargazers_count", 0) for r in repos)
    total_forks = sum(r.get("forks_count", 0) for r in repos)

    # Language diversity (number of distinct languages)
    languages: dict[str, int] = {}
    for repo in repos:
        lang = repo.get("language")
        if lang:
            languages[lang] = languages.get(lang, 0) + 1

    language_diversity = len(languages)

    # Quality repos — has stars or description
    quality_repos = sum(
        1 for r in repos
        if r.get("stargazers_count", 0) > 0 or r.get("description")
    )

    # Recent activity — repos updated in last 6 months
    six_months_ago = datetime.utcnow() - timedelta(days=180)
    recent_repos = sum(
        1 for r in repos
        if r.get("updated_at") and
        datetime.fromisoformat(
            r["updated_at"].replace("Z", "+00:00")
        ).replace(tzinfo=None) > six_months_ago
    )

    # Account age in days
    account_age_days = 0
    if profile.get("created_at"):
        try:
            created = datetime.fromisoformat(
                profile["created_at"].replace("Z", "+00:00")
            ).replace(tzinfo=None)
            account_age_days = (datetime.utcnow() - created).days
        except Exception:
            account_age_days = 0

    return {
        # ── Model features (exact names used in training) ─────────
        "github_followers":         profile.get("followers", 0),
        "github_public_repos":      profile.get("public_repos", 0),
        "github_language_diversity": language_diversity,
        "github_account_age_days":  account_age_days,

        # ── Extra data for UI display ─────────────────────────────
        "username":      username,
        "total_stars":   total_stars,
        "total_forks":   total_forks,
        "quality_repos": quality_repos,
        "recent_repos":  recent_repos,
        "languages":     languages,
        "top_language":  max(languages, key=languages.get) if languages else None,
        "following":     profile.get("following", 0),
        "public_gists":  profile.get("public_gists", 0),

        # ── Rate limit info (useful for debugging) ────────────────
        "api_authenticated": bool(settings.GITHUB_API_TOKEN),
    }