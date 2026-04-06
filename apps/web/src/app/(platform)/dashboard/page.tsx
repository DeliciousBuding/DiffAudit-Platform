const stats = [
  { label: "Models Ready", value: "3", tone: "text-[var(--accent)]" },
  { label: "Best Recon Scale", value: "25", tone: "text-[var(--warn)]" },
  { label: "Best AUC", value: "0.768", tone: "text-[var(--accent-3)]" },
  { label: "Platform Mode", value: "Stub", tone: "text-[var(--danger)]" }
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
            的 `public-25 step10`，后续平台应该围绕这条路径先完成第一版接入。
          </p>
        </div>
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold">系统状态</h2>
          <div className="mt-4 text-sm text-[var(--muted)]">
            前端结构已就位，后端接口已占位，研究仓库集成待接。
          </div>
        </div>
      </div>
    </div>
  );
}
