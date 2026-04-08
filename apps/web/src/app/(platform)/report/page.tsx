import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { fetchAttackDefenseTable } from "@/lib/attack-defense-table";
import { fetchCatalogDashboard } from "@/lib/catalog";

const unavailableActions = [
  {
    title: "稍后重试",
    note: "主表恢复后可继续查看最新 admitted 结果。",
  },
  {
    title: "先回到系统状态页",
    note: "如需整体判断三条线状态，可先回系统状态页核对。",
  },
  {
    title: "待主表恢复后更新结论",
    note: "主表恢复前，不建议更新正式对外结论。",
  },
];

const reportActions = [
  {
    title: "先看 admitted 主结果",
    note: "优先核对各轨道 admitted 行的攻击、防御和关键指标。",
  },
  {
    title: "再看当前系统缺口",
    note: "当前 gap 说明的是还能做什么、还不能宣称什么。",
  },
  {
    title: "跨轨道总览回到系统状态页",
    note: "整体数量和成熟度分布继续在系统状态页查看。",
  },
];

export default async function ReportPage() {
  const [catalog, attackDefenseTable] = await Promise.all([
    fetchCatalogDashboard(),
    fetchAttackDefenseTable(),
  ]);

  if (!catalog || !attackDefenseTable) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="证据报告"
          description="查看当前 admitted 结果和系统缺口。"
        />

        <SectionCard
          eyebrow="当前状态"
          title="当前 admitted 结果暂不可用"
          description="未能从平台后端读取统一主表或目录状态，请稍后重试。"
          className="overflow-hidden bg-[linear-gradient(135deg,hsl(28_94%_94%),transparent_48%),linear-gradient(180deg,color-mix(in_srgb,var(--card)_92%,transparent),color-mix(in_srgb,var(--card)_88%,transparent))]"
        >
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone="warning">backend unavailable</StatusBadge>
              <StatusBadge tone="info">waiting for admitted evidence table</StatusBadge>
            </div>

            <div className="rounded-[26px] border border-[color:var(--warning-soft)] bg-white/60 p-5 shadow-[0_20px_60px_hsl(30_60%_28%/0.08)]">
              <div className="text-[30px] font-semibold leading-tight tracking-tight">
                当前无法加载 admitted 结果详情。
              </div>
              <p className="mt-3 max-w-[60ch] text-sm leading-7 text-muted-foreground">
                请在主表恢复后再继续查看或引用当前结果。
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="恢复动作"
          title="先恢复主表与目录，再继续上层联调"
          description="这三步是当前最短恢复路径。"
        >
          <div className="space-y-3">
            {unavailableActions.map((item, index) => (
              <ActionCard key={item.title} index={index + 1} {...item} />
            ))}
          </div>
        </SectionCard>
      </div>
    );
  }

  const summaryStats = [
    {
      label: "Admitted Rows",
      value: String(attackDefenseTable.stats.total),
      sub: "主表有效结果行",
      iconLabel: "AR",
      tone: "warning" as const,
    },
    {
      label: "Defended",
      value: String(attackDefenseTable.stats.defended),
      sub: "含防御对照的 admitted 行",
      iconLabel: "DF",
      tone: "primary" as const,
    },
    {
      label: "Attack-only",
      value: String(attackDefenseTable.stats.undefended),
      sub: "纯攻击 admitted 行",
      iconLabel: "AT",
      tone: "success" as const,
    },
    {
      label: "Live Contracts",
      value: String(catalog.stats.total),
      sub: "目录中的可读合同项",
      iconLabel: "CT",
      tone: "info" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="证据报告"
        description="查看当前 admitted 攻击、防御结果和系统缺口。"
      />

      <SectionCard
        eyebrow="执行摘要"
        title="当前 admitted 结果详情"
        description="这里展示的是当前系统已经承认、可直接被平台消费的结果，而不是单条 best evidence 快照。"
        className="overflow-hidden bg-[linear-gradient(135deg,hsl(36_95%_94%),transparent_48%),linear-gradient(180deg,color-mix(in_srgb,var(--card)_92%,transparent),color-mix(in_srgb,var(--card)_88%,transparent))] dark:bg-[linear-gradient(135deg,hsl(36_70%_24%/0.45),transparent_52%),linear-gradient(180deg,hsl(220_13%_15%/0.92),hsl(220_13%_14%/0.88))]"
      >
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone="success">{attackDefenseTable.stats.total} admitted rows</StatusBadge>
              <StatusBadge tone="warning">{attackDefenseTable.stats.defended} defended</StatusBadge>
              <StatusBadge tone="info">{catalog.stats.total} live contracts</StatusBadge>
            </div>

            <div className="rounded-[26px] border border-[color:var(--warning-soft)] bg-white/60 p-5 shadow-[0_20px_60px_hsl(30_60%_28%/0.08)] dark:bg-white/6">
              <div className="text-[30px] font-semibold leading-tight tracking-tight">
                报告页现在优先展示 admitted 主表。
              </div>
              <p className="mt-3 max-w-[58ch] text-sm leading-7 text-muted-foreground">
                单条最佳摘要不再单独主导报告页，当前重点是 admitted 行与系统缺口。
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <SummaryTile
              label="Tracks covered"
              value={`${catalog.tracks.filter((track) => track.total > 0).length}`}
              sub="当前目录中有合同项的轨道数"
            />
            <SummaryTile
              label="Admitted defended"
              value={`${attackDefenseTable.stats.defended}`}
              sub="主表中含防御对照的结果数"
            />
            <SummaryTile
              label="Live contracts"
              value={`${catalog.stats.total}`}
              sub="catalog 中当前可读取的合同数"
            />
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryStats.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard
          eyebrow="主结果"
          title="Admitted 攻防结果"
          description="按主表逐条查看当前 admitted 攻击、防御和关键指标。"
        >
          <div className="space-y-3">
            {attackDefenseTable.rows.map((row) => (
              <div
                key={`${row.track}-${row.attack}-${row.defense}`}
                className="rounded-[24px] border border-border bg-white/45 p-4 dark:bg-white/5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                      {row.track}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-foreground">{row.attack}</div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {row.defense === "none" ? "无防御对照" : row.defense}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge tone="info">{row.evidenceLevel}</StatusBadge>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <DetailRow label="Model" value={row.model} />
                  <DetailRow label="AUC / ASR / TPR@1%FPR" value={`${row.aucLabel} / ${row.asrLabel} / ${row.tprLabel}`} />
                  <DetailRow label="Quality / Cost" value={row.qualityCost} />
                  <DetailRow label="Note" value={row.note} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="系统缺口"
          title="当前 live contract gap"
          description="这些 gap 决定了系统现在还能做什么、还不能越权宣称什么。"
        >
          <div className="space-y-3">
            {catalog.tracks.flatMap((track) => track.entries).map((entry) => (
              <div
                key={entry.contractKey}
                className="rounded-[24px] border border-border bg-white/45 p-4 dark:bg-white/5"
              >
                <div className="mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  {entry.contractKey}
                </div>
                <div className="mt-1 text-sm font-semibold text-foreground">{entry.label}</div>
                <div className="mt-3 space-y-3">
                  <DetailRow label="Current gap" value={entry.systemGap} />
                  <DetailRow label="Best workspace" value={entry.bestWorkspace} />
                  <DetailRow label="Evidence level" value={entry.evidenceLevel} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        eyebrow="下一步"
        title="后续操作"
        description="围绕当前证据继续推进。"
      >
        <div className="space-y-3">
          {reportActions.map((item, index) => (
            <ActionCard key={item.title} index={index + 1} {...item} />
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function SummaryTile({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-[24px] border border-border bg-white/55 p-4 dark:bg-white/5">
      <div className="mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
      <div className="mt-3 break-all text-2xl font-semibold tracking-tight">{value}</div>
      <div className="mt-2 break-all text-sm leading-6 text-muted-foreground">{sub}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-border bg-white/45 px-4 py-3 dark:bg-white/5">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-2 break-all text-sm font-medium leading-6 text-foreground">{value}</div>
    </div>
  );
}

function ActionCard({
  index,
  title,
  note,
}: {
  index: number;
  title: string;
  note: string;
}) {
  return (
    <div className="rounded-[24px] border border-border bg-white/45 p-4 dark:bg-white/5">
      <div className="flex items-center gap-3">
        <span className="mono inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {index}
        </span>
        <div className="text-sm font-semibold text-foreground">{title}</div>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{note}</p>
    </div>
  );
}
