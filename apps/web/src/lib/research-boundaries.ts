import { sanitizeRuntimeText } from "@/lib/runtime-text";

export type ResearchBoundary = {
  boundary_key?: string;
  key?: string;
  title?: string;
  label?: string;
  description?: string;
  status?: string;
  admission_status?: string;
  signal_strength?: string;
  admission_blocker?: string;
  promotion_required?: string;
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
  previewDetails: string[];
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
      sanitizeRuntimeText(boundary.title ?? boundary.label ?? boundary.description ?? boundary.key ?? boundary.boundary_key ?? fallbackLabel)
        ?? fallbackLabel
    )),
    previewDetails: boundaryItems.slice(0, 3).map((boundary) => {
      const signal = sanitizeRuntimeText(boundary.signal_strength ?? "");
      const blocker = sanitizeRuntimeText(boundary.admission_blocker ?? "");
      if (signal && blocker) return `${signal} / ${blocker}`;
      return signal || blocker || sanitizeRuntimeText(boundary.admission_status ?? boundary.status ?? "") || fallbackLabel;
    }),
  };
}

function isAdmittedBoundary(boundary: ResearchBoundary) {
  return (boundary.admission_status ?? boundary.status ?? "").toLowerCase() === "admitted";
}
