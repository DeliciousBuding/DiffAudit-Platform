import { describe, expect, it } from "vitest";

import { WORKSPACE_COPY, getTrackDisplayLabel } from "@/lib/workspace-copy";

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

    const violations: string[] = [];
    function walk(obj: unknown, path: string) {
      if (typeof obj === "string") {
        if (chineseRegex.test(obj)) violations.push(path);
        return;
      }
      if (typeof obj === "object" && obj !== null) {
        for (const [key, val] of Object.entries(obj)) {
          walk(val, path ? `${path}.${key}` : key);
        }
      }
    }
    walk(enCopy, "");
    expect(violations).toEqual([]);
  });
});

describe("getTrackDisplayLabel", () => {
  it("returns composed label for black-box in English", () => {
    expect(getTrackDisplayLabel("black-box", "en-US")).toBe("Recon / Black-box");
  });

  it("returns composed label for black-box in Chinese", () => {
    expect(getTrackDisplayLabel("black-box", "zh-CN")).toBe("Recon / 黑盒");
  });

  it("returns composed label for gray-box in English", () => {
    expect(getTrackDisplayLabel("gray-box", "en-US")).toBe("PIA / Gray-box");
  });

  it("returns composed label for white-box in Chinese", () => {
    expect(getTrackDisplayLabel("white-box", "zh-CN")).toBe("GSA / 白盒");
  });

  it("returns -- for null track", () => {
    expect(getTrackDisplayLabel(null, "en-US")).toBe("--");
  });

  it("returns -- for undefined track", () => {
    expect(getTrackDisplayLabel(undefined, "zh-CN")).toBe("--");
  });

  it("returns -- for unknown track", () => {
    expect(getTrackDisplayLabel("unknown", "en-US")).toBe("--");
  });
});
