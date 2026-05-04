"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { RefreshCw, Search, ChevronDown } from "lucide-react";

import { type Locale } from "@/components/language-picker";
import { useToast } from "@/components/toast-provider";
import { normalizeAuditJobList } from "@/lib/audit-job-payload";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";
import { type JobRecord, RunningCard, HistoryTable } from "./TaskListClient";

export function AuditsPageClient({
  locale,
  initialJobs = [],
}: {
  locale: Locale;
  initialJobs?: JobRecord[];
}) {
  const copy = WORKSPACE_COPY[locale].audits;
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const urlSyncSource = useRef<"state" | "url">("state");
  const { toast } = useToast();
  const prevJobStatuses = useRef<Map<string, string>>(new Map());

  const [allJobs, setAllJobs] = useState<JobRecord[]>(initialJobs);
  const [loading, setLoading] = useState(initialJobs.length === 0);
  const [loadError, setLoadError] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const [filter, setFilter] = useState(() => searchParams.get("filter") ?? "all");
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");

  const hasActiveJobs = allJobs.some((j) => j.status === "running" || j.status === "queued");
  const pollInterval = hasActiveJobs ? 5000 : 30000;

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
  }, [refreshToken, pollInterval, locale, toast]);

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

  useEffect(() => {
    const urlFilter = searchParams.get("filter") ?? "all";
    const urlQ = searchParams.get("q") ?? "";
    urlSyncSource.current = "url";
    setFilter(urlFilter);
    setSearch(urlQ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function refreshJobs() {
    setRefreshToken((v) => v + 1);
  }

  const runningJobs = useMemo(
    () => allJobs.filter((j) => j.status === "running" || j.status === "queued"),
    [allJobs],
  );

  const historyJobs = useMemo(() => {
    const base = allJobs.filter((j) => j.status === "completed" || j.status === "failed" || j.status === "cancelled");
    const byStatus = filter && filter !== "all" && filter !== "running"
      ? base.filter((j) => j.status === filter)
      : base;
    if (!search.trim()) return byStatus;
    const q = search.toLowerCase();
    return byStatus.filter((j) =>
      j.job_id.toLowerCase().includes(q) ||
      j.contract_key.toLowerCase().includes(q) ||
      (j.target_model ?? "").toLowerCase().includes(q),
    );
  }, [allJobs, filter, search]);

  return (
    <>
      {runningJobs.length > 0 ? (
        <section className="audits-section">
          <header className="audits-section-head">
            <h2>
              {copy.sections.activeTasks}
              <span className="audits-section-count">{runningJobs.length}</span>
            </h2>
          </header>
          <div className="audits-running-grid">
            {runningJobs.slice(0, 4).map((job) => (
              <RunningCard key={job.job_id} job={job} locale={locale} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="audits-section">
        <header className="audits-section-head">
          <h2>{copy.sections.taskHistory}</h2>
          <div className="audits-history-controls">
            <div className="audits-select">
              <select
                value={filter === "running" ? "all" : filter}
                onChange={(e) => setFilter(e.target.value)}
                aria-label={copy.filters.statusGroupLabel}
              >
                <option value="all">{copy.filters.statusAll}</option>
                <option value="completed">{copy.filters.statusCompleted}</option>
                <option value="failed">{copy.filters.statusFailed}</option>
              </select>
              <ChevronDown size={13} strokeWidth={1.7} aria-hidden="true" />
            </div>
            <div className="audits-search">
              <Search size={13} strokeWidth={1.7} aria-hidden="true" />
              <input
                type="search"
                placeholder={copy.filters.searchPlaceholder}
                aria-label={copy.filters.searchLabel}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="audits-icon-btn"
              onClick={refreshJobs}
              aria-label={copy.retry}
              title={copy.retry}
            >
              <RefreshCw size={14} strokeWidth={1.7} aria-hidden="true" />
            </button>
          </div>
        </header>
        <HistoryTable
          jobs={historyJobs}
          locale={locale}
          loading={loading}
          loadError={loadError}
          onRefresh={refreshJobs}
        />
      </section>
    </>
  );
}
