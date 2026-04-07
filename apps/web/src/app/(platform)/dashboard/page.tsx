import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { fetchCatalogDashboard, type CatalogAvailability } from "@/lib/catalog";

const catalogActions = [
  {
    title: "仅展示已发布条目",
    note: "首页仅展示已进入目录的能力和证据状态。",
  },
  {
    title: "未发布轨道保留入口",
    note: "Gray-box 和 White-box 保留入口，但不展示未发布内容。",
  },
  {
    title: "证据细节在报告页查看",
    note: "单条证据的详细信息统一在报告页查看。",
  },
];

const trackTone: Record<string, "primary" | "warning" | "info"> = {
  "black-box": "primary",
  "gray-box": "warning",
  "white-box": "info",
};

const availabilityTone: Record<CatalogAvailability, "success" | "warning" | "info"> = {
  ready: "success",
  partial: "warning",
  planned: "info",
};

export default async function DashboardPage() {
  const catalog = await fetchCatalogDashboard();

  if (!catalog) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="系统状态"
          description="统一查看 black-box、gray-box、white-box 三条线的状态、证据和可用入口。"
        />

        <SectionCard
          eyebrow="当前状态"
          title="系统状态暂时不可用"
          description="暂时无法加载三条线的状态信息，请稍后重试。"
          className="overflow-hidden bg-[linear-gradient(135deg,hsl(28_94%_94%),transparent_48%),linear-gradient(180deg,color-mix(in_srgb,var(--card)_92%,transparent),color-mix(in_srgb,var(--card)_88%,transparent))]"
        >
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone="warning">state feed unavailable</StatusBadge>
              <StatusBadge tone="info">waiting for capability status</StatusBadge>
            </div>

            <div className="rounded-[26px] border border-[color:var(--warning-soft)] bg-white/60 p-5 shadow-[0_20px_60px_hsl(30_60%_28%/0.08)]">
              <div className="text-[30px] font-semibold leading-tight tracking-tight">
                当前无法显示最新状态。
              </div>
              <p className="mt-3 max-w-[60ch] text-sm leading-7 text-muted-foreground">
                系统恢复后，这里会继续展示各轨道的状态和证据信息。
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    );
  }

  const stats = [
    {
      label: "总合同项",
      value: String(catalog.stats.total),
      sub: "catalog entries",
      iconLabel: "ALL",
      tone: "primary" as const,
    },
    {
      label: "Ready",
      value: String(catalog.stats.ready),
      sub: "可直接进入平台消费",
      iconLabel: "RDY",
      tone: "success" as const,
    },
    {
      label: "Partial",
      value: String(catalog.stats.partial),
      sub: "仅暴露部分能力或证据",
      iconLabel: "PAR",
      tone: "warning" as const,
    },
    {
      label: "Planned",
      value: String(catalog.stats.planned),
      sub: "已进入统一目录，未进入默认执行面",
      iconLabel: "PLN",
      tone: "info" as const,
    },
  ];

<<<<<<< HEAD
const weeklyActivity = [
  { day: "周一", member: 2, nonMember: 5 },
  { day: "周二", member: 4, nonMember: 3 },
  { day: "周三", member: 3, nonMember: 6 },
  { day: "周四", member: 6, nonMember: 4 },
  { day: "周五", member: 5, nonMember: 7 },
  { day: "周六", member: 8, nonMember: 5 },
  { day: "周日", member: 4, nonMember: 6 },
];

const watchlistItems = [
  {
    title: "复核 demo-member-004.png",
    detail: "重建距离低于告警阈值，成员置信度连续两次超过 80%。",
    tone: "warning" as const,
    tag: "高风险",
  },
  {
    title: "确认 6 个高风险样本的数据来源",
    detail: '当前报告标记为"来源待核查"，影响法务结论。',
    tone: "info" as const,
    tag: "待确认",
  },
  {
    title: "补录影子模型对照检测",
    detail: "区分真实成员信号与重建质量偏差。",
    tone: "primary" as const,
    tag: "建议",
  },
];

