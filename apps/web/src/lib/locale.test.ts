import { describe, it, expect } from "vitest";
import { resolveLocale, resolveLocaleFromCookieHeader, resolveLocaleFromHeaderStore } from "./locale";

describe("resolveLocale", () => {
  it("returns en-US for null", () => {
    expect(resolveLocale(null)).toBe("en-US");
  });

  it("returns en-US for undefined", () => {
    expect(resolveLocale(undefined)).toBe("en-US");
  });

  it("returns en-US for unknown value", () => {
    expect(resolveLocale("fr-FR")).toBe("en-US");
  });

  it("returns zh-CN for zh-CN", () => {
    expect(resolveLocale("zh-CN")).toBe("zh-CN");
  });

  it("returns en-US for en-US", () => {
    expect(resolveLocale("en-US")).toBe("en-US");
  });
});

describe("resolveLocaleFromCookieHeader", () => {
  it("extracts locale from cookie header", () => {
    expect(resolveLocaleFromCookieHeader("platform-locale-v2=zh-CN; other=value")).toBe("zh-CN");
  });

  it("defaults to en-US when cookie missing", () => {
    expect(resolveLocaleFromCookieHeader("other=value")).toBe("en-US");
  });

  it("handles null cookie header", () => {
    expect(resolveLocaleFromCookieHeader(null)).toBe("en-US");
  });

  it("handles URL-encoded cookie value", () => {
    expect(resolveLocaleFromCookieHeader("platform-locale-v2=zh-CN")).toBe("zh-CN");
  });
});

describe("resolveLocaleFromHeaderStore", () => {
  it("uses x-platform-locale header when valid", () => {
    const store = new Map([["x-platform-locale", "zh-CN"]]);
    expect(resolveLocaleFromHeaderStore({ get: (k) => store.get(k) ?? null })).toBe("zh-CN");
  });

  it("falls back to cookie when x-platform-locale is invalid", () => {
    const store = new Map([
      ["x-platform-locale", "invalid"],
      ["cookie", "platform-locale-v2=zh-CN"],
    ]);
    expect(resolveLocaleFromHeaderStore({ get: (k) => store.get(k) ?? null })).toBe("zh-CN");
  });

  it("defaults to en-US when nothing is set", () => {
    const store = new Map<string, string>();
    expect(resolveLocaleFromHeaderStore({ get: (k) => store.get(k) ?? null })).toBe("en-US");
  });
});
