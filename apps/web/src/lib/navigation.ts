import { type Locale } from "@/components/language-picker";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";
import { WORKSPACE_NAV_REGISTRY, type WorkspaceNavGroup, type WorkspaceNavIcon, type WorkspaceNavKey } from "@/lib/workspace-registry";

export type NavItem = {
  key: WorkspaceNavKey;
  href: string;
  title: string;
  subtitle: string;
  badge?: string;
  icon: WorkspaceNavIcon;
  group: WorkspaceNavGroup;
  shortcut: string;
  shortLabel: string;
};

export function getNavItems(locale: Locale): NavItem[] {
  const localized = WORKSPACE_COPY[locale].nav;
  return WORKSPACE_NAV_REGISTRY.map((entry) => ({
    key: entry.key,
    href: entry.href,
    icon: entry.icon,
    group: entry.group,
    shortcut: entry.shortcut,
    ...localized[entry.key],
  }));
}
