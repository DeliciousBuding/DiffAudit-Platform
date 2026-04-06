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
            当前版本围绕 REDIFFUSE 展示图像审计、仪表盘、批量检测、合规报告与接入指南，
            用于演示扩散模型成员推断检测的完整前端流程。
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-border bg-white/55 p-5 dark:bg-white/5">
              <div className="mono text-[11px] uppercase tracking-[0.14em] text-primary/80">核心术语</div>
              <div className="mt-3 text-2xl font-semibold">REDIFFUSE</div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                聚焦黑盒 Likelihood、白盒 DDIM Inversion 与灰盒 Attention Map 三类检测路径。
              </p>
            </div>
            <div className="rounded-3xl border border-border bg-white/55 p-5 dark:bg-white/5">
              <div className="mono text-[11px] uppercase tracking-[0.14em] text-primary/80">Access mode</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <StatusBadge tone="success">模拟模式运行中</StatusBadge>
                <StatusBadge tone="info">后端未连接</StatusBadge>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                当前入口支持直接浏览演示版前端；连接真实后端后，可替换 API 地址联调。
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-border bg-white/55 p-5 dark:bg-white/5">
            <div className="mono text-[11px] uppercase tracking-[0.14em] text-primary/80">你将看到的页面</div>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
              <li>图像成员推断检测与模拟进度展示</li>
              <li>审计仪表盘、风险热力图与检测记录</li>
              <li>批量检测、合规报告与接入指南</li>
            </ul>
          </div>
        </div>

        <div className="surface-card p-8 lg:p-10">
          <div className="mono text-[11px] uppercase tracking-[0.14em] text-primary/80">Shared Access</div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">登录后进入平台</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            输入共享访问凭据后，即可进入 DiffAudit 平台，直接查看图像审计、仪表盘、批量检测、合规报告和接入指南。
          </p>
          <div className="mt-8">
            <LoginForm redirectTo={redirectTo || "/audit"} />
          </div>
        </div>
      </section>
    </main>
  );
}
