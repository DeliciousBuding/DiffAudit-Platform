import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { getNavItems } from "@/lib/navigation";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";

import { WorkspaceGlobalSearch, getWorkspaceSearchItems, nextSearchActiveIndex } from "./workspace-global-search";

vi.mock("@/lib/router/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("WorkspaceGlobalSearch", () => {
  it("renders without reading browser-only recent-page state", () => {
    const originalWindow = globalThis.window;
    const originalLocalStorage = globalThis.localStorage;
    const getItem = vi.fn(() => JSON.stringify(["/workspace/reports"]));

    try {
      Object.defineProperty(globalThis, "window", {
        configurable: true,
        value: {},
        writable: true,
      });
      Object.defineProperty(globalThis, "localStorage", {
        configurable: true,
        value: { getItem, setItem: vi.fn() },
        writable: true,
      });

      const copy = WORKSPACE_COPY["en-US"].shell;
      const markup = renderToStaticMarkup(<WorkspaceGlobalSearch locale="en-US" />);

      expect(markup).toContain('role="search"');
      expect(markup).toContain('role="combobox"');
      expect(markup).toContain('aria-autocomplete="list"');
      expect(markup).toContain('autoComplete="off"');
      expect(markup).toContain(copy.searchPlaceholder);
      expect(markup).toContain(copy.searchShortcut);
      expect(markup).not.toContain("workspace-search-menu");
      expect(getItem).not.toHaveBeenCalled();
    } finally {
      Object.defineProperty(globalThis, "window", {
        configurable: true,
        value: originalWindow,
        writable: true,
      });
      Object.defineProperty(globalThis, "localStorage", {
        configurable: true,
        value: originalLocalStorage,
        writable: true,
      });
    }
  });

  it("keeps keyboard active index stable when there are no search results", () => {
    expect(nextSearchActiveIndex(0, 0, 1)).toBe(0);
    expect(nextSearchActiveIndex(0, 0, -1)).toBe(0);
  });

  it("uses localized shell copy for the Chinese search input", () => {
    const copy = WORKSPACE_COPY["zh-CN"].shell;
    const markup = renderToStaticMarkup(<WorkspaceGlobalSearch locale="zh-CN" />);

    expect(markup).toContain(copy.searchPlaceholder);
    expect(markup).toContain(copy.searchShortcut);
    expect(markup).not.toContain(WORKSPACE_COPY["en-US"].shell.searchPlaceholder);
  });

  it("derives English navigation search items from the workspace navigation registry", () => {
    const navItems = getNavItems("en-US");
    const searchItems = getWorkspaceSearchItems("en-US");
    const navSearchItems = searchItems.slice(0, navItems.length);

    expect(navSearchItems.map((item) => item.href)).toEqual(navItems.map((item) => item.href));
    expect(navSearchItems.map((item) => item.title)).toEqual(navItems.map((item) => item.title));
    expect(searchItems.at(-1)).toMatchObject({
      href: "/docs",
      title: WORKSPACE_COPY["en-US"].shell.searchDocsTitle,
      subtitle: WORKSPACE_COPY["en-US"].shell.searchDocsSubtitle,
    });
  });

  it("derives Chinese navigation search items from the workspace navigation registry", () => {
    const navItems = getNavItems("zh-CN");
    const searchItems = getWorkspaceSearchItems("zh-CN");
    const navSearchItems = searchItems.slice(0, navItems.length);

    expect(navSearchItems.map((item) => item.href)).toEqual(navItems.map((item) => item.href));
    expect(navSearchItems.map((item) => item.title)).toEqual(navItems.map((item) => item.title));
    expect(searchItems.at(-1)).toMatchObject({
      href: "/docs",
      title: WORKSPACE_COPY["zh-CN"].shell.searchDocsTitle,
      subtitle: WORKSPACE_COPY["zh-CN"].shell.searchDocsSubtitle,
    });
  });

  it("keeps system settings discoverable through search aliases", () => {
    const settings = getWorkspaceSearchItems("en-US").find((item) => item.href === "/workspace/settings");

    expect(settings?.keywords).toContain("runtime");
    expect(settings?.keywords).toContain("config");
  });

  it("wraps keyboard active index within available search results", () => {
    expect(nextSearchActiveIndex(0, 3, 1)).toBe(1);
    expect(nextSearchActiveIndex(2, 3, 1)).toBe(0);
    expect(nextSearchActiveIndex(0, 3, -1)).toBe(2);
  });
});
