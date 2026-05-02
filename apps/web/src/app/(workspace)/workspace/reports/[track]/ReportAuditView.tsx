import { RiskBadge } from "@/components/risk-badge";
import { ReportEvidenceStack } from "@/components/report-evidence-stack";
import { type Locale } from "@/components/language-picker";
import { type AttackDefenseRowViewModel } from "@/lib/workspace-source";
import { riskLabel } from "@/lib/risk-report";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";

export type ReportProvenance = {
  runDirectoryPath?: string | null;
  seed?: string | null;
  schedule?: string | null;
  fixtureVersion?: string | null;
  summaryPath?: string | null;
  evidenceLevel?: string | null;
  admissionStatus?: string | null;
  admissionLevel?: string | null;
  provenanceStatus?: string | null;
  intakeManifest?: string | null;
};

export type ReportJobContext = {
  jobId?: string;
  contractKey?: string;
  targetModel?: string;
  aucLabel?: string;
};

type ReportAuditViewProps = {
  locale: Locale;
  rows: AttackDefenseRowViewModel[];
  provenance: ReportProvenance;
  historyPlaceholder: string;
  jobContext?: ReportJobContext;
  highlightedRowKeys?: string[];
};

function hasValue(value?: string | null): boolean {
  return !!value && value.trim().length > 0 && value.trim() !== "—";
}

