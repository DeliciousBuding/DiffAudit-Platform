import { Suspense } from "react";
import { headers } from "next/headers";
import Link from "next/link";

import { type Locale } from "@/components/language-picker";

// Cache RSC responses for 60s — demo data doesn't change during a session
export const revalidate = 60;

import { resolveLocaleFromHeaderStore } from "@/lib/locale";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";
import { TableSkeleton, JobsListSkeleton } from "@/components/skeleton";
import { TaskListClient } from "./TaskListClient";

export default async function WorkspaceAuditsPage({ locale }: { locale?: Locale } = {}) {
  const resolvedLocale = locale ?? resolveLocaleFromHeaderStore(await headers());
  const copy = WORKSPACE_COPY[resolvedLocale].audits;

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="border-b border-border pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{copy.eyebrow}</div>
            <h1 className="mt-1 text-lg font-semibold">{copy.title}</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">{copy.description}</p>
          </div>
          <Link
            href="/workspace/audits/new"
            className="inline-flex items-center gap-1.5 rounded border border-[var(--accent-blue)] bg-[var(--accent-blue)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--accent-blue-hover)] shrink-0"
          >
            <span className="text-sm leading-none">+</span>
            {copy.createTaskButton}
          </Link>
        </div>
      </div>

      {/* Active tasks section */}
      <section className="border border-border bg-card">
        <div className="border-b border-border bg-muted/20 px-3 py-2 flex items-center justify-between">
          <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {copy.sections.activeTasks}
          </h2>
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-info animate-pulse" />
        </div>
        <div className="overflow-auto max-h-[420px]">
          <Suspense fallback={<JobsListSkeleton />}>
            <TaskListClient
              mode="active"
              locale={resolvedLocale}
            />
          </Suspense>
        </div>
      </section>

      {/* Task history section */}
      <section className="border border-border bg-card">
        <div className="border-b border-border bg-muted/20 px-3 py-2">
          <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {copy.sections.taskHistory}
          </h2>
        </div>
        <div className="overflow-auto">
          <Suspense
            fallback={
              <section className="border border-border bg-card">
                <TableSkeleton rows={5} cols={6} />
              </section>
            }
          >
            <TaskListClient
              mode="history"
              locale={resolvedLocale}
            />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
