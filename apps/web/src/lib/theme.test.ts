import { describe, expect, it } from "vitest";

import {
  DEFAULT_THEME,
  getThemeBootScript,
  isThemeMode,
  resolveThemeMode,
  THEME_STORAGE_KEY,
} from "./theme";

describe("theme helpers", () => {
  it("accepts only supported theme values", () => {
    expect(isThemeMode("light")).toBe(true);
    expect(isThemeMode("dark")).toBe(true);
    expect(isThemeMode("system")).toBe(false);
    expect(isThemeMode("")).toBe(false);
  });

  it("falls back to the default theme for invalid values", () => {
    expect(resolveThemeMode("light")).toBe("light");
    expect(resolveThemeMode("dark")).toBe("dark");
    expect(resolveThemeMode("system")).toBe(DEFAULT_THEME);
    expect(resolveThemeMode(undefined)).toBe(DEFAULT_THEME);
  });

  it("builds a bootstrap script that reads local storage and system preference", () => {
    const script = getThemeBootScript();

    expect(script).toContain(THEME_STORAGE_KEY);
    expect(script).toContain("localStorage.getItem");
    expect(script).toContain("prefers-color-scheme: dark");
    expect(script).toContain('classList.toggle("dark"');
    expect(script).toContain(DEFAULT_THEME);
  });
});
