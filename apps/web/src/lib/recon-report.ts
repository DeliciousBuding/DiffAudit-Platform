import { BestReconPayload, summarizeBestRecon } from "@/lib/audit-client";
import type { CatalogEntryPayload } from "@/lib/catalog";

const DEFAULT_API_BASE_URL = "http://127.0.0.1:8780";
const PRIMARY_REPORT_CONTRACT_KEY = "black-box/recon/sd15-ddim";

export type ReconReportViewModel = {
  statusLabel: string;
  statusTone: "primary" | "success" | "warning" | "info";
  workspaceName: string;
  workspacePath: string;
  paper: string;
  method: string;
  mode: string;
  backendLabel: string;
  aucLabel: string;
  asrLabel: string;
  tprLabel: string;
  summaryPath: string;
};

function backendBaseUrl() {
  return process.env.DIFFAUDIT_API_BASE_URL ?? DEFAULT_API_BASE_URL;
}

function statusTone(status?: string): ReconReportViewModel["statusTone"] {
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

function pickReportCatalogEntry(entries: CatalogEntryPayload[]) {
  return (
    entries.find(
      (entry) =>
        contractKey(entry) === PRIMARY_REPORT_CONTRACT_KEY && typeof entry.best_workspace === "string",
    ) ??
    entries.find(
      (entry) => entry.availability === "ready" && typeof entry.best_workspace === "string",
    ) ??
    entries.find((entry) => typeof entry.best_workspace === "string") ??
    null
  );
}

function toViewModel(best: BestReconPayload): ReconReportViewModel {
  const summary = summarizeBestRecon(best);

  return {
    statusLabel: statusLabel(best.status),
    statusTone: statusTone(best.status),
    workspaceName: best.workspace,
    workspacePath: best.workspace,
    paper: best.paper ?? "unknown",
    method: best.method ?? "unknown",
    mode: best.mode ?? "unknown",
    backendLabel: summary.backendLabel,
    aucLabel: summary.aucLabel,
    asrLabel: summary.asrLabel,
    tprLabel: summary.tprLabel,
    summaryPath: best.summary_path ?? "summary path unavailable",
  };
}

export async function fetchBestReconReport(): Promise<ReconReportViewModel | null> {
  try {
    const catalogResponse = await fetch(new URL("/api/v1/catalog", backendBaseUrl()), {
      cache: "no-store",
    });
    if (!catalogResponse.ok) {
      return null;
    }

    const catalogPayload = await catalogResponse.json();
    if (!Array.isArray(catalogPayload)) {
      return null;
    }

    const entry = pickReportCatalogEntry(catalogPayload as CatalogEntryPayload[]);
    if (!entry?.best_workspace) {
      return null;
    }

    const summaryResponse = await fetch(
      new URL(
        `/api/v1/experiments/${encodeURIComponent(entry.best_workspace)}/summary`,
        backendBaseUrl(),
      ),
      {
        cache: "no-store",
      },
    );
    if (!summaryResponse.ok) {
      return null;
    }

    const summaryPayload = (await summaryResponse.json()) as BestReconPayload;
    if (!summaryPayload.workspace) {
      return null;
    }
    return toViewModel(summaryPayload);
  } catch {
    return null;
  }
}
