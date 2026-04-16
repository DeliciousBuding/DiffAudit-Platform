import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import { PrintableAuditReport } from "./printable-audit-report";

vi.mock("./chart-auc-distribution", () => ({
  ChartAucDistribution: () => React.createElement("div", { "data-chart": "auc-distribution" }, "auc-chart"),
}));

vi.mock("./chart-roc-curve", () => ({
  ChartRocCurve: () => React.createElement("div", { "data-chart": "roc-curve" }, "roc-chart"),
}));

vi.mock("./chart-risk-distribution", () => ({
  ChartRiskDistribution: () => React.createElement("div", { "data-chart": "risk-distribution" }, "risk-chart"),
}));

vi.mock("./chart-attack-comparison", () => ({
  ChartAttackComparison: () => React.createElement("div", { "data-chart": "attack-comparison" }, "attack-chart"),
}));

vi.mock("./compare-view", () => ({
  CompareView: () => React.createElement("section", null, "Defense Effectiveness"),
}));

describe("PrintableAuditReport", () => {
  it("renders the full reports-page structure in a printable container", () => {
    const markup = renderToStaticMarkup(
      <PrintableAuditReport
        locale="en-US"
        rows={[
          {
            track: "black-box",
            attack: "recon",
            defense: "none",
            model: "stable-diffusion-v1-4",
            aucLabel: "0.849",
            asrLabel: "0.510",
            tprLabel: "1.000",
            evidenceLevel: "admitted",
            qualityCost: "",
            note: "",
            riskLevel: "medium",
          },
        ]}
        contracts={[
          {
            contractKey: "recon_artifact_mainline",
            label: "Recon + SD v1.4",
            systemGap: "Membership inference via loss deviation.",
            bestWorkspace: "pending workspace",
            availability: "ready",
            evidenceLevel: "best-summary",
            capabilityLabel: "",
            paper: "",
            runtimeLabel: "",
            bestSummaryPath: "",
            track: "black-box",
          },
        ]}
      />,
    );

    expect(markup).toContain("Audit results and coverage gaps.");
    expect(markup).toContain("AUC Score Distribution");
    expect(markup).toContain("ROC Curve");
    expect(markup).toContain("Risk Distribution");
    expect(markup).toContain("Attack Comparison");
    expect(markup).toContain("Coverage gaps");
    expect(markup).toContain("Defense Effectiveness");
    expect(markup).toContain("Audit results");
    expect(markup).toContain("recon_artifact_mainline");
    expect(markup).toContain("width:794px");
  });
});
