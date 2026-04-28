import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import AuthLayout from "./layout";

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
}));

vi.mock("@/lib/locale", () => ({
  resolveLocaleFromHeaderStore: vi.fn(() => "en-US"),
}));

vi.mock("@/components/language-picker", () => ({
  LanguagePicker: () => React.createElement("div", { "data-language-picker": "true" }, "language"),
}));

vi.mock("@/components/brand-mark", () => ({
  BrandMark: () => React.createElement("div", { "data-brand-mark": "true" }, "brand"),
}));

vi.mock("@/components/theme-toggle-button", () => ({
  ThemeToggleButton: () => React.createElement("button", { "data-theme-toggle": "true" }, "theme"),
}));

describe("AuthLayout", () => {
  it("renders a centered auth stage below the header", async () => {
    const markup = renderToStaticMarkup(
      await AuthLayout({ children: React.createElement("div", null, "auth-form") }),
    );

    expect(markup).toContain("min-h-[100svh]");
    expect(markup).toContain("pointer-events-none");
    expect(markup).toContain("auth-form");
    expect(markup).toContain("data-theme-toggle");
    expect(markup).toContain("data-language-picker");
  });
});
