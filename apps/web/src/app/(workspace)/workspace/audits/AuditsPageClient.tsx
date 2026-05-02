"use client";

import { Clock, ShieldCheck, XCircle, LayoutList } from "lucide-react";
import { useEffect, useState } from "react";

import { type Locale } from "@/components/language-picker";
import { normalizeAuditJobList } from "@/lib/audit-job-payload";
import { inferReportTrack } from "@/lib/audit-flow";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";
import { WorkspaceSectionCard } from "@/components/workspace-frame";
import { KpiCard } from "@/components/kpi-card";
import { type JobRecord, TaskListClient } from "./TaskListClient";

/* ── Component ────────────────────────────────────────────────────────── */

export function AuditsPageClient({ locale }: { locale: Locale }) {
  const copy = WORKSPACE_COPY[locale].audits;

  const [allJobs, setAllJobs] = useState<JobRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchAllJobs() {
      try {
        const res = await fetch("/api/v1/audit/jobs", { signal: controller.signal });
        if (!res.ok) {
          setLoadError(true);
          return;
        }
        const data = await res.json();
        const jobs = normalizeAuditJobList<JobRecord>(data);
        if (jobs) {
          setAllJobs(jobs);
          setLoadError(false);
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setLoadError(true);
        }
      } finally {
        setLoading(false);
      }
    }

    void fetchAllJobs();
    const interval = setInterval(fetchAllJobs, 5000);
    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [refreshToken]);

  /* ── Compute KPI stats from real data ─────────────────────────────────── */

  const runningCount = allJobs.filter(
    (j) => j.status === "running" || j.status === "queued",
  ).length;
  const completedCount = allJobs.filter((j) => j.status === "completed").length;
  const failedCount = allJobs.filter((j) => j.status === "failed").length;
  const trackSet = new Set(
    allJobs.map((j) => inferReportTrack(j)).filter((t): t is NonNullable<typeof t> => t !== null),
  );
  const trackCount = trackSet.size;

  /* ── Compute track sidebar counts from real data ──────────────────────── */

  const trackCounts = { "black-box": 0, "gray-box": 0, "white-box": 0 };
  for (const job of allJobs) {
    const track = inferReportTrack(job);
    if (track && track in trackCounts) {
      trackCounts[track as keyof typeof trackCounts]++;
    }
  }

  /* ── Filter tab definitions ───────────────────────────────────────────── */

  const filterTabs: { key: string; label: string }[] = [
    { key: "all", label: copy.filters.statusAll },
    { key: "running", label: copy.filters.statusRunning },
    { key: "completed", label: copy.filters.statusCompleted },
    { key: "failed", label: copy.filters.statusFailed },
  ];

  const trackItems = [
    { label: copy.filters.trackBlackBox, color: "var(--track-black)", count: trackCounts["black-box"] },
    { label: copy.filters.trackGrayBox, color: "var(--track-gray)", count: trackCounts["gray-box"] },
    { label: copy.filters.trackWhiteBox, color: "var(--track-white)", count: trackCounts["white-box"] },
  ];

  function refreshJobs() {
    setRefreshToken((v) => v + 1);
  }

  return (
    <>
      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={<span className="workspace-kpi-icon" aria-hidden="true"><Clock size={16} strokeWidth={1.5} /></span>}
          label={copy.statusLabels.running}
          value={runningCount}
          note={copy.sections.activeTasks}
        />
        <KpiCard
          icon={<span className="workspace-kpi-icon is-shield" aria-hidden="true"><ShieldCheck size={16} strokeWidth={1.5} /></span>}
          label={copy.statusLabels.completed}
          value={completedCount}
          note={copy.sections.taskHistory}
        />
        <KpiCard
          icon={<span className="workspace-kpi-icon is-failed" aria-hidden="true"><XCircle size={16} strokeWidth={1.5} /></span>}
          label={copy.statusLabels.failed}
          value={failedCount}
          note={copy.retryTitle}
        />
        <KpiCard
          icon={<span className="workspace-kpi-icon is-report" aria-hidden="true"><LayoutList size={16} strokeWidth={1.5} /></span>}
          label={copy.kpiTracksLabel}
          value={trackCount}
          note={copy.kpiTracksNote}
        />
      </div>

      {/* Toolbar: filter tabs + search */}
      <div className="workspace-toolbar">
        <div className="workspace-toolbar-tabs" role="tablist" aria-label={copy.filters.statusGroupLabel}>
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={filter === tab.key}
              className={filter === tab.key ? "is-active" : ""}
              onClick={() => setFilter(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="workspace-toolbar-search">
          <input
            type="search"
            placeholder={copy.filters.searchPlaceholder}
            aria-label={copy.filters.searchLabel}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Main layout: list + sidebar */}
      <div className="workspace-audit-layout">
        <div className="workspace-audit-main">
          {/* Active tasks section */}
          <WorkspaceSectionCard
            title={copy.sections.activeTasks}
            actions={<span className="inline-flex h-1.5 w-1.5 rounded-full bg-info animate-pulse" />}
          >
            <div className="overflow-auto max-h-[420px]">
              <TaskListClient
                mode="active"
                locale={locale}
                filter={filter}
                search={search}
                jobs={allJobs}
                loading={loading}
                loadError={loadError}
                onRefresh={refreshJobs}
              />
            </div>
          </WorkspaceSectionCard>

          {/* Task history section */}
          <WorkspaceSectionCard title={copy.sections.taskHistory}>
            <div className="overflow-auto">
              <TaskListClient
                mode="history"
                locale={locale}
                filter={filter}
                search={search}
                jobs={allJobs}
                loading={loading}
                loadError={loadError}
                onRefresh={refreshJobs}
              />
            </div>
          </WorkspaceSectionCard>
        </div>

        <aside className="workspace-audit-inspector">
          <section className="workspace-inspector-card">
            <div className="workspace-inspector-card-header">
              <h2>{copy.filters.groupLabel}</h2>
            </div>
            <div className="p-4 space-y-3">
              {trackItems.map((track) => (
                <div key={track.label} className="workspace-track-card">
                  <div className="workspace-track-card-indicator" style={{ background: track.color }} />
                  <div className="workspace-track-card-body">
                    <span className="workspace-track-card-label">{track.label}</span>
                    <span className="workspace-track-card-count">{track.count}{copy.trackCountUnit}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}
