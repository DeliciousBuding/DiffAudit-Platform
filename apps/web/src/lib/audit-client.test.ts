import { describe, expect, it } from "vitest";

import {
  buildArtifactReplayJobPayload,
  buildRuntimeMainlineJobPayload,
  summarizeEvidenceMetrics,
  toEvidenceViewModel,
} from "./audit-client";

describe("audit client helpers", () => {
  it("builds a recon artifact replay payload from the best evidence", () => {
    const payload = buildArtifactReplayJobPayload(
      {
        workspace: "../Project/experiments/recon-runtime-mainline-ddim-public-50-step10",
        artifact_paths: {
          score_artifact_dir:
            "../Project/experiments/recon-runtime-mainline-ddim-public-50-step10/score-artifacts",
        },
      },
      "audit-replay-001",
    );

    expect(payload).toEqual({
      job_type: "recon_artifact_mainline",
      contract_key: "black-box/recon/sd15-ddim",
      workspace_name: "audit-replay-001",
      runtime_profile: "local",
      assets: {},
      job_inputs: {
        artifact_dir:
          "../Project/experiments/recon-runtime-mainline-ddim-public-50-step10/score-artifacts",
        method: "threshold",
      },
    });
  });

  it("throws when best evidence does not expose a score artifact dir", () => {
    expect(() =>
      buildArtifactReplayJobPayload(
        {
          workspace: "../Project/experiments/recon-runtime-mainline-ddim-public-50-step10",
          artifact_paths: {},
        },
        "audit-replay-001",
      ),
    ).toThrow(/score_artifact_dir/i);
  });

  it("summarizes backend, scheduler, and metrics for the audit page", () => {
    expect(
      summarizeEvidenceMetrics({
        backend: "stable_diffusion",
        scheduler: "ddim",
        metrics: {
          auc: 0.866,
          asr: 0.51,
          tpr_at_1pct_fpr: 1,
        },
      }),
    ).toEqual({
      backendLabel: "stable_diffusion / ddim",
      aucLabel: "0.866",
      asrLabel: "0.510",
      tprLabel: "1.000",
    });
  });

  it("maps a source snapshot into an evidence view model", () => {
    expect(
      toEvidenceViewModel({
        statusLabel: "ready",
        statusTone: "success",
        workspaceName: "best evidence workspace",
        workspacePath: "../Project/experiments/recon-runtime-mainline-ddim-public-50-step10",
        paper: "diffaudit-2024",
        method: "threshold",
        mode: "blackbox",
        backendLabel: "stable_diffusion / ddim",
        aucLabel: "0.866",
        asrLabel: "0.510",
        tprLabel: "1.000",
        summaryPath: "source of truth",
      }),
    ).toEqual({
      status: {
        label: "ready",
        tone: "success",
      },
      workspace: {
        name: "best evidence workspace",
        path: "../Project/experiments/recon-runtime-mainline-ddim-public-50-step10",
      },
      context: {
        paper: "diffaudit-2024",
        method: "threshold",
      },
      executionMode: "blackbox",
      backendLabel: "stable_diffusion / ddim",
      metrics: {
        aucLabel: "0.866",
        asrLabel: "0.510",
        tprLabel: "1.000",
      },
      summaryPath: "source of truth",
    });
  });

  it("builds a generic runtime-mainline payload with runtime profile and assets", () => {
    expect(
      buildRuntimeMainlineJobPayload({
        job_type: "pia_runtime_mainline",
        contract_key: "gray-box/pia/cifar10-ddpm",
        workspace_name: "pia-runtime-001",
        job_inputs: {
          config: "D:/Code/DiffAudit/Project/tmp/configs/pia-cifar10-graybox-assets.local.yaml",
        },
      }),
    ).toEqual({
      job_type: "pia_runtime_mainline",
      contract_key: "gray-box/pia/cifar10-ddpm",
      workspace_name: "pia-runtime-001",
      runtime_profile: "local",
      assets: {},
      job_inputs: {
        config: "D:/Code/DiffAudit/Project/tmp/configs/pia-cifar10-graybox-assets.local.yaml",
      },
    });
  });
});
