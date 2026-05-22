import { type Locale } from "@/components/language-picker";
import { getNavItems } from "@/lib/navigation";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";
import { WORKSPACE_NAV_REGISTRY, type WorkspaceNavKey } from "@/lib/workspace-registry";

export type WorkspaceShortcut = {
  keys: string;
  label: string;
};

export type WorkspaceShortcutGroup = {
  title: string;
  shortcuts: WorkspaceShortcut[];
};

export const WORKSPACE_NAV_SHORTCUTS: Partial<Record<WorkspaceNavKey, string>> = {
  workspace: "Ctrl+1",
  audits: "Ctrl+2",
  modelAssets: "Ctrl+3",
  riskFindings: "Ctrl+4",
  reportCenter: "Ctrl+5",
  apiKeys: "Ctrl+6",
  account: "Ctrl+7",
  settings: "Ctrl+,",
};

export function formatShortcutForDisplay(shortcut: string): string {
  return shortcut.replace(/\+/g, " + ");
}

export function getWorkspaceNavHrefForShortcutKey(key: string): string | null {
  const shortcut = key === "," ? "Ctrl+," : /^[1-9]$/.test(key) ? `Ctrl+${key}` : null;
  if (!shortcut) return null;

  const entry = WORKSPACE_NAV_REGISTRY.find((item) => WORKSPACE_NAV_SHORTCUTS[item.key] === shortcut);
  return entry?.href ?? null;
}

export function getWorkspaceShortcutGroups(locale: Locale): WorkspaceShortcutGroup[] {
  const copy = WORKSPACE_COPY[locale].keyboardShortcuts;
  const navigationShortcuts = getNavItems(locale)
    .map((item) => {
      const shortcut = WORKSPACE_NAV_SHORTCUTS[item.key];
      if (!shortcut) return null;
      return {
        keys: formatShortcutForDisplay(shortcut),
        label: item.title,
      };
    })
    .filter((shortcut): shortcut is WorkspaceShortcut => shortcut !== null);

  return [
    {
      title: copy.groupNavigation,
      shortcuts: [
        { keys: formatShortcutForDisplay("Ctrl+K"), label: copy.openCommandPalette },
        ...navigationShortcuts,
      ],
    },
    {
      title: copy.groupActions,
      shortcuts: [
        { keys: formatShortcutForDisplay("Ctrl+N"), label: copy.createNewTask },
        { keys: formatShortcutForDisplay("Ctrl+B"), label: copy.toggleSidebar },
      ],
    },
    {
      title: copy.groupGeneral,
      shortcuts: [
        { keys: "?", label: copy.showShortcuts },
        { keys: "Esc", label: copy.closeDialog },
      ],
    },
    {
      title: copy.groupTable,
      shortcuts: [
        { keys: "J", label: copy.nextRow },
        { keys: "K", label: copy.previousRow },
        { keys: "Enter", label: copy.openDetail },
      ],
    },
  ];
}
