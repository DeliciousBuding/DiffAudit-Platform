import { headers } from "next/headers";

import { type Locale } from "@/components/language-picker";
import { fetchAttackDefenseTable } from "@/lib/attack-defense-table";
import { fetchCatalogDashboard } from "@/lib/catalog";
import { resolveLocaleFromHeaderStore } from "@/lib/locale";
import { StatusBadge } from "@/components/status-badge";
import { WorkspacePage } from "@/components/workspace-page";
import { CreateJobButton } from "@/components/create-job-button";
import { LiveJobsPanel } from "@/components/live-jobs-panel";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";

export default async function WorkspaceAuditsPage({ locale }: { locale?: Locale } = {}) {
  const resolvedLocale = locale ?? resolveLocaleFromHeaderStore(await headers());
  const copy = WORKSPACE_COPY[resolvedLocale].audits;
  const [catalog, table] = await Promise.all([
    fetchCatalogDashboard(),
    fetchAttackDefenseTable(),
  ]);

  const recommendedContracts =
    catalog?.tracks.flatMap((track) => track.entries).slice(0, 3) ?? [];
  const recentRows = table?.rows.slice(0, 3) ?? [];

  return (
    <WorkspacePage eyebrow={copy.eyebrow} title={copy.title} description={copy.description}>
      <div className="grid gap-5 lg:grid-cols-[0.96fr_1.04fr]">
        <section className="surface-card p-6">
          <div className="caption">{copy.sections.recommendedContracts}</div>
          <div className="mt-5 space-y-4">
            {recommendedContracts.length > 0 ? (
              recommendedContracts.map((entry) => (
                <article
                  key={entry.contractKey}
                  className="rounded-[22px] border border-border bg-white/55 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-base font-medium">{entry.label}</div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {entry.contractKey}
                      </p>
                    </div>
                    <StatusBadge
                      tone={
                        entry.availability === "ready"
                          ? "success"
                          : entry.availability === "partial"
                            ? "warning"
                            : "info"
                      }
                    >
                      {entry.availability}
                    </StatusBadge>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {entry.systemGap}
                  </p>
                  <div className="mt-4 flex items-center justify-between gap-3 rounded-[18px] border border-border bg-white/70 px-3 py-3 text-sm">
                    <span>{copy.recommendedWorkspace}: {entry.bestWorkspace}</span>
                    <CreateJobButton contractKey={entry.contractKey} label={copy.createJob} />
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[22px] border border-border bg-white/55 p-4 text-sm leading-7 text-muted-foreground">
                {copy.emptyContracts}
              </div>
            )}
          </div>
        </section>

        <section className="surface-card p-6">
          <div className="caption">{copy.sections.runningJobs}</div>
          <div className="mt-5">
            <LiveJobsPanel locale={resolvedLocale} />
          </div>
        </section>
      </div>

      <section className="surface-card mt-5 p-6">
        <div className="caption">{copy.sections.recentResults}</div>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {recentRows.length > 0 ? (
            recentRows.map((row) => (
              <article
                key={`${row.track}-${row.attack}-${row.defense}`}
                className="rounded-[22px] border border-border bg-white/55 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-base font-medium">{row.attack}</div>
                  <StatusBadge tone="info">{row.evidenceLevel}</StatusBadge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{row.model}</p>
                <div className="mt-4 grid gap-2 text-sm">
                  <div>AUC {row.aucLabel}</div>
                  <div>ASR {row.asrLabel}</div>
                  <div>TPR {row.tprLabel}</div>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[22px] border border-border bg-white/55 p-4 text-sm leading-7 text-muted-foreground lg:col-span-3">
              {copy.emptyResults}
            </div>
          )}
        </div>
      </section>
    </WorkspacePage>
  );
}
