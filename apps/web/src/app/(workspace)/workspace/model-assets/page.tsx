import { headers } from "next/headers";

import { StatusBadge } from "@/components/status-badge";
import { WorkspacePageFrame, WorkspaceSectionCard } from "@/components/workspace-frame";
import { resolveLocaleFromHeaderStore } from "@/lib/locale";
import { getWorkspaceCatalogData } from "@/lib/workspace-source";

export const dynamic = "force-dynamic";

export default async function ModelAssetsPage() {
  const locale = resolveLocaleFromHeaderStore(await headers());
  const catalog = await getWorkspaceCatalogData();
  const entries = catalog?.tracks.flatMap((track) => track.entries) ?? [];
  const copy = locale === "zh-CN"
    ? {
      eyebrow: "模型资产",
      title: "模型资产",
      description: "集中管理已纳入审计的模型、数据集与环境版本，保留资产安全与合规可追溯。",
      total: "模型数量",
      ready: "可审计资产",
      partial: "待补充资产",
      planned: "规划中",
      inventory: "资产目录",
      details: "资产详情",
      empty: "暂无模型资产。",
      owner: "负责人",
      runtime: "Runtime",
      evidence: "证据等级",
      workspace: "工作区",
    }
    : {
      eyebrow: "Model Assets",
      title: "Model Assets",
      description: "Manage auditable models, datasets, and runtime versions with traceable safety context.",
      total: "Models",
      ready: "Auditable assets",
      partial: "Needs coverage",
      planned: "Planned",
      inventory: "Asset inventory",
      details: "Asset details",
      empty: "No model assets available.",
      owner: "Owner",
      runtime: "Runtime",
      evidence: "Evidence level",
      workspace: "Workspace",
    };
  const selected = entries[0] ?? null;

  return (
    <WorkspacePageFrame eyebrow={copy.eyebrow} title={copy.title} description={copy.description}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="workspace-kpi-card"><div className="workspace-kpi-card-label">{copy.total}</div><div className="workspace-kpi-card-value">{catalog?.stats.total ?? 0}</div></div>
        <div className="workspace-kpi-card"><div className="workspace-kpi-card-label">{copy.ready}</div><div className="workspace-kpi-card-value">{catalog?.stats.ready ?? 0}</div></div>
        <div className="workspace-kpi-card"><div className="workspace-kpi-card-label">{copy.partial}</div><div className="workspace-kpi-card-value">{catalog?.stats.partial ?? 0}</div></div>
        <div className="workspace-kpi-card"><div className="workspace-kpi-card-label">{copy.planned}</div><div className="workspace-kpi-card-value">{catalog?.stats.planned ?? 0}</div></div>
      </div>

      <div className="workspace-page-with-rail">
        <div className="workspace-page-primary">
          <WorkspaceSectionCard title={copy.inventory}>
            <div className="grid gap-3 p-4 md:grid-cols-2">
              {entries.length > 0 ? entries.map((entry) => (
                <article key={entry.contractKey} className="workspace-asset-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-bold text-foreground">{entry.label}</h2>
                      <p className="mt-1 text-xs text-muted-foreground">{entry.capabilityLabel}</p>
                    </div>
                    <StatusBadge tone={entry.availability === "ready" ? "success" : entry.availability === "partial" ? "warning" : "info"} compact>
                      {entry.availability}
                    </StatusBadge>
                  </div>
                  <dl className="mt-4 grid gap-2 text-xs text-muted-foreground">
                    <div className="flex justify-between gap-3"><dt>{copy.runtime}</dt><dd className="truncate text-foreground">{entry.runtimeLabel}</dd></div>
                    <div className="flex justify-between gap-3"><dt>{copy.evidence}</dt><dd className="truncate text-foreground">{entry.evidenceLevel}</dd></div>
                    <div className="flex justify-between gap-3"><dt>{copy.workspace}</dt><dd className="truncate text-foreground">{entry.bestWorkspace}</dd></div>
                  </dl>
                </article>
              )) : <p className="text-sm text-muted-foreground">{copy.empty}</p>}
            </div>
          </WorkspaceSectionCard>
        </div>

        <aside className="workspace-page-rail">
          <section className="workspace-inspector-card">
            <div className="workspace-inspector-card-header"><h2>{copy.details}</h2></div>
            <div className="grid gap-3 p-4 text-sm">
              <div className="text-lg font-bold text-foreground">{selected?.label ?? copy.empty}</div>
              {selected ? (
                <>
                  <div className="workspace-inspector-metric"><span>{copy.owner}</span><strong>DiffAudit</strong></div>
                  <div className="workspace-inspector-metric"><span>{copy.runtime}</span><strong>{selected.runtimeLabel}</strong></div>
                  <div className="workspace-inspector-metric"><span>{copy.evidence}</span><strong>{selected.evidenceLevel}</strong></div>
                </>
              ) : null}
            </div>
          </section>
        </aside>
      </div>
    </WorkspacePageFrame>
  );
}
