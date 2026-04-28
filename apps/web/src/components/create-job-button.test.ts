import { afterEach, describe, expect, it, vi } from "vitest";

import { submitAuditJob } from "./create-job-button";

describe("submitAuditJob", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads a job template and posts a job", async () => {
    const templatePayload = { job_type: "recon_artifact_mainline", workspace_name: "test" };
    const jobResponse = { job_id: "job_42", status: "queued" };

    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify(templatePayload), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(jobResponse), {
          status: 202,
          headers: { "content-type": "application/json" },
        }),
      );

    vi.stubGlobal("fetch", mockFetch);

    const result = await submitAuditJob("black-box/recon/sd15-ddim");

    expect(result).toEqual({ jobId: "job_42", status: "queued" });
    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      "/api/v1/audit/job-template?contract_key=black-box%2Frecon%2Fsd15-ddim",
      expect.objectContaining({ cache: "no-store" }),
    );
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      "/api/v1/audit/jobs",
      expect.objectContaining({
        method: "POST",
        headers: { "content-type": "application/json" },
      }),
    );
  });

  it("propagates template errors", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ detail: "missing contract" }), {
          status: 404,
          headers: { "content-type": "application/json" },
        }),
      );

    vi.stubGlobal("fetch", mockFetch);

    await expect(submitAuditJob("missing")).rejects.toThrow("missing contract");
  });
});
