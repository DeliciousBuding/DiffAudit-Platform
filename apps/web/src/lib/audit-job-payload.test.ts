import { describe, expect, it } from "vitest";

import { normalizeAuditJobList } from "./audit-job-payload";

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
});
