export default function ReportPage() {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="mono text-xs uppercase tracking-[0.08em] text-[var(--muted-2)]">
          Audit Report
        </div>
        <h1 className="mt-3 text-2xl font-semibold">合规报告</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">
          报告页用于给出成员风险判断、实验上下文、模型信息和建议项。
          当前阶段先把结构搭出来，后续由后端真实结果驱动。
        </p>
      </div>

      <div className="glass-card p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="mono text-[11px] uppercase tracking-[0.08em] text-[var(--muted-2)]">
              Verdict
            </div>
            <div className="mt-3 text-xl font-semibold text-[var(--warn)]">Likely member</div>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="mono text-[11px] uppercase tracking-[0.08em] text-[var(--muted-2)]">
              Confidence
            </div>
            <div className="mt-3 text-xl font-semibold text-[var(--accent)]">0.82</div>
          </div>
        </div>
      </div>
    </div>
  );
}
