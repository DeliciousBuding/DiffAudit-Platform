import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { WorkspaceGlobalSearch } from "./workspace-global-search";

vi.mock("next/navigation", () => ({
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

      const markup = renderToStaticMarkup(<WorkspaceGlobalSearch locale="en-US" />);

      expect(markup).toContain('role="search"');
      expect(markup).toContain('role="combobox"');
      expect(markup).toContain("Search pages...");
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
});
