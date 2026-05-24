import { describe, expect, it } from "vitest";

import { getResearchBoundarySummary } from "./research-boundaries";

describe("getResearchBoundarySummary", () => {
  it("keeps watch-only research candidates out of admitted counts", () => {
    const summary = getResearchBoundarySummary({
      status: "ok",
      boundaries: [
        {
          key: "h2-output-cloud-geometry-candidate-no-runtime-job",
          title: "H2 output-cloud geometry candidate",
          admission_status: "watch",
        },
        {
          key: "rediffuse-stl10-bounded-scout-and-score-norm-completed-weak-results-no-runtime-job",
          title: "ReDiffuse STL-10 weak scout",
          admission_status: "watch",
        },
      ],
      source_readiness: { ready: true },
    }, "Unnamed boundary");

    expect(summary).toMatchObject({
      boundaryCount: 2,
      watchOnlyBoundaryCount: 2,
      admittedBoundaryCount: 0,
      ready: true,
    });
    expect(summary.previewLabels).toEqual([
      "H2 output-cloud geometry candidate",
      "ReDiffuse STL-10 weak scout",
    ]);
  });

  it("sanitizes boundary preview labels before they are rendered", () => {
    const summary = getResearchBoundarySummary({
      boundaries: [
        {
          title: "Failed at D:\\private\\runtime.log via http://127.0.0.1:8765",
          admission_status: "watch",
        },
      ],
    }, "Unnamed boundary");

    expect(summary.previewLabels[0]).not.toContain("D:\\private");
    expect(summary.previewLabels[0]).not.toContain("127.0.0.1");
    expect(summary.previewLabels[0]).toContain("<local-path>");
    expect(summary.previewLabels[0]).toContain("<runtime-url>");
  });
});