const modelCoverage = [
  { label: "SD 1.5", count: 18, share: 72, color: "bg-emerald-400" },
  { label: "SD 2.1", count: 12, share: 48, color: "bg-sky-500" },
  { label: "SDXL", count: 9, share: 36, color: "bg-orange-400" },
  { label: "DDIM", count: 8, share: 32, color: "bg-primary" },
];

const heatmapLegend = [
  { label: "低风险", color: "bg-background" },
  { label: "偏低", color: "bg-emerald-900" },
  { label: "中等", color: "bg-emerald-700" },
  { label: "偏高", color: "bg-primary/70" },
  { label: "高风险", color: "bg-primary" },
];

const queueStatus = [
  { label: "待复核队列", value: "2 个样本", sub: "高风险样本优先" },
  { label: "最近同步", value: "12 分钟前", sub: "展示层模拟状态" },
  { label: "当前重点模型", value: "SD 1.5", sub: "近 7 天调用最多" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="审计仪表盘"
        description="检测数量、模型覆盖、待复核风险与近期输出。"
      />

      <SectionCard
        eyebrow="执行摘要"
        title="高风险样本 6，待复核 2"
        description="当前待处理事项概览。"
        className="overflow-hidden bg-[linear-gradient(135deg,hsl(258_82%_97%),transparent_50%),linear-gradient(180deg,color-mix(in_srgb,var(--card)_92%,transparent),color-mix(in_srgb,var(--card)_88%,transparent))] dark:bg-[linear-gradient(135deg,hsl(258_40%_22%/0.55),transparent_52%),linear-gradient(180deg,hsl(220_13%_15%/0.92),hsl(220_13%_14%/0.88))]"
      >
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone="warning">高风险样本 6</StatusBadge>
              <StatusBadge tone="info">待复核队列 2</StatusBadge>
              <StatusBadge tone="primary">模拟模式运行中</StatusBadge>
=======
  return (
    <div className="space-y-6">
      <PageHeader
        title="系统状态"
        description="统一查看当前目录中的能力状态，并保留三条线的入口结构。"
      />

      <SectionCard
        eyebrow="系统概览"
        title="当前目录状态"
        description="展示当前目录中的能力，并保留三条线的入口位置。"
        className="overflow-hidden bg-[linear-gradient(135deg,hsl(258_82%_97%),transparent_50%),linear-gradient(180deg,color-mix(in_srgb,var(--card)_92%,transparent),color-mix(in_srgb,var(--card)_88%,transparent))] dark:bg-[linear-gradient(135deg,hsl(258_40%_22%/0.55),transparent_52%),linear-gradient(180deg,hsl(220_13%_15%/0.92),hsl(220_13%_14%/0.88))]"
      >
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone="primary">3 tracks</StatusBadge>
              <StatusBadge tone="success">{catalog.stats.ready} ready</StatusBadge>
              <StatusBadge tone="warning">{catalog.stats.partial} partial</StatusBadge>
              <StatusBadge tone="info">{catalog.stats.planned} planned</StatusBadge>
>>>>>>> origin/main
            </div>

            <div className="rounded-[26px] border border-primary/15 bg-white/60 p-5 shadow-[0_20px_60px_hsl(258_45%_30%/0.08)] dark:bg-white/6">
              <div className="text-[30px] font-semibold leading-tight tracking-tight">
<<<<<<< HEAD
                最近两次成员推断复测检出高风险信号。
              </div>
              <p className="mt-3 max-w-[60ch] text-sm leading-7 text-muted-foreground">
                成员置信度、重建距离与法规结论详见检测记录。
=======
                首页仅展示当前目录中的能力状态。
              </div>
              <p className="mt-3 max-w-[60ch] text-sm leading-7 text-muted-foreground">
                未发布内容保留入口，不在此页展开。
>>>>>>> origin/main
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
<<<<<<< HEAD
            {queueStatus.map((item) => (
              <div
                key={item.label}
                className="rounded-[24px] border border-border bg-white/55 p-4 dark:bg-white/5"
              >
                <div className="mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  {item.label}
                </div>
                <div className="mt-3 text-2xl font-semibold tracking-tight">{item.value}</div>
                <div className="mt-2 text-sm leading-6 text-muted-foreground">{item.sub}</div>
=======
            {catalog.tracks.map((item) => (
              <div
                key={item.track}
                className="rounded-[24px] border border-border bg-white/55 p-4 dark:bg-white/5"
              >
                <div className="mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  {item.track}
                </div>
                <div className="mt-3 text-2xl font-semibold tracking-tight">{item.total}</div>
                <div className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.track === "black-box" ? "已发布条目" : "未发布"}
                </div>
>>>>>>> origin/main
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

<<<<<<< HEAD
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard
          eyebrow="过去 7 天检测活动"
          title="成员 / 非成员检测趋势"
          description="每日成员与非成员检测结果。"
        >
          <div className="space-y-4">
            {weeklyActivity.map((row) => (
              <div key={row.day}>
                <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                  <span className="font-medium text-foreground">{row.day}</span>
                  <span className="text-muted-foreground">
                    成员 {row.member} / 非成员 {row.nonMember}
                  </span>
                </div>
                <div className="flex h-3 overflow-hidden rounded-full bg-background/70">
                  <div className="bg-amber-400" style={{ width: `${row.member * 8}%` }} />
                  <div className="bg-emerald-400" style={{ width: `${row.nonMember * 8}%` }} />
=======
      <SectionCard
        eyebrow="三线状态"
        title="三线目录状态"
        description="展示三条线的目录数量和成熟度分布。"
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {catalog.tracks.map((track) => (
            <div
              key={track.track}
              className="rounded-[24px] border border-border bg-white/55 p-5 dark:bg-white/5"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  {track.track}
                </div>
                <StatusBadge tone={trackTone[track.track] ?? "primary"}>{track.total} total</StatusBadge>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <TrackMetric label="ready" value={track.ready} />
                <TrackMetric label="partial" value={track.partial} />
                <TrackMetric label="planned" value={track.planned} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
        <SectionCard
          eyebrow="目录详情"
          title="按轨道分组的能力条目"
          description="各条线的成熟度、能力项和最佳证据状态。"
        >
          <div className="space-y-4">
            {catalog.tracks.map((track) => (
              <div key={track.track} className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                      {track.track}
                    </div>
                    <div className="mt-1 text-base font-semibold text-foreground">
                      {track.total > 0 ? `${track.total} 个 contract` : "当前无 catalog 条目"}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge tone="success">{track.ready} ready</StatusBadge>
                    <StatusBadge tone="warning">{track.partial} partial</StatusBadge>
                    <StatusBadge tone="info">{track.planned} planned</StatusBadge>
                  </div>
>>>>>>> origin/main
                </div>

                {track.entries.length === 0 ? (
                  <div className="rounded-[24px] border border-dashed border-border bg-white/35 p-4 text-sm leading-6 text-muted-foreground dark:bg-white/4">
                    当前无 catalog 条目
                  </div>
                ) : (
                  track.entries.map((entry) => (
                    <div
                      key={entry.contractKey}
                      className="rounded-[24px] border border-border bg-white/45 p-4 dark:bg-white/5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="mono text-xs text-muted-foreground">{entry.contractKey}</div>
                          <div className="mt-1 text-sm font-semibold text-foreground">{entry.label}</div>
                          <div className="mt-2 text-sm text-muted-foreground">{entry.paper}</div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge tone={trackTone[entry.track] ?? "primary"}>{entry.track}</StatusBadge>
                          <StatusBadge tone={availabilityTone[entry.availability]}>{entry.availability}</StatusBadge>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <CatalogDetail label="Capability" value={entry.capabilityLabel} />
                        <CatalogDetail label="Best evidence status" value={entry.evidenceLevel} />
                        <CatalogDetail label="Published workspace" value={entry.bestWorkspace} />
                        <CatalogDetail label="Runtime status" value={entry.runtimeLabel} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard
<<<<<<< HEAD
            eyebrow="待处理风险"
            title="风险待办"
            description="当前需处理事项。"
          >
            <div className="space-y-3">
              {watchlistItems.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[24px] border border-border bg-white/45 p-4 dark:bg-white/5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-foreground">{item.title}</div>
                    <StatusBadge tone={item.tone}>{item.tag}</StatusBadge>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.detail}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="运行概览"
            title="覆盖模型与执行状态"
            description="模型覆盖与执行节奏。"
          >
            <div className="space-y-4">
              {modelCoverage.map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-foreground">{item.label}</span>
                    <span className="mono text-muted-foreground">{item.count} 次</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-background/70">
                    <div className={`h-3 ${item.color}`} style={{ width: `${item.share}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          eyebrow="风险热力图（模拟）"
          title="风险分布"
          description="近期风险值分布。"
        >
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-foreground">风险分布图例</span>
            {heatmapLegend.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className={`h-3 w-3 rounded-full ${item.color}`} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-8 gap-1 sm:grid-cols-12">
            {Array.from({ length: 96 }, (_, index) => {
              const palette = [
                "bg-background",
                "bg-emerald-950",
                "bg-emerald-900",
                "bg-emerald-800",
                "bg-emerald-700",
                "bg-emerald-600",
                "bg-primary/70",
                "bg-primary",
              ];
              return (
=======
            eyebrow="当前重点"
            title="解读说明"
            description="当前状态解读。"
          >
            <div className="space-y-3">
              {catalogActions.map((item) => (
>>>>>>> origin/main
                <div
                  key={item.title}
                  className="rounded-[24px] border border-border bg-white/45 p-4 dark:bg-white/5"
                >
                  <div className="text-sm font-semibold text-foreground">{item.title}</div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.note}</p>
                </div>
              ))}
            </div>
          </SectionCard>

<<<<<<< HEAD
        <SectionCard
          eyebrow="最近检测记录"
          title="历史记录"
          description="检测结果、置信度与处置优先级。"
        >
          <div className="space-y-3">
            {recentDetections.map((item, index) => (
              <div
                key={item.file}
                className="rounded-[24px] border border-border bg-white/45 px-4 py-4 dark:bg-white/5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="mono text-xs text-muted-foreground">#{String(index + 1).padStart(2, "0")}</div>
                    <div className="mt-1 text-sm font-semibold text-foreground">{item.file}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="mono text-sm text-muted-foreground">{item.confidence}</div>
                    <StatusBadge tone={item.tone}>{item.verdict}</StatusBadge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
=======
          <SectionCard
            eyebrow="下一步"
            title="操作指引"
            description="系统状态页查看整体状态，证据细节查看报告页。"
          >
            <div className="space-y-4">
              <ActionCard
                index={1}
                title="系统状态页仅展示目录"
                note="展示 track、availability 和已发布条目的状态，"
              />
              <ActionCard
                index={2}
                title="证据细节查看报告页"
                note="单条 evidence 的详细信息、workspace 和 summary 在报告页查看。"
              />
            </div>
          </SectionCard>
        </div>
>>>>>>> origin/main
      </div>
    </div>
  );
}

function CatalogDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-border bg-white/60 px-4 py-3 dark:bg-white/6">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-2 break-all text-sm font-medium leading-6 text-foreground">{value}</div>
    </div>
  );
}

function TrackMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[18px] border border-border bg-white/60 px-3 py-3 text-center dark:bg-white/6">
      <div className="mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
      <div className="mt-2 text-xl font-semibold tracking-tight">{value}</div>
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
      {note ? <p className="mt-3 text-sm leading-6 text-muted-foreground">{note}</p> : null}
    </div>
  );
}
