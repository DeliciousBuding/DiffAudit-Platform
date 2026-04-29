import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { getNavItems } from "./navigation";
import { WORKSPACE_COPY } from "./workspace-copy";
import { WORKSPACE_NAV_REGISTRY } from "./workspace-registry";

const WORKSPACE_APP_DIR = path.join(process.cwd(), "src", "app", "(workspace)");
const PAGE_BYPASS_IMPORTS = [
  "@/lib/attack-defense-table",
  "@/lib/catalog",
  "@/lib/demo-mode",
];

function walkFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const absolutePath = path.join(dir, entry);
    if (statSync(absolutePath).isDirectory()) {
      return walkFiles(absolutePath);
    }
    return /\.(ts|tsx)$/.test(entry) ? [absolutePath] : [];
  });
}

describe("workspace source-of-truth boundaries", () => {
  it("derives every localized workspace nav item from the registry order", () => {
    const registryKeys = WORKSPACE_NAV_REGISTRY.map((entry) => entry.key);

    expect(getNavItems("en-US").map((item) => item.key)).toEqual(registryKeys);
    expect(getNavItems("zh-CN").map((item) => item.key)).toEqual(registryKeys);
    expect(Object.keys(WORKSPACE_COPY["en-US"].nav)).toEqual(registryKeys);
    expect(Object.keys(WORKSPACE_COPY["zh-CN"].nav)).toEqual(registryKeys);
  });

  it("keeps workspace pages on the workspace data facade", () => {
    const bypasses = walkFiles(WORKSPACE_APP_DIR).flatMap((file) => {
      const source = readFileSync(file, "utf8");
      return PAGE_BYPASS_IMPORTS
        .filter((moduleName) => source.includes(`from "${moduleName}"`))
        .map((moduleName) => `${path.relative(process.cwd(), file)} imports ${moduleName}`);
    });

    expect(bypasses).toEqual([]);
  });
});
