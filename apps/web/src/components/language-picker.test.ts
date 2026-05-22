import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { LanguagePicker, nextLanguageMenuIndex, resolveActiveLocale } from "./language-picker";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

describe("resolveActiveLocale", () => {
  it("prefers the pending locale over a stale controlled value", () => {
    expect(
      resolveActiveLocale({
        value: "en-US",
        internalLocale: "en-US",
        pendingLocale: "zh-CN",
      }),
    ).toBe("zh-CN");
  });

  it("falls back to the controlled value when no pending locale exists", () => {
    expect(
      resolveActiveLocale({
        value: "zh-CN",
        internalLocale: "en-US",
        pendingLocale: null,
      }),
    ).toBe("zh-CN");
  });

  it("falls back to internal state for uncontrolled usage", () => {
    expect(
      resolveActiveLocale({
        internalLocale: "zh-CN",
      }),
    ).toBe("zh-CN");
  });
});

describe("LanguagePicker", () => {
  it("renders the trigger with explicit menu semantics", () => {
    const markup = renderToStaticMarkup(React.createElement(LanguagePicker, { value: "en-US" }));

    expect(markup).toContain('aria-haspopup="menu"');
    expect(markup).toContain('aria-controls="');
    expect(markup).toContain('aria-expanded="false"');
  });

  it("keeps keyboard menu index stable when the menu has no focusable items", () => {
    expect(nextLanguageMenuIndex(0, 0, 1)).toBe(0);
    expect(nextLanguageMenuIndex(0, 0, -1)).toBe(0);
  });

  it("wraps keyboard menu index within available language options", () => {
    expect(nextLanguageMenuIndex(0, 2, 1)).toBe(1);
    expect(nextLanguageMenuIndex(1, 2, 1)).toBe(0);
    expect(nextLanguageMenuIndex(0, 2, -1)).toBe(1);
  });
});
