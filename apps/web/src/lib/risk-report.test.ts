import { describe, expect, it } from "vitest";

import { generateReportHTML } from "./risk-report";

describe("generateReportHTML", () => {
  it("renders a printable A4-style report with detailed tables", () => {
    const html = generateReportHTML(
      [
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
      "en-US",
    );

    expect(html).toContain("Detailed Results");
    expect(html).toContain("Risk Overview");
    expect(html).toContain("Conclusions & Recommendations");
    expect(html).toContain("Avg. Attack AUC");
    expect(html).toContain("Recon");
    expect(html).toContain("PIA");
  });
});
