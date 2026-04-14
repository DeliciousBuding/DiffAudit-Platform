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


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Publish public snapshot data for apps/api-go.")
    parser.add_argument(
        "--control-api-base-url",
        default="http://127.0.0.1:8765",
        help="Base URL for the live Local-API control plane.",
    )
    parser.add_argument(
        "--output-dir",
        default=str(Path(__file__).resolve().parents[1] / "data" / "public"),
        help="Target directory for generated snapshot files.",
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
        except Exception as exc:  # noqa: BLE001
            warnings.append(f"{contract_key}: {exc}")

    return list(records.values()), warnings


def main() -> int:
    args = parse_args()
    base_url = args.control_api_base_url
    output_dir = Path(args.output_dir)
    summaries_dir = output_dir / "summaries"

    catalog = fetch_json(base_url, "/api/v1/catalog")
    attack_defense_table = fetch_json(base_url, "/api/v1/evidence/attack-defense-table")
    models = fetch_json(base_url, "/api/v1/models")
    summaries, warnings = collect_summaries(base_url, catalog)

    if summaries_dir.exists():
        shutil.rmtree(summaries_dir)
    summaries_dir.mkdir(parents=True, exist_ok=True)

    write_json(output_dir / "catalog.json", catalog)
    write_json(output_dir / "attack-defense-table.json", attack_defense_table)
    write_json(output_dir / "models.json", models)

    summary_keys: list[str] = []
    contract_summary_keys: dict[str, str] = {}
    for record in sorted(summaries, key=lambda item: item.key):
        write_json(summaries_dir / f"{record.key}.json", record.payload)
        summary_keys.append(record.key)
        contract_summary_keys[record.contract_key] = record.key

    manifest = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source": base_url,
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
