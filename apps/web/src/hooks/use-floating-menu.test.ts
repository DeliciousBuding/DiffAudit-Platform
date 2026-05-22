import { describe, expect, it } from "vitest";

import { nextFloatingMenuIndex, resolveFloatingMenuFocusIndex } from "./use-floating-menu";

describe("nextFloatingMenuIndex", () => {
  it("keeps the index stable when there are no focusable items", () => {
    expect(nextFloatingMenuIndex(0, 0, 1)).toBe(0);
    expect(nextFloatingMenuIndex(0, 0, -1)).toBe(0);
  });

  it("wraps forward and backward within available menu items", () => {
    expect(nextFloatingMenuIndex(0, 3, 1)).toBe(1);
    expect(nextFloatingMenuIndex(2, 3, 1)).toBe(0);
    expect(nextFloatingMenuIndex(0, 3, -1)).toBe(2);
  });
});

describe("resolveFloatingMenuFocusIndex", () => {
  it("falls back to the first item when no focusable items exist", () => {
    expect(resolveFloatingMenuFocusIndex("first", 0)).toBe(0);
    expect(resolveFloatingMenuFocusIndex("last", 0)).toBe(0);
    expect(resolveFloatingMenuFocusIndex(3, 0)).toBe(0);
  });

  it("resolves semantic first and last targets", () => {
    expect(resolveFloatingMenuFocusIndex("first", 4)).toBe(0);
    expect(resolveFloatingMenuFocusIndex("last", 4)).toBe(3);
  });

  it("clamps numeric targets into the available item range", () => {
    expect(resolveFloatingMenuFocusIndex(2, 4)).toBe(2);
    expect(resolveFloatingMenuFocusIndex(99, 4)).toBe(3);
    expect(resolveFloatingMenuFocusIndex(-1, 4)).toBe(3);
    expect(resolveFloatingMenuFocusIndex(-99, 4)).toBe(0);
  });
});
