"""
cv_processor.py

Full pipeline, matching the flow:

    Resume PDF
        |
        v
    Extract Text        (text_extraction.py)
        |
        v
    Clean Text           (text_cleaning.py)
        |
        v
    Extract Sections      (section_extraction.py)
        |
        v
    Extract Skills / Projects / Internships / Certifications / CGPA
                          (feature_extractors.py)
        |
        v
    Convert into Numbers
        |
        v
    Return JSON

The output numeric schema matches the cv_* columns used in
candidate_dataset.csv:
    cv_skills          -> count of distinct matched technical skills
    cv_projects        -> count of project entries
    cv_internships     -> count of internship entries
    cv_certifications  -> count of certification entries
    cv_cgpa            -> CGPA on a 4.0 scale (float)
"""

import json

from .text_extraction import extract_text
from .text_cleaning import clean_text
from .section_extraction import extract_sections
from .feature_extractors import (
    extract_skills,
    extract_projects,
    extract_internships,
    extract_certifications,
    extract_cgpa,
)

def process_cv(pdf_path: str, verbose: bool = False) -> dict:
    """
    Runs the full CV -> numeric features pipeline for a single PDF.

    Returns a dict (JSON-serializable) with:
      - candidate features matching the model's expected input schema
      - "_details": the raw extracted lists, useful for debugging/audit
        (not fed to the model, but handy for a recruiter/candidate UI
        to show "here's what we detected")
    """
    # Step 1: Extract Text
    raw_text = extract_text(pdf_path)

    # Step 2: Clean Text
    cleaned = clean_text(raw_text)

    # Step 3: Extract Sections
    sections = extract_sections(cleaned)

    # Step 4: Extract each feature
    skills_section = sections.get("skills", "")
    projects_section = sections.get("projects", "")
    experience_section = sections.get("experience", "")
    certifications_section = sections.get("certifications", "")

    skills = extract_skills(skills_section, full_text_fallback=cleaned)
    projects = extract_projects(projects_section)
    internships = extract_internships(experience_section)
    certifications = extract_certifications(certifications_section)
    cgpa = extract_cgpa(cleaned)

    # Step 5: Convert into Numbers
    features = {
        "cv_skills": len(skills),
        "cv_projects": len(projects),
        "cv_internships": len(internships),
        "cv_certifications": len(certifications),
        "cv_cgpa": cgpa if cgpa is not None else 0.0,
    }

    result = {"features": features}

    if verbose:
        result["_details"] = {
            "sections_found": list(sections.keys()),
            "skills_matched": skills,
            "projects_detected": projects,
            "internships_detected": internships,
            "certifications_detected": certifications,
            "cgpa_found": cgpa is not None,
        }

    return result


# Step 6: Return JSON (CLI entry point)
if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python cv_processor.py <path_to_resume.pdf> [--verbose]")
        sys.exit(1)

    pdf_path = sys.argv[1]
    verbose = "--verbose" in sys.argv

    output = process_cv(pdf_path, verbose=verbose)
    print(json.dumps(output, indent=2))
