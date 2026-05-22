import { describe, expect, it, vi } from "vitest";

import { getNavItems } from "@/lib/navigation";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";

import { getCommandItems } from "./command-palette";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("command palette commands", () => {
  it("derives English navigation commands from the workspace navigation registry", () => {
    const navItems = getNavItems("en-US");
    const commands = getCommandItems("en-US").filter((command) => command.category === "navigation");

    expect(commands).toHaveLength(navItems.length);
    expect(commands.map((command) => command.label)).toEqual(navItems.map((item) => item.title));
    expect(commands.map((command) => command.href)).toEqual(navItems.map((item) => item.href));
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
});
