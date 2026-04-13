import { describe, expect, it } from "vitest";

import { navItems } from "./navigation";
import { findActiveNavItem } from "./platform-shell";

describe("platform shell helpers", () => {
  it("exposes icon metadata for every navigation item", () => {
    expect(navItems.map((item) => item.icon)).toEqual([
      "dashboard",
      "spark",
      "report",
      "settings",
    ]);
  });

  it("returns the matching nav item for an exact route", () => {
    expect(findActiveNavItem("/workspace")).toEqual(navItems[0]);
    expect(findActiveNavItem("/workspace/audits")).toEqual(navItems[1]);
  });

  it("matches nested routes to the longest compatible nav item", () => {
    expect(findActiveNavItem("/workspace/settings/team")).toEqual(navItems[3]);
    expect(findActiveNavItem("/workspace/reports/preview/123")).toEqual(navItems[2]);
  });

  it("falls back to the first nav item when no route matches", () => {
    expect(findActiveNavItem("/missing")).toEqual(navItems[0]);
  });
});
