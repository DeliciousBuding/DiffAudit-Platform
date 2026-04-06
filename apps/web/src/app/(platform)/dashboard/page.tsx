import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { dashboardStats, recentDetections } from "@/lib/demo-data";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="审计仪表盘"
        description="聚合展示 REDIFFUSE 检测次数、成员检出、高风险图像、模型分布、风险热力图与最近检测记录。"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <SectionCard
          eyebrow="过去 7 天检测活动"
          title="成员 / 非成员检测趋势"
          description="使用模拟数据展示最近一周的检测活动。"
        >
          <div className="space-y-4">
            {[
              { day: "周一", member: 2, non: 5 },
              { day: "周二", member: 4, non: 3 },
              { day: "周三", member: 3, non: 6 },
              { day: "周四", member: 6, non: 4 },
              { day: "周五", member: 5, non: 7 },
              { day: "周六", member: 8, non: 5 },
              { day: "周日", member: 4, non: 6 },
            ].map((row) => (
              <div key={row.day}>
                <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{row.day}</span>
                  <span>成员 {row.member} / 非成员 {row.non}</span>
                </div>
                <div className="flex h-3 overflow-hidden rounded-full bg-background/70">
                  <div className="bg-amber-400" style={{ width: `${row.member * 8}%` }} />
                  <div className="bg-emerald-400" style={{ width: `${row.non * 8}%` }} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="模型分布"
          title="当前覆盖模型"
          description="以模拟统计展示当前检测覆盖的模型分布。"
        >
          <div className="space-y-4">
            {[
              { label: "SD 1.5", count: 18, color: "bg-emerald-400" },
              { label: "SD 2.1", count: 12, color: "bg-sky-500" },
              { label: "SDXL", count: 9, color: "bg-orange-400" },
              { label: "DDIM", count: 8, color: "bg-primary" },
            ].map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{item.label}</span>
                  <span className="mono">{item.count}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-background/70">
                  <div className={`h-3 ${item.color}`} style={{ width: `${item.count * 4}%` }} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          eyebrow="风险热力图（模拟）"
          title="风险分布"
          description="模拟展示近期风险值分布。"
        >
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
          description="模拟展示最近样本的成员推断结果。"
        >
          <div className="space-y-3">
            {recentDetections.map((item) => (
              <div
                key={item.file}
                className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-white/45 px-4 py-3 dark:bg-white/5"
              >
                <div className="mono truncate text-xs text-foreground">{item.file}</div>
                <div className="mono text-xs text-muted-foreground">{item.confidence}</div>
                <StatusBadge tone={item.tone}>{item.verdict}</StatusBadge>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
