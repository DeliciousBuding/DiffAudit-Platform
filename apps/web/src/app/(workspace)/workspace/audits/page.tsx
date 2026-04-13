import { fetchAttackDefenseTable } from "@/lib/attack-defense-table";
import { fetchAuditJobs } from "@/lib/audit-jobs";
import { fetchCatalogDashboard } from "@/lib/catalog";
import { StatusBadge } from "@/components/status-badge";
import { WorkspacePage } from "@/components/workspace-page";

export default async function WorkspaceAuditsPage() {
  const [catalog, table, jobs] = await Promise.all([
    fetchCatalogDashboard(),
    fetchAttackDefenseTable(),
    fetchAuditJobs(),
  ]);

  const recommendedContracts =
    catalog?.tracks.flatMap((track) => track.entries).slice(0, 3) ?? [];
  const recentRows = table?.rows.slice(0, 3) ?? [];

  return (
    <WorkspacePage
      eyebrow="Audits"
      title="创建任务、查看运行状态，并在同一页里查看结果。"
      description="审计流程页围绕 live contract、任务队列和结果摘要组织，不再保留演示控制台。"
    >
      <div className="grid gap-5 lg:grid-cols-[0.96fr_1.04fr]">
        <section className="surface-card p-6">
          <div className="caption">创建首条审计任务</div>
          <div className="mt-5 space-y-4">
            {recommendedContracts.length > 0 ? (
              recommendedContracts.map((entry) => (
                <article
                  key={entry.contractKey}
                  className="rounded-[22px] border border-border bg-white/55 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-base font-medium">{entry.label}</div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {entry.contractKey}
                      </p>
                    </div>
                    <StatusBadge
                      tone={
                        entry.availability === "ready"
                          ? "success"
                          : entry.availability === "partial"
                            ? "warning"
                            : "info"
                      }
                    >
                      {entry.availability}
                    </StatusBadge>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {entry.systemGap}
                  </p>
                  <div className="mt-4 flex items-center justify-between gap-3 rounded-[18px] border border-border bg-white/70 px-3 py-3 text-sm">
                    <span>推荐 workspace：{entry.bestWorkspace}</span>
                    <button type="button" className="portal-pill portal-pill-primary">
                      创建任务
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[22px] border border-border bg-white/55 p-4 text-sm leading-7 text-muted-foreground">
                当前还没有可创建的 contract，请先检查 catalog 数据源。
              </div>
            )}
          </div>
        </section>

        <section className="surface-card p-6">
          <div className="caption">当前运行任务</div>
          <div className="mt-5 space-y-4">
            {jobs && jobs.length > 0 ? (
              jobs.map((job) => (
                <article
                  key={job.jobId}
                  className="rounded-[22px] border border-border bg-white/55 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-base font-medium">{job.jobId}</div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {job.workspaceName}
                      </p>
                    </div>
                    <StatusBadge tone={job.statusTone}>{job.status}</StatusBadge>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-[18px] border border-border bg-white/70 px-3 py-3 text-sm">
                      {job.contractKey}
                    </div>
                    <div className="rounded-[18px] border border-border bg-white/70 px-3 py-3 text-sm">
                      最近更新 {job.updatedAtLabel}
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {job.error || job.summaryPath}
                  </p>
                </article>
              ))
            ) : (
              <div className="rounded-[22px] border border-border bg-white/55 p-4 text-sm leading-7 text-muted-foreground">
                当前还没有可展示的运行任务。
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="surface-card mt-5 p-6">
        <div className="caption">结果摘要</div>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {recentRows.length > 0 ? (
            recentRows.map((row) => (
              <article
                key={`${row.track}-${row.attack}-${row.defense}`}
                className="rounded-[22px] border border-border bg-white/55 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-base font-medium">{row.attack}</div>
                  <StatusBadge tone="info">{row.evidenceLevel}</StatusBadge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{row.model}</p>
                <div className="mt-4 grid gap-2 text-sm">
                  <div>AUC {row.aucLabel}</div>
                  <div>ASR {row.asrLabel}</div>
                  <div>TPR {row.tprLabel}</div>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[22px] border border-border bg-white/55 p-4 text-sm leading-7 text-muted-foreground lg:col-span-3">
              当前无法读取结果摘要，请稍后再试。
            </div>
          )}
        </div>
      </section>
    </WorkspacePage>
  );
}
