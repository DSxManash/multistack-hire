# backend/app/services/scoring_service.py

import os
import joblib
import numpy as np

# ── Load model once at startup ────────────────────────────────────
_MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "ml",
    "candidate_ranking_model_final.pkl"
)

try:
    _MODEL = joblib.load(_MODEL_PATH)
    print(f"[scoring_service] Model loaded from {_MODEL_PATH}")
except Exception as e:
    _MODEL = None
    print(f"[scoring_service] WARNING: Could not load model: {e}")


def build_feature_vector(
    github_data: dict,
    leetcode_data: dict,
    cv_features: dict,
) -> np.ndarray:
    """
    Build feature vector matching EXACT training feature order:

    github_followers, github_public_repos, github_language_diversity,
    github_account_age_days, leetcode_easy_solved, leetcode_medium_solved,
    leetcode_hard_solved, cv_skills, cv_projects, cv_internships,
    cv_certifications, cv_cgpa
    """
    features = [
        # GitHub (4 features)
        float(github_data.get("followers", 0)),
        float(github_data.get("public_repos", 0)),
        float(github_data.get("language_count", 0)),   
        float(github_data.get("account_age_days", 0)),

        # LeetCode (3 features)
        float(leetcode_data.get("easy_solved", 0)),
        float(leetcode_data.get("medium_solved", 0)),
        float(leetcode_data.get("hard_solved", 0)),

        # CV features (5 features) — from your team's cv_processor
        float(cv_features.get("cv_skills", 0)),
        float(cv_features.get("cv_projects", 0)),
        float(cv_features.get("cv_internships", 0)),
        float(cv_features.get("cv_certifications", 0)),
        float(cv_features.get("cv_cgpa", 0.0)),
    ]

    return np.array(features, dtype=np.float32).reshape(1, -1)


def calculate_score(
    github_data: dict,
    leetcode_data: dict,
    cv_features: dict,
) -> tuple[float, dict]:
    """
    Predict candidate score using trained XGBoost model.
    Returns (score, breakdown) tuple.
    Score is 0-100.
    """
    feature_vector = build_feature_vector(github_data, leetcode_data, cv_features)

    if _MODEL is not None:
        # Use real trained model
        raw_score = float(_MODEL.predict(feature_vector)[0])
        # Clamp to 0-100
        final_score = round(min(max(raw_score, 0.0), 100.0), 1)
    else:
        # Fallback rule-based if model failed to load
        f = feature_vector[0]
        github_score  = min(f[0]/200 + f[1]/100 + f[2]/10 + f[3]/3650, 1.0) * 35
        leetcode_score = min(f[4]/300 + f[5]/200 + f[6]/100, 1.0) * 35
        cv_score = min(f[7]/20 + f[8]/10 + f[9]/5 + f[10]/5 + f[11]/4, 1.0) * 30
        final_score = round(github_score + leetcode_score + cv_score, 1)

    # Score breakdown for UI display
    breakdown = {
        "github": round(min(
            (github_data.get("followers", 0)/200 +
             github_data.get("public_repos", 0)/100 +
             github_data.get("language_count", 0)/10) / 3 * 35, 35
        ), 1),
        "leetcode": round(min(
            (leetcode_data.get("easy_solved", 0)/300 +
             leetcode_data.get("medium_solved", 0)/200 +
             leetcode_data.get("hard_solved", 0)/100) / 3 * 35, 35
        ), 1),
        "cv": round(min(
            (cv_features.get("cv_skills", 0)/20 +
             cv_features.get("cv_projects", 0)/10 +
             cv_features.get("cv_cgpa", 0)/4) / 3 * 30, 30
        ), 1),
    }

    return final_score, breakdown