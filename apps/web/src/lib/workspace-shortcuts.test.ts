import { describe, expect, it } from "vitest";

import { getNavItems } from "@/lib/navigation";

import {
  formatShortcutForDisplay,
  getWorkspaceNavHrefForShortcutKey,
  getWorkspaceShortcutGroups,
} from "./workspace-shortcuts";

describe("workspace shortcuts", () => {
  it("formats compact shortcuts for display", () => {
    expect(formatShortcutForDisplay("Ctrl+1")).toBe("Ctrl + 1");
    expect(formatShortcutForDisplay("Ctrl+,")).toBe("Ctrl + ,");
  });

  it("resolves keyboard navigation through the shared shortcut registry", () => {
    expect(getWorkspaceNavHrefForShortcutKey("1")).toBe("/workspace/start");
    expect(getWorkspaceNavHrefForShortcutKey("7")).toBe("/workspace/account");
    expect(getWorkspaceNavHrefForShortcutKey(",")).toBe("/workspace/settings");
    expect(getWorkspaceNavHrefForShortcutKey("8")).toBeNull();
    expect(getWorkspaceNavHrefForShortcutKey("n")).toBeNull();
  });

  it("derives English shortcut modal navigation labels from the workspace navigation registry", () => {
    const navItems = getNavItems("en-US");
    const navigationGroup = getWorkspaceShortcutGroups("en-US")[0];
    const navShortcuts = navigationGroup.shortcuts.slice(1);

    expect(navShortcuts.map((shortcut) => shortcut.label)).toEqual(navItems.map((item) => item.title));
    expect(navShortcuts.map((shortcut) => shortcut.keys)).toEqual(
      navItems.map((item) => formatShortcutForDisplay(item.shortcut)),
    );
  });

  it("derives Chinese shortcut modal navigation labels from the workspace navigation registry", () => {
    const navItems = getNavItems("zh-CN");
    const navigationGroup = getWorkspaceShortcutGroups("zh-CN")[0];
    const navShortcuts = navigationGroup.shortcuts.slice(1);

    expect(navShortcuts.map((shortcut) => shortcut.label)).toEqual(navItems.map((item) => item.title));
    expect(navShortcuts.map((shortcut) => shortcut.keys)).toEqual(
      navItems.map((item) => formatShortcutForDisplay(item.shortcut)),
    );
  });
});
