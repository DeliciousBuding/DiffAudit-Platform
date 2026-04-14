import { type Locale } from "@/components/language-picker";
import { fetchAttackDefenseTable } from "@/lib/attack-defense-table";
import { fetchCatalogDashboard } from "@/lib/catalog";
import { readServerLocale } from "@/lib/locale";
import { StatusBadge } from "@/components/status-badge";
import { WorkspacePage } from "@/components/workspace-page";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";

export default async function WorkspaceReportsPage({ locale }: { locale?: Locale } = {}) {
  const resolvedLocale = locale ?? await readServerLocale();
  const copy = WORKSPACE_COPY[resolvedLocale].reports;
  const [catalog, table] = await Promise.all([
    fetchCatalogDashboard(),
    fetchAttackDefenseTable(),
  ]);

  const rows = table?.rows ?? [];
  const contracts = catalog?.tracks.flatMap((track) => track.entries).slice(0, 4) ?? [];

  return (
    <WorkspacePage eyebrow={copy.eyebrow} title={copy.title} description={copy.description}>
      <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="surface-card p-6">
          <div className="caption">{copy.sections.auditResults}</div>
          <div className="mt-5 space-y-4">
            {rows.length > 0 ? (
              rows.map((row) => (
                <article key={`${row.track}-${row.attack}-${row.defense}`} className="rounded-[22px] border border-border bg-white/55 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-base font-medium">{row.attack}</div>
                      <p className="mt-1 text-sm text-muted-foreground">{row.model}</p>
                    </div>
                    <StatusBadge tone="info">{row.evidenceLevel}</StatusBadge>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-[18px] border border-border bg-white/70 px-3 py-3 text-sm">AUC {row.aucLabel}</div>
                    <div className="rounded-[18px] border border-border bg-white/70 px-3 py-3 text-sm">ASR {row.asrLabel}</div>
                    <div className="rounded-[18px] border border-border bg-white/70 px-3 py-3 text-sm">TPR {row.tprLabel}</div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[22px] border border-border bg-white/55 p-4 text-sm leading-7 text-muted-foreground">
                {copy.emptyResults}
              </div>
            )}
          </div>
        </section>

        <section className="surface-card p-6">
          <div className="caption">{copy.sections.coverageGaps}</div>
          <div className="mt-5 space-y-4">
            {contracts.length > 0 ? (
              contracts.map((entry) => (
                <article key={entry.contractKey} className="rounded-[22px] border border-border bg-white/55 p-4">
                  <div className="mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{entry.contractKey}</div>
                  <div className="mt-2 text-base font-medium">{entry.label}</div>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{entry.systemGap}</p>
                </article>
              ))
            ) : (
              <div className="rounded-[22px] border border-border bg-white/55 p-4 text-sm leading-7 text-muted-foreground">
                {copy.emptyGaps}
              </div>
            )}
            <button type="button" className="portal-pill portal-pill-primary w-full">
              {copy.exportSummary}
            </button>
          </div>
        </section>
      </div>
    </WorkspacePage>
  );
}
