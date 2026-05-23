import { describe, expect, it } from "vitest";
import { WORKSPACE_NAV_REGISTRY, type WorkspaceNavKey } from "./workspace-registry";

describe("WORKSPACE_NAV_REGISTRY", () => {
  const primaryKeys: WorkspaceNavKey[] = [
    "workspace",
    "audits",
    "modelAssets",
    "riskFindings",
    "reportCenter",
  ];
  const accountKeys: WorkspaceNavKey[] = ["apiKeys", "account", "settings"];

  it("has exactly 8 entries", () => {
    expect(WORKSPACE_NAV_REGISTRY).toHaveLength(8);
  });

  it("every entry has a unique key", () => {
    const keys = WORKSPACE_NAV_REGISTRY.map((e) => e.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("every entry has a unique href", () => {
    const hrefs = WORKSPACE_NAV_REGISTRY.map((e) => e.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("every entry has a unique shortcut", () => {
    const shortcuts = WORKSPACE_NAV_REGISTRY.map((e) => e.shortcut);
    expect(new Set(shortcuts).size).toBe(shortcuts.length);
  });

  it("all hrefs start with /workspace/", () => {
    for (const entry of WORKSPACE_NAV_REGISTRY) {
      expect(entry.href).toMatch(/^\/workspace\//);
    }
  });

  it("primary group has 5 entries", () => {
    const primary = WORKSPACE_NAV_REGISTRY.filter((e) => e.group === "primary");
    expect(primary.map((e) => e.key).sort()).toEqual([...primaryKeys].sort());
  });

  it("account group has 3 entries", () => {
    const account = WORKSPACE_NAV_REGISTRY.filter((e) => e.group === "account");
    expect(account.map((e) => e.key).sort()).toEqual([...accountKeys].sort());
  });

  it("shortcuts use Ctrl+ format", () => {
    for (const entry of WORKSPACE_NAV_REGISTRY) {
      expect(entry.shortcut).toMatch(/^Ctrl\+/);
    }
  });
});
