"""Guard workspace route inventory against navigation-registry drift."""

from __future__ import annotations

import re
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
AGENTS_PATH = REPO_ROOT / "AGENTS.md"
REGISTRY_PATH = REPO_ROOT / "apps" / "web" / "src" / "lib" / "workspace-registry.ts"


def workspace_inventory_section(markdown: str) -> str:
    match = re.search(
        r"^## Workspace Page Inventory\s*(?P<section>.*?)(?=^## |\Z)",
        markdown,
        flags=re.MULTILINE | re.DOTALL,
    )
    if not match:
        raise AssertionError("AGENTS.md is missing the Workspace Page Inventory section.")
    return match.group("section")


class WorkspaceInventoryTest(unittest.TestCase):
    def test_workspace_registry_routes_are_documented(self) -> None:
        registry = REGISTRY_PATH.read_text(encoding="utf-8")
        agents = AGENTS_PATH.read_text(encoding="utf-8")

        registry_hrefs = sorted(set(re.findall(r'href:\s*"([^"]+)"', registry)))
        inventory = workspace_inventory_section(agents)

        missing = [href for href in registry_hrefs if f"| `{href}` |" not in inventory]
        self.assertEqual(
            [],
            missing,
            "Every workspace navigation route in WORKSPACE_NAV_REGISTRY must be listed "
            "in AGENTS.md Workspace Page Inventory.",
        )


if __name__ == "__main__":
    unittest.main()
