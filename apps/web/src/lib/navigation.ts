import { type Locale } from "@/components/language-picker";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";

export type NavItem = {
  href: string;
  title: string;
  subtitle: string;
  badge?: string;
  icon: "spark" | "dashboard" | "report" | "key" | "settings";
  shortLabel: string;
};

const NAV_ICONS: Array<NavItem["icon"]> = ["dashboard", "spark", "report", "key", "settings"];

export function getNavItems(locale: Locale): NavItem[] {
  return WORKSPACE_COPY[locale].nav.map((item, i) => ({
    ...item,
    icon: NAV_ICONS[i],
  }));
}

export const navItems: NavItem[] = getNavItems("en-US");
