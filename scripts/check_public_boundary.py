"""Fail when public-facing tracked files contain private deployment material."""

from __future__ import annotations

import re
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Rule:
    name: str
    pattern: re.Pattern[str]


TEXT_SUFFIXES = {
    "",
    ".css",
    ".env",
    ".example",
    ".go",
    ".html",
    ".js",
    ".json",
    ".md",
    ".mjs",
    ".ps1",
    ".py",
    ".svg",
    ".toml",
    ".ts",
    ".tsx",
    ".txt",
    ".yaml",
    ".yml",
}

TEXT_NAMES = {
    ".dockerignore",
    ".editorconfig",
    ".gitignore",
    "Dockerfile",
    "LICENSE",
}

SKIP_PATHS = {
    "apps/web/package-lock.json",
    "scripts/check_public_boundary.py",
}

RULES = [
    Rule(
        "realistic secret assignment",
        re.compile(
            r"(?i)\b(?:api[_-]?key|client[_-]?secret|oauth[_-]?secret|access[_-]?token|refresh[_-]?token)"
            r"\b\s*[:=]\s*[\"'](?!replace-|example|placeholder|changeme)"
            r"[A-Za-z0-9_./+=:-]{12,}[\"']"
        ),
    ),
    Rule("OpenAI-style secret", re.compile(r"\bsk-[A-Za-z0-9_-]{20,}\b")),
    Rule("GitHub token", re.compile(r"\b(?:ghp|github_pat)_[A-Za-z0-9_]{20,}\b")),
    Rule("private deployment alias", re.compile(r"\bgz[12]\b", re.IGNORECASE)),
    Rule("private host command", re.compile(r"(?:^|[`\"'])ssh\s+(?!alias|aliases\b)[A-Za-z0-9_.-]+", re.IGNORECASE)),
    Rule("private domain", re.compile(re.escape("diffaudit" + ".vectorcontrol" + ".tech"), re.IGNORECASE)),
    Rule("machine local path", re.compile(r"(?:[A-Z]:" + r"\\(?:Users|Code|Projects|Windows|Program Files)|/home/(?:admin|ubuntu|diffaudit)/|/etc/)")),
    Rule("raw Windows exception", re.compile("Win" + "Error", re.IGNORECASE)),
    Rule("raw Research workspace path", re.compile(r"Research[/\\]workspaces", re.IGNORECASE)),
    Rule("personal demo fixture", re.compile("delicious" + "233", re.IGNORECASE)),
    Rule("off-brand CAPTCHA claim", re.compile("CAP" + "TCHA", re.IGNORECASE)),
    Rule("non-Apache source-available wording", re.compile(r"source[- ]available", re.IGNORECASE)),
    Rule("approval-gated commercial wording", re.compile(r"commercial authorization", re.IGNORECASE)),
]


def tracked_files(repo_root: Path) -> list[Path]:
    completed = subprocess.run(
        ["git", "-C", str(repo_root), "ls-files"],
        check=True,
        capture_output=True,
        text=True,
    )
    return [repo_root / line.strip() for line in completed.stdout.splitlines() if line.strip()]


def should_scan(path: Path, repo_root: Path) -> bool:
    rel = path.relative_to(repo_root).as_posix()
    if rel in SKIP_PATHS:
        return False
    return path.name in TEXT_NAMES or path.suffix in TEXT_SUFFIXES


def main() -> int:
    repo_root = Path(__file__).resolve().parents[1]
    failures: list[str] = []

    for path in tracked_files(repo_root):
        if not should_scan(path, repo_root):
            continue
        rel = path.relative_to(repo_root).as_posix()
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        for line_no, line in enumerate(text.splitlines(), 1):
            for rule in RULES:
                if rule.pattern.search(line):
                    failures.append(f"{rel}:{line_no}: {rule.name}")

    if failures:
        print("Public boundary check failed:", file=sys.stderr)
        for failure in failures:
            print(f"  {failure}", file=sys.stderr)
        return 1

    print("Public boundary check passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
