import { describe, expect, it } from "vitest";

import { normalizeAuditJobList, sanitizeAuditJobPayload } from "./audit-job-payload";

describe("normalizeAuditJobList", () => {
  it("accepts a bare live-mode array", () => {
    expect(normalizeAuditJobList([{ job_id: "job_live" }])).toEqual([{ job_id: "job_live" }]);
  });

  it("accepts the demo-mode object wrapper", () => {
    expect(normalizeAuditJobList({ jobs: [{ job_id: "job_demo" }] })).toEqual([{ job_id: "job_demo" }]);
  });

  it("accepts empty demo-mode wrappers", () => {
    expect(normalizeAuditJobList({ jobs: null })).toEqual([]);
  });

  it("returns null for malformed payloads", () => {
    expect(normalizeAuditJobList({})).toBeNull();
    expect(normalizeAuditJobList("not-json")).toBeNull();
  });

  it("sanitizes live runtime strings across nested audit job payloads", () => {
    expect(sanitizeAuditJobPayload({
      jobs: [
        {
          job_id: "job_live",
          workspace_name: "C:\\runtime\\private\\run",
          target_model: "http://localhost:8765/model",
          summary_note: "wrote token=abc to control.internal",
          state_history: [
            { state: "running", detail: "/srv/runtime/job/stdout.log" },
          ],
        },
      ],
    })).toEqual({
      jobs: [
        {
          job_id: "job_live",
          workspace_name: "<local-path>",
          target_model: "<runtime-url>",
          summary_note: "wrote token=<redacted> to <runtime-host>",
          state_history: [
            { state: "running", detail: "<local-path>" },
          ],
        },
      ],
    });
  });
});
