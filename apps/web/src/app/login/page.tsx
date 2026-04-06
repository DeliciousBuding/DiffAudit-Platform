import { StatusBadge } from "@/components/status-badge";
import { LoginForm } from "@/components/login-form";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
      <div className="absolute right-6 top-6 z-10">
        <ThemeToggle />
      </div>

      <section className="relative z-10 grid w-full max-w-6xl gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="surface-card p-8 lg:p-10">
          <div className="mono text-sm tracking-[0.14em] text-primary">DIFFAUDIT PREVIEW</div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">扩散模型隐私审计体验入口</h1>
          <p className="mt-4 max-w-[56ch] text-[15px] leading-7 text-muted-foreground">
            DiffAudit 面向研究团队、合作伙伴与审阅者，提供统一的审计流程、结果展示与报告视图，
            用于更直观地理解扩散模型隐私风险的评估方式。
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-border bg-white/55 p-5 dark:bg-white/5">
              <div className="mono text-[11px] uppercase tracking-[0.14em] text-primary/80">Experience</div>
              <div className="mt-3 text-2xl font-semibold">Guided Review</div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                通过清晰的页面结构和结果卡片，快速浏览审计流程、能力边界与结论展示。
              </p>
            </div>
            <div className="rounded-3xl border border-border bg-white/55 p-5 dark:bg-white/5">
              <div className="mono text-[11px] uppercase tracking-[0.14em] text-primary/80">Access mode</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <StatusBadge tone="success">Shared Login</StatusBadge>
                <StatusBadge tone="info">Invite Preview</StatusBadge>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                当前入口用于受邀预览，便于外部审阅者集中查看平台能力与展示内容。
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-border bg-white/55 p-5 dark:bg-white/5">
            <div className="mono text-[11px] uppercase tracking-[0.14em] text-primary/80">What you can explore</div>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
              <li>统一的图像审计入口与结果浏览体验</li>
              <li>适合评审展示的仪表盘、报告页与说明页</li>
              <li>面向后续产品化的批量任务与审计流程视图</li>
            </ul>
          </div>
        </div>

        <div className="surface-card p-8 lg:p-10">
          <div className="mono text-[11px] uppercase tracking-[0.14em] text-primary/80">Secure Access</div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">登录后开始预览</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            输入共享访问凭据后，即可进入平台并查看审计流程、报告展示和批量任务界面。
          </p>
          <div className="mt-8">
            <LoginForm redirectTo={redirectTo || "/audit"} />
          </div>
        </div>
      </section>
    </main>
  );
}
