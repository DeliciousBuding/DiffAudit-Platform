import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ReportEvidenceStack } from "./report-evidence-stack";

describe("ReportEvidenceStack", () => {
  it("uses neutral placeholders instead of fabricated provenance text", () => {
    const markup = renderToStaticMarkup(
      <ReportEvidenceStack
        locale="en-US"
        row={{
          track: "gray-box",
          attack: "PIA",
          defense: "none",
          model: "DDPM",
          aucLabel: "0.841",
          asrLabel: "0.786",
          tprLabel: "0.058",
          qualityCost: "512 samples",
          evidenceLevel: "runtime-mainline",
          note: "baseline",
          riskLevel: "high",
        }}
      />,
    );

    expect(markup).toContain("Provenance: —");
    expect(markup).toContain("Boundary: —");
    expect(markup).toContain("Source Path: —");
    expect(markup).not.toContain("unknown");
    expect(markup).not.toContain("No boundary note provided.");
  });
});
