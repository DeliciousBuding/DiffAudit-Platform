"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { type Locale } from "@/components/language-picker";
import { NavIcon } from "@/components/platform-shell-icons";
import { getNavItems } from "@/lib/navigation";
import { findActiveNavItem } from "@/lib/platform-shell";

export function PlatformNavDesktop({ locale = "en-US" }: { locale?: Locale }) {
  const pathname = usePathname();
  const items = getNavItems(locale);
  const current = findActiveNavItem(pathname, items);

  return (
    <nav className="workspace-nav" aria-label="Workspace navigation">
      {items.map((item) => {
        const active = current.href === item.href;
        return (
        <Link
          key={item.href}
          href={item.href}
          prefetch={false}
          aria-current={active ? "page" : undefined}
          className={`workspace-nav-link ${active ? "is-active" : ""}`}
        >
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-foreground">
              <NavIcon icon={item.icon} />
            </span>
            <span className="whitespace-nowrap">{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function PlatformNavMobile({ locale = "en-US" }: { locale?: Locale }) {
  const pathname = usePathname();
  const items = getNavItems(locale);
  const current = findActiveNavItem(pathname, items);

  return (
    <nav
      className="fixed bottom-4 left-4 right-4 z-40 hidden grid-cols-4 gap-2 rounded-[24px] border border-border bg-[var(--color-bg-primary)]/92 p-2 shadow-[0_20px_60px_rgba(18,19,23,0.12)] backdrop-blur-[20px] max-lg:grid sm:grid-cols-7"
      aria-label="Mobile navigation"
    >
      {items.map((item) => {
        const active = current.href === item.href;
        return (
        <Link
          key={item.href}
          href={item.href}
          prefetch={false}
          aria-current={active ? "page" : undefined}
          className={`flex min-h-[64px] flex-col items-center justify-center gap-1.5 rounded-lg border p-2 text-center text-[11px] font-bold transition-all duration-150 ${
            active
                ? "border-primary/20 bg-accent text-foreground"
                : "border-transparent text-muted-foreground"
            }`}
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-foreground">
              <NavIcon icon={item.icon} />
            </span>
            <span className="text-[12px]">{item.shortLabel}</span>
          </Link>
        );
      })}
    </nav>
  );
}
