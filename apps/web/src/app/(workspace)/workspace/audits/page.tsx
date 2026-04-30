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
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="workspace-kpi-card">
          <div className="workspace-kpi-card-label">{copy.statusLabels.running}</div>
          <div className="workspace-kpi-card-value">1</div>
          <p className="workspace-kpi-card-note">{copy.sections.activeTasks}</p>
        </div>
        <div className="workspace-kpi-card">
          <div className="workspace-kpi-card-label">{copy.statusLabels.completed}</div>
          <div className="workspace-kpi-card-value">5</div>
          <p className="workspace-kpi-card-note">{copy.sections.taskHistory}</p>
        </div>
        <div className="workspace-kpi-card">
          <div className="workspace-kpi-card-label">{copy.statusLabels.failed}</div>
          <div className="workspace-kpi-card-value">1</div>
          <p className="workspace-kpi-card-note">{copy.retryTitle}</p>
        </div>
        <div className="workspace-kpi-card">
          <div className="workspace-kpi-card-label">{copy.filters.trackSelectLabel}</div>
          <div className="workspace-kpi-card-value">3</div>
          <p className="workspace-kpi-card-note">{copy.filters.trackAll}</p>
        </div>
      </div>

      <div className="workspace-toolbar">
        <div className="workspace-toolbar-tabs">
          <span className="is-active">{copy.filters.statusAll}</span>
          <span>{copy.filters.statusRunning}</span>
          <span>{copy.filters.statusCompleted}</span>
          <span>{copy.filters.statusFailed}</span>
        </div>
        <div className="workspace-toolbar-search">
          <span>{copy.filters.searchPlaceholder}</span>
        </div>
      </div>

      <div className="workspace-audit-layout">
        <div className="workspace-audit-main">
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
        </div>

        <aside className="workspace-audit-inspector">
          <section className="workspace-inspector-card">
            <div className="workspace-inspector-card-header">
              <h2>{copy.sections.activeTasks}</h2>
            </div>
            <div className="p-4">
              <div className="workspace-audit-stepper" aria-hidden="true">
                {[copy.statusLabels.queued, copy.statusLabels.running, copy.statusLabels.completed].map((label, index) => (
                  <div key={label} className={index <= 1 ? "is-active" : ""}>
                    <span>{index + 1}</span>
                    <small>{label}</small>
                  </div>
                ))}
              </div>
              <div className="mt-5 space-y-3">
                <div className="workspace-inspector-metric">
                  <span>{copy.taskTable.status}</span>
                  <strong>{copy.statusLabels.running}</strong>
                </div>
                <div className="workspace-inspector-metric">
                  <span>{copy.taskTable.type}</span>
                  <strong>recon / black-box</strong>
                </div>
                <div className="workspace-inspector-metric">
                  <span>{copy.taskTable.duration}</span>
                  <strong>68%</strong>
                </div>
              </div>
            </div>
          </section>

          <section className="workspace-inspector-card">
            <div className="workspace-inspector-card-header">
              <h2>{copy.filters.groupLabel}</h2>
            </div>
            <div className="space-y-3 p-4">
              {[copy.filters.trackBlackBox, copy.filters.trackGrayBox, copy.filters.trackWhiteBox].map((track, index) => (
                <div key={track} className="workspace-action-row">
                  <span className="workspace-action-icon">{index + 1}</span>
                  <p>{track}</p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </WorkspacePageFrame>
  );
}

export default async function WorkspaceAuditsPage() {
  return renderWorkspaceAuditsPage();
}
