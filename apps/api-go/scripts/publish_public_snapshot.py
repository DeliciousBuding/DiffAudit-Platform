#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import shutil
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import quote
from urllib.request import Request, urlopen

PUBLIC_TEXT_REPLACEMENTS = {
    "local CLiD": "snapshot CLiD",
    "base SD1.5 local snapshot": "base SD1.5 snapshot",
    "local scale-up evidence": "snapshot scale-up evidence",
    "current PIA local signal": "current PIA snapshot signal",
    "local defense comparator": "snapshot defense comparator",
    "local baseline": "snapshot baseline",
    "single-machine-real-asset": "snapshot-validated-asset",
    "real-asset-closed-loop": "snapshot-closed-loop-asset",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Publish public snapshot data for apps/api-go.")
    parser.add_argument(
        "--runtime-base-url",
        default="http://127.0.0.1:8765",
        help="Base URL for the live Runtime control plane.",
    )
    parser.add_argument(
        "--control-api-base-url",
        default=None,
        help="Deprecated alias for --runtime-base-url.",
    )
    parser.add_argument(
        "--output-dir",
        default=str(Path(__file__).resolve().parents[1] / "data" / "public"),
        help="Target directory for generated snapshot files.",
    )
    parser.add_argument(
        "--research-root",
        default=str(Path(__file__).resolve().parents[4] / "Research"),
        help="Research checkout root used for direct admitted-table fallback when Runtime is unavailable.",
    )
    return parser.parse_args()


def fetch_json(base_url: str, path: str) -> Any:
    request = Request(f"{base_url.rstrip('/')}{path}", headers={"accept": "application/json"})
    with urlopen(request, timeout=30) as response:
        return json.load(response)


def workspace_key(value: str) -> str:
    normalized = value.replace("\\", "/").strip("/")
    if not normalized:
        raise ValueError("workspace key is empty")
    return normalized.split("/")[-1]


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )


