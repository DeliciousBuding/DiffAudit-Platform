"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, Moon, Sun, Plus } from "lucide-react";

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
  const isZh = locale === "zh-CN";

  // Section dividers between nav groups
  const sectionBreaks = new Set([1, 3, 5]);

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
    (window as Record<string, unknown>).__toggleSidebar = toggleCollapse;
    return () => {
      delete (window as Record<string, unknown>).__toggleSidebar;
    };
  }, [toggleCollapse]);

  // Sync collapsed class on the sidebar element
  useEffect(() => {
    const sidebar = document.querySelector(".workspace-sidebar");
    if (sidebar) {
      sidebar.classList.toggle("is-collapsed", collapsed);
    }
  }, [collapsed]);

  const createLabel = isZh ? "新建审计任务" : "New audit task";
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
    <div className="flex flex-col h-full">
      <Link
        href="/workspace/audits/new"
        className="mx-2 mb-2 flex items-center justify-center gap-1.5 rounded-xl bg-[var(--accent-blue)] px-3 py-2 text-[13px] font-medium text-background transition-all duration-200 hover:shadow-[0_4px_16px_rgba(47,109,246,0.25)] hover:scale-[1.02] active:scale-[0.98]"
      >
        <Plus size={14} strokeWidth={1.5} aria-hidden="true" />
        <span className="workspace-sidebar-label">{createLabel}</span>
        <kbd className="ml-auto hidden text-[10px] font-medium opacity-60 sidebar-kbd" aria-hidden="true">Ctrl+N</kbd>
      </Link>
      <nav ref={navRef} className="flex flex-col gap-0.5" aria-label={sidebarLabel} onKeyDown={onNavKeyDown}>
        {items.map((item, index) => {
          const active = current.href === item.href;
          return (
            <div key={item.href}>
              {sectionBreaks.has(index) && (
                <div className="my-1.5 mx-2 border-t border-border/30" aria-hidden="true" />
              )}
              <Link
                href={item.href}
                prefetch={false}
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
      <div className="mt-auto pt-2 border-t border-border/40">
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
