import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import nextConfig, { resolveTurbopackRoot } from "./next.config";

describe("next config", () => {
  it("wires turbopack root through the resolver", () => {
    expect(nextConfig.turbopack?.root).toBe(resolveTurbopackRoot(__dirname));
  });

  it("returns the nearest directory that owns next and the lockfile", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "diffaudit-next-config-"));
    const repoRoot = path.join(tempRoot, "repo");
    const appRoot = path.join(repoRoot, "apps", "web");

    fs.mkdirSync(path.join(appRoot, "node_modules", "next"), { recursive: true });
    fs.writeFileSync(path.join(appRoot, "package-lock.json"), "{}");
    fs.writeFileSync(path.join(appRoot, "node_modules", "next", "package.json"), "{}");

    expect(resolveTurbopackRoot(appRoot)).toBe(appRoot);
  });

  it("falls back to the workspace root when app-local next ownership is absent", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "diffaudit-next-config-"));
    const repoRoot = path.join(tempRoot, "repo");
    const appRoot = path.join(repoRoot, "apps", "web");

    fs.mkdirSync(appRoot, { recursive: true });

    expect(resolveTurbopackRoot(appRoot)).toBe(repoRoot);
  });
});
