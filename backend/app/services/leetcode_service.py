# backend/app/services/leetcode_service.py

import httpx
from app.core.config import settings

QUERY = """
query getUserProfile($username: String!) {
  matchedUser(username: $username) {
    username
    submitStats: submitStatsGlobal {
      acSubmissionNum {
        difficulty
        count
        submissions
      }
    }
    profile {
      ranking
      reputation
      starRating
    }
  }
}
"""


async def fetch_leetcode_data(username: str) -> dict:
    """
    Fetch candidate LeetCode statistics via GraphQL.

    Uses settings.LEETCODE_GRAPHQL_URL from .env.

    ⚠️  IMPORTANT: LeetCode does not have an official public API.
    This uses their unofficial GraphQL endpoint which may:
      - Be blocked by LeetCode's WAF (returns 403)
      - Return CORS errors in some environments
      - Stop working without notice

    For production reliability, consider:
      - RapidAPI LeetCode wrapper (paid)
      - Asking candidates to self-report their stats
      - Using LeetCode's official API (requires partnership)

    Returns structured dict matching model feature names:
      leetcode_easy_solved, leetcode_medium_solved, leetcode_hard_solved
    """
    headers = {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; multistack-hire/1.0)",
        "Referer": "https://leetcode.com",
        "Origin": "https://leetcode.com",
    }

    payload = {
        "query": QUERY,
        "variables": {"username": username},
        "operationName": "getUserProfile",
    }

    async with httpx.AsyncClient(
        timeout=settings.LEETCODE_API_TIMEOUT,
        follow_redirects=True,
    ) as client:
        try:
            response = await client.post(
                settings.LEETCODE_GRAPHQL_URL,
                json=payload,
                headers=headers,
            )
        except httpx.TimeoutException:
            raise ValueError(
                f"LeetCode API timed out after "
                f"{settings.LEETCODE_API_TIMEOUT}s. "
                f"LeetCode may be blocking server requests."
            )
        except httpx.ConnectError:
            raise ValueError(
                "Cannot connect to LeetCode API. "
                "Check network connectivity."
            )

    if response.status_code == 403:
        raise ValueError(
            "LeetCode blocked this request (403 Forbidden). "
            "The unofficial GraphQL endpoint may be rate-limited "
            "or blocked from server IPs. "
            "This is a known limitation — scores will use 0 "
            "for LeetCode features."
        )

    if response.status_code != 200:
        raise ValueError(
            f"LeetCode API error: HTTP {response.status_code}"
        )

    # Parse response
    try:
        data = response.json()
    except Exception:
        raise ValueError("LeetCode API returned invalid JSON")

    # Check for GraphQL errors
    if "errors" in data:
        raise ValueError(
            f"LeetCode GraphQL error: {data['errors'][0].get('message', 'Unknown')}"
        )

    user = data.get("data", {}).get("matchedUser")
    if not user:
        raise ValueError(
            f"LeetCode user '{username}' not found. "
            f"Check that the username is correct."
        )

    # ── Feature Extraction ────────────────────────────────────────
    stats = user.get("submitStats", {}).get("acSubmissionNum", [])
    solved = {s["difficulty"]: s["count"] for s in stats}

    profile_data = user.get("profile", {})

    easy_solved   = solved.get("Easy", 0)
    medium_solved = solved.get("Medium", 0)
    hard_solved   = solved.get("Hard", 0)
    total_solved  = solved.get("All", 0)

    # Weighted score for UI display
    weighted_score = (easy_solved * 1) + (medium_solved * 3) + (hard_solved * 5)

    return {
        # ── Model features (exact names used in training) ─────────
        "leetcode_easy_solved":   easy_solved,
        "leetcode_medium_solved": medium_solved,
        "leetcode_hard_solved":   hard_solved,

        # ── Extra data for UI display ─────────────────────────────
        "username":       username,
        "total_solved":   total_solved,
        "weighted_score": weighted_score,
        "ranking":        profile_data.get("ranking", 0),
        "reputation":     profile_data.get("reputation", 0),
    }


def get_empty_leetcode_data() -> dict:
    """
    Returns zeroed LeetCode data when API is unavailable.
    Used as graceful fallback so scoring still runs.
    All model features default to 0.
    """
    return {
        "leetcode_easy_solved":   0,
        "leetcode_medium_solved": 0,
        "leetcode_hard_solved":   0,
        "total_solved":   0,
        "weighted_score": 0,
        "ranking":        0,
        "reputation":     0,
        "error": "LeetCode API unavailable",
    }