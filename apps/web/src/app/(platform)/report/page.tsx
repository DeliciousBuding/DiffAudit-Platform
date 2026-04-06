import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { toEvidenceViewModel } from "@/lib/audit-client";
import { fetchBestReconReport } from "@/lib/recon-report";

const unavailableActions = [
  {
    title: "稍后重试读取证据摘要",
    note: "如果当前摘要源短暂不可用，系统恢复后会继续展示最新的已发布证据。",
  },
  {
    title: "改看最近一次已导出的证据副本",
    note: "如果你手头已有这条线的上一次导出结果，可以暂时先基于那份证据继续沟通。",
  },
  {
    title: "等待最新摘要恢复后再更新结论",
    note: "摘要恢复前，不要把临时口头判断升级为正式结论。",
  },
];

const reportActions = [
  {
    title: "先确认当前证据状态与运行模式",
    note: "优先阅读当前状态、运行模式和 headline metrics，再决定这份证据是否适合继续引用。",
  },
  {
    title: "沿着当前 workspace 继续追踪同一份证据",
    note: "如果需要继续深读或复核，围绕当前 workspace 和 summary 路径往下追，不要切到另一份未对齐的摘要。",
  },
  {
    title: "把跨轨道判断留给系统状态页",
    note: "这页只解释当前这份 evidence，本线之外的成熟度和入口状态继续回到系统状态页查看。",
  },
];

export default async function ReportPage() {
  const report = await fetchBestReconReport();

  if (!report) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="研究报告"
          description="当前页优先展示最佳 black-box recon 证据；如果读取失败，就暂停引用这份 evidence，等待摘要恢复。"
        />

        <SectionCard
          eyebrow="当前状态"
          title="最佳 recon 证据暂不可用"
          description="未能从平台后端读取当前最佳实验摘要。现在不应该继续引用演示结论，而应该先恢复真实数据链。"
          className="overflow-hidden bg-[linear-gradient(135deg,hsl(28_94%_94%),transparent_48%),linear-gradient(180deg,color-mix(in_srgb,var(--card)_92%,transparent),color-mix(in_srgb,var(--card)_88%,transparent))]"
        >
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone="warning">backend unavailable</StatusBadge>
              <StatusBadge tone="info">waiting for recon summary</StatusBadge>
            </div>

            <div className="rounded-[26px] border border-[color:var(--warning-soft)] bg-white/60 p-5 shadow-[0_20px_60px_hsl(30_60%_28%/0.08)]">
              <div className="text-[30px] font-semibold leading-tight tracking-tight">
                真实摘要链断了，页面现在应该优先恢复数据入口，而不是继续输出结论性文案。
              </div>
              <p className="mt-3 max-w-[60ch] text-sm leading-7 text-muted-foreground">
                这意味着当前无法安全引用这份 evidence。最稳妥的做法是等待摘要恢复，再基于同一份已发布证据继续判断。
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
    { label: "运行模式", value: evidence.executionMode, sub: "best evidence mode", iconLabel: "MD", tone: "info" as const },
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
        title="研究报告"
        description="当前页直接读取最佳 black-box recon 证据，把平台展示口径对齐到研究仓库当前已发布的证据摘要。"
      />

      <SectionCard
        eyebrow="执行摘要"
        title={`当前最佳 recon 证据来自 ${evidence.workspace.name}`}
        description="这页不再声称单张图像已经被审计，也不再引用演示态成员结论；它只陈述当前研究主线里最强的一份 recon 证据。"
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
                这页展示的是当前已发布的最佳 recon 证据摘要，用来陈述事实证据，而不是代替研究结论之外的推断。
              </div>
              <p className="mt-3 max-w-[58ch] text-sm leading-7 text-muted-foreground">
                当前证据的核心信息是状态、运行模式、论文方法与 headline metrics。更进一步的复核可以继续沿着同一份 workspace 和 summary 往下追踪。
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
          description="页面只保留当前最重要的三条事实，避免继续沿用旧的演示文案。"
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
          description="这里展示的是实验摘要本身，而不是单图审计结论。"
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
        title="基于这份最佳证据继续推进"
        description="后续动作统一围绕当前 best evidence 展开，避免不同页面和不同摘要源给出相互冲突的结论。"
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
