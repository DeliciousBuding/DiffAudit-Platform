const steps = [
  "前端调用 FastAPI `/api/v1/audit/jobs` 创建任务",
  "后端后续会把任务转发到研究仓库 CLI",
  "研究仓库输出 `summary.json` 和 artifact 路径",
  "平台读取结果并展示成员风险结论"
];

export default function GuidePage() {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h1 className="text-2xl font-semibold">接入指南</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
          第一版平台先面向最小闭环：前端调用 FastAPI，FastAPI 再调用研究仓库。
        </p>
      </div>

      <div className="glass-card p-6">
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step} className="flex gap-4">
              <div className="mono flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-semibold text-black">
                {index + 1}
              </div>
              <div className="text-sm leading-7 text-[var(--muted)]">{step}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
