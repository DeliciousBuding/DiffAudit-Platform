"use client";

import Link from "next/link";
import type { Locale } from "@/components/language-picker";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";

export interface ErrorFallbackProps {
  locale: Locale;
  error: Error & { digest?: string };
  reset: () => void;
  isRuntimeError?: boolean;
  useClientLink?: boolean;
}

export function ErrorFallbackUI({
  locale,
  error,
  reset,
  isRuntimeError = false,
  useClientLink = false,
}: ErrorFallbackProps) {
  const copy = WORKSPACE_COPY[locale].settings.errorPage;

  const title = isRuntimeError ? copy.runtimeTitle : copy.title;
  const description = isRuntimeError ? copy.runtimeDescription : copy.description;
  const goHomeLink = (
    useClientLink ? (
      <Link
        href="/workspace/start"
        className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/30"
      >
        {copy.goHome}
      </Link>
    ) : (
      <a
        href="/workspace/start"
        className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/30"
      >
        {copy.goHome}
      </a>
    )
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-lg w-full border-2 border-[var(--warning)]/40 bg-[var(--warning)]/5 rounded-lg p-6 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--warning)]/20">
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-[var(--warning)]" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-2 text-foreground">
              {title}
            </h2>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              {description}
            </p>

            {error.digest && (
              <p className="text-xs text-muted-foreground mb-3">
                {copy.errorId}: {error.digest}
              </p>
            )}

            <details className="mb-4">
              <summary className="text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                {copy.errorDetails}
              </summary>
              <pre className="mt-2 p-3 bg-muted/30 rounded-md text-xs overflow-auto max-h-32 border border-border">
                {error.message}
              </pre>
            </details>

            <div className="flex items-center gap-3">
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-md border border-[var(--accent-blue)] bg-[var(--accent-blue)] px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md hover:opacity-90"
              >
                {copy.retry}
              </button>
              {goHomeLink}
            </div>

            {isRuntimeError && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2 font-medium">{copy.quickFixes}</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>{copy.quickFixCheckRuntime}</li>
                  <li>{copy.quickFixVerifyNetwork}</li>
                  <li>{copy.quickFixEnableDemo}</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
