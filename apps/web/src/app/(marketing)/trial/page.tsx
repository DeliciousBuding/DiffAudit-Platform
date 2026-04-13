import { BrandMark } from "@/components/brand-mark";
import { TrialForm } from "@/components/trial-form";

export default function TrialPage() {
  return (
    <main className="site-shell">
      <header className="site-header">
        <div className="container site-header-inner">
          <BrandMark compact />
        </div>
      </header>

      <section className="container py-12 md:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr]">
          <div className="workspace-highlight">
            <div className="caption">申请试用</div>
            <h1 className="mt-3 text-[34px] font-[450] leading-tight">让团队先用统一工作台跑通一条审计闭环。</h1>
            <p className="mt-4 max-w-[48ch] text-sm leading-7 text-muted-foreground">
              告诉我们你的模型类型、团队角色和当前风险关注点。我们会基于这些信息安排试用与后续接入。
            </p>
          </div>

          <TrialForm />
        </div>
      </section>
    </main>
  );
}
