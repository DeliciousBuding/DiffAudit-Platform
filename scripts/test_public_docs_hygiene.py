"""Guard public docs against internal progress-log artifacts."""

from __future__ import annotations

import re
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
DOCS_DIR = REPO_ROOT / "docs"

BLOCKED_DOC_NAME_PATTERNS = (
    re.compile(r"\bprogress\b", re.IGNORECASE),
    re.compile(r"\bhandoff\b", re.IGNORECASE),
    re.compile(r"\breview[-_ ]?dump\b", re.IGNORECASE),
)

BLOCKED_CONTENT_MARKERS = (
    "Progress Log",
    "parallel review agents",
    "parallel agents audited",
    "fixes (3 parallel agents)",
)


class PublicDocsHygieneTest(unittest.TestCase):
    def test_public_docs_do_not_include_internal_progress_logs(self) -> None:
        markdown_files = sorted(DOCS_DIR.glob("*.md"))

        blocked_names = [
            path.name
            for path in markdown_files
            if any(pattern.search(path.stem) for pattern in BLOCKED_DOC_NAME_PATTERNS)
        ]
        self.assertEqual([], blocked_names)

        blocked_content = []
        for path in markdown_files:
            text = path.read_text(encoding="utf-8")
            for marker in BLOCKED_CONTENT_MARKERS:
                if marker in text:
                    blocked_content.append(f"{path.relative_to(REPO_ROOT)} contains {marker!r}")

        self.assertEqual([], blocked_content)


if __name__ == "__main__":
    unittest.main()
