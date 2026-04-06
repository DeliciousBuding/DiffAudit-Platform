"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoutButton } from "@/components/logout-button";
import { navItems } from "@/lib/navigation";

function titleForPath(pathname: string) {
  return navItems.find((item) => pathname.startsWith(item.href)) ?? navItems[0];
}

export function PlatformShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const current = titleForPath(pathname);

  return (
    <div className="platform-shell flex min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <aside className="hidden w-64 shrink-0 border-r border-[var(--border)] bg-[var(--background-soft)] lg:flex lg:flex-col">
        <div className="border-b border-[var(--border)] px-6 py-7">
          <div className="mono text-base font-medium tracking-[0.08em] text-[var(--accent)]">
            DiffAudit
          </div>
          <div className="mt-2 text-xs text-[var(--muted-2)]">
            扩散模型隐私审计平台
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-2 px-3 py-4">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl border px-4 py-3 transition ${
                  active
                    ? "border-[rgba(79,255,176,0.25)] bg-[rgba(79,255,176,0.08)] text-[var(--accent)]"
                    : "border-transparent text-[var(--muted)] hover:border-[var(--border)] hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--foreground)]"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">{item.title}</span>
                  {item.badge ? (
                    <span className="mono rounded-full border border-[rgba(79,255,176,0.25)] px-2 py-0.5 text-[10px]">
                      {item.badge}
                    </span>
                  ) : null}
                </div>
                <div className="mt-1 text-xs text-[var(--muted-2)]">{item.subtitle}</div>
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-[var(--border)] px-4 py-4 text-xs text-[var(--muted-2)]">
          <span className="inline-block h-2 w-2 rounded-full bg-[var(--accent)] shadow-[0_0_10px_var(--accent)]" />{" "}
          API shell scaffold
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[rgba(17,19,24,0.92)] px-6 py-4 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold">{current.title}</div>
              <div className="mono mt-1 text-xs text-[var(--muted-2)]">
                DiffAudit / {current.subtitle}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LogoutButton />
              <span className="mono rounded-full border border-[rgba(79,255,176,0.25)] bg-[rgba(79,255,176,0.06)] px-3 py-1 text-[11px] text-[var(--accent)]">
                RECON
              </span>
              <span className="mono rounded-full border border-[rgba(255,179,71,0.25)] bg-[rgba(255,179,71,0.06)] px-3 py-1 text-[11px] text-[var(--warn)]">
                PLATFORM SHELL
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
