import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";

export default function ReportPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="合规报告"
        description="报告页把一次审计的核心结论、模型上下文与建议内容整理成更适合阅读与交流的展示形式。"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Verdict" value="Likely member" sub="当前占位风险结论" iconLabel="VR" tone="warning" />
        <StatCard label="Confidence" value="0.82" sub="用于快速感知判断强度" iconLabel="CF" tone="primary" />
        <StatCard label="Method" value="Recon" sub="当前展示聚焦的审计方式" iconLabel="MT" tone="info" />
        <StatCard label="Target" value="SD1.5" sub="本次结果对应的模型设置" iconLabel="TG" tone="success" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard eyebrow="Summary" title="风险判断概览">
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone="warning">Likely member</StatusBadge>
            <StatusBadge tone="primary">Recon Assessment</StatusBadge>
          </div>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            在完整版本中，报告会把风险结论、判断依据和上下文信息整合到同一页，方便外部审阅者快速理解结果。
          </p>
        </SectionCard>

        <SectionCard eyebrow="Contents" title="报告包含的内容">
          <div className="space-y-3 text-sm leading-6 text-muted-foreground">
            <div>风险结果摘要</div>
            <div>关键指标与可视化占位</div>
            <div>模型与方法背景说明</div>
            <div>可进一步追踪的上下文信息</div>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard eyebrow="Context" title="模型与方法背景">
          <div className="space-y-3 text-sm leading-6 text-muted-foreground">
            <div>Stable Diffusion 1.5</div>
            <div>DDIM scheduler</div>
            <div>受控演示用评估路径</div>
            <div>面向成员推断风险的结果展示</div>
          </div>
        </SectionCard>

        <SectionCard eyebrow="Interpretation" title="建议如何阅读结果">
          <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
            <li>先看结论卡片，再结合置信度理解判断强弱</li>
            <li>通过模型与方法背景模块理解结果适用范围</li>
            <li>后续版本会继续补充更完整的对照与说明信息</li>
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
