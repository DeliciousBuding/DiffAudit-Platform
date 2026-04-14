import { StatusBadge } from "@/components/status-badge";
import { RiskBadge } from "@/components/risk-badge";
import { classifyRisk } from "@/lib/risk-report";

type ResultRow = {
  track: string;
  attack: string;
  defense: string;
  model: string;
  evidenceLevel: string;
  aucLabel: string;
  asrLabel: string;
  tprLabel: string;
};

const RISK_COLOR: Record<string, string> = {
  high: "var(--risk-high)",
  medium: "var(--risk-medium)",
  low: "var(--risk-low)",
};

type ResultsTableProps = {
  rows: ResultRow[];
  emptyMessage: string;
};

export function ResultsTable({ rows, emptyMessage }: ResultsTableProps) {
  if (rows.length === 0) {
    return (
      <div className="px-3 py-4 text-xs text-muted-foreground text-center">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead className="sticky top-0 bg-muted/30">
          <tr className="border-b border-border">
            <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">Attack</th>
            <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">Model</th>
            <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">Evidence</th>
            <th className="px-3 py-1.5 text-right font-semibold text-muted-foreground">AUC</th>
            <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">Risk</th>
            <th className="px-3 py-1.5 text-right font-semibold text-muted-foreground">ASR</th>
            <th className="px-3 py-1.5 text-right font-semibold text-muted-foreground">TPR</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const auc = parseFloat(row.aucLabel);
            const riskLevel = Number.isNaN(auc) ? "low" : classifyRisk(auc);
            return (
              <tr
                key={`${row.track}-${row.attack}-${row.defense}`}
                className={`table-row-hover border-b border-border transition-colors hover:bg-muted/30 ${
                  index % 2 === 0 ? "bg-background" : "bg-muted/10"
                }`}
              >
                <td className="px-3 py-2 font-medium">{row.attack}</td>
                <td className="px-3 py-2 text-muted-foreground">{row.model}</td>
                <td className="px-3 py-2">
                  <StatusBadge tone="info">{row.evidenceLevel}</StatusBadge>
                </td>
                <td
                  className="mono px-3 py-2 text-right font-semibold"
                  style={{ color: RISK_COLOR[riskLevel] }}
                >
                  {row.aucLabel}
                </td>
                <td className="px-3 py-2">
                  <RiskBadge auc={auc} />
                </td>
                <td className="mono px-3 py-2 text-right">{row.asrLabel}</td>
                <td className="mono px-3 py-2 text-right">{row.tprLabel}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
