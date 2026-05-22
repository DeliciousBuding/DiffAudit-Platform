import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { ThemeToggleButton, nextThemeMenuIndex } from "./theme-toggle-button";

vi.mock("@/hooks/use-theme", () => ({
  useTheme: () => ({
    theme: "system",
    resolvedTheme: "light",
    setTheme: vi.fn(),
  }),
}));

describe("ThemeToggleButton", () => {
  it("renders the trigger with explicit menu semantics", () => {
    const markup = renderToStaticMarkup(React.createElement(ThemeToggleButton));

    expect(markup).toContain('aria-haspopup="menu"');
    expect(markup).toContain('aria-controls="');
    expect(markup).toContain('aria-expanded="false"');
  });

  it("keeps keyboard menu index stable when the menu has no focusable items", () => {
    expect(nextThemeMenuIndex(0, 0, 1)).toBe(0);
    expect(nextThemeMenuIndex(0, 0, -1)).toBe(0);
  });

  it("wraps keyboard menu index within available theme options", () => {
    expect(nextThemeMenuIndex(0, 3, 1)).toBe(1);
    expect(nextThemeMenuIndex(2, 3, 1)).toBe(0);
    expect(nextThemeMenuIndex(0, 3, -1)).toBe(2);
  });
});
