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
        title="图像成员推断检测"
        description="第一版平台先提供稳定的产品壳：上传目标图像、选择模型与审计方法、提交任务并读取统一的成员风险结果。"
      />

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
        <SectionCard eyebrow="Audit Intake" title="提交审计任务">
          <div className="rounded-[28px] border border-dashed border-primary/25 bg-primary/6 px-6 py-12 text-center">
            <div className="text-base font-semibold">拖拽或点击上传目标图像</div>
            <div className="mt-2 text-sm text-muted-foreground">先占位前端结构，后续接真实上传与任务流。</div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-border bg-white/55 p-4 dark:bg-white/5">
              <div className="mono text-[11px] uppercase tracking-[0.14em] text-primary/80">Target model</div>
              <div className="mt-3 rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm">
                Stable Diffusion 1.5 + DDIM
              </div>
            </div>
            <div className="rounded-3xl border border-border bg-white/55 p-4 dark:bg-white/5">
              <div className="mono text-[11px] uppercase tracking-[0.14em] text-primary/80">Audit policy</div>
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
            提交审计任务
          </button>
        </SectionCard>

        <div className="grid gap-4">
          <SectionCard eyebrow="Output shape" title="任务输出结构">
            <div className="space-y-3 text-sm text-muted-foreground">
              <div>成员风险分数</div>
              <div>成员 / 非成员判定</div>
              <div>实验 summary 路径</div>
              <div>artifact 路径与日志</div>
            </div>
          </SectionCard>

          <SectionCard eyebrow="First release" title="第一版约束">
            <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
              <li>只接一条成熟主线：Stable Diffusion + DDIM recon</li>
              <li>后端先做任务壳，不重写研究算法</li>
              <li>真实执行后续通过研究仓库 CLI 打通</li>
            </ul>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
