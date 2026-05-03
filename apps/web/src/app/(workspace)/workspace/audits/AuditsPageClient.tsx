"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

import { type Locale } from "@/components/language-picker";
import { useToast } from "@/components/toast-provider";
import { normalizeAuditJobList } from "@/lib/audit-job-payload";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";
import { WorkspaceSectionCard } from "@/components/workspace-frame";
import { TableDensityToggle, readPersistedDensity, type Density } from "@/components/table-density-toggle";
import { type JobRecord, TaskListClient } from "./TaskListClient";

/* ── Component ────────────────────────────────────────────────────────── */

export function AuditsPageClient({ locale }: { locale: Locale }) {
  const copy = WORKSPACE_COPY[locale].audits;
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const urlSyncSource = useRef<"state" | "url">("state");
  const { toast } = useToast();
  const prevJobStatuses = useRef<Map<string, string>>(new Map());

  const [allJobs, setAllJobs] = useState<JobRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const [filter, setFilter] = useState(() => searchParams.get("filter") ?? "all");
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");

  // Adaptive polling: fast when active jobs, slow when idle
  const hasActiveJobs = allJobs.some((j) => j.status === "running" || j.status === "queued");
  const pollInterval = hasActiveJobs ? 5000 : 30000;

  /* -- table density ------------------------------------------------ */
  const DENSITY_KEY = "diffaudit-audits-density";
  const [density, setDensity] = useState<Density>(() => readPersistedDensity(DENSITY_KEY));
  useEffect(() => {
    localStorage.setItem(DENSITY_KEY, density);
  }, [density]);

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
          // Detect job status transitions and notify
          for (const job of jobs) {
            const prevStatus = prevJobStatuses.current.get(job.job_id);
            if (prevStatus && (prevStatus === "running" || prevStatus === "queued")) {
              if (job.status === "completed") {
                toast({ type: "success", title: locale === "zh-CN" ? `任务完成: ${job.job_id}` : `Task completed: ${job.job_id}` });
              } else if (job.status === "failed") {
                toast({ type: "error", title: locale === "zh-CN" ? `任务失败: ${job.job_id}` : `Task failed: ${job.job_id}` });
              }
            }
            prevJobStatuses.current.set(job.job_id, job.status);
          }
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
    const interval = setInterval(fetchAllJobs, pollInterval);
    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [refreshToken, pollInterval]);

  /* ── Sync state -> URL ─────────────────────────────────────────────────── */
  useEffect(() => {
    if (urlSyncSource.current === "url") {
      urlSyncSource.current = "state";
      return;
    }
    const sp = new URLSearchParams();
    if (filter !== "all") sp.set("filter", filter);
    if (search.trim()) sp.set("q", search.trim());
    const qs = sp.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [filter, search, pathname, router]);

  /* ── Sync URL -> state (back/forward navigation) ──────────────────────── */
  useEffect(() => {
    const urlFilter = searchParams.get("filter") ?? "all";
    const urlQ = searchParams.get("q") ?? "";

    urlSyncSource.current = "url";
    setFilter(urlFilter);
    setSearch(urlQ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  /* ── Filter tab definitions ───────────────────────────────────────────── */

  const filterTabs: { key: string; label: string }[] = [
    { key: "all", label: copy.filters.statusAll },
    { key: "running", label: copy.filters.statusRunning },
    { key: "completed", label: copy.filters.statusCompleted },
    { key: "failed", label: copy.filters.statusFailed },
  ];

  function refreshJobs() {
    setRefreshToken((v) => v + 1);
  }

  const showActiveSection = filter === "all" || filter === "running";
  const showHistorySection = filter === "all" || filter === "completed" || filter === "failed";
  const historyTitle =
    filter === "completed"
      ? copy.statusLabels.completed
      : filter === "failed"
        ? copy.statusLabels.failed
        : copy.sections.taskHistory;

  return (
    <>
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
        <div className="ml-auto">
          <TableDensityToggle density={density} onChange={setDensity} />
        </div>
      </div>

      {/* Main layout: task list only */}
      <div className="workspace-audit-layout">
        <div className="workspace-audit-main">
          {showActiveSection ? (
            <WorkspaceSectionCard
              title={copy.sections.activeTasks}
              actions={<span className="inline-flex h-1.5 w-1.5 rounded-full bg-info animate-pulse" aria-hidden="true" />}
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
                  density={density}
                />
              </div>
            </WorkspaceSectionCard>
          ) : null}

          {showHistorySection ? (
            <WorkspaceSectionCard title={historyTitle}>
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
                  density={density}
                />
              </div>
            </WorkspaceSectionCard>
          ) : null}
        </div>
      </div>
    </>
  );
}
