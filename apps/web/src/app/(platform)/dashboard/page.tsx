import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";

const stats = [
  { label: "体验页面", value: "6", sub: "覆盖审计、报告、指南与批量视图", iconLabel: "UI", tone: "primary" as const },
  { label: "重点路径", value: "Recon", sub: "当前展示围绕成熟黑盒审计路线展开", iconLabel: "RC", tone: "warning" as const },
  { label: "报告视图", value: "Ready", sub: "支持以结果卡片与摘要方式展示结论", iconLabel: "RP", tone: "info" as const },
  { label: "访问状态", value: "Private", sub: "采用共享凭据进行受控预览", iconLabel: "AC", tone: "success" as const },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="平台体验总览"
        description="这一页用于帮助审阅者快速了解 DiffAudit 当前可以展示的能力、典型场景，以及整个平台的整体体验方向。"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
        <SectionCard
          eyebrow="Highlighted experience"
          title="聚焦单一路线，降低理解成本"
          description="当前展示版本聚焦最成熟的一条扩散模型审计路线，让审阅者先看清楚输入、结果和报告结构，再逐步扩展更多方法。"
        >
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone="primary">Stable Diffusion 1.5</StatusBadge>
            <StatusBadge tone="info">DDIM</StatusBadge>
            <StatusBadge tone="warning">Membership Audit</StatusBadge>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="What reviewers see"
          title="体验重点"
          description="平台当前强调统一的任务入口、清晰的结果呈现和便于展示的报告结构，帮助外部审阅者快速抓住重点。"
        >
          <div className="space-y-3 text-sm leading-6 text-muted-foreground">
            <div className="flex items-center justify-between rounded-2xl border border-border bg-white/45 px-4 py-3 dark:bg-white/5">
              <span>统一审计入口</span>
              <StatusBadge tone="success">Ready</StatusBadge>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-border bg-white/45 px-4 py-3 dark:bg-white/5">
              <span>结果与报告展示</span>
              <StatusBadge tone="info">Ready</StatusBadge>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-border bg-white/45 px-4 py-3 dark:bg-white/5">
              <span>批量任务视图</span>
              <StatusBadge tone="warning">Preview</StatusBadge>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          eyebrow="Designed for review"
          title="为什么先做这个版本"
          description="相比直接暴露实验脚本，这一版更适合演示、交流和审阅。它把复杂的研究流程整理成更稳定、可浏览、可沟通的产品体验。"
        >
          <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
            <li>用一致的页面结构降低理解门槛</li>
            <li>让结果说明和报告展示更适合面向外部沟通</li>
            <li>为后续扩展更多审计方式预留清晰空间</li>
          </ul>
        </SectionCard>

        <SectionCard
          eyebrow="What comes next"
          title="下一步会继续完善的方向"
          description="在统一体验骨架确定后，后续会继续丰富数据接入、任务执行联动与更完整的结果内容，让展示层和实际审计过程进一步靠拢。"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-white/45 p-4 dark:bg-white/5">
              <div className="mono text-[11px] uppercase tracking-[0.14em] text-primary/80">Experience</div>
              <div className="mt-2 text-sm font-semibold">更完整的任务与结果流转</div>
            </div>
            <div className="rounded-2xl border border-border bg-white/45 p-4 dark:bg-white/5">
              <div className="mono text-[11px] uppercase tracking-[0.14em] text-primary/80">Presentation</div>
              <div className="mt-2 text-sm font-semibold">更深入的报告与可视化内容</div>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
