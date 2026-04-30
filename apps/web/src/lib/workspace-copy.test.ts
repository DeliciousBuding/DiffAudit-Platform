import { describe, expect, it } from "vitest";

import { WORKSPACE_COPY } from "@/lib/workspace-copy";

function collectKeys(obj: unknown, prefix = ""): string[] {
  if (typeof obj !== "object" || obj === null) {
    return [];
  }

  const result: string[] = [];
  for (const key of Object.keys(obj as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${key}` : key;
    result.push(path);
    result.push(...collectKeys((obj as Record<string, unknown>)[key], path));
  }
  return result;
}

function collectTopLevelKeys(obj: unknown): string[] {
  if (typeof obj !== "object" || obj === null) {
    return [];
  }
  return Object.keys(obj as Record<string, unknown>);
}

describe("WORKSPACE_COPY key parity", () => {
  it("en-US and zh-CN have the same top-level keys", () => {
    const enKeys = collectTopLevelKeys(WORKSPACE_COPY["en-US"]).sort();
    const zhKeys = collectTopLevelKeys(WORKSPACE_COPY["zh-CN"]).sort();

    expect(enKeys).toEqual(zhKeys);
  });

  it("en-US and zh-CN have identical nested key structure at every level", () => {
    const enKeys = collectKeys(WORKSPACE_COPY["en-US"]).sort();
    const zhKeys = collectKeys(WORKSPACE_COPY["zh-CN"]).sort();

    expect(enKeys).toEqual(zhKeys);
  });

  it("no en-US leaf values are Chinese text (i18n regression guard)", () => {
    const enCopy = WORKSPACE_COPY["en-US"];
    const chineseRegex = /[\u4e00-\u9fff]/;

    const knownViolations = new Set([
      "emptyWorkspace.title",
      "emptyWorkspace.steps.0.title",
      "emptyWorkspace.steps.0.desc",
      "emptyWorkspace.steps.1.title",
      "emptyWorkspace.steps.1.desc",
      "emptyWorkspace.steps.2.title",
      "emptyWorkspace.steps.2.desc",
    ]);

    const violations: string[] = [];
    for (const path of collectKeys(enCopy)) {
      const parts = path.split(".");
      let current: unknown = enCopy;
      for (const part of parts) {
        current = (current as Record<string, unknown>)[part];
      }
      if (typeof current === "string" && chineseRegex.test(current) && !knownViolations.has(path)) {
        violations.push(`${path}: "${current}"`);
      }
    }

    expect(violations).toEqual([]);
  });
});
