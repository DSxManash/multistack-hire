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


# Exact feature order matching training data
FEATURE_ORDER = [
    "github_followers",
    "github_public_repos",
    "github_language_diversity",
    "github_account_age_days",
    "leetcode_easy_solved",
    "leetcode_medium_solved",
    "leetcode_hard_solved",
    "cv_skills",
    "cv_projects",
    "cv_internships",
    "cv_certifications",
    "cv_cgpa",
]


def build_feature_vector(
    github_data: dict,
    leetcode_data: dict,
    cv_features: dict,
) -> np.ndarray:
    """
    Build feature vector in EXACT order matching model training.
    Keys come directly from service return values.
    """
    # Merge all data sources into one flat dict
    all_data = {
        **github_data,
        **leetcode_data,
        **cv_features,
    }

    # Extract features in exact training order
    features = [
        float(all_data.get(feature, 0.0))
        for feature in FEATURE_ORDER
    ]

    return np.array(features, dtype=np.float32).reshape(1, -1)


def calculate_score(
    github_data: dict,
    leetcode_data: dict,
    cv_features: dict,
) -> tuple[float, dict]:
    """
    Predict candidate score using XGBoost model.
    Falls back to rule-based scoring if model not loaded.
    """
    feature_vector = build_feature_vector(
        github_data, leetcode_data, cv_features
    )

    if _MODEL is not None:
        raw_score = float(_MODEL.predict(feature_vector)[0])
        final_score = round(min(max(raw_score, 0.0), 100.0), 1)
    else:
        # Rule-based fallback
        f = feature_vector[0]
        github_part  = min((f[0]/200 + f[1]/100 + f[2]/10 + f[3]/3650) / 4, 1.0) * 35
        leetcode_part = min((f[4]/300 + f[5]/200 + f[6]/100) / 3, 1.0) * 35
        cv_part = min((f[7]/20 + f[8]/10 + f[9]/5 + f[10]/5 + f[11]/4.0) / 5, 1.0) * 30
        final_score = round(github_part + leetcode_part + cv_part, 1)

    # Breakdown for UI
    breakdown = {
        "github": round(
            min((github_data.get("github_followers", 0)/200 +
                 github_data.get("github_public_repos", 0)/100 +
                 github_data.get("github_language_diversity", 0)/10) / 3, 1.0
            ) * 35, 1
        ),
        "leetcode": round(
            min((leetcode_data.get("leetcode_easy_solved", 0)/300 +
                 leetcode_data.get("leetcode_medium_solved", 0)/200 +
                 leetcode_data.get("leetcode_hard_solved", 0)/100) / 3, 1.0
            ) * 35, 1
        ),
        "cv": round(
            min((cv_features.get("cv_skills", 0)/20 +
                 cv_features.get("cv_projects", 0)/10 +
                 cv_features.get("cv_cgpa", 0)/4.0) / 3, 1.0
            ) * 30, 1
        ),
    }

    return final_score, breakdown