import { fetchAttackDefenseTable } from "@/lib/attack-defense-table";
import { fetchCatalogDashboard } from "@/lib/catalog";
import { StatusBadge } from "@/components/status-badge";
import { WorkspacePage } from "@/components/workspace-page";

export default async function WorkspaceReportsPage() {
  const [catalog, table] = await Promise.all([
    fetchCatalogDashboard(),
    fetchAttackDefenseTable(),
  ]);

  const rows = table?.rows ?? [];
  const contracts = catalog?.tracks.flatMap((track) => track.entries).slice(0, 4) ?? [];

  return (
    <WorkspacePage
      eyebrow="Reports"
      title="结果汇总、当前系统缺口和导出动作都在这里。"
      description="报告页围绕 admitted 主表、当前 contract gap 和导出动作组织结果视图。"
    >
      <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="surface-card p-6">
          <div className="caption">结果汇总</div>
          <div className="mt-5 space-y-4">
            {rows.length > 0 ? (
              rows.map((row) => (
                <article key={`${row.track}-${row.attack}-${row.defense}`} className="rounded-[22px] border border-border bg-white/55 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-base font-medium">{row.attack}</div>
                      <p className="mt-1 text-sm text-muted-foreground">{row.model}</p>
                    </div>
                    <StatusBadge tone="info">{row.evidenceLevel}</StatusBadge>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-[18px] border border-border bg-white/70 px-3 py-3 text-sm">AUC {row.aucLabel}</div>
                    <div className="rounded-[18px] border border-border bg-white/70 px-3 py-3 text-sm">ASR {row.asrLabel}</div>
                    <div className="rounded-[18px] border border-border bg-white/70 px-3 py-3 text-sm">TPR {row.tprLabel}</div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[22px] border border-border bg-white/55 p-4 text-sm leading-7 text-muted-foreground">
                当前无法读取 admitted 主表，请稍后重试。
              </div>
            )}
          </div>
        </section>

        <section className="surface-card p-6">
          <div className="caption">当前 gap 与导出</div>
          <div className="mt-5 space-y-4">
            {contracts.length > 0 ? (
              contracts.map((entry) => (
                <article key={entry.contractKey} className="rounded-[22px] border border-border bg-white/55 p-4">
                  <div className="mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{entry.contractKey}</div>
                  <div className="mt-2 text-base font-medium">{entry.label}</div>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{entry.systemGap}</p>
                </article>
              ))
            ) : (
              <div className="rounded-[22px] border border-border bg-white/55 p-4 text-sm leading-7 text-muted-foreground">
                暂无 contract gap 可展示。
              </div>
            )}
            <button type="button" className="portal-pill portal-pill-primary w-full">
              导出当前报告摘要
            </button>
          </div>
        </section>
      </div>
    </WorkspacePage>
  );
}
