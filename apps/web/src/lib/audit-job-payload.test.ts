import { describe, expect, it } from "vitest";

import { normalizeAuditJobList } from "./audit-job-payload";

describe("normalizeAuditJobList", () => {
  it("accepts a bare live-mode array", () => {
    expect(normalizeAuditJobList([{ job_id: "job_live" }])).toEqual([{ job_id: "job_live" }]);
  });

  it("accepts the demo-mode object wrapper", () => {
    expect(normalizeAuditJobList({ jobs: [{ job_id: "job_demo" }] })).toEqual([{ job_id: "job_demo" }]);
  });

  it("falls back to an empty list for malformed payloads", () => {
    expect(normalizeAuditJobList({ jobs: null })).toEqual([]);
    expect(normalizeAuditJobList({})).toEqual([]);
  });
});
