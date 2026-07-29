# backend/app/services/scoring_service.py

import json
import numpy as np
from datetime import datetime


def _normalize(value: float, max_value: float) -> float:
    """Normalize a value to 0-1 range."""
    if max_value == 0:
        return 0.0
    return min(float(value) / max_value, 1.0)


def build_feature_vector(
    github_data: dict,
    leetcode_data: dict,
    resume_data: dict,
    profile_data: dict,
) -> np.ndarray:
    """
    Build normalized feature vector from all data sources.
    Each feature is normalized to 0-1 range.

    Feature weights (for rule-based scoring):
      GitHub:   35% of total score
      LeetCode: 35% of total score
      Resume:   20% of total score
      Profile:  10% of total score
    """
    features = [
        # GitHub features (35%)
        _normalize(github_data.get("public_repos", 0), 100),
        _normalize(github_data.get("total_stars", 0), 500),
        _normalize(github_data.get("followers", 0), 200),
        _normalize(github_data.get("quality_repos", 0), 50),
        _normalize(github_data.get("recent_repos", 0), 20),
        _normalize(github_data.get("language_count", 0), 10),
        _normalize(github_data.get("account_age_days", 0), 3650),

        # LeetCode features (35%)
        _normalize(leetcode_data.get("total_solved", 0), 500),
        _normalize(leetcode_data.get("hard_solved", 0), 100),
        _normalize(leetcode_data.get("medium_solved", 0), 200),
        _normalize(leetcode_data.get("weighted_score", 0), 1000),

        # Resume features (20%)
        _normalize(resume_data.get("skills_count", 0), 20),
        _normalize(resume_data.get("experience_years", 0), 15),
        float(resume_data.get("has_degree", False)),

        # Profile features (10%)
        _normalize(profile_data.get("years_of_experience", 0), 20),
    ]

    return np.array(features, dtype=np.float32)


def calculate_score(feature_vector: np.ndarray) -> tuple[float, dict]:
    """
    Calculate candidate score using weighted formula.
    Returns (score, shap_breakdown) tuple.

    When XGBoost model is trained:
      Replace this function body with:
        model = xgboost.load_model("model.json")
        score = float(model.predict(feature_vector.reshape(1, -1))[0])
        explainer = shap.TreeExplainer(model)
        shap_vals = explainer.shap_values(feature_vector.reshape(1, -1))
    """
    f = feature_vector

    # Weighted scoring formula
    github_score = float(np.mean(f[0:7])) * 35      # 35% weight
    leetcode_score = float(np.mean(f[7:11])) * 35   # 35% weight
    resume_score = float(np.mean(f[11:14])) * 20    # 20% weight
    profile_score = float(np.mean(f[14:15])) * 10   # 10% weight

    total_score = github_score + leetcode_score + resume_score + profile_score
    final_score = round(min(total_score, 100), 1)

    # SHAP-style breakdown (contribution of each source)
    shap_breakdown = {
        "github": round(github_score, 1),
        "leetcode": round(leetcode_score, 1),
        "resume": round(resume_score, 1),
        "profile": round(profile_score, 1),
    }

    return final_score, shap_breakdown