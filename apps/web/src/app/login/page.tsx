import { LoginForm } from "@/components/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(79,255,176,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,107,53,0.12),transparent_30%)]" />
      <div className="absolute inset-x-0 top-0 h-56 bg-[linear-gradient(180deg,rgba(123,143,255,0.12),transparent)]" />

      <section className="glass-card relative z-10 w-full max-w-md p-8 shadow-[0_40px_120px_rgba(0,0,0,0.35)]">
        <div className="mono text-sm tracking-[0.14em] text-[var(--accent)]">
          DIFFAUDIT PREVIEW
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          临时访问登录
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          当前平台使用共享账号密码进行临时访问控制。登录后可查看审计面板、结果页和接口代理。
        </p>
        <LoginForm redirectTo={redirectTo || "/audit"} />
      </section>
    </main>
  );
}
