const methods = [
  { label: "黑盒 / Recon", tone: "text-[var(--accent)]" },
  { label: "灰盒 / PIA", tone: "text-[var(--accent-2)]" },
  { label: "白盒 / Attention", tone: "text-[var(--accent-3)]" }
];

export default function AuditPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
      <section className="glass-card p-6">
        <div className="mono text-xs uppercase tracking-[0.12em] text-[var(--muted-2)]">
          Audit Intake
        </div>
        <h1 className="mt-3 text-2xl font-semibold">图像成员推断检测</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
          第一版先支持一个稳定可接入的产品壳：上传目标图像，选择模型与审计方法，
          然后把任务交给后端生成统一的成员风险结果。
        </p>

        <div className="mt-6 rounded-2xl border border-dashed border-[rgba(79,255,176,0.25)] bg-[rgba(79,255,176,0.03)] px-6 py-10 text-center">
          <div className="text-sm text-[var(--foreground)]">拖拽或点击上传目标图像</div>
          <div className="mt-2 text-xs text-[var(--muted-2)]">
            先占位前端结构，后续接真实上传与任务流
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="glass-card p-4">
            <div className="mono text-[11px] uppercase tracking-[0.08em] text-[var(--muted-2)]">
              Target model
            </div>
            <div className="mt-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm">
              Stable Diffusion 1.5 + DDIM
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="mono text-[11px] uppercase tracking-[0.08em] text-[var(--muted-2)]">
              Audit policy
            </div>
            <div className="mt-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm">
              Recon / membership risk
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {methods.map((method) => (
            <span
              key={method.label}
              className={`mono rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs ${method.tone}`}
            >
              {method.label}
            </span>
          ))}
        </div>

        <button className="mt-6 w-full rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-black transition hover:brightness-110">
          提交审计任务
        </button>
      </section>

      <section className="grid gap-4">
        <div className="glass-card p-5">
          <div className="mono text-xs uppercase tracking-[0.08em] text-[var(--muted-2)]">
            Output shape
          </div>
          <div className="mt-4 space-y-3 text-sm text-[var(--muted)]">
            <div>成员风险分数</div>
            <div>成员 / 非成员判定</div>
            <div>实验 summary 路径</div>
            <div>artifact 路径与日志</div>
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="mono text-xs uppercase tracking-[0.08em] text-[var(--muted-2)]">
            First release
          </div>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted)]">
            <li>只接一条成熟主线：Stable Diffusion + DDIM recon</li>
            <li>后端先做任务壳，不重写研究算法</li>
            <li>真实执行后续通过研究仓库 CLI 打通</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
