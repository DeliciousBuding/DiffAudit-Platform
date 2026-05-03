"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, Moon, Sun } from "lucide-react";

import { type Locale } from "@/components/language-picker";
import { NavIcon } from "@/components/platform-shell-icons";
import { useTheme } from "@/hooks/use-theme";
import { getNavItems } from "@/lib/navigation";
import { findActiveNavItem } from "@/lib/platform-shell";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";

const STORAGE_KEY = "diffaudit-sidebar-collapsed";

function getCollapsedFromStorage(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

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
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(getCollapsedFromStorage());
  }, []);

  const toggleCollapse = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // localStorage may be unavailable
      }
      return next;
    });
  }, []);

  // Expose toggle for keyboard shortcut
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__toggleSidebar = toggleCollapse;
    return () => {
      delete (window as unknown as Record<string, unknown>).__toggleSidebar;
    };
  }, [toggleCollapse]);

  // Sync collapsed class on the sidebar element
  useEffect(() => {
    const sidebar = document.querySelector(".workspace-sidebar");
    if (sidebar) {
      sidebar.classList.toggle("is-collapsed", collapsed);
    }
  }, [collapsed]);

  const navRef = useRef<HTMLElement>(null);

  // Arrow key navigation between sidebar links
  const onNavKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const links = navRef.current?.querySelectorAll<HTMLAnchorElement>("a.workspace-sidebar-link");
    if (!links || links.length === 0) return;
    const current = Array.from(links).indexOf(e.target as HTMLAnchorElement);
    if (current < 0) return;
    e.preventDefault();
    const next = e.key === "ArrowDown"
      ? (current + 1) % links.length
      : (current - 1 + links.length) % links.length;
    links[next].focus();
  }, []);

  return (
    <div className="workspace-sidebar-inner">
      <nav ref={navRef} className="workspace-sidebar-nav" aria-label={sidebarLabel} onKeyDown={onNavKeyDown}>
        {items.map((item) => {
          const active = current.href === item.href;
          return (
            <div key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`workspace-sidebar-link ${active ? "is-active" : ""}`}
                title={collapsed ? item.title : item.subtitle}
              >
                <NavIcon icon={item.icon} />
                <div className="workspace-sidebar-label flex flex-col min-w-0">
                  <span className="text-[13px] font-medium leading-tight truncate">{item.title}</span>
                  <span className="workspace-sidebar-subtitle text-[11px] leading-tight text-muted-foreground/80 truncate">{item.subtitle}</span>
                </div>
              </Link>
            </div>
          );
        })}
      </nav>
      <div className="workspace-sidebar-footer">
        <button
          type="button"
          onClick={toggle}
          className="workspace-sidebar-link w-full"
          aria-label={themeLabel}
          title={themeLabel}
        >
          {isDark ? <Moon size={16} strokeWidth={1.5} aria-hidden="true" /> : <Sun size={16} strokeWidth={1.5} aria-hidden="true" />}
          <span className="workspace-sidebar-label text-[13px] font-medium leading-tight truncate">{themeLabel}</span>
        </button>
        <button
          type="button"
          onClick={toggleCollapse}
          className="sidebar-collapse-btn"
          aria-label={collapsed ? WORKSPACE_COPY[locale].shell.expandSidebar : WORKSPACE_COPY[locale].shell.collapseSidebar}
          title={collapsed ? WORKSPACE_COPY[locale].shell.expandSidebar : WORKSPACE_COPY[locale].shell.collapseSidebar}
        >
          <ChevronLeft size={16} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
