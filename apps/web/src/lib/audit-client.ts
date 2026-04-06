export type BestReconPayload = {
  status?: string;
  paper?: string;
  method?: string;
  mode?: string;
  workspace: string;
  summary_path?: string;
  backend?: string | null;
  scheduler?: string | null;
  metrics?: {
    auc?: number | null;
    asr?: number | null;
    tpr_at_1pct_fpr?: number | null;
  };
  artifact_paths?: {
    score_artifact_dir?: string;
  };
};

export type ArtifactReplayJobPayload = {
  job_type: "recon_artifact_mainline";
  contract_key: "black-box/recon/sd15-ddim";
  workspace_name: string;
  job_inputs: {
    artifact_dir: string;
    method: "threshold";
  };
};

export type EvidenceSourceSnapshot = {
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

export type EvidenceViewModel = {
  status: {
    label: string;
    tone: EvidenceSourceSnapshot["statusTone"];
  };
  workspace: {
    name: string;
    path: string;
  };
  context: {
    paper: string;
    method: string;
  };
  executionMode: string;
  backendLabel: string;
  metrics: {
    aucLabel: string;
    asrLabel: string;
    tprLabel: string;
  };
  summaryPath: string;
};

function formatMetric(value: number | null | undefined) {
  if (typeof value !== "number") {
    return "n/a";
  }
  return value.toFixed(3);
}

export function summarizeBestRecon(best: BestReconPayload) {
  const backendLabel = best.scheduler
    ? `${best.backend ?? "unknown"} / ${best.scheduler}`
    : `${best.backend ?? "unknown"}`;

  return {
    backendLabel,
    aucLabel: formatMetric(best.metrics?.auc),
    asrLabel: formatMetric(best.metrics?.asr),
    tprLabel: formatMetric(best.metrics?.tpr_at_1pct_fpr),
  };
}

export function toEvidenceViewModel(
  source: EvidenceSourceSnapshot,
): EvidenceViewModel {
  return {
    status: {
      label: source.statusLabel,
      tone: source.statusTone,
    },
    workspace: {
      name: source.workspaceName,
      path: source.workspacePath,
    },
    context: {
      paper: source.paper,
      method: source.method,
    },
    executionMode: source.mode,
    backendLabel: source.backendLabel,
    metrics: {
      aucLabel: source.aucLabel,
      asrLabel: source.asrLabel,
      tprLabel: source.tprLabel,
    },
    summaryPath: source.summaryPath,
  };
}

export function buildArtifactReplayJobPayload(
  best: BestReconPayload,
  workspaceName: string,
): ArtifactReplayJobPayload {
  const artifactDir = best.artifact_paths?.score_artifact_dir;
  if (!artifactDir) {
    throw new Error("Best recon evidence does not expose score_artifact_dir");
  }

  return {
    job_type: "recon_artifact_mainline",
    contract_key: "black-box/recon/sd15-ddim",
    workspace_name: workspaceName,
    job_inputs: {
      artifact_dir: artifactDir,
      method: "threshold",
    },
  };
}
