# backend/app/services/leetcode_service.py

import httpx

LEETCODE_GRAPHQL = "https://leetcode.com/graphql"

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
    Fetch candidate's LeetCode statistics via GraphQL.
    Returns structured dict ready for feature engineering.
    """
    headers = {
        "Content-Type": "application/json",
        "User-Agent": "multistack-hire-app",
        "Referer": "https://leetcode.com",
    }

    payload = {
        "query": QUERY,
        "variables": {"username": username},
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.post(
            LEETCODE_GRAPHQL,
            json=payload,
            headers=headers,
        )

        if response.status_code != 200:
            raise ValueError(f"LeetCode API error: {response.status_code}")

        data = response.json()

    user = data.get("data", {}).get("matchedUser")
    if not user:
        raise ValueError(f"LeetCode user '{username}' not found")

    # Parse submission stats
    stats = user.get("submitStats", {}).get("acSubmissionNum", [])
    solved = {s["difficulty"]: s["count"] for s in stats}

    profile = user.get("profile", {})

    total_solved = solved.get("All", 0)
    easy_solved = solved.get("Easy", 0)
    medium_solved = solved.get("Medium", 0)
    hard_solved = solved.get("Hard", 0)

    # Acceptance rate — hard problems worth more
    weighted_score = (easy_solved * 1) + (medium_solved * 3) + (hard_solved * 5)

    return {
        "username": username,
        "total_solved": total_solved,
        "easy_solved": easy_solved,
        "medium_solved": medium_solved,
        "hard_solved": hard_solved,
        "weighted_score": weighted_score,
        "ranking": profile.get("ranking", 0),
        "reputation": profile.get("reputation", 0),
    }