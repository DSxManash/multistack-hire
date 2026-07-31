"""
text_extraction.py

Step 1 of the pipeline: Resume PDF -> Extract Text

Uses pdfplumber as the primary extractor (better at preserving layout/line
breaks, which helps section detection later) and falls back to PyMuPDF
(fitz) if pdfplumber fails or returns empty text (e.g. for some PDFs
exported oddly from Word/Canva).
"""

import pdfplumber
import fitz  # PyMuPDF


def _extract_with_pdfplumber(pdf_path: str) -> str:
    text_chunks = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text() or ""
            text_chunks.append(page_text)
    return "\n".join(text_chunks)


def _extract_with_pymupdf(pdf_path: str) -> str:
    text_chunks = []
    with fitz.open(pdf_path) as doc:
        for page in doc:
            text_chunks.append(page.get_text())
    return "\n".join(text_chunks)


def extract_text(pdf_path: str) -> str:
    """
    Extract raw text from a resume PDF.

    Tries pdfplumber first; if it raises an error or returns text with
    fewer than 20 characters (likely a scanned/image-only PDF or a
    pdfplumber failure), falls back to PyMuPDF.

    Returns the raw extracted text (unclean, unmerged, layout intact).
    """
    text = ""
    try:
        text = _extract_with_pdfplumber(pdf_path)
    except Exception:
        text = ""

    if len(text.strip()) < 20:
        try:
            text = _extract_with_pymupdf(pdf_path)
        except Exception as e:
            raise RuntimeError(
                f"Failed to extract text from PDF '{pdf_path}' using both "
                f"pdfplumber and PyMuPDF: {e}"
            )

    if len(text.strip()) < 20:
        raise ValueError(
            "Extracted text is too short/empty. The PDF may be a scanned "
            "image without a text layer (OCR would be required)."
        )

    return text
