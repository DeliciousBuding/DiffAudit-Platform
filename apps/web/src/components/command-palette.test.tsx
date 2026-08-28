import { describe, expect, it, vi } from "vitest";

import { getNavItems } from "@/lib/navigation";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";

import { getCommandItems, getNavigationCommandId } from "./command-palette";

vi.mock("@/lib/router/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("command palette commands", () => {
  it("derives English navigation commands from the workspace navigation registry", () => {
    const navItems = getNavItems("en-US");
    const commands = getCommandItems("en-US").filter((command) => command.category === "navigation");

    expect(commands).toHaveLength(navItems.length);
    expect(commands.map((command) => command.id)).toEqual(navItems.map((item) => getNavigationCommandId(item.key)));
    expect(commands.map((command) => command.label)).toEqual(navItems.map((item) => item.title));
    expect(commands.map((command) => command.href)).toEqual(navItems.map((item) => item.href));
    expect(commands.map((command) => command.shortcut)).toEqual(navItems.map((item) => item.shortcut));
  });

  it("derives Chinese navigation commands from the workspace navigation registry", () => {
    const navItems = getNavItems("zh-CN");
    const commands = getCommandItems("zh-CN").filter((command) => command.category === "navigation");

    expect(commands).toHaveLength(navItems.length);
    expect(commands.map((command) => command.label)).toEqual(navItems.map((item) => item.title));
    expect(commands.map((command) => command.href)).toEqual(navItems.map((item) => item.href));
  });

  it("keeps non-navigation command labels in workspace copy", () => {
    const copy = WORKSPACE_COPY["zh-CN"].commandPalette;
    const commands = getCommandItems("zh-CN");

    expect(commands.find((command) => command.id === "action-new-task")?.label).toBe(copy.actionNewTask);
    expect(commands.find((command) => command.id === "action-add-model")?.label).toBe(copy.actionAddModel);
    expect(commands.find((command) => command.id === "action-export-report")?.label).toBe(copy.actionExportReport);
    expect(commands.find((command) => command.id === "info-shortcuts")?.label).toBe(copy.infoShortcuts);
    expect(commands.find((command) => command.id === "info-docs")?.label).toBe(copy.infoDocs);
  });

  it("keeps command ids unique", () => {
    const ids = getCommandItems("en-US").map((command) => command.id);

    expect(new Set(ids)).toHaveLength(ids.length);
  });
});
