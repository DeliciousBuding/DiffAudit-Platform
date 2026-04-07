import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";

const reportMetrics = [
  { label: "成员推断结论", value: "成员", sub: "模拟结果", iconLabel: "VR", tone: "warning" as const },
  { label: "成员置信度", value: "82%", sub: "REDIFFUSE v1.0", iconLabel: "CF", tone: "primary" as const },
  { label: "重建距离", value: "0.043", sub: "D(x,x̂)", iconLabel: "DX", tone: "info" as const },
  { label: "SSIM 相似度", value: "0.910", sub: "重建质量指标", iconLabel: "SS", tone: "success" as const },
];

const scopeDetails = [
  { label: "目标模型", value: "Stable Diffusion 1.5" },
  { label: "待检图像", value: "未指定（演示模式）" },
  { label: "检测方法", value: "黑盒 Likelihood + 白盒 DDIM Inversion" },
  { label: "算法版本", value: "REDIFFUSE v1.0" },
];

const evidenceSummary = [
  {
    title: "成员信号",
    detail: "成员置信度 82%，超过高风险判断阈值。",
  },
  {
    title: "重建证据",
    detail: "重建距离 0.043，SSIM 0.910，伴随较强的重建一致性。",
  },
  {
    title: "结论边界",
    detail: '当前为演示模式，结论为"高概率成员信号"，非最终法务结论。',
  },
];

const complianceItems = [
  {
    title: "《生成式AI管理办法》第 4 条",
    status: "可能不符合",
    note: "数据来源仍未补齐授权证明，无法确认训练样本来源合规。",
    tone: "warning" as const,
  },
  {
    title: "数据来源合规性",
    status: "需要法务复核",
    note: "来源链路未闭环，当前风险集中在数据来源无法确认。",
    tone: "info" as const,
  },
  {
    title: "知识产权侵权风险",
    status: "中高风险",
    note: "如果训练集含有未授权素材，模型输出和训练过程都可能触发侵权争议。",
    tone: "warning" as const,
  },
];

const actionChecklist = [
  {
    title: "补齐训练数据来源证明",
    owner: "算法 / 数据团队",
    note: "优先补录高风险样本所在批次的来源记录，否则法务评估无法落地。",
  },
  {
    title: "对高风险样本发起人工复核",
    owner: "审计负责人",
    note: "从演示结论推进到业务可复核状态，单次推断不作为最终结论。",
  },
  {
    title: "同步法务侧风险说明",
    owner: "法务",
    note: '区分"成员信号"与"侵权结论"的边界。',
  },
];

export default function ReportPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="合规报告"
        description="结论、证据链与处置建议。"
      />

      <SectionCard
        eyebrow="执行摘要"
        title="高概率成员信号，需法务复核数据来源"
        description="结论、依据与后续动作。"
        className="overflow-hidden bg-[linear-gradient(135deg,hsl(36_95%_94%),transparent_48%),linear-gradient(180deg,color-mix(in_srgb,var(--card)_92%,transparent),color-mix(in_srgb,var(--card)_88%,transparent))] dark:bg-[linear-gradient(135deg,hsl(36_70%_24%/0.45),transparent_52%),linear-gradient(180deg,hsl(220_13%_15%/0.92),hsl(220_13%_14%/0.88))]"
      >
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone="warning">高风险</StatusBadge>
              <StatusBadge tone="info">需要法务复核</StatusBadge>
              <StatusBadge tone="primary">演示模式</StatusBadge>
            </div>

            <div className="rounded-[26px] border border-[color:var(--warning-soft)] bg-white/60 p-5 shadow-[0_20px_60px_hsl(30_60%_28%/0.08)] dark:bg-white/6">
              <div className="text-[30px] font-semibold leading-tight tracking-tight">
                报告支撑&quot;先复核来源，再决定是否升级为正式风险结论&quot;的管理动作。
              </div>
              <p className="mt-3 max-w-[58ch] text-sm leading-7 text-muted-foreground">
                成员置信度、重建一致性与数据来源缺口构成当前核心结论。
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <SummaryTile label="当前结论" value="成员信号强" sub="成员置信度 82%" />
            <SummaryTile label="关键风险" value="来源待核查" sub="影响法规判断" />
            <SummaryTile label="推荐动作" value="先复核再定级" sub="演示结果非最终结论" />
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {reportMetrics.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard
          eyebrow="证据链摘要"
          title="证据链摘要"
          description="判断依据摘要。"
        >
          <div className="space-y-3">
            {evidenceSummary.map((item) => (
              <div
                key={item.title}
                className="rounded-[24px] border border-border bg-white/45 p-4 dark:bg-white/5"
              >
                <div className="text-sm font-semibold text-foreground">{item.title}</div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.detail}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="审计对象范围"
          title="审计对象信息"
          description="审计对象与检测参数。"
        >
          <div className="space-y-3">
            {scopeDetails.map((item) => (
              <DetailRow key={item.label} label={item.label} value={item.value} />
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          eyebrow="法规符合性评估"
          title="法规风险判断"
          description="处置建议。"
        >
          <div className="space-y-3">
            {complianceItems.map((item) => (
              <div
                key={item.title}
                className="rounded-[24px] border border-border bg-white/45 p-4 dark:bg-white/5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-foreground">{item.title}</div>
                  <StatusBadge tone={item.tone}>{item.status}</StatusBadge>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.note}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="处置建议清单"
          title="处置建议清单"
          description="后续动作清单。"
        >
          <div className="space-y-3">
            {actionChecklist.map((item, index) => (
              <div
                key={item.title}
                className="rounded-[24px] border border-border bg-white/45 p-4 dark:bg-white/5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="mono inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      {index + 1}
                    </span>
                    <div className="text-sm font-semibold text-foreground">{item.title}</div>
                  </div>
                  <div className="mono text-xs text-muted-foreground">{item.owner}</div>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.note}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function SummaryTile({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-[24px] border border-border bg-white/55 p-4 dark:bg-white/5">
      <div className="mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
      <div className="mt-3 text-2xl font-semibold tracking-tight">{value}</div>
      <div className="mt-2 text-sm leading-6 text-muted-foreground">{sub}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-border bg-white/45 px-4 py-3 dark:bg-white/5">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-2 text-sm font-medium leading-6 text-foreground">{value}</div>
    </div>
  );
}
