import { RiskBadge } from "@/components/risk-badge";
import { StatusBadge } from "@/components/status-badge";
import { type Locale } from "@/components/language-picker";
import { type AttackDefenseRowViewModel } from "@/lib/attack-defense-table";
import { riskLabel } from "@/lib/risk-report";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";

export type ReportProvenance = {
  runDirectoryPath?: string | null;
  seed?: string | null;
  schedule?: string | null;
  fixtureVersion?: string | null;
  summaryPath?: string | null;
};

type ReportAuditViewProps = {
  locale: Locale;
  rows: AttackDefenseRowViewModel[];
  provenance: ReportProvenance;
  historyPlaceholder: string;
};

function valueOrDash(value?: string | null) {
  return value && value.trim().length > 0 ? value : "—";
}

export function ReportAuditView({
  locale,
  rows,
  provenance,
  historyPlaceholder,
}: ReportAuditViewProps) {
  const copy = WORKSPACE_COPY[locale].reports;
  const t = locale === "zh-CN"
    ? {
        summaryTitle: "审计视图摘要",
        resultRows: "结果行数",
        defendedRows: "已防御",
        undefendedRows: "无防御",
        provenanceTitle: "实验溯源",
        runDirectory: "Run 目录",
        seed: "Seed",
        schedule: "调度",
        fixtureVersion: "Fixture 版本",
        summaryPath: "summary.json",
        historyTitle: "历史对照",
        historyPlaceholder:
          "同一 track 的既往 verdict diff 将在 14.2 接入；这里预留堆叠卡位，不填造数据。",
      }
    : {
        summaryTitle: "Audit view summary",
        resultRows: "Result rows",
        defendedRows: "Defended",
        undefendedRows: "Undefended",
        provenanceTitle: "Experiment provenance",
        runDirectory: "Run directory",
        seed: "Seed",
        schedule: "Schedule",
        fixtureVersion: "Fixture version",
        summaryPath: "summary.json",
        historyTitle: "History comparison",
        historyPlaceholder:
          "Historical verdict diffs for this track will land in 14.2. This slot is intentionally reserved without fabricated data.",
      };
  const defendedRows = rows.filter((row) => row.defense !== "none" && row.defense !== "None").length;
  const undefendedRows = rows.length - defendedRows;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 xl:grid-cols-[minmax(0,2fr)_minmax(22rem,1fr)]">
        <section className="border border-border bg-card">
          <div className="border-b border-border bg-muted/20 px-3 py-2">
            <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t.summaryTitle}
            </h2>
          </div>
          <div className="grid gap-3 p-3 sm:grid-cols-3">
            <div className="border border-border bg-background px-3 py-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t.resultRows}
              </div>
              <div className="mt-2 text-2xl font-semibold">{rows.length}</div>
            </div>
            <div className="border border-border bg-background px-3 py-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t.defendedRows}
              </div>
              <div className="mt-2 text-2xl font-semibold">{defendedRows}</div>
            </div>
            <div className="border border-border bg-background px-3 py-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t.undefendedRows}
              </div>
              <div className="mt-2 text-2xl font-semibold">{undefendedRows}</div>
            </div>
          </div>
        </section>

        <section className="border border-border bg-card">
          <div className="border-b border-border bg-muted/20 px-3 py-2">
            <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t.provenanceTitle}
            </h2>
          </div>
          <dl className="grid gap-3 p-3 text-xs">
            <div>
              <dt className="font-semibold text-foreground">{t.runDirectory}</dt>
              <dd className="mt-1 break-all text-muted-foreground">{valueOrDash(provenance.runDirectoryPath)}</dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">{t.seed}</dt>
              <dd className="mt-1 text-muted-foreground">{valueOrDash(provenance.seed)}</dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">{t.schedule}</dt>
              <dd className="mt-1 text-muted-foreground">{valueOrDash(provenance.schedule)}</dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">{t.fixtureVersion}</dt>
              <dd className="mt-1 text-muted-foreground">{valueOrDash(provenance.fixtureVersion)}</dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">{t.summaryPath}</dt>
              <dd className="mt-1 break-all text-muted-foreground">{valueOrDash(provenance.summaryPath)}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="border border-border bg-card">
        <div className="border-b border-border bg-muted/20 px-3 py-2">
            <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t.historyTitle}
            </h2>
        </div>
        <div className="space-y-2 p-3 text-xs text-muted-foreground">
          <p>{historyPlaceholder}</p>
          <div className="border border-dashed border-border bg-background px-3 py-4">
              {t.historyPlaceholder}
            </div>
        </div>
      </section>

      <section className="border border-border bg-card">
        <div className="border-b border-border bg-muted/20 px-3 py-2">
          <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {copy.sections.auditResults}
          </h2>
        </div>
        <div className="overflow-auto">
          {rows.length > 0 ? (
            <table className="w-full border-collapse text-xs">
              <thead className="sticky top-0 bg-muted/30">
                <tr className="border-b border-border">
                  <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">{copy.tableHeaders.attack}</th>
                  <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">{copy.tableHeaders.defense}</th>
                  <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">{copy.tableHeaders.model}</th>
                  <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">{copy.tableHeaders.evidence}</th>
                  <th className="px-3 py-1.5 text-right font-semibold text-muted-foreground">{copy.tableHeaders.auc}</th>
                  <th className="px-3 py-1.5 text-right font-semibold text-muted-foreground">{copy.tableHeaders.asr}</th>
                  <th className="px-3 py-1.5 text-right font-semibold text-muted-foreground">{copy.tableHeaders.tpr}</th>
                  <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">{copy.tableHeaders.risk}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={`${row.track}-${row.attack}-${row.defense}-audit`}
                    className={`border-b border-border ${
                      index % 2 === 0 ? "bg-background" : "bg-muted/10"
                    }`}
                  >
                    <td className="px-3 py-2 font-medium">{row.attack}</td>
                    <td className="px-3 py-2 text-muted-foreground">{row.defense}</td>
                    <td className="px-3 py-2 text-muted-foreground">{row.model}</td>
                    <td className="px-3 py-2">
                      <div className="space-y-1">
                        <StatusBadge tone="info" compact>
                          {row.evidenceLevel}
                        </StatusBadge>
                        <div className="text-[10px] text-muted-foreground">{row.note}</div>
                      </div>
                    </td>
                    <td className="mono px-3 py-2 text-right">{row.aucLabel}</td>
                    <td className="mono px-3 py-2 text-right">{row.asrLabel}</td>
                    <td className="mono px-3 py-2 text-right">{row.tprLabel}</td>
                    <td className="px-3 py-2">
                      <RiskBadge
                        auc={parseFloat(row.aucLabel)}
                        label={riskLabel(row.riskLevel, locale)}
                        locale={locale}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-3 py-4 text-center text-xs text-muted-foreground">
              {copy.emptyResults}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
