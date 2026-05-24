import { sanitizeRuntimeText } from "@/lib/runtime-text";

export type ResearchBoundary = {
  key?: string;
  title?: string;
  label?: string;
  status?: string;
  admission_status?: string;
};

export type ResearchBoundariesPayload = {
  status?: string;
  source?: string;
  candidate_policy?: string;
  boundaries?: ResearchBoundary[];
  runtime_configured?: boolean;
  demo_mode?: boolean;
  source_readiness?: {
    configured?: boolean;
    ready?: boolean;
  };
};

export type ResearchBoundarySummary = {
  boundaryCount: number;
  watchOnlyBoundaryCount: number;
  admittedBoundaryCount: number;
  ready: boolean;
  previewLabels: string[];
};

export function getResearchBoundarySummary(
  payload: ResearchBoundariesPayload | null | undefined,
  fallbackLabel: string,
): ResearchBoundarySummary {
  const boundaryItems = Array.isArray(payload?.boundaries)
    ? payload.boundaries
    : [];

  return {
    boundaryCount: boundaryItems.length,
    watchOnlyBoundaryCount: boundaryItems.filter((boundary) => !isAdmittedBoundary(boundary)).length,
    admittedBoundaryCount: boundaryItems.filter(isAdmittedBoundary).length,
    ready: payload?.status === "ok" || payload?.source_readiness?.ready === true,
    previewLabels: boundaryItems.slice(0, 3).map((boundary) => (
      sanitizeRuntimeText(boundary.title ?? boundary.label ?? boundary.key ?? fallbackLabel)
        ?? fallbackLabel
    )),
  };
}

function isAdmittedBoundary(boundary: ResearchBoundary) {
  return (boundary.admission_status ?? boundary.status ?? "").toLowerCase() === "admitted";
}
