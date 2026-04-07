"use client";

import { useMemo, useState } from "react";

import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { batchSeedItems } from "@/lib/demo-data";

type QueueItem = {
  id: string;
  name: string;
  status: "wait" | "run" | "mem" | "non";
  confidence: number;
};

function statusBadge(item: QueueItem) {
  if (item.status === "mem") {
    return <StatusBadge tone="warning">成员 {Math.round(item.confidence * 100)}%</StatusBadge>;
  }

  if (item.status === "non") {
    return <StatusBadge tone="success">非成员 {Math.round(item.confidence * 100)}%</StatusBadge>;
  }

  if (item.status === "run") {
    return <StatusBadge tone="primary">检测中...</StatusBadge>;
  }

  return <StatusBadge tone="info">等待中</StatusBadge>;
}

export function BatchConsole() {
  const [queue, setQueue] = useState<QueueItem[]>(
    batchSeedItems.map((name, index) => ({
      id: `${index}-${name}`,
      name,
      status: "wait",
      confidence: 0,
    })),
  );

  const summary = useMemo(() => {
    return {
      member: queue.filter((item) => item.status === "mem").length,
      nonMember: queue.filter((item) => item.status === "non").length,
      wait: queue.filter((item) => item.status === "wait").length,
    };
  }, [queue]);

  async function startBatch() {
    for (let index = 0; index < queue.length; index += 1) {
      setQueue((current) =>
        current.map((item, itemIndex) =>
          itemIndex === index ? { ...item, status: "run" } : item,
        ),
      );
      await new Promise((resolve) => window.setTimeout(resolve, 600));
      const isMember = Math.random() > 0.5;
      const confidence = 0.55 + Math.random() * 0.4;
      setQueue((current) =>
        current.map((item, itemIndex) =>
          itemIndex === index
            ? { ...item, status: isMember ? "mem" : "non", confidence }
            : item,
        ),
      );
    }
  }

  function clearQueue() {
    setQueue([]);
  }

  return (
    <div className="space-y-6">
      <SectionCard
        eyebrow="Batch mode"
        title="REDIFFUSE 批量检测"
        description="组织多张图像的成员推断任务，按批次统一比较和风险回顾。"
      >
        <div className="rounded-[28px] border border-dashed border-primary/25 bg-primary/6 px-6 py-10 text-center">
          <div className="text-base font-semibold">点击或拖拽多张图像到此处</div>
          <div className="mt-2 text-sm text-muted-foreground">
            面向批量执行 REDIFFUSE 成员推断检测
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={startBatch}
            className="rounded-2xl border border-primary/35 px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/8"
          >
            开始批量检测
          </button>
          <button
            type="button"
            className="rounded-2xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            导出 CSV
          </button>
          <button
            type="button"
            onClick={clearQueue}
            className="rounded-2xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            清空队列
          </button>
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="Queue"
        title={`检测队列 (${queue.length} 项)`}
        description={`成员 ${summary.member} / 非成员 ${summary.nonMember} / 待检 ${summary.wait}`}
      >
        <div className="space-y-3">
          {queue.length === 0 ? (
            <div className="text-sm text-muted-foreground">当前队列为空。</div>
          ) : (
            queue.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-2xl border border-border bg-white/45 px-4 py-4 dark:bg-white/5"
              >
                <div className="text-lg">🖼</div>
                <div className="mono flex-1 truncate text-xs text-foreground">{item.name}</div>
                {statusBadge(item)}
              </div>
            ))
          )}
        </div>
      </SectionCard>
    </div>
  );
}
