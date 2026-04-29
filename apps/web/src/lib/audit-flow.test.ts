import { describe, expect, it } from "vitest";

import { buildCompletedJobReportHref, buildReportHref, inferReportTrack } from "./audit-flow";

describe("audit flow routing", () => {
  it("infers report tracks from contract keys and job types", () => {
    expect(inferReportTrack({ contract_key: "black-box/recon/sd15-ddim" })).toBe("black-box");
    expect(inferReportTrack({ job_type: "pia_runtime_mainline" })).toBe("gray-box");
    expect(inferReportTrack({ contract_key: "white-box/gsa/ddpm-cifar10" })).toBe("white-box");
  });

  it("builds stable report links", () => {
    expect(buildReportHref("gray-box")).toBe("/workspace/reports/gray-box?view=audit");
    expect(buildReportHref("black-box", "display")).toBe("/workspace/reports/black-box?view=display");
  });

  it("only routes completed jobs into report review", () => {
    expect(buildCompletedJobReportHref({
      status: "completed",
      contract_key: "black-box/recon/sd15-ddim",
    })).toBe("/workspace/reports/black-box?view=audit&contract=black-box%2Frecon%2Fsd15-ddim");
    expect(buildCompletedJobReportHref({
      status: "running",
      contract_key: "black-box/recon/sd15-ddim",
    })).toBeNull();
    expect(buildCompletedJobReportHref({
      status: "completed",
      contract_key: "unknown/family",
    })).toBeNull();
  });

  it("carries safe completed-job context into report links", () => {
    expect(buildCompletedJobReportHref({
      job_id: "job_demo_004",
      status: "completed",
      contract_key: "recon_artifact_mainline",
      target_model: "stable-diffusion-v1-4",
      metrics: { auc: 0.849 },
    })).toBe("/workspace/reports/black-box?view=audit&job=job_demo_004&contract=recon_artifact_mainline&model=stable-diffusion-v1-4&auc=0.849");
  });
});
