import { type Locale } from "@/components/language-picker";
import { fetchAttackDefenseTable } from "@/lib/attack-defense-table";
import { fetchCatalogDashboard } from "@/lib/catalog";
import { readServerLocale } from "@/lib/locale";
import { StatusBadge } from "@/components/status-badge";
import { WorkspacePage } from "@/components/workspace-page";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";

function Kpi({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="workspace-kpi">
      <div className="workspace-kpi-label">{label}</div>
      <div className="workspace-kpi-value">{value}</div>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">{note}</p>
    </div>
  );
}

export default async function WorkspaceHomePage({ locale }: { locale?: Locale } = {}) {
  const resolvedLocale = locale ?? await readServerLocale();
  const copy = WORKSPACE_COPY[resolvedLocale].workspace;
  const [catalog, table] = await Promise.all([
    fetchCatalogDashboard(),
    fetchAttackDefenseTable(),
  ]);

  const activeContracts = catalog?.stats.total ?? 0;
  const defendedRows = table?.stats.defended ?? 0;
  const recentRows = table?.rows.slice(0, 3) ?? [];

  return (
    <WorkspacePage
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={copy.description}
      aside={
        <>
          <Kpi label={copy.kpis.liveContractsLabel} value={String(activeContracts)} note={copy.kpis.liveContractsNote} />
          <Kpi label={copy.kpis.defendedRowsLabel} value={String(defendedRows)} note={copy.kpis.defendedRowsNote} />
        </>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="surface-card p-6">
          <div className="caption">{copy.sections.tasks}</div>
          <div className="mt-5 space-y-4">
            {copy.todoItems.map((item, index) => (
              <div key={item} className="flex items-start gap-3 rounded-[22px] border border-border bg-white/55 p-4">
                <span className="mono inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs">
                  {index + 1}
                </span>
                <p className="text-sm leading-7">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="surface-card p-6">
          <div className="caption">{copy.sections.recentResults}</div>
          <div className="mt-5 space-y-4">
            {recentRows.length > 0 ? (
              recentRows.map((row) => (
                <article key={`${row.track}-${row.attack}-${row.defense}`} className="rounded-[22px] border border-border bg-white/55 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-base font-medium">{row.attack}</div>
                      <p className="mt-1 text-sm text-muted-foreground">{row.model}</p>
                    </div>
                    <StatusBadge tone="info">{row.track}</StatusBadge>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{row.note}</p>
                </article>
              ))
            ) : (
              <div className="rounded-[22px] border border-border bg-white/55 p-4 text-sm leading-7 text-muted-foreground">
                {copy.emptyResults}
              </div>
            )}
          </div>
        </section>
      </div>
    </WorkspacePage>
  );
}