export function ReportAuditView({
  locale,
  rows,
  provenance,
  historyPlaceholder,
  jobContext,
  highlightedRowKeys = [],
}: ReportAuditViewProps) {
  const copy = WORKSPACE_COPY[locale].reports;
  const highlightedRows = new Set(highlightedRowKeys);
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
        evidenceLevel: "证据等级",
        admissionStatus: "准入状态",
        admissionLevel: "准入层级",
        provenanceStatus: "溯源状态",
        intakeManifest: "导入清单",
        historyTitle: "历史对照",
        historyPlaceholder:
          "历史对照数据将在后续版本接入，敬请期待。",
        noProvenanceData: "暂无溯源数据。",
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
        evidenceLevel: "Evidence level",
        admissionStatus: "Admission status",
        admissionLevel: "Admission level",
        provenanceStatus: "Provenance status",
        intakeManifest: "Intake manifest",
        historyTitle: "History comparison",
        historyPlaceholder:
          "Historical comparison data will be available in a future release.",
        noProvenanceData: "No provenance data available.",
      };
  const defendedRows = rows.filter((row) => row.defense !== "none" && row.defense !== "None").length;
  const undefendedRows = rows.length - defendedRows;

  return (
    <div className="space-y-4">
      {jobContext ? (
        <section className="rounded-2xl border border-[color:var(--accent-blue)]/25 bg-[color:var(--accent-blue)]/5 px-4 py-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-foreground">{copy.jobContext.title}</div>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {highlightedRows.size > 0
                  ? copy.jobContext.matched(highlightedRows.size)
                  : copy.jobContext.notAdmitted}
              </p>
            </div>
            <div className="grid gap-1 text-right text-[10px] text-muted-foreground sm:grid-cols-2 sm:text-left">
              {jobContext.contractKey ? (
                <div>
                  <span className="font-semibold text-foreground">{copy.jobContext.contract}: </span>
                  <span className="mono break-all">{jobContext.contractKey}</span>
                </div>
              ) : null}
              {jobContext.targetModel ? (
                <div>
                  <span className="font-semibold text-foreground">{copy.jobContext.model}: </span>
                  <span className="mono">{jobContext.targetModel}</span>
                </div>
              ) : null}
              {jobContext.aucLabel ? (
                <div>
                  <span className="font-semibold text-foreground">{copy.jobContext.auc}: </span>
                  <span className="mono">{jobContext.aucLabel}</span>
                </div>
              ) : null}
              {jobContext.jobId ? (
                <div>
                  <span className="font-semibold text-foreground">{copy.jobContext.job}: </span>
                  <span className="mono">{jobContext.jobId}</span>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(22rem,1fr)]">
        <section className="rounded-2xl border border-border bg-card p-4">
          <div className="border-b border-border pb-3 mb-3">
            <h2 className="text-[13px] font-bold text-foreground">
              {t.summaryTitle}
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-background px-3 py-3">
              <div className="text-[13px] text-muted-foreground">
                {t.resultRows}
              </div>
              <div className="mt-2 text-2xl font-semibold">{rows.length}</div>
            </div>
            <div className="rounded-2xl border border-border bg-background px-3 py-3">
              <div className="text-[13px] text-muted-foreground">
                {t.defendedRows}
              </div>
              <div className="mt-2 text-2xl font-semibold">{defendedRows}</div>
            </div>
            <div className="rounded-2xl border border-border bg-background px-3 py-3">
              <div className="text-[13px] text-muted-foreground">
                {t.undefendedRows}
              </div>
              <div className="mt-2 text-2xl font-semibold">{undefendedRows}</div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4">
          <div className="border-b border-border pb-3 mb-3">
            <h2 className="text-[13px] font-bold text-foreground">
              {t.provenanceTitle}
            </h2>
          </div>
          <dl className="grid gap-4 text-[13px]">
            {hasValue(provenance.runDirectoryPath) ? (
              <div>
                <dt className="font-semibold text-foreground">{t.runDirectory}</dt>
                <dd className="mt-1 break-all text-muted-foreground">{provenance.runDirectoryPath}</dd>
              </div>
            ) : null}
            {hasValue(provenance.seed) ? (
              <div>
                <dt className="font-semibold text-foreground">{t.seed}</dt>
                <dd className="mt-1 text-muted-foreground">{provenance.seed}</dd>
              </div>
            ) : null}
            {hasValue(provenance.schedule) ? (
              <div>
                <dt className="font-semibold text-foreground">{t.schedule}</dt>
                <dd className="mt-1 text-muted-foreground">{provenance.schedule}</dd>
              </div>
            ) : null}
            {hasValue(provenance.fixtureVersion) ? (
              <div>
                <dt className="font-semibold text-foreground">{t.fixtureVersion}</dt>
                <dd className="mt-1 text-muted-foreground">{provenance.fixtureVersion}</dd>
              </div>
            ) : null}
            {hasValue(provenance.summaryPath) ? (
              <div>
                <dt className="font-semibold text-foreground">{t.summaryPath}</dt>
                <dd className="mt-1 break-all text-muted-foreground">{provenance.summaryPath}</dd>
              </div>
            ) : null}
            {hasValue(provenance.evidenceLevel) ? (
              <div>
                <dt className="font-semibold text-foreground">{t.evidenceLevel}</dt>
                <dd className="mt-1 text-muted-foreground">{provenance.evidenceLevel}</dd>
              </div>
            ) : null}
            {hasValue(provenance.admissionStatus) ? (
              <div>
                <dt className="font-semibold text-foreground">{t.admissionStatus}</dt>
                <dd className="mt-1 text-muted-foreground">{provenance.admissionStatus}</dd>
              </div>
            ) : null}
            {hasValue(provenance.admissionLevel) ? (
              <div>
                <dt className="font-semibold text-foreground">{t.admissionLevel}</dt>
                <dd className="mt-1 text-muted-foreground">{provenance.admissionLevel}</dd>
              </div>
            ) : null}
            {hasValue(provenance.provenanceStatus) ? (
              <div>
                <dt className="font-semibold text-foreground">{t.provenanceStatus}</dt>
                <dd className="mt-1 text-muted-foreground">{provenance.provenanceStatus}</dd>
              </div>
            ) : null}
            {hasValue(provenance.intakeManifest) ? (
              <div>
                <dt className="font-semibold text-foreground">{t.intakeManifest}</dt>
                <dd className="mt-1 break-all text-muted-foreground">{provenance.intakeManifest}</dd>
              </div>
            ) : null}
            {!hasValue(provenance.runDirectoryPath) && !hasValue(provenance.seed) && !hasValue(provenance.schedule) && !hasValue(provenance.fixtureVersion) && !hasValue(provenance.summaryPath) && !hasValue(provenance.evidenceLevel) && !hasValue(provenance.admissionStatus) && !hasValue(provenance.admissionLevel) && !hasValue(provenance.provenanceStatus) && !hasValue(provenance.intakeManifest) ? (
              <p className="text-muted-foreground text-[11px] italic">{t.noProvenanceData}</p>
            ) : null}
          </dl>
        </section>
      </div>

      <section className="rounded-2xl border border-border bg-card p-4">
        <div className="border-b border-border pb-3 mb-3">
            <h2 className="text-[13px] font-bold text-foreground">
              {t.historyTitle}
            </h2>
        </div>
        <div className="space-y-2 text-[13px] text-muted-foreground">
          <p>{historyPlaceholder}</p>
          <div className="rounded-2xl border border-dashed border-border bg-background px-3 py-4">
              {t.historyPlaceholder}
            </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4">
        <div className="border-b border-border pb-3 mb-3">
          <h2 className="text-[13px] font-bold text-foreground">
            {copy.sections.auditResults}
          </h2>
        </div>
        <div className="overflow-auto">
          {rows.length > 0 ? (
            <table className="min-w-[900px] w-full border-collapse text-[13px]">
              <thead className="sticky top-0 bg-muted/30">
                <tr className="border-b border-border">
                  <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{copy.tableHeaders.attack}</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{copy.tableHeaders.defense}</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{copy.tableHeaders.model}</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{copy.tableHeaders.evidence}</th>
                  <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{copy.tableHeaders.auc}</th>
                  <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{copy.tableHeaders.asr}</th>
                  <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{copy.tableHeaders.tpr}</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{copy.tableHeaders.risk}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => {
                  const key = `${row.track}::${row.attack}::${row.defense}::${row.model}::${row.aucLabel}`;
                  const isHighlighted = highlightedRows.has(key);
                  return (
                    <tr
                      key={`${key}::${index}`}
                      className={`border-b border-border transition-colors hover:bg-muted/20 ${
                        isHighlighted
                          ? "border-l-2 border-l-[var(--accent-blue)] bg-[color:var(--accent-blue)]/5"
                          : index % 2 === 0 ? "bg-background" : "bg-muted/10"
                      }`}
                    >
                    <td className="px-3 py-3 font-medium">
                      {isHighlighted ? (
                        <span className="mb-1 inline-flex rounded-full border border-[color:var(--accent-blue)]/25 bg-[color:var(--accent-blue)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--accent-blue)]">
                          {copy.jobContext.matchedRow}
                        </span>
                      ) : null}
                      <div>{row.attack}</div>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{row.defense}</td>
                    <td className="px-3 py-3 text-muted-foreground">{row.model}</td>
                    <td className="px-3 py-3">
                      <ReportEvidenceStack locale={locale} row={row} />
                    </td>
                    <td className="mono px-3 py-3 text-right">{row.aucLabel}</td>
                    <td className="mono px-3 py-3 text-right">{row.asrLabel}</td>
                    <td className="mono px-3 py-3 text-right">{row.tprLabel}</td>
                    <td className="px-3 py-3">
                      <RiskBadge
                        auc={parseFloat(row.aucLabel)}
                        label={riskLabel(row.riskLevel, locale)}
                        locale={locale}
                      />
                    </td>
                  </tr>
                  );
                })}
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
