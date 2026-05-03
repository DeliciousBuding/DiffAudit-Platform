import type { EvidenceSourceSnapshot, EvidenceSummaryPayload } from "@/lib/audit-client";
import { summarizeEvidenceMetrics } from "@/lib/audit-client";
import { backendBaseUrl } from "@/lib/api-proxy";
import type { CatalogEntryPayload } from "@/lib/catalog";
import { fetchWithTimeout } from "@/lib/fetch-timeout";

const DEFAULT_SERVER_FETCH_TIMEOUT_MS = 600;

type FetchEvidenceOptions = {
  preferredContractKey?: string | null;
};

function statusTone(status?: string): EvidenceSourceSnapshot["statusTone"] {
  if (status === "ready") {
    return "success";
  }
  if (status === "running") {
    return "warning";
  }
  if (status === "queued") {
    return "info";
  }
  return "primary";
}

function statusLabel(status?: string) {
  if (!status) {
    return "unknown";
  }
  return status;
}

function contractKey(entry: CatalogEntryPayload) {
  return entry.contract_key ?? entry.key ?? null;
}

function hasWorkspace(entry: CatalogEntryPayload) {
  return typeof entry.best_workspace === "string" && entry.best_workspace.length > 0;
}

function pickCatalogEntry(
  entries: CatalogEntryPayload[],
  preferredContractKey?: string | null,
) {
  const preferred =
    preferredContractKey ??
    (process.env.DIFFAUDIT_PRIMARY_CONTRACT_KEY
      ? String(process.env.DIFFAUDIT_PRIMARY_CONTRACT_KEY)
      : null);

  if (preferred) {
    const match = entries.find((entry) => contractKey(entry) === preferred && hasWorkspace(entry));
    if (match) {
      return match;
    }
  }

  return (
    entries.find((entry) => entry.availability === "ready" && hasWorkspace(entry)) ??
    entries.find((entry) => hasWorkspace(entry)) ??
    null
  );
}

function toSnapshot(summary: EvidenceSummaryPayload): EvidenceSourceSnapshot {
  const metrics = summarizeEvidenceMetrics(summary);

  return {
    statusLabel: statusLabel(summary.status),
    statusTone: statusTone(summary.status),
    workspaceName: summary.workspace,
    workspacePath: summary.workspace,
    paper: summary.paper ?? "unknown",
    method: summary.method ?? "unknown",
    mode: summary.mode ?? "unknown",
    backendLabel: metrics.backendLabel,
    aucLabel: metrics.aucLabel,
    asrLabel: metrics.asrLabel,
    tprLabel: metrics.tprLabel,
    summaryPath: summary.summary_path ?? "summary path unavailable",
  };
}

export async function fetchBestEvidenceSourceSnapshot(
  options: FetchEvidenceOptions = {},
): Promise<EvidenceSourceSnapshot | null> {
  try {
    const catalogResponse = await fetchWithTimeout(
      new URL("/api/v1/catalog", backendBaseUrl()),
      { cache: "no-store" },
      { timeoutMs: DEFAULT_SERVER_FETCH_TIMEOUT_MS },
    );
    if (!catalogResponse.ok) {
      return null;
    }

    const catalogPayload = await catalogResponse.json();
    if (!Array.isArray(catalogPayload)) {
      return null;
    }

    const entry = pickCatalogEntry(catalogPayload as CatalogEntryPayload[], options.preferredContractKey);
    if (!entry?.best_workspace) {
      return null;
    }

    const summaryResponse = await fetchWithTimeout(
      new URL(
        `/api/v1/experiments/${encodeURIComponent(entry.best_workspace)}/summary`,
        backendBaseUrl(),
      ),
      { cache: "no-store" },
      { timeoutMs: DEFAULT_SERVER_FETCH_TIMEOUT_MS },
    );
    if (!summaryResponse.ok) {
      return null;
    }

    const summaryPayload = (await summaryResponse.json()) as EvidenceSummaryPayload;
    if (!summaryPayload.workspace) {
      return null;
    }

    return toSnapshot(summaryPayload);
  } catch {
    return null;
  }
}

/**
 * Fast-path one-call variant that uses the new /api/v1/experiments/best
 * endpoint introduced in the Go backend. Falls back to the two-step path
 * via fetchBestEvidenceSourceSnapshot if the endpoint is unavailable.
 */
export async function fetchBestEvidenceByContract(
  contractKey: string,
): Promise<EvidenceSourceSnapshot | null> {
  try {
    const response = await fetchWithTimeout(
      new URL(
        `/api/v1/experiments/best?contract_key=${encodeURIComponent(contractKey)}`,
        backendBaseUrl(),
      ),
      { cache: "no-store" },
      { timeoutMs: DEFAULT_SERVER_FETCH_TIMEOUT_MS },
    );
    if (response.ok) {
      const summaryPayload = (await response.json()) as EvidenceSummaryPayload;
      if (summaryPayload.workspace) {
        return toSnapshot(summaryPayload);
      }
    }
  } catch {
    // Fall through
  }
  return fetchBestEvidenceSourceSnapshot({ preferredContractKey: contractKey });
}

