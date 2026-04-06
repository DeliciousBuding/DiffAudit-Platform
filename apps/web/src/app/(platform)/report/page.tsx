import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { fetchBestReconReport } from "@/lib/recon-report";

const unavailableActions = [
  {
    title: "确认平台后端与本地 API 都已启动",
    owner: "平台 / 本地 API",
    note: "先检查 8780 平台网关和 8765 研究 API，再重试读取最佳 recon 摘要。",
  },
  {
    title: "核对 blackbox-status 是否仍指向有效 summary.json",
    owner: "研究实验",
    note: "当前页面依赖 /api/v1/experiments/recon/best 指向的 source of truth。",
  },
  {
    title: "恢复后再同步飞书与平台展示",
    owner: "飞书治理 / 平台",
    note: "不要在摘要缺失时继续发布演示结论，避免状态口径再次漂移。",
  },
];

const reportActions = [
  {
    title: "继续以 blackbox-status 作为 recon 主结论入口",
    owner: "研究实验",
    note: "平台页只展示当前最佳证据，不再自己挑 summary，避免与研究口径分叉。",
  },
  {
    title: "围绕当前最佳 workspace 做下一轮 artifact replay 或报告发布",
    owner: "平台 / 飞书治理",
    note: "后续操作统一围绕这份 best evidence，减少“展示一套、实验一套”的分裂状态。",
  },
  {
    title: "补齐 dashboard 的真实读链",
    owner: "平台前端",
    note: "report 已有真实摘要后，下一步再把 dashboard 从静态仪表盘推进到真实状态概览。",
  },
];

export default async function ReportPage() {
  const report = await fetchBestReconReport();

  if (!report) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="研究报告"
          description="当前页优先展示最佳 black-box recon 证据；如果读取失败，就明确告诉接手者缺什么，而不是继续展示演示结论。"
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
                先恢复平台 API 到研究 API 的读链，再继续讨论展示层和飞书同步。否则只是在放大旧的演示态误导。
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

  const reportMetrics = [
    { label: "AUC", value: report.aucLabel, sub: "headline metric", iconLabel: "AU", tone: "warning" as const },
    { label: "ASR", value: report.asrLabel, sub: "attack success rate", iconLabel: "AR", tone: "primary" as const },
    { label: "TPR @ 1% FPR", value: report.tprLabel, sub: "low-fpr sensitivity", iconLabel: "TP", tone: "success" as const },
    { label: "运行模式", value: report.mode, sub: "best evidence mode", iconLabel: "MD", tone: "info" as const },
  ];

  const evidenceSummary = [
    {
      title: "当前最佳 workspace",
      detail: report.workspaceName,
    },
    {
      title: "后端 / 调度器",
      detail: report.backendLabel,
    },
    {
      title: "报告来源",
      detail: report.summaryPath,
    },
  ];

  const scopeDetails = [
    { label: "Paper", value: report.paper },
    { label: "Method", value: report.method },
    { label: "Workspace Path", value: report.workspacePath },
    { label: "Status", value: report.statusLabel },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="研究报告"
        description="当前页直接读取最佳 black-box recon 证据，把平台展示口径对齐到研究仓库的 source of truth。"
      />

      <SectionCard
        eyebrow="执行摘要"
        title={`当前最佳 recon 证据来自 ${report.workspaceName}`}
        description="这页不再声称单张图像已经被审计，也不再引用演示态成员结论；它只陈述当前研究主线里最强的一份 recon 证据。"
        className="overflow-hidden bg-[linear-gradient(135deg,hsl(36_95%_94%),transparent_48%),linear-gradient(180deg,color-mix(in_srgb,var(--card)_92%,transparent),color-mix(in_srgb,var(--card)_88%,transparent))] dark:bg-[linear-gradient(135deg,hsl(36_70%_24%/0.45),transparent_52%),linear-gradient(180deg,hsl(220_13%_15%/0.92),hsl(220_13%_14%/0.88))]"
      >
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone={report.statusTone}>{report.statusLabel}</StatusBadge>
              <StatusBadge tone="info">{report.paper}</StatusBadge>
              <StatusBadge tone="primary">{report.backendLabel}</StatusBadge>
            </div>

            <div className="rounded-[26px] border border-[color:var(--warning-soft)] bg-white/60 p-5 shadow-[0_20px_60px_hsl(30_60%_28%/0.08)] dark:bg-white/6">
              <div className="text-[30px] font-semibold leading-tight tracking-tight">
                平台现在展示的是研究主线的最佳 recon 摘要，不再把 mock 结论伪装成真实审计结果。
              </div>
              <p className="mt-3 max-w-[58ch] text-sm leading-7 text-muted-foreground">
                当前证据的核心信息是 workspace、运行模式、后端组合和 headline metrics。更进一步的判断应该继续回到研究 summary，而不是由页面自己发明语义。
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <SummaryTile label="Best workspace" value={report.workspaceName} sub={report.mode} />
            <SummaryTile label="Backend stack" value={report.backendLabel} sub={report.paper} />
            <SummaryTile label="Summary path" value="source of truth" sub={report.summaryPath} />
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {reportMetrics.map((metric) => (
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
        description="后续动作统一围绕当前 best evidence 展开，避免平台、研究和飞书各说各话。"
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
  owner,
  note,
}: {
  index: number;
  title: string;
  owner: string;
  note: string;
}) {
  return (
    <div className="rounded-[24px] border border-border bg-white/45 p-4 dark:bg-white/5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="mono inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {index}
          </span>
          <div className="text-sm font-semibold text-foreground">{title}</div>
        </div>
        <div className="mono text-xs text-muted-foreground">{owner}</div>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{note}</p>
    </div>
  );
}
