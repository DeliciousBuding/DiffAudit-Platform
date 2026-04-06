const steps = [
  "前端调用平台 Go API `/api/v1/audit/jobs` 创建任务",
  "平台 Go API 把请求转发到研究仓库本地 Go 服务",
  "研究仓库输出 `summary.json` 和 artifact 路径",
  "平台读取结果并展示成员风险结论"
];

export default function GuidePage() {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h1 className="text-2xl font-semibold">接入指南</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
          当前已经形成两层 Go 控制面：平台侧负责 API 网关，研究侧负责本地审计控制面。
          后续前端只需要围绕这条已打通的任务链继续接页面状态和交互。
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
