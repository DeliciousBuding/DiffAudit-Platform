import { describe, expect, it } from "vitest";

import { generateCompetitionReportHTML } from "./competition-report";

describe("generateCompetitionReportHTML", () => {
  it("includes the expanded visual summary and coverage sections", () => {
    const html = generateCompetitionReportHTML({
      locale: "en-US",
      catalogSize: 6,
      defendedRows: 3,
      rows: [
        {
          track: "black-box",
          attack: "Recon",
          defense: "none",
          model: "Stable Diffusion v1.5",
          aucLabel: "0.849",
          asrLabel: "0.510",
          tprLabel: "1.000",
          evidenceLevel: "runtime-mainline",
        },
        {
          track: "gray-box",
          attack: "PIA",
          defense: "stochastic-dropout",
          model: "Stable Diffusion v1.5",
          aucLabel: "0.791",
          asrLabel: "0.620",
          tprLabel: "0.880",
          evidenceLevel: "runtime-mainline",
        },
      ],
      contracts: [
        {
          contractKey: "recon_artifact_mainline",
          label: "Recon + SD v1.4",
          systemGap: "Membership inference via loss deviation.",
          workspace: "pending workspace",
        },
      ],
    });

    expect(html).toContain("Audit Summary");
    expect(html).toContain("Risk Distribution");
    expect(html).toContain("Three Attack Line Results");
    expect(html).toContain("Defense Comparison");
    expect(html).toContain("Innovation Highlights");
    expect(html).toContain("Auditable Contracts");
    expect(html).toContain("Avg. Attack Success Rate");
  });
});
