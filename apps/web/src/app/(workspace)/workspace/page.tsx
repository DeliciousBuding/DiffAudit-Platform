import { fetchAttackDefenseTable } from "@/lib/attack-defense-table";
import { fetchCatalogDashboard } from "@/lib/catalog";
import { StatusBadge } from "@/components/status-badge";
import { WorkspacePage } from "@/components/workspace-page";

function Kpi({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="workspace-kpi">
      <div className="workspace-kpi-label">{label}</div>
      <div className="workspace-kpi-value">{value}</div>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">{note}</p>
    </div>
  );
}

export default async function WorkspaceHomePage() {
  const [catalog, table] = await Promise.all([
    fetchCatalogDashboard(),
    fetchAttackDefenseTable(),
  ]);

  const activeContracts = catalog?.stats.total ?? 0;
  const defendedRows = table?.stats.defended ?? 0;
  const recentRows = table?.rows.slice(0, 3) ?? [];

  return (
    <WorkspacePage
      eyebrow="Workspace"
      title="个人待办、最近审计和关键指标在同一个工作台里闭环。"
      description="工作台首页集中处理待办、结果和关键指标，是统一网站里的日常操作入口。"
      aside={
        <>
          <Kpi label="Live contracts" value={String(activeContracts)} note="当前 catalog 中可读取的合同项数量。" />
          <Kpi label="Defended rows" value={String(defendedRows)} note="当前 admitted 主表中带防御对照的结果行。" />
        </>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="surface-card p-6">
          <div className="caption">个人待办</div>
          <div className="mt-5 space-y-4">
            {[
              "检查本轮审计任务的参数与数据源。",
              "查看最新 admitted 结果，确认是否需要导出报告。",
              "在设置页同步团队、密钥和个人偏好。",
            ].map((item, index) => (
              <div key={item} className="flex items-start gap-3 rounded-[22px] border border-border bg-white/55 p-4">
                <span className="mono inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs">
                  {index + 1}
                </span>
                <p className="text-sm leading-7">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="surface-card p-6">
          <div className="caption">最近审计</div>
          <div className="mt-5 space-y-4">
            {recentRows.length > 0 ? (
              recentRows.map((row) => (
                <article key={`${row.track}-${row.attack}-${row.defense}`} className="rounded-[22px] border border-border bg-white/55 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-base font-medium">{row.attack}</div>
                      <p className="mt-1 text-sm text-muted-foreground">{row.model}</p>
                    </div>
                    <StatusBadge tone="info">{row.track}</StatusBadge>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{row.note}</p>
                </article>
              ))
            ) : (
              <div className="rounded-[22px] border border-border bg-white/55 p-4 text-sm leading-7 text-muted-foreground">
                当前未读取到最近审计结果，可前往审计流程页发起任务。
              </div>
            )}
          </div>
        </section>
      </div>
    </WorkspacePage>
  );
}
