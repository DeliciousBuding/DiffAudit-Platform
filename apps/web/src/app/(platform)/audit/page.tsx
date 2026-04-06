import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";

const methods = [
  { label: "黑盒 / Recon", tone: "primary" as const },
  { label: "灰盒 / PIA", tone: "warning" as const },
  { label: "白盒 / Attention", tone: "info" as const },
];

export default function AuditPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="开始一次图像审计"
        description="从单张图像出发，体验一次完整的隐私风险审计流程，了解平台如何组织输入、方法选择和结果展示。"
      />

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
        <SectionCard eyebrow="Start here" title="提交审计任务">
          <div className="rounded-[28px] border border-dashed border-primary/25 bg-primary/6 px-6 py-12 text-center">
            <div className="text-base font-semibold">拖拽或点击上传目标图像</div>
            <div className="mt-2 text-sm text-muted-foreground">演示版本使用统一的任务入口，帮助审阅者先理解整体流程与结果结构。</div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-border bg-white/55 p-4 dark:bg-white/5">
              <div className="mono text-[11px] uppercase tracking-[0.14em] text-primary/80">Target model</div>
              <div className="mt-3 rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm">
                Stable Diffusion 1.5 + DDIM
              </div>
            </div>
            <div className="rounded-3xl border border-border bg-white/55 p-4 dark:bg-white/5">
              <div className="mono text-[11px] uppercase tracking-[0.14em] text-primary/80">Audit method</div>
              <div className="mt-3 rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm">
                Recon / membership risk
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {methods.map((method) => (
              <StatusBadge key={method.label} tone={method.tone}>
                {method.label}
              </StatusBadge>
            ))}
          </div>

          <button className="mt-6 w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:-translate-y-px hover:brightness-105">
            开始体验
          </button>
        </SectionCard>

        <div className="grid gap-4">
          <SectionCard eyebrow="What you receive" title="输出内容">
            <div className="space-y-3 text-sm text-muted-foreground">
              <div>清晰的风险分数与结论摘要</div>
              <div>便于浏览的结果与说明结构</div>
              <div>可用于追踪的实验上下文信息</div>
              <div>面向报告页的统一展示内容</div>
            </div>
          </SectionCard>

          <SectionCard eyebrow="Why this route" title="为什么从这条路线开始">
            <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
              <li>优先围绕最成熟的审计路径建立统一体验</li>
              <li>先让外部审阅者看清楚任务组织与结果表达</li>
              <li>为后续扩展更多方法留出一致的页面结构</li>
            </ul>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
