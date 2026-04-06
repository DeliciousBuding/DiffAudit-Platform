import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";

export default function ReportPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="合规报告"
        description="报告页用于给出成员风险判断、实验上下文、模型信息和建议项。当前阶段先把结构搭出来，后续由后端真实结果驱动。"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Verdict" value="Likely member" sub="当前占位风险结论" iconLabel="VR" tone="warning" />
        <StatCard label="Confidence" value="0.82" sub="风险判断置信度" iconLabel="CF" tone="primary" />
        <StatCard label="Method" value="Recon" sub="当前摘要对应的方法" iconLabel="MT" tone="info" />
        <StatCard label="Target" value="SD1.5" sub="模型与调度配置" iconLabel="TG" tone="success" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard eyebrow="Risk summary" title="成员风险结论">
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone="warning">Likely member</StatusBadge>
            <StatusBadge tone="primary">Recon evidence</StatusBadge>
          </div>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            当前页面用于承接未来后端返回的 verdict、置信度、运行上下文与 artifact 链接。这里先用静态占位结构保证页面语义和展示层完整。
          </p>
        </SectionCard>

        <SectionCard eyebrow="Artifacts" title="结果产物">
          <div className="space-y-3 text-sm leading-6 text-muted-foreground">
            <div>summary.json</div>
            <div>risk histogram</div>
            <div>prompt / scheduler metadata</div>
            <div>runtime logs</div>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard eyebrow="Model context" title="模型与实验上下文">
          <div className="space-y-3 text-sm leading-6 text-muted-foreground">
            <div>Stable Diffusion 1.5</div>
            <div>DDIM scheduler</div>
            <div>public-25 route</div>
            <div>recon membership inference</div>
          </div>
        </SectionCard>

        <SectionCard eyebrow="Recommendations" title="建议项">
          <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
            <li>结合 artifact 和 summary 检查证据强度是否稳定</li>
            <li>在正式输出时补充非成员对照与阈值说明</li>
            <li>保留运行元数据，便于结果追溯与二次验证</li>
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
