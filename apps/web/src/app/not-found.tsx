import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-sm text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card">
          <span className="text-2xl font-semibold text-muted-foreground">404</span>
        </div>
        <h1 className="text-xl font-semibold text-foreground">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          页面未找到 — The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/workspace"
          className="mt-6 inline-flex items-center justify-center rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition hover:-translate-y-px hover:bg-[var(--palette-grey-10)]"
        >
          Return to workspace
        </Link>
      </div>
    </div>
  );
}
