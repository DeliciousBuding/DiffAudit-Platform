import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";

const queue = [
  { name: "celeba_public_25_target_member", status: "completed" },
  { name: "celeba_public_25_target_non_member", status: "completed" },
  { name: "celeba_public_25_shadow_member", status: "completed" },
  { name: "celeba_public_25_shadow_non_member", status: "completed" }
];

export default function BatchPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="批量检测"
        description="批量页展示未来如何把多张图像和成组任务纳入统一的审计视图，让规模化评估也保持清晰的浏览体验。"
      />

      <SectionCard eyebrow="Preview queue" title="批量任务视图">
        <div className="space-y-3">
          {queue.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between gap-4 rounded-3xl border border-border bg-white/45 px-4 py-4 dark:bg-white/5"
            >
              <div>
                <div className="mono text-xs text-foreground">{item.name}</div>
                <div className="mt-1 text-xs text-muted-foreground">演示用批量任务条目</div>
              </div>
              <StatusBadge tone="success">{item.status}</StatusBadge>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard eyebrow="Value" title="批量体验会带来什么">
          <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
            <li>在一个视图里组织多张图像的审计任务</li>
            <li>更适合比较同批次结果与状态变化</li>
            <li>帮助研究团队和审阅者快速浏览整体进度</li>
          </ul>
        </SectionCard>

        <SectionCard eyebrow="Direction" title="接下来会继续完善">
          <p className="text-sm leading-7 text-muted-foreground">
            当前版本先展示批量任务的组织方式。随着更多实际任务接入，这里会继续补充更完整的状态、结果和筛选能力。
          </p>
        </SectionCard>
      </div>
    </div>
  );
}
