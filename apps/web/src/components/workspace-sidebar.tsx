"use client";

import Link from "@/lib/router/link";
import { usePathname } from "@/lib/router/navigation";

import { type Locale } from "@/components/language-picker";
import { NavIcon } from "@/components/platform-shell-icons";
import { ThemeToggleButton } from "@/components/theme-toggle-button";
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { getNavItems } from "@/lib/navigation";
import { findActiveNavItem } from "@/lib/platform-shell";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";

/**
 * WorkspaceSidebar — the workspace navigation, now rendered through the
 * shadcn sidebar block.
 *
 * Replaces the legacy file's hand-rolled `.workspace-sidebar-link` markup,
 * localStorage collapse state, arrow-key roving, and footer Sun/Moon toggle.
 * The sidebar block (SidebarProvider, Ctrl+B, cookie state, mobile Sheet) owns
 * all of that; this component only describes the nav: one SidebarMenu of
 * SidebarMenuButtons, each a `next/link` via `render` with `isActive` state
 * and a collapsed-state tooltip. The label span hides on icon-collapse; the
 * NavIcon persists. The footer holds the single theme control (the topbar's
 * duplicate ThemeToggleButton is dropped), consolidating two toggles to one.
 */
export function WorkspaceSidebar({ locale = "en-US" }: { locale?: Locale }) {
  const pathname = usePathname();
  const items = getNavItems(locale);
  const current = findActiveNavItem(pathname, items);

  return (
    <>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item, index) => {
                const active = current.href === item.href;
                const prevItem = index > 0 ? items[index - 1] : null;
                const startsAccountGroup =
                  item.group === "account" && prevItem?.group !== item.group;
                return (
                  <SidebarMenuItem key={item.href}>
                    {startsAccountGroup ? <SidebarSeparator className="my-1" /> : null}
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={active}
                      tooltip={item.title}
                    >
                      <NavIcon icon={item.icon} />
                      <span className="group-has-data-[collapsible=icon]/sidebar-wrapper:hidden truncate">
                        {item.title}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-0 p-2">
        <SidebarSeparator className="mb-2" />
        <ThemeToggleButton
          labels={{
            prefix: WORKSPACE_COPY[locale].userMenu.themeLabel,
            light: WORKSPACE_COPY[locale].userMenu.themeLight,
            dark: WORKSPACE_COPY[locale].userMenu.themeDark,
            system: WORKSPACE_COPY[locale].userMenu.themeSystem,
          }}
        />
      </SidebarFooter>
    </>
  );
}
