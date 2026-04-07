"""Run the repository's standard local quality gates."""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path
from shutil import which


def run(cmd: list[str], cwd: Path) -> None:
    executable = which(cmd[0]) or which(f"{cmd[0]}.cmd")
    if executable is None:
        raise SystemExit(f"missing executable: {cmd[0]}")
    completed = subprocess.run([executable, *cmd[1:]], cwd=str(cwd), check=False)
    if completed.returncode != 0:
        raise SystemExit(completed.returncode)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--fast",
        action="store_true",
        help="run the minimal fast check suite",
    )
    args = parser.parse_args()

    repo_root = Path(__file__).resolve().parents[1]

    run(["npm", "--prefix", "apps/web", "run", "lint"], repo_root)
    run(["npm", "--prefix", "apps/web", "run", "test"], repo_root)
    run(["go", "-C", "./apps/api-go", "test", "./..."], repo_root)
    run(["uv", "run", "--directory", "apps/api", "ruff", "check", "."], repo_root)
    run(["uv", "run", "--directory", "apps/api", "pytest"], repo_root)

    if not args.fast:
        build_dir = repo_root / "tmp" / "quality-gates"
        build_dir.mkdir(parents=True, exist_ok=True)
        build_name = "platform-api-check.exe" if sys.platform.startswith("win") else "platform-api-check"
        run(["npm", "--prefix", "apps/web", "run", "build"], repo_root)
        run(
            [
                "go",
                "-C",
                "./apps/api-go",
                "build",
                "-o",
                str(build_dir / build_name),
                "./cmd/platform-api",
            ],
            repo_root,
        )


if __name__ == "__main__":
    main()
