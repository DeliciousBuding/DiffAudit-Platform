import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";

const steps = [
  "上传目标图像并确认本次审计任务的输入内容",
  "选择当前适合演示的模型与审计路径",
  "查看平台生成的结果摘要、结论与说明结构",
  "在报告页中继续浏览风险判断与上下文信息"
];

export default function GuidePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="接入指南"
        description="这一页帮助审阅者快速理解平台如何组织一次审计体验，以及每个页面在整体流程中的角色。"
      />

      <SectionCard eyebrow="Journey" title="审计体验路径">
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
          eyebrow="For reviewers"
          title="你会在这里看到什么"
          description="平台把复杂的研究过程整理成更容易沟通的浏览体验，让结果页、报告页和说明页更适合面向外部展示。"
        >
          <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
            <li>统一的页面入口与结果浏览路径</li>
            <li>更清晰的报告卡片和结论展示结构</li>
            <li>便于后续扩展的统一产品骨架</li>
          </ul>
        </SectionCard>

        <SectionCard
          eyebrow="Outputs"
          title="平台展示的核心信息"
          description="在完整体验中，平台会围绕风险判断、方法说明、模型上下文和结果摘要，持续丰富页面内容。"
        >
          <div className="space-y-3 text-sm leading-6 text-muted-foreground">
            <div>风险分数与判断结果</div>
            <div>方法与模型的核心背景说明</div>
            <div>便于展示的报告卡片与摘要模块</div>
            <div>可继续扩展的结果上下文信息</div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
