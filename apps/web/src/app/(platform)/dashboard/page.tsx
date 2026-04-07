import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { dashboardStats, recentDetections } from "@/lib/demo-data";

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
            </div>

            <div className="rounded-[26px] border border-primary/15 bg-white/60 p-5 shadow-[0_20px_60px_hsl(258_45%_30%/0.08)] dark:bg-white/6">
              <div className="text-[30px] font-semibold leading-tight tracking-tight">
                最近两次成员推断复测检出高风险信号。
              </div>
              <p className="mt-3 max-w-[60ch] text-sm leading-7 text-muted-foreground">
                成员置信度、重建距离与法规结论详见检测记录。
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
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
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

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
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard
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
                <div
                  key={index}
                  className={`aspect-square rounded-[4px] ${palette[(index * 7) % palette.length]}`}
                />
              );
            })}
          </div>
        </SectionCard>

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
      </div>
    </div>
  );
}
