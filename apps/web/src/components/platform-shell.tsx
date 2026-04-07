import { LogoutButton } from "@/components/logout-button";
import { PlatformCurrentNav } from "@/components/platform-current-nav.client";
import { PlatformNavDesktop, PlatformNavMobile } from "@/components/platform-nav.client";
import { BrandMark, GithubIcon } from "@/components/platform-shell-icons";

import { StatusBadge } from "@/components/status-badge";
import { ThemeToggle } from "@/components/theme-toggle";

export function PlatformShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <div className="grid max-w-full grid-cols-[296px_minmax(0,1fr)] max-lg:grid-cols-1 max-lg:px-4">
        <aside className="sticky top-0 hidden h-dvh self-start border-r border-[color:var(--sidebar-border)] bg-[color:var(--sidebar-background)] max-lg:hidden lg:block">
          <div className="flex h-full flex-col px-6 pb-6 pt-8">
            <div className="border-b border-border pb-6">
              <div className="flex items-center gap-3.5">
                <BrandMark />
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

            <PlatformNavDesktop />

            <div className="mt-auto flex items-center justify-between gap-3">
              <StatusBadge tone="info">演示数据</StatusBadge>
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
              <div className="h-8 w-8 shrink-0">
                <BrandMark />
              </div>
              <div>
                <strong className="text-[18px]">DiffAudit</strong>
                <div className="text-[13px] text-muted-foreground">
                  <PlatformCurrentNav />
                </div>
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
                <PlatformCurrentNav mode="full" />
              </div>
              <div className="mt-2 text-sm text-muted-foreground">前端展示层，当前显示演示数据</div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge tone="primary">REDIFFUSE</StatusBadge>
              <StatusBadge tone="info">演示模式</StatusBadge>
              <LogoutButton />
            </div>
          </div>

          <div>{children}</div>
        </main>

        <PlatformNavMobile />
      </div>
    </div>
  );
}
