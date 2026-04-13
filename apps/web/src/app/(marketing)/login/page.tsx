import { readAuthConfig, sanitizeRedirectPath } from "@/lib/auth";
import { BrandMark } from "@/components/brand-mark";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;
  const config = readAuthConfig();

  return (
    <main className="site-shell">
      <header className="site-header">
        <div className="container site-header-inner">
          <BrandMark compact />
        </div>
      </header>

      <section className="container py-12 md:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="workspace-highlight">
            <div className="caption">统一认证入口</div>
            <h1 className="mt-3 text-[34px] font-[450] leading-tight">
              登录之后，直接进入同一个网站里的工作台。
            </h1>
            <p className="mt-4 max-w-[48ch] text-sm leading-7 text-muted-foreground">
              首页负责产品表达，登录页负责同站认证，工作台负责任务与结果。
            </p>
          </div>

          <div className="surface-card p-6 md:p-8">
            <div className="caption">共享账户</div>
            <h2 className="mt-3 text-[28px] font-[450] leading-tight">输入共享账号后进入 `/workspace`。</h2>
            <div className="mt-6">
              <LoginForm
                usernameHint={config.username}
                redirectTo={sanitizeRedirectPath(redirectTo)}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
