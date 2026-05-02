"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const showLocalDetails = typeof window !== "undefined"
    && (window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-2xl overflow-hidden rounded-[28px] border border-border bg-card/85 shadow-[0_24px_80px_rgba(0,0,0,0.16)] backdrop-blur">
        <div className="border-b border-border bg-muted/20 px-6 py-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            DiffAudit Platform
          </div>
        </div>
        <div className="grid gap-8 px-6 py-8 md:grid-cols-[160px_minmax(0,1fr)] md:px-8">
          <div className="flex items-center justify-center">
            <div className="flex h-28 w-28 items-center justify-center rounded-[2rem] border border-border bg-background text-4xl font-semibold tracking-tight text-foreground">
              !
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">页面发生错误</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              当前页面没有正常完成加载。你可以先重试一次；如果仍失败，优先回到首页、Docs 或工作台继续操作。
            </p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              An unexpected error occurred while rendering this page.
            </p>
            {error.digest ? (
              <div className="mt-4 rounded-2xl border border-border bg-background/80 px-4 py-3 text-xs leading-6 text-muted-foreground">
                Error digest: <span className="font-mono text-foreground">{error.digest}</span>
              </div>
            ) : null}
            {showLocalDetails && error.message ? (
              <div className="mt-4 rounded-2xl border border-[#bf2f2f]/20 bg-[#bf2f2f]/8 px-4 py-3 text-xs leading-6 text-[#bf2f2f]">
                Local error: <span className="font-mono break-all">{error.message}</span>
              </div>
            ) : null}
            {showLocalDetails && error.stack ? (
              <details className="mt-3 rounded-2xl border border-border bg-background/80 px-4 py-3 text-xs leading-6 text-muted-foreground">
                <summary className="cursor-pointer font-medium text-foreground">Stack trace</summary>
                <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-5">
                  {error.stack}
                </pre>
              </details>
            ) : null}
            <div className="mt-6 grid gap-3 sm:grid-cols-4">
              <button
                type="button"
                onClick={() => reset()}
                className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:-translate-y-px hover:bg-muted/30"
              >
                重试
              </button>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:-translate-y-px hover:bg-muted/30"
              >
                首页
              </Link>
              <Link
                href="/docs/quick-start"
                className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:-translate-y-px hover:bg-muted/30"
              >
                Docs
              </Link>
              <Link
                href="/workspace/start"
                className="inline-flex items-center justify-center rounded-xl border border-[var(--accent-blue)] bg-[var(--accent-blue)] px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-px hover:bg-[var(--accent-blue-hover)]"
              >
                工作台
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
