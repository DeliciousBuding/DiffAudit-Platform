import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";

const steps = [
  "前端调用 FastAPI `/api/v1/audit/jobs` 创建任务",
  "后端后续会把任务转发到研究仓库 CLI",
  "研究仓库输出 `summary.json` 和 artifact 路径",
  "平台读取结果并展示成员风险结论"
];

export default function GuidePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="接入指南"
        description="第一版平台先面向最小闭环：前端调用 FastAPI，FastAPI 再调用研究仓库并读取标准 summary 输出。"
      />

      <SectionCard eyebrow="Pipeline" title="任务链路">
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step} className="flex gap-4 rounded-3xl border border-border bg-white/45 p-4 dark:bg-white/5">
              <div className="mono flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {index + 1}
              </div>
              <div className="text-sm leading-7 text-muted-foreground">{step}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          eyebrow="Boundary"
          title="平台仓库职责"
          description="平台负责产品壳、API 契约、共享登录和结果展示，不复制算法实现。"
        >
          <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
            <li>稳定页面入口与结果摘要结构</li>
            <li>统一保护受控 API 路由</li>
            <li>保持研究代码在独立仓库内演进</li>
          </ul>
        </SectionCard>

        <SectionCard
          eyebrow="Artifacts"
          title="预期输出"
          description="研究仓库后续至少应返回统一任务状态、summary 路径、artifact 列表和成员风险结论。"
        >
          <div className="space-y-3 text-sm leading-6 text-muted-foreground">
            <div>summary.json</div>
            <div>artifact paths</div>
            <div>risk score and verdict</div>
            <div>runtime logs</div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
