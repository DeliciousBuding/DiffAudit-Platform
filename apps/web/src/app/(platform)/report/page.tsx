import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { toEvidenceViewModel } from "@/lib/audit-client";
import { fetchBestReconReport } from "@/lib/recon-report";

const unavailableActions = [
  {
    title: "稍后重试",
    note: "摘要恢复后可继续查看最新已发布证据。",
  },
  {
    title: "查看最近一次导出结果",
    note: "如已持有上一版导出结果，可先据此核对。",
  },
  {
    title: "待摘要恢复后更新结论",
    note: "摘要恢复前，不建议更新正式结论。",
  },
];

const reportActions = [
  {
    title: "先确认状态与运行模式",
    note: "优先核对状态、运行模式和关键指标。",
  },
  {
    title: "沿当前 workspace 继续追踪",
    note: "需要复核时，继续查看当前 workspace 和摘要路径。",
  },
  {
    title: "跨轨道信息回到系统状态页查看",
    note: "其他轨道的入口和成熟度请在系统状态页查看。",
  },
];

export default async function ReportPage() {
  const report = await fetchBestReconReport();

  if (!report) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="证据报告"
          description="查看当前证据摘要和关键指标。"
        />

        <SectionCard
          eyebrow="当前状态"
          title="当前证据暂不可用"
          description="未能从平台后端读取当前摘要，请稍后重试。"
          className="overflow-hidden bg-[linear-gradient(135deg,hsl(28_94%_94%),transparent_48%),linear-gradient(180deg,color-mix(in_srgb,var(--card)_92%,transparent),color-mix(in_srgb,var(--card)_88%,transparent))]"
        >
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone="warning">backend unavailable</StatusBadge>
              <StatusBadge tone="info">waiting for recon summary</StatusBadge>
            </div>

            <div className="rounded-[26px] border border-[color:var(--warning-soft)] bg-white/60 p-5 shadow-[0_20px_60px_hsl(30_60%_28%/0.08)]">
              <div className="text-[30px] font-semibold leading-tight tracking-tight">
                当前无法加载证据摘要。
              </div>
              <p className="mt-3 max-w-[60ch] text-sm leading-7 text-muted-foreground">
                请在摘要恢复后再继续查看或引用当前证据。
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="恢复动作"
          title="先恢复真实摘要，再继续上层联调"
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

  const evidence = toEvidenceViewModel(report);

  const evidenceMetrics = [
    {
      label: "AUC",
      value: evidence.metrics.aucLabel,
      sub: "headline metric",
      iconLabel: "AU",
      tone: "warning" as const,
    },
    {
      label: "ASR",
      value: evidence.metrics.asrLabel,
      sub: "attack success rate",
      iconLabel: "AR",
      tone: "primary" as const,
    },
    {
      label: "TPR @ 1% FPR",
      value: evidence.metrics.tprLabel,
      sub: "low-fpr sensitivity",
      iconLabel: "TP",
      tone: "success" as const,
    },
    {
      label: "运行模式",
      value: evidence.executionMode,
      sub: "best evidence mode",
      iconLabel: "MD",
      tone: "info" as const,
    },
  ];

  const evidenceSummary = [
    {
      title: "当前状态",
      detail: evidence.status.label,
    },
    {
      title: "运行模式",
      detail: evidence.executionMode,
    },
    {
      title: "论文 / 方法",
      detail: `${evidence.context.paper} / ${evidence.context.method}`,
    },
  ];

  const scopeDetails = [
    { label: "Best workspace", value: evidence.workspace.path },
    { label: "Summary path", value: evidence.summaryPath },
    { label: "Backend stack", value: evidence.backendLabel },
    { label: "Status", value: evidence.status.label },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="证据报告"
        description="查看当前证据摘要和关键指标。"
      />

      <SectionCard
        eyebrow="执行摘要"
        title={`当前证据来自 ${evidence.workspace.name}`}
        description="展示当前证据摘要。"
        className="overflow-hidden bg-[linear-gradient(135deg,hsl(36_95%_94%),transparent_48%),linear-gradient(180deg,color-mix(in_srgb,var(--card)_92%,transparent),color-mix(in_srgb,var(--card)_88%,transparent))] dark:bg-[linear-gradient(135deg,hsl(36_70%_24%/0.45),transparent_52%),linear-gradient(180deg,hsl(220_13%_15%/0.92),hsl(220_13%_14%/0.88))]"
      >
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone={evidence.status.tone}>{evidence.status.label}</StatusBadge>
              <StatusBadge tone="info">{evidence.context.paper}</StatusBadge>
              <StatusBadge tone="primary">{evidence.backendLabel}</StatusBadge>
            </div>

            <div className="rounded-[26px] border border-[color:var(--warning-soft)] bg-white/60 p-5 shadow-[0_20px_60px_hsl(30_60%_28%/0.08)] dark:bg-white/6">
              <div className="text-[30px] font-semibold leading-tight tracking-tight">
                当前证据摘要
              </div>
              <p className="mt-3 max-w-[58ch] text-sm leading-7 text-muted-foreground">
                状态、运行模式、论文方法与关键指标。
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <SummaryTile label="Best workspace" value={evidence.workspace.name} sub={evidence.executionMode} />
            <SummaryTile label="Backend stack" value={evidence.backendLabel} sub={evidence.context.paper} />
            <SummaryTile label="Summary path" value={evidence.summaryPath} sub={evidence.status.label} />
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {evidenceMetrics.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard
          eyebrow="证据链摘要"
          title="最佳证据摘要"
          description="当前最重要的三条事实。"
        >
          <div className="space-y-3">
            {evidenceSummary.map((item) => (
              <div
                key={item.title}
                className="rounded-[24px] border border-border bg-white/45 p-4 dark:bg-white/5"
              >
                <div className="text-sm font-semibold text-foreground">{item.title}</div>
                <p className="mt-2 break-all text-sm leading-6 text-muted-foreground">{item.detail}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="研究对象"
          title="当前摘要信息"
          description="实验摘要信息。"
        >
          <div className="space-y-3">
            {scopeDetails.map((item) => (
              <DetailRow key={item.label} label={item.label} value={item.value} />
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
