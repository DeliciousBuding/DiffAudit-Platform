"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoutButton } from "@/components/logout-button";
import { StatusBadge } from "@/components/status-badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { navItems } from "@/lib/navigation";
import { findActiveNavItem } from "@/lib/platform-shell";

export function PlatformShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const current = findActiveNavItem(pathname);

  return (
    <div className="min-h-dvh">
      <div className="grid max-w-full grid-cols-[296px_minmax(0,1fr)] max-lg:grid-cols-1 max-lg:px-4">
        <aside className="sticky top-0 hidden h-dvh self-start border-r border-[color:var(--sidebar-border)] bg-[color:var(--sidebar-background)] max-lg:hidden lg:block">
          <div className="flex h-full flex-col px-6 pb-6 pt-8">
            <div className="border-b border-border pb-6">
              <div className="flex items-center gap-3.5">
                <div className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-sky-500 text-sm font-semibold text-white shadow-[0_4px_16px_hsl(258_60%_63%/0.2)]">
                  DA
                </div>
                <div className="flex flex-col gap-1">
                  <h1 className="text-[26px] font-bold leading-tight text-transparent bg-gradient-to-br from-primary to-sky-500 bg-clip-text">
                    DiffAudit
                  </h1>
                  <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                    Preview
                  </span>
                </div>
              </div>
            </div>

            <nav className="flex flex-1 flex-col gap-2 pt-5" aria-label="Main navigation">
              <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-primary/70">
                Audit Console
              </span>
          {navItems.map((item) => {
                const active = current.href === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                    className={`flex min-h-[50px] items-center gap-3 rounded-2xl border px-3.5 py-3 text-base font-semibold transition-all duration-150 ${
                  active
                        ? "border-primary/20 bg-gradient-to-br from-primary/8 to-sky-500/6 text-primary"
                        : "border-transparent text-muted-foreground hover:-translate-y-px hover:bg-white/50 hover:text-foreground dark:hover:bg-white/6"
                }`}
              >
                    <span className="mono inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-[11px] font-semibold text-primary">
                      {item.glyph}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px]">{item.title}</span>
                      <span className="mt-1 block truncate text-xs font-medium text-muted-foreground">
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

            <div className="mt-auto flex items-center justify-between gap-3">
              <StatusBadge tone="success">Online</StatusBadge>
              <div className="flex items-center gap-2">
                <a
                  href="https://github.com/DeliciousBuding/DiffAudit-Platform"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white/55 text-[11px] font-semibold text-muted-foreground transition hover:-translate-y-px hover:text-foreground dark:bg-white/5"
                  title="GitHub"
                >
                  GH
                </a>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 p-6 max-lg:pb-[104px]">
          <header className="mb-4 hidden items-center justify-between gap-4 rounded-[22px] border border-border bg-white/70 p-3.5 dark:bg-[hsl(220_13%_15%/0.7)] max-lg:flex">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-gradient-to-br from-primary to-sky-500 text-[10px] font-semibold text-white">
                DA
              </div>
              <div>
                <strong className="text-lg">DiffAudit</strong>
                <div className="text-xs text-muted-foreground">{current.shortLabel}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <LogoutButton />
            </div>
          </header>

          <div className="mb-6 flex items-center justify-between gap-4 max-lg:hidden">
            <div>
              <div className="mono text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/80">
                DiffAudit / {current.shortLabel}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">{current.subtitle}</div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge tone="primary">Recon</StatusBadge>
              <StatusBadge tone="warning">Shared Access</StatusBadge>
              <ThemeToggle />
              <LogoutButton />
            </div>
          </div>

          <div>{children}</div>
        </main>

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
                className={`flex min-h-[64px] flex-col items-center justify-center gap-1.5 rounded-2xl border p-2 text-center text-[11px] font-bold transition-all duration-150 ${
                  active
                    ? "border-primary/20 bg-white/80 text-foreground dark:bg-white/8"
                    : "border-transparent text-muted-foreground"
                }`}
              >
                <span className="mono text-[11px] font-semibold">{item.glyph}</span>
                <span>{item.shortLabel}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
