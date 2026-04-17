import { Suspense } from "react";
import { headers } from "next/headers";
import Link from "next/link";

export const dynamic = "force-dynamic";

import { resolveLocaleFromHeaderStore } from "@/lib/locale";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";
import { TableSkeleton, JobsListSkeleton } from "@/components/skeleton";
import { WorkspacePageFrame, WorkspaceSectionCard } from "@/components/workspace-frame";
import { TaskListClient } from "./TaskListClient";

type WorkspaceAuditsPageOptions = {
  locale?: "en-US" | "zh-CN";
};

async function renderWorkspaceAuditsPage({ locale }: WorkspaceAuditsPageOptions = {}) {
  const resolvedLocale = locale ?? resolveLocaleFromHeaderStore(await headers());
  const copy = WORKSPACE_COPY[resolvedLocale].audits;

  return (
    <WorkspacePageFrame
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={copy.description}
      actions={
        <Link
          href="/workspace/audits/new"
          className="workspace-btn-primary px-3 py-1.5 text-xs font-medium shrink-0"
        >
          <span className="text-sm leading-none">+</span>
          {copy.createTaskButton}
        </Link>
      }
    >

      {/* Active tasks section */}
      <WorkspaceSectionCard
        title={copy.sections.activeTasks}
        actions={<span className="inline-flex h-1.5 w-1.5 rounded-full bg-info animate-pulse" />}
      >
        <div className="overflow-auto max-h-[420px]">
          <Suspense fallback={<JobsListSkeleton />}>
            <TaskListClient
              mode="active"
              locale={resolvedLocale}
            />
          </Suspense>
        </div>
      </WorkspaceSectionCard>

      {/* Task history section */}
      <WorkspaceSectionCard title={copy.sections.taskHistory}>
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
      </WorkspaceSectionCard>
    </WorkspacePageFrame>
  );
}

export default async function WorkspaceAuditsPage() {
  return renderWorkspaceAuditsPage();
}
