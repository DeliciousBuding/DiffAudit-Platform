#!/usr/bin/env python3
"""run-platform-api — DiffAudit Platform API 网关启动（ps1 迁移，契约见 server docs/design/ps1-to-python-migration.md）。

对应 Platform/apps/api-go/run-platform-api.ps1：端口占用检查 + go run ./cmd/platform-api。
端口探测用 socket bind 替代 Get-NetTCPConnection（stdlib only）。
"""

import argparse
import os
import shutil
import socket
import subprocess
import sys

DEFAULT_LISTEN_HOST = "127.0.0.1"
DEFAULT_LISTEN_PORT = 8780


def port_in_use(host: str, port: int) -> bool:
    probe = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        probe.bind((host, port))
        return False
    except OSError:
        return True
    finally:
        probe.close()


def run_go(command: list, cwd: str) -> int:
    if os.name == "nt":
        resolved = shutil.which(command[0])
        if resolved and resolved.lower().endswith((".cmd", ".bat")):
            command = ["cmd.exe", "/c", *command]
    return subprocess.run(command, cwd=cwd).returncode


def main() -> int:
    parser = argparse.ArgumentParser(description="DiffAudit Platform API 网关启动")
    parser.add_argument("--listen-host", default=DEFAULT_LISTEN_HOST)
    parser.add_argument("--listen-port", type=int, default=DEFAULT_LISTEN_PORT)
    parser.add_argument("--public-data-dir", default="")
    parser.add_argument("--runtime-base-url", default="")
    parser.add_argument("--demo-mode", default=True)
    args = parser.parse_args()

    service_root = os.path.dirname(os.path.abspath(__file__))
    public_data_dir = args.public_data_dir or os.path.join(service_root, "data", "public")

    if port_in_use(args.listen_host, args.listen_port):
        print(f"Port {args.listen_port} is already in use. "
              f"Use --listen-port to start the gateway on another port, or stop the existing process intentionally.",
              file=sys.stderr)
        return 1

    result = run_go([
        "go", "run", "./cmd/platform-api",
        "--host", args.listen_host,
        "--port", str(args.listen_port),
        "--public-data-dir", public_data_dir,
        "--runtime-base-url", args.runtime_base_url,
        "--demo-mode", str(args.demo_mode),
    ], cwd=service_root)
    return result


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as exc:  # noqa: BLE001 —— 顶层兜底，对齐 ps1 $ErrorActionPreference='Stop'
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)
