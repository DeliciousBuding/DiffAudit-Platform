"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Download, FileText, RefreshCw } from "lucide-react";

import { CopyButton } from "@/components/copy-button";
import { EmptyState } from "@/components/empty-state";
import { type Locale } from "@/components/language-picker";
import { StatusBadge } from "@/components/status-badge";
import { normalizeAuditJobList } from "@/lib/audit-job-payload";
import { buildCompletedJobReportHref, inferReportTrack, type AuditReportTrack } from "@/lib/audit-flow";
import { formatCompactTime, formatDuration, formatMetricValue } from "@/lib/format";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";

type ReportJob = {
  job_id: string;
  status: string;
  contract_key: string;
  workspace_name: string;
  job_type: string;
  created_at: string;
  updated_at: string;
  target_model?: string | null;
  summary_note?: string | null;
  metrics?: {
    auc?: number;
    asr?: number;
    tpr?: number;
  };
};

function trackLabel(track: AuditReportTrack | null, locale: Locale) {
  if (track === "black-box") return locale === "zh-CN" ? "Recon / 黑盒" : "Recon / Black-box";
  if (track === "gray-box") return locale === "zh-CN" ? "PIA / 灰盒" : "PIA / Gray-box";
  if (track === "white-box") return locale === "zh-CN" ? "GSA / 白盒" : "GSA / White-box";
  return "--";
}

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

export function ReportsPageClient({ locale }: { locale: Locale }) {
  const copy = WORKSPACE_COPY[locale].reports;
  const [jobs, setJobs] = useState<ReportJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  async function loadJobs(signal?: AbortSignal) {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/audit/jobs", { cache: "no-store", signal });
      if (!res.ok) {
        setLoadError(true);
        return;
      }
      const payload = await res.json();
      const normalized = normalizeAuditJobList<ReportJob>(payload);
      setJobs(normalized ?? []);
      setLoadError(false);
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        setLoadError(true);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    void loadJobs(controller.signal);
    return () => controller.abort();
  }, []);

  const completedJobs = useMemo(
    () =>
      jobs
        .filter((job) => job.status === "completed")
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
    [jobs],
  );

  function exportCsv() {
    const header = ["job_id", "model", "track", "contract_key", "workspace", "created_at", "updated_at", "auc", "asr", "tpr", "report_url"];
    const rows = completedJobs.map((job) => {
      const reportHref = buildCompletedJobReportHref(job) ?? "";
      const track = inferReportTrack(job);
      return [
        job.job_id,
        job.target_model ?? "",
        trackLabel(track, locale),
        job.contract_key,
        job.workspace_name,
        job.created_at,
        job.updated_at,
        formatMetricValue(job.metrics?.auc),
        formatMetricValue(job.metrics?.asr),
        formatMetricValue(job.metrics?.tpr),
        reportHref,
      ];
    });
    const csv = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `diffaudit-task-reports-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return <div className="h-80 animate-pulse rounded-2xl border border-border bg-muted/10" />;
  }

  if (loadError) {
    return (
      <EmptyState
        icon={RefreshCw}
        title={locale === "zh-CN" ? "报告列表加载失败" : "Could not load reports"}
        description={locale === "zh-CN" ? "任务接口暂时不可用，请重试。" : "The task endpoint is not available. Try again."}
        action={{ label: locale === "zh-CN" ? "重试" : "Retry", onClick: () => loadJobs() }}
      />
    );
  }

  if (completedJobs.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title={copy.emptyResults}
        description={locale === "zh-CN" ? "完成任务后，每条任务报告会在这里按行显示。" : "Completed task reports will appear here as rows."}
        action={{ label: copy.createAuditTask, href: "/workspace/audits/new" }}
      />
    );
  }

  return (
    <section className="workspace-section-card">
      <div className="workspace-section-card-header">
        <div>
          <h2 className="workspace-section-card-title">{locale === "zh-CN" ? "任务报告" : "Task reports"}</h2>
          <p className="mt-1 text-[12px] text-muted-foreground">
            {locale === "zh-CN"
              ? "按完成任务汇总报告；同一模型的 Recon、PIA、GSA 会分别成行，方便统一查看和导出。"
              : "Reports are grouped by completed task. Recon, PIA, and GSA runs for the same model remain separate rows."}
          </p>
        </div>
        <button type="button" onClick={exportCsv} className="workspace-btn-secondary px-3 py-2 text-xs font-medium">
          <Download size={14} strokeWidth={1.5} aria-hidden="true" />
          {locale === "zh-CN" ? "导出列表" : "Export list"}
        </button>
      </div>
      <div ref={tableRef} className="workspace-table-scroll" role="region" aria-label={locale === "zh-CN" ? "任务报告表" : "Task reports table"}>
        <table className="workspace-data-table w-full border-collapse text-[13px]">
          <thead className="sticky top-0 bg-muted/30">
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{locale === "zh-CN" ? "任务" : "Task"}</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{copy.tableHeaders.model}</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{copy.tableHeaders.track}</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{copy.tableHeaders.auc}</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{locale === "zh-CN" ? "完成时间" : "Completed"}</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{locale === "zh-CN" ? "操作" : "Actions"}</th>
            </tr>
          </thead>
          <tbody>
            {completedJobs.map((job) => {
              const track = inferReportTrack(job);
              const reportHref = buildCompletedJobReportHref(job);
              return (
                <tr key={job.job_id} className="border-b border-border/40 transition-colors hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="mono text-xs font-medium whitespace-nowrap">{job.job_id}</span>
                      <CopyButton text={job.job_id} label="job ID" />
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground">{job.workspace_name}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="mono text-xs whitespace-nowrap">{job.target_model ?? "--"}</span>
                    <div className="mt-1 max-w-[22rem] truncate text-[11px] text-muted-foreground">{job.summary_note ?? job.contract_key}</div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={track === "white-box" ? "warning" : track === "gray-box" ? "info" : "neutral"}>
                      {trackLabel(track, locale)}
                    </StatusBadge>
                  </td>
                  <td className="mono px-4 py-3 text-right text-xs">{formatMetricValue(job.metrics?.auc)}</td>
                  <td className="px-4 py-3">
                    <span className="mono text-xs text-muted-foreground">{formatCompactTime(job.updated_at, locale)}</span>
                    <div className="mt-1 text-[11px] text-muted-foreground">{formatDuration(job.created_at, job.updated_at, locale)}</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/workspace/audits/${encodeURIComponent(job.job_id)}`} className="text-xs text-[var(--accent-blue)] hover:underline">
                        {locale === "zh-CN" ? "任务详情" : "Task"}
                      </Link>
                      {reportHref ? (
                        <Link href={reportHref} className="text-xs text-[var(--accent-blue)] hover:underline">
                          {copy.view}
                        </Link>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
