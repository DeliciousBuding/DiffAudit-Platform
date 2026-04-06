const queue = [
  { name: "celeba_public_25_target_member", status: "completed" },
  { name: "celeba_public_25_target_non_member", status: "completed" },
  { name: "celeba_public_25_shadow_member", status: "completed" },
  { name: "celeba_public_25_shadow_non_member", status: "completed" }
];

export default function BatchPage() {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h1 className="text-2xl font-semibold">批量检测</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
          第二阶段会把单图输入扩展到批量作业和任务队列。第一版先预留列表和状态视图。
        </p>
      </div>

      <div className="glass-card p-6">
        <div className="space-y-3">
          {queue.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
            >
              <span className="mono text-xs text-[var(--foreground)]">{item.name}</span>
              <span className="mono rounded-md bg-[rgba(79,255,176,0.08)] px-2 py-1 text-[10px] text-[var(--accent)]">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
