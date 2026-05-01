import { describe, expect, it } from "vitest";

import { getNavItems } from "./navigation";
import { findActiveNavItem } from "./platform-shell";

describe("platform shell helpers", () => {
  const navItems = getNavItems("en-US");

  it("exposes icon metadata for every navigation item", () => {
    expect(navItems.map((item) => item.icon)).toEqual([
      "dashboard",
      "spark",
      "model",
      "risk",
      "report",
      "key",
      "account",
    ]);
  });

  it("returns the matching nav item for an exact route", () => {
    expect(findActiveNavItem("/workspace", navItems)).toEqual(navItems[0]);
    expect(findActiveNavItem("/workspace/audits", navItems)).toEqual(navItems[1]);
  });

  it("matches nested routes to the longest compatible nav item", () => {
    expect(findActiveNavItem("/workspace/api-keys/rotate", navItems)).toEqual(navItems[5]);
    expect(findActiveNavItem("/workspace/account/security", navItems)).toEqual(navItems[6]);
    expect(findActiveNavItem("/workspace/reports/preview/123", navItems)).toEqual(navItems[4]);
  });

  it("falls back to the first nav item when no route matches", () => {
    expect(findActiveNavItem("/missing", navItems)).toEqual(navItems[0]);
  });
});
