import { describe, expect, it } from "vitest";

import { navItems } from "./navigation";
import { findActiveNavItem } from "./platform-shell";

describe("platform shell helpers", () => {
  it("exposes icon metadata for every navigation item", () => {
    expect(navItems.map((item) => item.icon)).toEqual([
      "image",
      "dashboard",
      "stack",
      "report",
      "guide",
    ]);
  });

  it("returns the matching nav item for an exact route", () => {
    expect(findActiveNavItem("/audit")).toEqual(navItems[0]);
    expect(findActiveNavItem("/dashboard")).toEqual(navItems[1]);
  });

  it("matches nested routes to the longest compatible nav item", () => {
    expect(findActiveNavItem("/guide/setup/api")).toEqual(navItems[4]);
    expect(findActiveNavItem("/report/preview/123")).toEqual(navItems[3]);
  });

  it("falls back to the first nav item when no route matches", () => {
    expect(findActiveNavItem("/missing")).toEqual(navItems[0]);
  });
});
