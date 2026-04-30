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
  compact?: boolean;
};

export function ReportEvidenceStack({
  locale,
  row,
  showNote = true,
  compact = false,
}: ReportEvidenceStackProps) {
  const headers = WORKSPACE_COPY[locale].reports.tableHeaders;
  const boundary = row.boundary?.trim() || "—";
  const sourcePath = row.sourcePath?.trim() || "—";
  const provenanceStatus = row.provenanceStatus?.trim() || "—";

  return (
    <div className={compact ? "workspace-evidence-stack is-compact" : "workspace-evidence-stack"}>
      <StatusBadge tone={evidenceTone(row.evidenceLevel)} compact>
        {row.evidenceLevel}
      </StatusBadge>
      {showNote ? (
        <div
          className="workspace-evidence-note"
          title={row.note}
        >
          {row.note}
        </div>
      ) : null}
      <div
        className="workspace-evidence-pill"
        title={`${headers.qualityCost}: ${row.qualityCost}`}
      >
        <span className="truncate">
          {headers.qualityCost}: {row.qualityCost}
        </span>
      </div>
      <div
        className="workspace-evidence-meta"
        title={`${headers.provenance}: ${provenanceStatus}`}
      >
        {headers.provenance}: {provenanceStatus}
      </div>
      <div
        className="workspace-evidence-meta"
        title={`${headers.boundary}: ${boundary}`}
      >
        {headers.boundary}: {boundary}
      </div>
      <div
        className="workspace-evidence-source"
        title={`${headers.source}: ${sourcePath}`}
      >
        {headers.source}: {sourcePath}
      </div>
    </div>
  );
}
