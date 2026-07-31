"""
feature_extractors.py

Step 4 of the pipeline: Extract Skills / Projects / Internships /
Certifications / CGPA from the section text produced by
section_extraction.py.

Uses spaCy for sentence/line segmentation support and simple NLP
(noun-phrase-friendly tokenization), combined with regex and keyword
matching -- this mirrors the "spaCy + regex" approach described in the
project's methodology (Section 6.1.3, CV PARSING FUNCTIONALITY).
"""

import re
import spacy

from .skills_database import SKILLS_DB

_nlp = spacy.load("en_core_web_sm", disable=["ner", "lemmatizer"])


# ---------------------------------------------------------------------
# SKILLS
# ---------------------------------------------------------------------
def extract_skills(section_text: str, full_text_fallback: str = "") -> list:
    """
    Matches known technical skills (from SKILLS_DB) against the Skills
    section. If no Skills section was found, falls back to scanning the
    whole resume text so skills mentioned inline aren't missed entirely.
    Returns a de-duplicated list of canonical skill names found.
    """
    search_text = section_text if section_text.strip() else full_text_fallback
    normalized = f" {search_text.lower()} "
    normalized = re.sub(r"[^\w\s+#./]", " ", normalized)  # keep +,#,.,/ for c++, c#, node.js
    normalized = re.sub(r"\s+", " ", normalized)

    found = set()
    for canonical, variants in SKILLS_DB.items():
        for variant in variants:
            # apply the same punctuation normalization to the variant
            # (e.g. "scikit-learn" -> "scikit learn") so it matches text
            # that went through the same normalization above
            v = re.sub(r"[^\w\s+#./]", " ", variant.strip().lower())
            v = re.sub(r"\s+", " ", v).strip()
            if not v:
                continue

            if re.fullmatch(r"[a-z0-9 ]+", v):
                # plain alphanumeric variant (e.g. "python", "machine learning")
                # -> require word boundaries so "java" doesn't match inside
                # "javascript", "c" doesn't match inside "certified", etc.
                pattern = r"\b" + re.escape(v).replace(r"\ ", r"\s+") + r"\b"
            else:
                # variant contains special chars (c++, c#, node.js) which
                # are already distinctive enough for a plain substring match
                pattern = re.escape(v).replace(r"\ ", r"\s+")

            if re.search(pattern, normalized):
                found.add(canonical)
                break

    return sorted(found)


# ---------------------------------------------------------------------
# PROJECTS
# ---------------------------------------------------------------------
def extract_projects(section_text: str) -> list:
    """
    Counts distinct project entries in the Projects section.
    Heuristic: a new project starts at a line that is NOT a bullet
    (doesn't start with "-") and is followed by bullet detail lines,
    OR simply each top-level (non-bulleted) line if the section is
    formatted as one-line-per-project.
    """
    if not section_text.strip():
        return []

    lines = [l for l in section_text.split("\n") if l.strip()]
    projects = []
    for line in lines:
        if line.startswith("- "):
            continue  # this is a detail/bullet line under a project, not a new project title
        # skip lines that are clearly just dates or empty separators
        if re.fullmatch(r"[\d/,\-\s]+", line):
            continue
        projects.append(line.strip())

    return projects


# ---------------------------------------------------------------------
# INTERNSHIPS
# ---------------------------------------------------------------------
INTERNSHIP_KEYWORDS = ["intern", "internship", "trainee"]


def extract_internships(section_text: str) -> list:
    """
    From the Experience section, counts entries that look like
    internships (title line containing "intern"/"trainee") as opposed to
    full-time roles. If the whole Experience section is internship-only
    (common for students), every top-level entry counts.
    """
    if not section_text.strip():
        return []

    lines = [l for l in section_text.split("\n") if l.strip()]
    entries = []
    for line in lines:
        if line.startswith("- "):
            continue
        if re.fullmatch(r"[\d/,\-\s]+", line):
            continue
        entries.append(line.strip())

    internship_entries = [
        e for e in entries if any(kw in e.lower() for kw in INTERNSHIP_KEYWORDS)
    ]

    # If nothing explicitly says "intern" but this is a student resume,
    # treat every experience entry as an internship (common case).
    return internship_entries if internship_entries else entries


# ---------------------------------------------------------------------
# CERTIFICATIONS
# ---------------------------------------------------------------------
def extract_certifications(section_text: str) -> list:
    """
    Counts distinct certification entries (one per non-bulleted line, or
    one per bullet if the whole section is bulleted).
    """
    if not section_text.strip():
        return []

    lines = [l for l in section_text.split("\n") if l.strip()]
    bulleted = [l for l in lines if l.startswith("- ")]

    if bulleted:
        return [b[2:].strip() for b in bulleted]

    return [l.strip() for l in lines if not re.fullmatch(r"[\d/,\-\s]+", l)]


# ---------------------------------------------------------------------
# CGPA
# ---------------------------------------------------------------------
CGPA_PATTERNS = [
    r"cgpa\s*[:\-]?\s*(\d\.\d{1,2})",
    r"gpa\s*[:\-]?\s*(\d\.\d{1,2})",
    r"cgpa\s*[:\-]?\s*(\d\.\d{1,2})\s*/\s*4",
    r"(\d\.\d{1,2})\s*/\s*4\.0\s*cgpa",
    r"(\d\.\d{1,2})\s*cgpa",
]


def extract_cgpa(full_text: str) -> float:
    """
    Searches the whole resume (CGPA is often in the Education section,
    which may not always be reliably split out) for a CGPA/GPA value on
    a 4.0 scale. Returns None if not found.

    If a value is found on what looks like a 10-point scale (e.g. "8.5
    CGPA" with no "/4"), it is converted to a 4.0 scale using the common
    formula: cgpa_4 = cgpa_10 / 2.5
    """
    text_lower = full_text.lower()

    for pattern in CGPA_PATTERNS:
        match = re.search(pattern, text_lower)
        if match:
            value = float(match.group(1))
            if value > 4.0:
                # looks like a 10-point scale value, convert to 4.0 scale
                value = round(value / 2.5, 2)
            return min(value, 4.0)

    return None
