import { describe, expect, it } from "vitest";

import {
  isValidPathSegment,
  isValidWorkspaceIdentifier,
  normalizeWorkspaceIdentifier,
} from "@/lib/path-validation";

describe("path validation", () => {
  it("keeps generic path segments strict", () => {
    expect(isValidPathSegment("job_demo-001")).toBe(true);
    expect(isValidPathSegment("research://workspaces/demo")).toBe(false);
    expect(isValidPathSegment("../demo")).toBe(false);
  });

  it("normalizes logical workspace identifiers to the final public snapshot key", () => {
    expect(normalizeWorkspaceIdentifier("research://workspaces/gray-box/runs/pia-cifar10")).toBe("pia-cifar10");
    expect(normalizeWorkspaceIdentifier("experiments/recon-runtime-mainline-ddim-public-100-step30")).toBe(
      "recon-runtime-mainline-ddim-public-100-step30",
    );
  });

  it("accepts public logical workspace identifiers without allowing unsafe final keys", () => {
    expect(isValidWorkspaceIdentifier("research://workspaces/gray-box/runs/pia-cifar10-runtime-mainline")).toBe(true);
    expect(isValidWorkspaceIdentifier("research://workspaces/gray-box/runs/../secret")).toBe(false);
    expect(isValidWorkspaceIdentifier("research://workspaces/gray-box/runs/secret.json")).toBe(false);
    expect(isValidWorkspaceIdentifier("research://workspaces/gray-box/runs/")).toBe(false);
    expect(isValidWorkspaceIdentifier("")).toBe(false);
  });
});
