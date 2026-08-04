#!/usr/bin/env python3
"""build_docker_images — DiffAudit Platform 本地镜像构建（ps1 迁移，契约见 server docs/design/ps1-to-python-migration.md）。

对应 Platform/scripts/build_docker_images.ps1：git 状态检查 + web/api 双镜像 docker build + current tag。
"""

import argparse
import subprocess
import sys
from datetime import datetime, timezone

DEFAULT_WEB_IMAGE = "diffaudit-platform-web"
DEFAULT_API_IMAGE = "diffaudit-platform-api"


def git(repo_root: str, *args: str) -> str:
    result = subprocess.run(["git", "-C", repo_root, *args], capture_output=True, text=True, encoding="utf-8", errors="replace")
    if result.returncode != 0:
        raise RuntimeError(f"git {' '.join(args)} failed: {result.stderr.strip()}")
    return result.stdout


def run_docker_build(repo_root: str, dockerfile: str, image_tag: str, revision: str, build_date: str) -> None:
    result = subprocess.run([
        "docker", "build",
        "--build-arg", f"VCS_REF={revision}",
        "--build-arg", f"BUILD_DATE={build_date}",
        "-f", dockerfile,
        "-t", image_tag,
        repo_root,
    ])
    if result.returncode != 0:
        raise RuntimeError(f"docker build failed for {image_tag}")


def main() -> int:
    parser = argparse.ArgumentParser(description="DiffAudit Platform 本地镜像构建（web + api）")
    parser.add_argument("--tag", default="")
    parser.add_argument("--web-image", default=DEFAULT_WEB_IMAGE)
    parser.add_argument("--api-image", default=DEFAULT_API_IMAGE)
    parser.add_argument("--allow-dirty", action="store_true")
    args = parser.parse_args()

    script_dir = os.path.dirname(os.path.abspath(__file__))
    repo_root = os.path.abspath(os.path.join(script_dir, ".."))

    revision = git(repo_root, "rev-parse", "HEAD").strip()
    short_revision = git(repo_root, "rev-parse", "--short=12", "HEAD").strip()
    status = git(repo_root, "status", "--porcelain").strip()

    if status and not args.allow_dirty:
        raise RuntimeError("working tree is dirty; commit or pass --allow-dirty for a local-only image")

    tag = args.tag or short_revision
    build_date = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    run_docker_build(
        repo_root,
        os.path.join(repo_root, "apps", "web", "Dockerfile"),
        f"{args.web_image}:{tag}",
        revision,
        build_date,
    )
    run_docker_build(
        repo_root,
        os.path.join(repo_root, "apps", "api-go", "Dockerfile"),
        f"{args.api_image}:{tag}",
        revision,
        build_date,
    )

    subprocess.run(["docker", "tag", f"{args.web_image}:{tag}", f"{args.web_image}:current"], check=True)
    subprocess.run(["docker", "tag", f"{args.api_image}:{tag}", f"{args.api_image}:current"], check=True)

    print(f"Built {args.web_image}:{tag} and {args.api_image}:{tag}")
    print(f"Revision: {revision}")
    return 0


if __name__ == "__main__":
    import os

    try:
        sys.exit(main())
    except Exception as exc:  # noqa: BLE001 —— 顶层兜底，对齐 ps1 $ErrorActionPreference='Stop'
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)
