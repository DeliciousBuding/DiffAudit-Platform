// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";

import AuthLayout from "./layout";

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
}));

vi.mock("@/lib/locale", () => ({
  resolveLocaleFromHeaderStore: vi.fn(() => "en-US"),
  resolveLocaleFromCookieHeader: vi.fn(() => "en-US"),
  Locale: undefined,
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
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={["/login"]}>
          <Routes>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<div id="auth-form">auth-form</div>} />
            </Route>
          </Routes>
        </MemoryRouter>,
      );
    });

    const markup = container.innerHTML;
    expect(markup).toContain("min-h-[100svh]");
    expect(markup).toContain("pointer-events-none");
    expect(markup).toContain("auth-form");
    expect(markup).toContain("data-theme-toggle");
    expect(markup).toContain("data-language-picker");
    root.unmount();
  });
});
