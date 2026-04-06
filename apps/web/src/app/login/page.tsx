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
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">扩散模型隐私审计平台</h1>
          <p className="mt-4 max-w-[56ch] text-[15px] leading-7 text-muted-foreground">
            这个公网入口现在用于审阅平台壳、统一任务形状和研究结果呈现。当前访问通过共享登录保护，
            后端真实执行仍然保持在研究仓库侧。
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-border bg-white/55 p-5 dark:bg-white/5">
              <div className="mono text-[11px] uppercase tracking-[0.14em] text-primary/80">Current route</div>
              <div className="mt-3 text-2xl font-semibold">Recon</div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                第一版聚焦 Stable Diffusion + DDIM 的成熟黑盒审计路径。
              </p>
            </div>
            <div className="rounded-3xl border border-border bg-white/55 p-5 dark:bg-white/5">
              <div className="mono text-[11px] uppercase tracking-[0.14em] text-primary/80">Access mode</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <StatusBadge tone="success">Shared Login</StatusBadge>
                <StatusBadge tone="info">Review Only</StatusBadge>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                登录后可以查看页面壳、API 代理和当前接入状态。
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-border bg-white/55 p-5 dark:bg-white/5">
            <div className="mono text-[11px] uppercase tracking-[0.14em] text-primary/80">What this preview covers</div>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
              <li>统一的审计入口与任务组织方式</li>
              <li>平台内共享登录和受保护 API 访问</li>
              <li>结果页、批量页、接入说明页的展示骨架</li>
            </ul>
          </div>
        </div>

        <div className="surface-card p-8 lg:p-10">
          <div className="mono text-[11px] uppercase tracking-[0.14em] text-primary/80">Temporary Access</div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">临时访问登录</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            当前平台使用共享账号密码进行临时访问控制。登录后可查看审计面板、结果页和接口代理。
          </p>
          <div className="mt-8">
            <LoginForm redirectTo={redirectTo || "/audit"} />
          </div>
        </div>
      </section>
    </main>
  );
}
