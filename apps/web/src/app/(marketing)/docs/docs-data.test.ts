import { describe, expect, it } from "vitest";

import { getDocsContent } from "./docs-data";

describe("docs API reference", () => {
  it("documents the public snapshot contract in both locales", () => {
    for (const locale of ["en-US", "zh-CN"] as const) {
      const content = getDocsContent(locale);
      const page = content.pages.find((item) => item.slug === "api-reference");

      expect(page).toBeDefined();
      expect(page?.sections.some((section) => section.id === "snapshot-contract")).toBe(true);
      expect(page?.sections.some((section) => section.id === "response-examples")).toBe(true);
      expect(JSON.stringify(page)).toContain("/api/v1/evidence/attack-defense-table");
      expect(JSON.stringify(page)).toContain("research://");
    }
  });

  it("keeps request-time fallback boundaries explicit", () => {
    const content = getDocsContent("en-US");
    const page = content.pages.find((item) => item.slug === "api-reference");
    const raw = JSON.stringify(page);

    expect(raw).toContain("do not fall back");
    expect(raw).toContain("must not display raw network errors");
  });
});
