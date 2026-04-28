import Link from "next/link";

export default function NotFound() {
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
              404
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">页面不存在</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              你访问的地址可能已经移动、被删除，或者链接本身就是错误的。
            </p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              The page you requested could not be found. Use one of the stable entry points below.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:-translate-y-px hover:bg-muted/30"
              >
                返回首页
              </Link>
              <Link
                href="/docs/quick-start"
                className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:-translate-y-px hover:bg-muted/30"
              >
                打开 Docs
              </Link>
              <Link
                href="/workspace"
                className="inline-flex items-center justify-center rounded-xl border border-[var(--accent-blue)] bg-[var(--accent-blue)] px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-px hover:bg-[var(--accent-blue-hover)]"
              >
                返回工作台
              </Link>
            </div>
            <div className="mt-6 rounded-2xl border border-border bg-background/80 px-4 py-3 text-xs leading-6 text-muted-foreground">
              常见原因：文档 slug 已调整、旧链接失效、未登录时直接访问内部路径。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
