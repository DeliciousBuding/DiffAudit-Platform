import { type Locale } from "@/components/language-picker";
import { StatusBadge } from "@/components/status-badge";
import { type AttackDefenseRowViewModel } from "@/lib/attack-defense-table";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";

function evidenceTone(
  evidenceLevel: string,
): "primary" | "success" | "warning" | "info" | "neutral" {
  const normalized = evidenceLevel.trim().toLowerCase();
  if (normalized.includes("admitted")) {
    return "success";
  }
  if (normalized.includes("mainline")) {
    return "primary";
  }
  if (normalized.includes("challenger")) {
    return "warning";
  }
  return "neutral";
}

type ReportEvidenceStackProps = {
  locale: Locale;
  row: AttackDefenseRowViewModel;
  showNote?: boolean;
};

export function ReportEvidenceStack({
  locale,
  row,
  showNote = true,
}: ReportEvidenceStackProps) {
  const headers = WORKSPACE_COPY[locale].reports.tableHeaders;
  const boundary = row.boundary ?? "No boundary note provided.";
  const sourcePath = row.sourcePath ?? "No source path provided.";
  const provenanceStatus = row.provenanceStatus ?? "unknown";

  return (
    <div className="space-y-1">
      <StatusBadge tone={evidenceTone(row.evidenceLevel)} compact>
        {row.evidenceLevel}
      </StatusBadge>
      {showNote ? (
        <div
          className="max-w-[22rem] text-[10px] leading-4 text-muted-foreground"
          title={row.note}
        >
          {row.note}
        </div>
      ) : null}
      <div
        className="inline-flex max-w-[22rem] items-center rounded-full border border-border bg-muted/20 px-2 py-1 text-[10px] leading-4 text-muted-foreground"
        title={`${headers.qualityCost}: ${row.qualityCost}`}
      >
        <span className="truncate">
          {headers.qualityCost}: {row.qualityCost}
        </span>
      </div>
      <div
        className="max-w-[22rem] text-[10px] leading-4 text-muted-foreground"
        title={`${headers.provenance}: ${provenanceStatus}`}
      >
        {headers.provenance}: {provenanceStatus}
      </div>
      <div
        className="max-w-[22rem] text-[10px] leading-4 text-muted-foreground"
        title={`${headers.boundary}: ${boundary}`}
      >
        {headers.boundary}: {boundary}
      </div>
      <div
        className="max-w-[22rem] truncate font-mono text-[10px] leading-4 text-muted-foreground"
        title={`${headers.source}: ${sourcePath}`}
      >
        {headers.source}: {sourcePath}
      </div>
    </div>
  );
}