def read_json_file(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def sanitize_public_string(value: str) -> str:
    normalized = value.replace("\\", "/")
    research_marker = "/Research/"
    if research_marker in normalized:
        return f"research://{normalized.split(research_marker, 1)[1].lstrip('/')}"
    if normalized.startswith("Research/"):
        return f"research://{normalized.removeprefix('Research/').lstrip('/')}"
    if normalized.startswith(("workspaces/", "experiments/", "external/")):
        return f"research://{normalized}"
    sanitized = normalized
    for source, replacement in PUBLIC_TEXT_REPLACEMENTS.items():
        sanitized = sanitized.replace(source, replacement)
    return sanitized


def sanitize_public_payload(payload: Any) -> Any:
    if isinstance(payload, dict):
        return {key: sanitize_public_payload(value) for key, value in payload.items()}
    if isinstance(payload, list):
        return [sanitize_public_payload(item) for item in payload]
    if isinstance(payload, str):
        return sanitize_public_string(payload)
    return payload


def sanitize_existing_json_tree(root: Path) -> None:
    if not root.exists():
        return
    for path in sorted(root.rglob("*.json")):
        write_json(path, sanitize_public_payload(read_json_file(path)))


@dataclass
class SummaryRecord:
    key: str
    contract_key: str
    payload: Any


def collect_summaries(base_url: str, catalog: list[dict[str, Any]]) -> tuple[list[SummaryRecord], list[str]]:
    records: dict[str, SummaryRecord] = {}
    warnings: list[str] = []

    for entry in catalog:
        contract_key = entry.get("contract_key")
        best_workspace = entry.get("best_workspace")
        if not isinstance(contract_key, str) or not contract_key:
            continue
        if not isinstance(best_workspace, str) or not best_workspace:
            continue

        try:
            payload = fetch_json(
                base_url,
                f"/api/v1/evidence/contracts/best?contract_key={quote(contract_key, safe='')}",
            )
            summary_workspace = payload.get("workspace") or payload.get("workspace_name") or best_workspace
            key = workspace_key(str(summary_workspace))
            records[key] = SummaryRecord(key=key, contract_key=contract_key, payload=payload)
        except Exception:  # noqa: BLE001
            warnings.append(f"{contract_key}: runtime unavailable while fetching best evidence.")

    return list(records.values()), warnings


def load_runtime_json_with_existing_fallback(
    *,
    base_url: str,
    api_path: str,
    existing_path: Path,
    warning_label: str,
    warnings: list[str],
) -> Any:
    try:
        return fetch_json(base_url, api_path)
    except Exception:  # noqa: BLE001
        if existing_path.exists():
            warnings.append(f"{warning_label}: runtime unavailable; reused existing snapshot.")
            return read_json_file(existing_path)
        raise


def resolve_research_attack_defense_table_path(research_root: str | Path | None) -> Path | None:
    if research_root is None:
        return None
    root = Path(research_root)
    path = root / "workspaces" / "implementation" / "artifacts" / "unified-attack-defense-table.json"
    return path if path.exists() else None


def load_attack_defense_table(
    *,
    base_url: str,
    output_dir: Path,
    research_root: str | Path | None,
    warnings: list[str],
) -> tuple[Any, str]:
    try:
        return fetch_json(base_url, "/api/v1/evidence/attack-defense-table"), base_url
    except Exception:  # noqa: BLE001
        research_table_path = resolve_research_attack_defense_table_path(research_root)
        if research_table_path is not None:
            warnings.append(
                "attack-defense-table: runtime unavailable; synced from "
                "research://workspaces/implementation/artifacts/unified-attack-defense-table.json."
            )
            return read_json_file(research_table_path), "research-direct-sync"

        existing_path = output_dir / "attack-defense-table.json"
        if existing_path.exists():
            warnings.append("attack-defense-table: runtime unavailable; reused existing snapshot.")
            return read_json_file(existing_path), "snapshot-reuse"
        raise


def load_existing_manifest(output_dir: Path) -> dict[str, Any] | None:
    manifest_path = output_dir / "manifest.json"
    if not manifest_path.exists():
        return None
    payload = read_json_file(manifest_path)
    return payload if isinstance(payload, dict) else None


def reuse_existing_summary_state(output_dir: Path, warnings: list[str]) -> tuple[list[str], dict[str, str]]:
    manifest = load_existing_manifest(output_dir)
    summaries_dir = output_dir / "summaries"
    if manifest is None or not summaries_dir.exists():
        return [], {}

    summary_keys = manifest.get("summary_keys")
    contract_summary_keys = manifest.get("contract_summary_keys")
    if not isinstance(summary_keys, list) or not isinstance(contract_summary_keys, dict):
        return [], {}

    warnings.append("summaries: runtime unavailable; reused existing snapshot.")
    sanitize_existing_json_tree(summaries_dir)
    return [str(key) for key in summary_keys], {str(key): str(value) for key, value in contract_summary_keys.items()}


def main() -> int:
    args = parse_args()
    base_url = args.control_api_base_url or args.runtime_base_url
    output_dir = Path(args.output_dir)
    summaries_dir = output_dir / "summaries"

    warnings: list[str] = []
    catalog = load_runtime_json_with_existing_fallback(
        base_url=base_url,
        api_path="/api/v1/catalog",
        existing_path=output_dir / "catalog.json",
        warning_label="catalog",
        warnings=warnings,
    )
    attack_defense_table, source = load_attack_defense_table(
        base_url=base_url,
        output_dir=output_dir,
        research_root=getattr(args, "research_root", None),
        warnings=warnings,
    )
    models = load_runtime_json_with_existing_fallback(
        base_url=base_url,
        api_path="/api/v1/models",
        existing_path=output_dir / "models.json",
        warning_label="models",
        warnings=warnings,
    )
    summaries, summary_warnings = collect_summaries(base_url, catalog if isinstance(catalog, list) else [])
    warnings.extend(summary_warnings)

    catalog = sanitize_public_payload(catalog)
    attack_defense_table = sanitize_public_payload(attack_defense_table)
    models = sanitize_public_payload(models)

    write_json(output_dir / "catalog.json", catalog)
    write_json(output_dir / "attack-defense-table.json", attack_defense_table)
    write_json(output_dir / "models.json", models)

    summary_keys: list[str] = []
    contract_summary_keys: dict[str, str] = {}
    if summaries:
        if summaries_dir.exists():
            shutil.rmtree(summaries_dir)
        summaries_dir.mkdir(parents=True, exist_ok=True)
        for record in sorted(summaries, key=lambda item: item.key):
            write_json(summaries_dir / f"{record.key}.json", sanitize_public_payload(record.payload))
            summary_keys.append(record.key)
            contract_summary_keys[record.contract_key] = record.key
    else:
        summary_keys, contract_summary_keys = reuse_existing_summary_state(output_dir, warnings)

    manifest = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source": source,
        "catalog_count": len(catalog) if isinstance(catalog, list) else 0,
        "summary_keys": summary_keys,
        "contract_summary_keys": contract_summary_keys,
        "warnings": warnings,
    }
    write_json(output_dir / "manifest.json", manifest)

    print(
        json.dumps(
            {
                "output_dir": str(output_dir),
                "catalog_count": manifest["catalog_count"],
                "summary_keys": summary_keys,
                "warnings": warnings,
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
