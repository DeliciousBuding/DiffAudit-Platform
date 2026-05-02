"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";

import { type Locale } from "@/components/language-picker";
import { NavIcon } from "@/components/platform-shell-icons";
import { useTheme } from "@/hooks/use-theme";
import { getNavItems } from "@/lib/navigation";
import { findActiveNavItem } from "@/lib/platform-shell";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";

export function WorkspaceSidebar({ locale = "en-US" }: { locale?: Locale }) {
  const pathname = usePathname();
  const { resolvedTheme, toggle } = useTheme();
  const items = getNavItems(locale);
  const current = findActiveNavItem(pathname, items);
  const sidebarLabel = WORKSPACE_COPY[locale].shell.desktopNavAriaLabel;
  const isDark = resolvedTheme === "dark";
  const themeLabel = isDark
    ? WORKSPACE_COPY[locale].userMenu.themeDark
    : WORKSPACE_COPY[locale].userMenu.themeLight;

  return (
    <div className="flex flex-col h-full">
      <nav className="flex flex-col gap-0.5" aria-label={sidebarLabel}>
        {items.map((item) => {
          const active = current.href === item.href;
          return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={false}
            aria-current={active ? "page" : undefined}
            className={`workspace-sidebar-link ${active ? "is-active" : ""}`}
            title={item.subtitle}
            >
              <NavIcon icon={item.icon} />
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-medium leading-tight truncate">{item.title}</span>
                <span className="text-[10px] leading-tight text-muted-foreground/60 truncate">{item.subtitle}</span>
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto pt-2 border-t border-border/40">
        <button
          type="button"
          onClick={toggle}
          className="workspace-sidebar-link w-full"
          aria-label={themeLabel}
          title={themeLabel}
        >
          {isDark ? <Moon size={16} strokeWidth={1.5} /> : <Sun size={16} strokeWidth={1.5} />}
          <span className="text-[13px] font-medium leading-tight truncate">{themeLabel}</span>
        </button>
      </div>
    </div>
  );
}
