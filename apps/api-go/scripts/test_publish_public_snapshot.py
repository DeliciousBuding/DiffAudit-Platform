import importlib.util
import json
import sys
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch


SCRIPT_PATH = Path(__file__).with_name("publish_public_snapshot.py")


def load_script_module():
    spec = importlib.util.spec_from_file_location("publish_public_snapshot", SCRIPT_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError("failed to load publish_public_snapshot module")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


class PublishPublicSnapshotTests(unittest.TestCase):
    def test_falls_back_to_research_attack_defense_table_and_existing_snapshot_when_runtime_is_unavailable(self):
        module = load_script_module()

        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            output_dir = root / "public"
            summaries_dir = output_dir / "summaries"
            summaries_dir.mkdir(parents=True, exist_ok=True)

            (output_dir / "catalog.json").write_text(
                json.dumps(
                    [
                        {
                            "contract_key": "black-box/recon/sd15-ddim",
                            "best_workspace": "recon-runtime-mainline-ddim-public-100-step30",
                        }
                    ]
                ),
                encoding="utf-8",
            )
            (output_dir / "models.json").write_text(
                json.dumps([{"key": "sd15-ddim"}]),
                encoding="utf-8",
            )
            (output_dir / "manifest.json").write_text(
                json.dumps(
                    {
                        "summary_keys": ["recon-runtime-mainline-ddim-public-100-step30"],
                        "contract_summary_keys": {
                            "black-box/recon/sd15-ddim": "recon-runtime-mainline-ddim-public-100-step30"
                        },
                        "warnings": [],
                    }
                ),
                encoding="utf-8",
            )
            (summaries_dir / "recon-runtime-mainline-ddim-public-100-step30.json").write_text(
                json.dumps({"workspace": "recon-runtime-mainline-ddim-public-100-step30"}),
                encoding="utf-8",
            )

            research_root = root / "Research"
            research_table = research_root / "workspaces" / "implementation" / "artifacts"
            research_table.mkdir(parents=True, exist_ok=True)
            (research_table / "unified-attack-defense-table.json").write_text(
                json.dumps(
                    {
                        "schema": "diffaudit.attack_defense_table.v1",
                        "updated_at": "2026-04-16T07:20:00+08:00",
                        "rows": [{"track": "gray-box", "attack": "PIA GPU512 baseline", "defense": "none"}],
                    }
                ),
                encoding="utf-8",
            )

            with patch.object(
                module,
                "parse_args",
                return_value=SimpleNamespace(
                    runtime_base_url="http://127.0.0.1:8765",
                    control_api_base_url=None,
                    output_dir=str(output_dir),
                    research_root=str(research_root),
                ),
            ), patch.object(module, "fetch_json", side_effect=RuntimeError("runtime offline")):
                exit_code = module.main()

            self.assertEqual(exit_code, 0)

            table_payload = json.loads((output_dir / "attack-defense-table.json").read_text(encoding="utf-8"))
            self.assertEqual(table_payload["updated_at"], "2026-04-16T07:20:00+08:00")
            self.assertEqual(table_payload["rows"][0]["attack"], "PIA GPU512 baseline")

            manifest_payload = json.loads((output_dir / "manifest.json").read_text(encoding="utf-8"))
            self.assertEqual(manifest_payload["source"], "research-direct-sync")
            self.assertIn("summary_keys", manifest_payload)
            self.assertIn("recon-runtime-mainline-ddim-public-100-step30", manifest_payload["summary_keys"])
            self.assertTrue(
                any("Research/workspaces/implementation/artifacts/unified-attack-defense-table.json" in warning for warning in manifest_payload["warnings"])
            )


if __name__ == "__main__":
    unittest.main()
