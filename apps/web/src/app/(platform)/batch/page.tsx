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
        description="第二阶段会把单图输入扩展到批量作业和任务队列。第一版先预留列表和状态视图。"
      />

      <SectionCard eyebrow="Queue" title="任务队列">
        <div className="space-y-3">
          {queue.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between gap-4 rounded-3xl border border-border bg-white/45 px-4 py-4 dark:bg-white/5"
            >
              <div>
                <div className="mono text-xs text-foreground">{item.name}</div>
                <div className="mt-1 text-xs text-muted-foreground">batch placeholder job</div>
              </div>
              <StatusBadge tone="success">{item.status}</StatusBadge>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard eyebrow="Planned inputs" title="后续输入扩展">
          <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
            <li>多图批量上传</li>
            <li>队列级状态轮询</li>
            <li>失败任务重试与日志追踪</li>
          </ul>
        </SectionCard>

        <SectionCard eyebrow="Delivery note" title="当前阶段">
          <p className="text-sm leading-7 text-muted-foreground">
            当前页面只承接队列样式和状态结构，不引入新的后台行为。等任务执行链路稳定后，再接入真实批量作业。
          </p>
        </SectionCard>
      </div>
    </div>
  );
}
