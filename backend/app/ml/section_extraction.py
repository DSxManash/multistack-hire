"""
section_extraction.py

Step 3 of the pipeline: Clean Text -> Extract Sections

Resumes have no fixed schema, so this uses a heuristic header-matching
approach: scan each line, and if it looks like a section heading (short,
matches a known header alias, often capitalized/bold-like), start a new
section. Everything until the next recognized heading belongs to that
section.
"""

import re

# Canonical section -> list of header aliases that may appear in a resume
SECTION_ALIASES = {
    "skills": [
        "skills", "technical skills", "core skills", "key skills",
        "skills and interests", "technologies", "technical proficiencies",
    ],
    "projects": [
        "projects", "academic projects", "personal projects",
        "major projects", "project experience", "project work",
    ],
    "experience": [
        "experience", "work experience", "internship", "internships",
        "professional experience", "employment history", "work history",
    ],
    "certifications": [
        "certifications", "certificates", "licenses & certifications",
        "courses and certifications", "training and certifications",
    ],
    "education": [
        "education", "academic background", "educational qualification",
        "academic qualification", "academics",
    ],
}

# Flatten alias -> canonical section for lookup
_ALIAS_TO_SECTION = {}
for section, aliases in SECTION_ALIASES.items():
    for alias in aliases:
        _ALIAS_TO_SECTION[alias] = section


def _normalize_heading(line: str) -> str:
    return re.sub(r"[^a-z& ]", "", line.lower()).strip()


def _looks_like_heading(line: str) -> bool:
    """
    Heuristic: a heading line is short (<= 5 words), has no sentence-ending
    punctuation, and matches (or closely matches) a known alias.
    """
    stripped = line.strip()
    if not stripped or len(stripped) > 40:
        return False
    word_count = len(stripped.split())
    if word_count > 5:
        return False
    normalized = _normalize_heading(stripped)
    return normalized in _ALIAS_TO_SECTION


def extract_sections(cleaned_text: str) -> dict:
    """
    Splits resume text into a dict of {section_name: section_text}.

    Recognized section_name keys: 'skills', 'projects', 'experience',
    'certifications', 'education'. Any text before the first recognized
    heading is stored under 'header' (name, contact info, summary, etc).
    """
    lines = cleaned_text.split("\n")

    sections = {"header": []}
    current_section = "header"

    for line in lines:
        if _looks_like_heading(line):
            normalized = _normalize_heading(line)
            current_section = _ALIAS_TO_SECTION[normalized]
            sections.setdefault(current_section, [])
            continue
        sections.setdefault(current_section, [])
        sections[current_section].append(line)

    # Join lines back into text blocks, drop empty sections
    result = {}
    for name, lines_list in sections.items():
        block = "\n".join(lines_list).strip()
        if block:
            result[name] = block

    return result
