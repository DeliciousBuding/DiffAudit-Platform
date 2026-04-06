import { describe, expect, it } from "vitest";

import { buildArtifactReplayJobPayload, summarizeBestRecon } from "./audit-client";

describe("audit client helpers", () => {
  it("builds a recon artifact replay payload from the best evidence", () => {
    const payload = buildArtifactReplayJobPayload(
      {
        workspace: "D:/Code/DiffAudit/Project/experiments/recon-runtime-mainline-ddim-public-50-step10",
        artifact_paths: {
          score_artifact_dir:
            "D:/Code/DiffAudit/Project/experiments/recon-runtime-mainline-ddim-public-50-step10/score-artifacts",
        },
      },
      "audit-replay-001",
    );

    expect(payload).toEqual({
      job_type: "recon_artifact_mainline",
      workspace_name: "audit-replay-001",
      artifact_dir:
        "D:/Code/DiffAudit/Project/experiments/recon-runtime-mainline-ddim-public-50-step10/score-artifacts",
      method: "threshold",
    });
  });

  it("throws when best evidence does not expose a score artifact dir", () => {
    expect(() =>
      buildArtifactReplayJobPayload(
        {
          workspace: "D:/Code/DiffAudit/Project/experiments/recon-runtime-mainline-ddim-public-50-step10",
          artifact_paths: {},
        },
        "audit-replay-001",
      ),
    ).toThrow(/score_artifact_dir/i);
  });

  it("summarizes backend, scheduler, and metrics for the audit page", () => {
    expect(
      summarizeBestRecon({
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
});
