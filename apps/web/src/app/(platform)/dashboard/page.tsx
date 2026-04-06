import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { fetchCatalogDashboard, type CatalogAvailability } from "@/lib/catalog";

const catalogActions = [
  {
    title: "当前 live catalog 仅包含已发布条目",
    note: "首页只陈述已经进入 live catalog 的能力与证据状态，不把未发布能力写得比后端更完整。",
  },
  {
    title: "未发布 track 保留入口但不放大",
    note: "Gray-box 和 White-box 仍保留统一入口位置，但在没有 live 条目前只显示为空位和目录状态。",
  },
  {
    title: "证据深读继续留给 report",
    note: "首页只说明系统状态，不把单条 evidence 的深读内容提前搬到 dashboard。",
  },
];

const trackTone: Record<string, "primary" | "warning" | "info"> = {
  "black-box": "primary",
  "gray-box": "warning",
  "white-box": "info",
};

const availabilityTone: Record<CatalogAvailability, "success" | "warning" | "info"> = {
  ready: "success",
  partial: "warning",
  planned: "info",
};

export default async function DashboardPage() {
  const catalog = await fetchCatalogDashboard();

  if (!catalog) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="三轨系统状态"
          description="统一查看 black-box、gray-box、white-box 三条线当前的能力成熟度、最佳证据状态和可读入口。"
        />

        <SectionCard
          eyebrow="当前状态"
          title="系统状态暂时不可用"
          description="三线能力目录暂时无法加载。请稍后重试，系统恢复后这里会继续展示当前可读证据和规划中的能力入口。"
          className="overflow-hidden bg-[linear-gradient(135deg,hsl(28_94%_94%),transparent_48%),linear-gradient(180deg,color-mix(in_srgb,var(--card)_92%,transparent),color-mix(in_srgb,var(--card)_88%,transparent))]"
        >
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone="warning">state feed unavailable</StatusBadge>
              <StatusBadge tone="info">waiting for capability status</StatusBadge>
            </div>

            <div className="rounded-[26px] border border-[color:var(--warning-soft)] bg-white/60 p-5 shadow-[0_20px_60px_hsl(30_60%_28%/0.08)]">
              <div className="text-[30px] font-semibold leading-tight tracking-tight">
                当前无法展示三条线的最新状态，但系统恢复后会继续提供统一的能力与证据概览。
              </div>
              <p className="mt-3 max-w-[60ch] text-sm leading-7 text-muted-foreground">
                这页默认展示哪些能力已经有证据、哪些仍处于准备态，以及哪些能力还在规划中，而不是放大单一研究方法的临时状态。
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    );
  }

  const stats = [
    {
      label: "总合同项",
      value: String(catalog.stats.total),
      sub: "catalog entries",
      iconLabel: "ALL",
      tone: "primary" as const,
    },
    {
      label: "Ready",
      value: String(catalog.stats.ready),
      sub: "可直接进入平台消费",
      iconLabel: "RDY",
      tone: "success" as const,
    },
    {
      label: "Partial",
      value: String(catalog.stats.partial),
      sub: "仅暴露部分能力或证据",
      iconLabel: "PAR",
      tone: "warning" as const,
    },
    {
      label: "Planned",
      value: String(catalog.stats.planned),
      sub: "已进入统一目录，未进入默认执行面",
      iconLabel: "PLN",
      tone: "info" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="三轨系统状态"
        description="统一查看当前已经进入 live catalog 的能力状态，并保留三条线的统一入口结构。"
      />

      <SectionCard
        eyebrow="系统概览"
        title="统一三线当前 live 状态"
        description="首页先展示当前已经进入 live catalog 的能力，再保留三条线的入口和目录位置。"
        className="overflow-hidden bg-[linear-gradient(135deg,hsl(258_82%_97%),transparent_50%),linear-gradient(180deg,color-mix(in_srgb,var(--card)_92%,transparent),color-mix(in_srgb,var(--card)_88%,transparent))] dark:bg-[linear-gradient(135deg,hsl(258_40%_22%/0.55),transparent_52%),linear-gradient(180deg,hsl(220_13%_15%/0.92),hsl(220_13%_14%/0.88))]"
      >
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone="primary">3 tracks</StatusBadge>
              <StatusBadge tone="success">{catalog.stats.ready} ready</StatusBadge>
              <StatusBadge tone="warning">{catalog.stats.partial} partial</StatusBadge>
              <StatusBadge tone="info">{catalog.stats.planned} planned</StatusBadge>
            </div>

            <div className="rounded-[26px] border border-primary/15 bg-white/60 p-5 shadow-[0_20px_60px_hsl(258_45%_30%/0.08)] dark:bg-white/6">
              <div className="text-[30px] font-semibold leading-tight tracking-tight">
                这页只陈述当前已经进入 live catalog 的能力状态，不把尚未发布的线写成已经可读。
              </div>
              <p className="mt-3 max-w-[60ch] text-sm leading-7 text-muted-foreground">
                当前 live catalog 里已有可读条目会直接显示在目录中；还没进入 live catalog 的线继续保留位置，但不提前承诺证据或运行入口。
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            {catalog.tracks.map((item) => (
              <div
                key={item.track}
                className="rounded-[24px] border border-border bg-white/55 p-4 dark:bg-white/5"
              >
                <div className="mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  {item.track}
                </div>
                <div className="mt-3 text-2xl font-semibold tracking-tight">{item.total}</div>
                <div className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.track === "black-box"
                    ? "当前 live catalog 仅包含已发布条目"
                    : "尚未进入 live catalog"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <SectionCard
        eyebrow="三线状态"
        title="三线目录状态"
        description="固定展示 black-box、gray-box、white-box 三条线当前的目录数量和成熟度分布，即使某条线暂时还没有条目。"
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {catalog.tracks.map((track) => (
            <div
              key={track.track}
              className="rounded-[24px] border border-border bg-white/55 p-5 dark:bg-white/5"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  {track.track}
                </div>
                <StatusBadge tone={trackTone[track.track] ?? "primary"}>{track.total} total</StatusBadge>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <TrackMetric label="ready" value={track.ready} />
                <TrackMetric label="partial" value={track.partial} />
                <TrackMetric label="planned" value={track.planned} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
        <SectionCard
          eyebrow="统一目录"
          title="按 track 分组的 catalog 条目"
          description="每条线都先展示当前成熟度，再列出已进入系统目录的能力项和已发布的最佳证据状态。"
        >
          <div className="space-y-4">
            {catalog.tracks.map((track) => (
              <div key={track.track} className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                      {track.track}
                    </div>
                    <div className="mt-1 text-base font-semibold text-foreground">
                      {track.total > 0 ? `${track.total} 个 contract` : "当前无 catalog 条目"}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge tone="success">{track.ready} ready</StatusBadge>
                    <StatusBadge tone="warning">{track.partial} partial</StatusBadge>
                    <StatusBadge tone="info">{track.planned} planned</StatusBadge>
                  </div>
                </div>

                {track.entries.length === 0 ? (
                  <div className="rounded-[24px] border border-dashed border-border bg-white/35 p-4 text-sm leading-6 text-muted-foreground dark:bg-white/4">
                    当前无 catalog 条目
                  </div>
                ) : (
                  track.entries.map((entry) => (
                    <div
                      key={entry.contractKey}
                      className="rounded-[24px] border border-border bg-white/45 p-4 dark:bg-white/5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="mono text-xs text-muted-foreground">{entry.contractKey}</div>
                          <div className="mt-1 text-sm font-semibold text-foreground">{entry.label}</div>
                          <div className="mt-2 text-sm text-muted-foreground">{entry.paper}</div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge tone={trackTone[entry.track] ?? "primary"}>{entry.track}</StatusBadge>
                          <StatusBadge tone={availabilityTone[entry.availability]}>{entry.availability}</StatusBadge>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <CatalogDetail label="Capability" value={entry.capabilityLabel} />
                        <CatalogDetail label="Best evidence status" value={entry.evidenceLevel} />
                        <CatalogDetail label="Published workspace" value={entry.bestWorkspace} />
                        <CatalogDetail label="Runtime status" value={entry.runtimeLabel} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard
            eyebrow="当前重点"
            title="三条线的当前解读"
            description="用统一语言解释当前 live 状态，避免把未发布能力写得像已经上线。"
          >
            <div className="space-y-3">
              {catalogActions.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[24px] border border-border bg-white/45 p-4 dark:bg-white/5"
                >
                  <div className="text-sm font-semibold text-foreground">{item.title}</div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.note}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="下一步"
            title="页面分工"
            description="首页继续承担系统状态入口，单条 evidence 的细读留给 report。"
          >
            <div className="space-y-4">
              <ActionCard
                index={1}
                title="保持首页只讲 live 状态"
                note="首页继续展示 track、availability 和已发布条目的目录状态，不在这里扩成单条 evidence 细读。"
              />
              <ActionCard
                index={2}
                title="单条 evidence 继续走 report"
                note="如果需要看某一条 evidence 的细节、workspace 和 summary，就继续进入 report，而不是在 dashboard 重复同一层内容。"
              />
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function CatalogDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-border bg-white/60 px-4 py-3 dark:bg-white/6">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-2 break-all text-sm font-medium leading-6 text-foreground">{value}</div>
    </div>
  );
}

function TrackMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[18px] border border-border bg-white/60 px-3 py-3 text-center dark:bg-white/6">
      <div className="mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
      <div className="mt-2 text-xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}

function ActionCard({
  index,
  title,
  note,
}: {
  index: number;
  title: string;
  note: string;
}) {
  return (
    <div className="rounded-[24px] border border-border bg-white/45 p-4 dark:bg-white/5">
      <div className="flex items-center gap-3">
        <span className="mono inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {index}
        </span>
        <div className="text-sm font-semibold text-foreground">{title}</div>
      </div>
      {note ? <p className="mt-3 text-sm leading-6 text-muted-foreground">{note}</p> : null}
    </div>
  );
}
