"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoutButton } from "@/components/logout-button";
import { StatusBadge } from "@/components/status-badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { navItems } from "@/lib/navigation";
import { findActiveNavItem } from "@/lib/platform-shell";

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] fill-current">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.79 8.2 11.38.6.11.82-.25.82-.56 0-.28-.01-1.2-.01-2.19-3.34.73-4.04-1.42-4.04-1.42-.55-1.38-1.33-1.75-1.33-1.75-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.48 1 .11-.77.42-1.3.77-1.6-2.66-.3-5.45-1.33-5.45-5.94 0-1.31.47-2.38 1.24-3.22-.12-.31-.54-1.55.12-3.22 0 0 1-.32 3.3 1.23A11.4 11.4 0 0 1 12 5.8c1.02 0 2.05.14 3.01.42 2.29-1.55 3.29-1.23 3.29-1.23.66 1.67.24 2.91.12 3.22.77.84 1.24 1.91 1.24 3.22 0 4.62-2.8 5.63-5.47 5.93.43.38.81 1.11.81 2.23 0 1.61-.01 2.9-.01 3.29 0 .31.21.68.82.56A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
    </svg>
  );
}

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
                    扩散模型隐私审计平台 v1.0
                  </span>
                </div>
              </div>
            </div>

            <nav className="flex flex-1 flex-col gap-2 pt-5" aria-label="Main navigation">
              <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-primary/70">
                审计导航
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
              <StatusBadge tone="success">模拟模式运行中</StatusBadge>
              <div className="flex items-center gap-1.5">
                <a
                  href="https://github.com/DeliciousBuding/DiffAudit-Platform"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-all duration-150 hover:-translate-y-px hover:bg-white/60 hover:text-foreground dark:hover:bg-white/10"
                  title="GitHub"
                >
                  <GithubIcon />
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
              <div className="mt-2 text-sm text-muted-foreground">REDIFFUSE 前端展示层，当前以后端未连接的模拟模式运行</div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge tone="primary">REDIFFUSE</StatusBadge>
              <StatusBadge tone="warning">模拟模式</StatusBadge>
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
