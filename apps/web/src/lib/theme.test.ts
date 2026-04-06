import { describe, expect, it } from "vitest";

import {
  DEFAULT_THEME,
  getEffectiveTheme,
  getThemeBootScript,
  getThemeLabel,
  isThemeMode,
  resolveThemeMode,
  THEME_STORAGE_KEY,
} from "./theme";

describe("theme helpers", () => {
  it("accepts only supported theme values", () => {
    expect(isThemeMode("light")).toBe(true);
    expect(isThemeMode("dark")).toBe(true);
    expect(isThemeMode("system")).toBe(true);
    expect(isThemeMode("")).toBe(false);
  });

  it("falls back to the default theme for invalid values", () => {
    expect(resolveThemeMode("light")).toBe("light");
    expect(resolveThemeMode("dark")).toBe("dark");
    expect(resolveThemeMode("system")).toBe("system");
    expect(resolveThemeMode(undefined)).toBe(DEFAULT_THEME);
  });

  it("resolves system mode to the matching effective theme", () => {
    expect(getEffectiveTheme("light", true)).toBe("light");
    expect(getEffectiveTheme("dark", false)).toBe("dark");
    expect(getEffectiveTheme("system", true)).toBe("dark");
    expect(getEffectiveTheme("system", false)).toBe("light");
  });

  it("returns user-facing labels for each theme mode", () => {
    expect(getThemeLabel("light")).toBe("浅色");
    expect(getThemeLabel("dark")).toBe("深色");
    expect(getThemeLabel("system")).toBe("跟随系统");
  });

  it("builds a bootstrap script that reads and applies persisted theme state", () => {
    const script = getThemeBootScript();

    expect(script).toContain(THEME_STORAGE_KEY);
    expect(script).toContain("localStorage.getItem");
    expect(script).toContain("matchMedia");
    expect(script).toContain("themeMode");
    expect(script).toContain('classList.toggle("dark"');
    expect(script).toContain(DEFAULT_THEME);
  });
});
