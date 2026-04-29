import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const APP_DIR = path.join(process.cwd(), "src", "app");
const LEGACY_PLATFORM_GROUP = path.join(APP_DIR, "(platform)");
const LEGACY_PAGE_FILES = [
  "audit/page.tsx",
  "batch/page.tsx",
  "dashboard/page.tsx",
  "guide/page.tsx",
  "report/page.tsx",
] as const;
const LEGACY_ROUTE_RE = /(?<![A-Za-z0-9/_-])\/(?:audit|batch|dashboard|guide|report)(?![A-Za-z0-9/_-])/g;

function walkFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const absolutePath = path.join(dir, entry);
    if (statSync(absolutePath).isDirectory()) {
      return walkFiles(absolutePath);
    }
    return /\.(md|ts|tsx)$/.test(entry) ? [absolutePath] : [];
  });
}

describe("legacy workspace routes", () => {
  it("does not keep legacy platform redirect pages", () => {
    const remaining = LEGACY_PAGE_FILES.filter((file) => {
      const absolutePath = path.join(LEGACY_PLATFORM_GROUP, ...file.split("/"));
      try {
        statSync(absolutePath);
        return true;
      } catch {
        return false;
      }
    });

    expect(remaining).toEqual([]);
  });

  it("does not link to deleted legacy top-level routes", () => {
    const references = walkFiles(process.cwd()).flatMap((file) => {
      if (
        file.endsWith(`${path.sep}legacy-routes.test.ts`)
        || file.includes(`${path.sep}node_modules${path.sep}`)
        || file.includes(`${path.sep}.next${path.sep}`)
      ) {
        return [];
      }

      const source = readFileSync(file, "utf8");
      return Array.from(source.matchAll(LEGACY_ROUTE_RE))
        .map((match) => `${path.relative(process.cwd(), file)} references ${match[0]}`);
    });

    expect(references).toEqual([]);
  });
});
