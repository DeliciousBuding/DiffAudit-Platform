import { BestReconPayload, summarizeBestRecon } from "@/lib/audit-client";

const DEFAULT_API_BASE_URL = "http://127.0.0.1:8780";

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
  const url = new URL("/api/v1/experiments/recon/best", backendBaseUrl());

  try {
    const response = await fetch(url, {
      cache: "no-store",
    });
    if (!response.ok) {
      return null;
    }
    const payload = (await response.json()) as BestReconPayload;
    if (!payload.workspace) {
      return null;
    }
    return toViewModel(payload);
  } catch {
    return null;
  }
}
