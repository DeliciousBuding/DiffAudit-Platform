import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";

const stats = [
  { label: "Models Ready", value: "3", sub: "当前已对齐的模型配置", iconLabel: "MD", tone: "primary" as const },
  { label: "Best Recon Scale", value: "25", sub: "公开子集上的最强证据点", iconLabel: "SC", tone: "warning" as const },
  { label: "Best AUC", value: "0.768", sub: "当前摘要里记录的最佳结果", iconLabel: "AU", tone: "info" as const },
  { label: "Platform Mode", value: "Stub", sub: "前端和接口壳已连通", iconLabel: "ST", tone: "success" as const },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="平台状态总览"
        description="当前页面聚合第一版平台壳的运行状态、研究路线摘要和接入方向，作为公网审阅入口的总控视图。"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
        <SectionCard
          eyebrow="Primary Route"
          title="当前最强黑盒证据"
          description="当前研究主线的最强公开子集证据来自 Stable Diffusion + DDIM 的 public-25 step10。第一版平台应该围绕这条路径先完成产品化接入。"
        >
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone="primary">Stable Diffusion 1.5</StatusBadge>
            <StatusBadge tone="info">DDIM</StatusBadge>
            <StatusBadge tone="warning">public-25</StatusBadge>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Runtime"
          title="系统状态"
          description="前端结构已切到新壳，后端接口仍保持 stub。研究仓库 CLI 接入和真实结果回填仍是后续工作。"
        >
          <div className="space-y-3 text-sm leading-6 text-muted-foreground">
            <div className="flex items-center justify-between rounded-2xl border border-border bg-white/45 px-4 py-3 dark:bg-white/5">
              <span>Public Web Shell</span>
              <StatusBadge tone="success">Ready</StatusBadge>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-border bg-white/45 px-4 py-3 dark:bg-white/5">
              <span>FastAPI Stub</span>
              <StatusBadge tone="info">Connected</StatusBadge>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-border bg-white/45 px-4 py-3 dark:bg-white/5">
              <span>Research CLI Bridge</span>
              <StatusBadge tone="warning">Pending</StatusBadge>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          eyebrow="Delivery Focus"
          title="第一版交付边界"
          description="保持平台仓库薄壳，不把研究代码直接搬进来。先稳定任务形状、会话保护、展示层和对研究仓库的调用边界。"
        >
          <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
            <li>统一前端入口、结果页和任务状态页</li>
            <li>通过代理层统一保护 `/api/v1/*`</li>
            <li>后续只通过明确契约调用研究仓库</li>
          </ul>
        </SectionCard>

        <SectionCard
          eyebrow="Next Phase"
          title="后续接入方向"
          description="平台下一阶段应该优先把 audit job 创建、任务轮询和结果读取打通，再补真实上传、批量输入和 artifact 追踪。"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-white/45 p-4 dark:bg-white/5">
              <div className="mono text-[11px] uppercase tracking-[0.14em] text-primary/80">Step 1</div>
              <div className="mt-2 text-sm font-semibold">统一任务创建</div>
            </div>
            <div className="rounded-2xl border border-border bg-white/45 p-4 dark:bg-white/5">
              <div className="mono text-[11px] uppercase tracking-[0.14em] text-primary/80">Step 2</div>
              <div className="mt-2 text-sm font-semibold">结果与 artifact 回填</div>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
