import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { ThemeToggleButton } from "./theme-toggle-button";

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

});
