const stats = [
  { label: "Models Ready", value: "3", tone: "text-[var(--accent)]" },
  { label: "Best Recon Scale", value: "100", tone: "text-[var(--warn)]" },
  { label: "Best AUC", value: "0.788", tone: "text-[var(--accent-3)]" },
  { label: "Platform Mode", value: "Go Proxy", tone: "text-[var(--accent)]" }
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card p-5">
            <div className="mono text-[11px] uppercase tracking-[0.08em] text-[var(--muted-2)]">
              {stat.label}
            </div>
            <div className={`mt-3 text-3xl font-bold ${stat.tone}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold">当前最强黑盒证据</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
            当前研究主线的最强公开子集证据来自 `Stable Diffusion + DDIM`
            的 `public-100 step10`。平台侧 Go API 与研究侧本地 Go API 已打通，
            前端接下来应围绕这条已验证路径继续补任务状态和结果展示。
          </p>
        </div>
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold">系统状态</h2>
          <div className="mt-4 text-sm text-[var(--muted)]">
            前端结构已就位，平台后端与研究本地服务已联调通过，剩余工作集中在页面交互和结果视图。
          </div>
        </div>
      </div>
    </div>
  );
}
