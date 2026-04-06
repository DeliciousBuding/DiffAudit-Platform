import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { fetchCatalogDashboard, type CatalogAvailability } from "@/lib/catalog";

const catalogActions = [
  {
    title: "Dashboard 只读 catalog，不在这里 fan-out 拉 summary",
    note: "这页先负责能力发现和成熟度可见性，把单条 evidence 深读继续留给 report。",
  },
  {
    title: "统一消费路径固定为 catalog -> summary",
    note: "前端先识别 contract_key、availability 和 evidence_level，再决定是否进入更深的 evidence 页面。",
  },
  {
    title: "灰盒 / 白盒先忠实展示成熟度，不伪装成已同级可执行",
    note: "planned 和 partial 条目只陈述当前状态，不提前承诺运行入口。",
  },
];

const unavailableActions = [
  "先恢复 /api/v1/catalog",
  "确认平台网关和后端代理仍能访问统一 catalog",
  "catalog 恢复后再继续扩 dashboard 文案或更深层指标读取",
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
          title="审计仪表盘"
          description="这页现在优先承担统一 catalog 展示壳。读不到 catalog 时，不继续输出静态仪表盘，而是先明确恢复真实读链。"
        />

        <SectionCard
          eyebrow="当前状态"
          title="统一 catalog 暂不可用"
          description="未能从平台后端读取统一 contract 目录。现在应该先恢复 catalog，而不是继续保留黑盒特例页的静态演示内容。 "
          className="overflow-hidden bg-[linear-gradient(135deg,hsl(28_94%_94%),transparent_48%),linear-gradient(180deg,color-mix(in_srgb,var(--card)_92%,transparent),color-mix(in_srgb,var(--card)_88%,transparent))]"
        >
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone="warning">catalog unavailable</StatusBadge>
              <StatusBadge tone="info">waiting for unified contract list</StatusBadge>
            </div>

            <div className="rounded-[26px] border border-[color:var(--warning-soft)] bg-white/60 p-5 shadow-[0_20px_60px_hsl(30_60%_28%/0.08)]">
              <div className="text-[30px] font-semibold leading-tight tracking-tight">
                dashboard 的真实入口已经改成 catalog，当前应该先恢复能力目录，而不是继续播放静态监控故事。
              </div>
              <p className="mt-3 max-w-[60ch] text-sm leading-7 text-muted-foreground">
                report 保持单条 evidence 深读不变，但 dashboard 这页必须先看见统一 contract 目录，才能继续承担三线化展示壳。
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="恢复动作"
          title="先恢复 catalog 根，再继续上层展示"
          description="这三步是当前最短恢复路径。"
        >
          <div className="space-y-3">
            {unavailableActions.map((item, index) => (
              <ActionCard key={item} index={index + 1} title={item} note="" />
            ))}
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
        title="审计仪表盘"
        description="dashboard 现在先承担统一 evidence / catalog 展示壳，只消费 contract 目录，不在这里继续下钻 ready 条目的 summary。"
      />

      <SectionCard
        eyebrow="展示壳"
        title="统一 evidence / catalog 展示壳"
        description="这页先看见当前有哪些 contract_key、成熟度如何、最佳证据落点在哪里；更深的单条 evidence 继续留在 report。"
        className="overflow-hidden bg-[linear-gradient(135deg,hsl(258_82%_97%),transparent_50%),linear-gradient(180deg,color-mix(in_srgb,var(--card)_92%,transparent),color-mix(in_srgb,var(--card)_88%,transparent))] dark:bg-[linear-gradient(135deg,hsl(258_40%_22%/0.55),transparent_52%),linear-gradient(180deg,hsl(220_13%_15%/0.92),hsl(220_13%_14%/0.88))]"
      >
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone="primary">catalog -&gt; summary</StatusBadge>
              <StatusBadge tone="success">{catalog.stats.ready} ready</StatusBadge>
              <StatusBadge tone="warning">{catalog.stats.partial} partial</StatusBadge>
            </div>

            <div className="rounded-[26px] border border-primary/15 bg-white/60 p-5 shadow-[0_20px_60px_hsl(258_45%_30%/0.08)] dark:bg-white/6">
              <div className="text-[30px] font-semibold leading-tight tracking-tight">
                dashboard 不再讲“某个黑盒样本今天有多危险”，而是先忠实陈述三线 contract 当前到了哪一步。
              </div>
              <p className="mt-3 max-w-[60ch] text-sm leading-7 text-muted-foreground">
                当前最短路径是把 dashboard 收口成 catalog 入口，再把单条 evidence 深读继续放在 report。这样既去掉黑盒特例页，又不会把 summary fan-out 塞回首页。
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
                  ready {item.ready} / total {item.total}
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

      <div className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
        <SectionCard
          eyebrow="统一目录"
          title="当前 catalog 条目"
          description="这里只展示 contract 目录和最佳证据落点，不在 dashboard 再次读取条目对应的 summary 内容。"
        >
          <div className="space-y-4">
            {catalog.entries.map((entry) => (
              <div
                key={entry.key}
                className="rounded-[24px] border border-border bg-white/45 p-4 dark:bg-white/5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="mono text-xs text-muted-foreground">{entry.key}</div>
                    <div className="mt-1 text-sm font-semibold text-foreground">{entry.label}</div>
                    <div className="mt-2 text-sm text-muted-foreground">{entry.capabilityLabel}</div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge tone={trackTone[entry.track] ?? "primary"}>{entry.track}</StatusBadge>
                    <StatusBadge tone={availabilityTone[entry.availability]}>{entry.availability}</StatusBadge>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <CatalogDetail label="Evidence level" value={entry.evidenceLevel} />
                  <CatalogDetail label="Runtime" value={entry.runtimeLabel} />
                  <CatalogDetail label="Best workspace" value={entry.bestWorkspace} />
                  <CatalogDetail label="Best summary path" value={entry.bestSummaryPath} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard
            eyebrow="当前规则"
            title="这页只负责能力发现"
            description="dashboard 和 report 的分工先明确收口，避免再次把首页堆回黑盒特例逻辑。"
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
            title="后续推进顺序"
            description="保持 report 现状不回退，同时让 dashboard 成为统一目录入口。"
          >
            <div className="space-y-4">
              <ActionCard
                index={1}
                title="继续把 dashboard 作为 catalog 壳迭代"
                note="后续如果需要更深指标，再基于明确需求讨论是否新增二级 evidence drill-down，而不是默认 fan-out。"
              />
              <ActionCard
                index={2}
                title="report 继续保留单条 evidence 深读"
                note="当前最佳 recon 证据仍然由 report 负责读取和陈述，不在这轮改动里回退。"
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
