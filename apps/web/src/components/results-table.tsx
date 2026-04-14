import { StatusBadge } from "@/components/status-badge";

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
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">Attack</th>
            <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">Model</th>
            <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">Evidence</th>
            <th className="px-3 py-1.5 text-right font-semibold text-muted-foreground">AUC</th>
            <th className="px-3 py-1.5 text-right font-semibold text-muted-foreground">ASR</th>
            <th className="px-3 py-1.5 text-right font-semibold text-muted-foreground">TPR</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={`${row.track}-${row.attack}-${row.defense}`}
              className={`border-b border-border transition-colors hover:bg-muted/30 ${
                index % 2 === 0 ? "bg-background" : "bg-muted/10"
              }`}
            >
              <td className="px-3 py-2 font-medium text-sm">{row.attack}</td>
              <td className="px-3 py-2 text-muted-foreground">{row.model}</td>
              <td className="px-3 py-2">
                <StatusBadge tone="info">{row.evidenceLevel}</StatusBadge>
              </td>
              <td className="mono px-3 py-2 text-right">{row.aucLabel}</td>
              <td className="mono px-3 py-2 text-right">{row.asrLabel}</td>
              <td className="mono px-3 py-2 text-right">{row.tprLabel}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
