"""Verify Docker image OCI revision labels before deployment."""

from __future__ import annotations

import argparse
import json
import subprocess
from dataclasses import dataclass
from pathlib import Path
from shutil import which


REVISION_LABEL = "org.opencontainers.image.revision"
SOURCE_LABEL = "org.opencontainers.image.source"
MIN_REVISION_PREFIX_LENGTH = 7
DEFAULT_WEB_IMAGE = "diffaudit-platform-web"
DEFAULT_API_IMAGE = "diffaudit-platform-api"
DEFAULT_GHCR_WEB_IMAGE = "ghcr.io/deliciousbuding/diffaudit-platform-web"
DEFAULT_GHCR_API_IMAGE = "ghcr.io/deliciousbuding/diffaudit-platform-api"


@dataclass(frozen=True)
class VerificationResult:
    image: str
    ok: bool
    message: str


def run_text(cmd: list[str], cwd: Path) -> str:
    executable = which(cmd[0]) or which(f"{cmd[0]}.cmd")
    if executable is None:
        raise SystemExit(f"missing executable: {cmd[0]}")
    completed = subprocess.run(
        [executable, *cmd[1:]],
        cwd=str(cwd),
        check=False,
        capture_output=True,
        text=True,
    )
    if completed.returncode != 0:
        stderr = completed.stderr.strip()
        stdout = completed.stdout.strip()
        detail = stderr or stdout or f"exit code {completed.returncode}"
        raise SystemExit(f"{' '.join(cmd)} failed: {detail}")
    return completed.stdout.strip()


def git_revision(repo_root: Path, short: bool = False) -> str:
    args = ["git", "rev-parse"]
    if short:
        args.append("--short=12")
    args.append("HEAD")
    return run_text(args, repo_root).strip()


def planned_images(
    images: list[str] | None,
    *,
    local_tag: str | None = None,
    ghcr_tag: str | None = None,
) -> list[str]:
    if images:
        return images
    if local_tag:
        return [
            f"{DEFAULT_WEB_IMAGE}:{local_tag}",
            f"{DEFAULT_API_IMAGE}:{local_tag}",
        ]
    if ghcr_tag:
        return [
            f"{DEFAULT_GHCR_WEB_IMAGE}:{ghcr_tag}",
            f"{DEFAULT_GHCR_API_IMAGE}:{ghcr_tag}",
        ]
    raise ValueError("provide --image, --local-tag, or --ghcr-tag")


def revision_matches(actual: str, expected: str) -> bool:
    actual = actual.strip().lower()
    expected = expected.strip().lower()
    if not actual or not expected or actual == "unknown":
        return False
    if actual == expected:
        return True
    if min(len(actual), len(expected)) < MIN_REVISION_PREFIX_LENGTH:
        return False
    if len(actual) < len(expected):
        return expected.startswith(actual)
    if len(expected) < len(actual):
        return actual.startswith(expected)
    return False


def inspect_image_labels(image: str, repo_root: Path) -> dict[str, str]:
    raw = run_text(
        ["docker", "image", "inspect", image, "--format", "{{ json .Config.Labels }}"],
        repo_root,
    )
    if not raw or raw == "null":
        return {}
    try:
        labels = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise SystemExit(f"docker returned invalid label JSON for {image}: {exc}") from exc
    if not isinstance(labels, dict):
        return {}
    return {str(key): str(value) for key, value in labels.items()}


def verify_labels(
    image: str,
    labels: dict[str, str],
    *,
    expected_revision: str,
    expected_source: str | None = None,
) -> VerificationResult:
    actual_revision = labels.get(REVISION_LABEL, "").strip()
    if not revision_matches(actual_revision, expected_revision):
        return VerificationResult(
            image=image,
            ok=False,
            message=(
                f"revision label mismatch: expected {expected_revision}, "
                f"got {actual_revision or '<missing>'}"
            ),
        )

    if expected_source is not None:
        actual_source = labels.get(SOURCE_LABEL, "").strip()
        if actual_source != expected_source:
            return VerificationResult(
                image=image,
                ok=False,
                message=(
                    f"source label mismatch: expected {expected_source}, "
                    f"got {actual_source or '<missing>'}"
                ),
            )

    return VerificationResult(
        image=image,
        ok=True,
        message=f"revision {actual_revision}",
    )


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Verify Docker image org.opencontainers.image.revision labels.",
    )
    parser.add_argument(
        "--expected-revision",
        help="expected Git revision; defaults to the current repository HEAD",
    )
    parser.add_argument(
        "--expected-source",
        help="optional expected org.opencontainers.image.source label",
    )
    parser.add_argument(
        "--image",
        action="append",
        help="image reference to verify; repeat for multiple images",
    )
    parser.add_argument(
        "--local-tag",
        help="verify diffaudit-platform-web:<tag> and diffaudit-platform-api:<tag>",
    )
    parser.add_argument(
        "--ghcr-tag",
        help="verify the public GHCR web/api images with this tag, for example sha-1c9d67d",
    )
    args = parser.parse_args()

    repo_root = Path(__file__).resolve().parents[1]
    expected_revision = args.expected_revision or git_revision(repo_root)
    try:
        images = planned_images(
            args.image,
            local_tag=args.local_tag,
            ghcr_tag=args.ghcr_tag,
        )
    except ValueError as exc:
        parser.error(str(exc))

    failures: list[VerificationResult] = []
    for image in images:
        labels = inspect_image_labels(image, repo_root)
        result = verify_labels(
            image,
            labels,
            expected_revision=expected_revision,
            expected_source=args.expected_source,
        )
        prefix = "OK" if result.ok else "FAIL"
        print(f"{prefix} {result.image}: {result.message}")
        if not result.ok:
            failures.append(result)

    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
