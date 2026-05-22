import { describe, expect, it } from "vitest";

import { nextFloatingMenuIndex } from "./use-floating-menu";

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
