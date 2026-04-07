"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NavIcon } from "@/components/platform-shell-icons";
import { navItems } from "@/lib/navigation";
import { findActiveNavItem } from "@/lib/platform-shell";

export function PlatformNavDesktop() {
  const pathname = usePathname();
  const current = findActiveNavItem(pathname);

  return (
    <nav className="flex flex-1 flex-col gap-2 pt-5" aria-label="Main navigation">
      <span className="text-[14px] font-semibold tracking-[0.06em] text-primary/75">审计导航</span>
      {navItems.map((item) => {
        const active = current.href === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-[50px] items-center gap-3 rounded-2xl border px-3.5 py-3 text-base font-semibold transition-all duration-150 ${
              active
                ? "border-primary/20 bg-gradient-to-br from-primary/8 to-sky-500/6 text-primary"
                : "border-transparent text-muted-foreground hover:-translate-y-px hover:bg-white/50 hover:text-foreground dark:hover:bg-white/6"
            }`}
          >
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <NavIcon icon={item.icon} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[16px] font-semibold">{item.title}</span>
              <span className="mt-1 block truncate text-[13px] font-medium text-muted-foreground">
                {item.subtitle}
              </span>
            </span>
            {item.badge ? (
              <span className="mono rounded-full border border-primary/20 px-2 py-0.5 text-[10px] text-primary">
                {item.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

export function PlatformNavMobile() {
  const pathname = usePathname();
  const current = findActiveNavItem(pathname);

  return (
    <nav
      className="fixed bottom-4 left-4 right-4 z-40 hidden grid-cols-5 gap-2 rounded-3xl border border-border bg-white/90 p-2 shadow-lg backdrop-blur-[20px] dark:bg-[hsl(220_13%_14%/0.92)] max-lg:grid"
      aria-label="Mobile navigation"
    >
      {navItems.map((item) => {
        const active = current.href === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-[64px] flex-col items-center justify-center gap-1.5 rounded-2xl border p-2 text-center text-[11px] font-bold transition-all duration-150 ${
              active
                ? "border-primary/20 bg-white/80 text-foreground dark:bg-white/8"
                : "border-transparent text-muted-foreground"
            }`}
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <NavIcon icon={item.icon} />
            </span>
            <span className="text-[12px]">{item.shortLabel}</span>
          </Link>
        );
      })}
    </nav>
  );
}

