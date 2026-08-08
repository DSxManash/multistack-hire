"""
text_cleaning.py

Step 2 of the pipeline: Extract Text -> Clean Text

Normalizes whitespace, fixes common PDF-extraction artifacts (broken
hyphenation, bullet symbols, repeated blank lines), and standardizes
line endings so downstream regex-based section/entity extraction is
reliable.
"""

import re
import unicodedata


BULLET_CHARS = ["•", "●", "▪", "‣", "◦", "·", "\uf0b7", "\uf0a7"]


def clean_text(raw_text: str) -> str:
    text = raw_text

    # Normalize unicode (e.g. curly quotes, ligatures) to plain ASCII-ish form
    text = unicodedata.normalize("NFKD", text)

    # Standardize line endings
    text = text.replace("\r\n", "\n").replace("\r", "\n")

    # Replace bullet symbols with a consistent marker "- "
    for bullet in BULLET_CHARS:
        text = text.replace(bullet, "\n- ")

    # Fix hyphenated line-break words e.g. "develop-\nment" -> "development"
    text = re.sub(r"(\w)-\n(\w)", r"\1\2", text)

    # Collapse multiple spaces/tabs into one
    text = re.sub(r"[ \t]+", " ", text)

    # Collapse 3+ newlines into exactly 2 (keep paragraph breaks)
    text = re.sub(r"\n{3,}", "\n\n", text)

    # Strip trailing whitespace on each line
    lines = [line.strip() for line in text.split("\n")]
    text = "\n".join(lines)

    # Remove empty lines that resulted from stripping (but keep single
    # blank lines as section separators)
    cleaned_lines = []
    prev_blank = False
    for line in lines:
        is_blank = len(line) == 0
        if is_blank and prev_blank:
            continue
        cleaned_lines.append(line)
        prev_blank = is_blank

    return "\n".join(cleaned_lines).strip()
