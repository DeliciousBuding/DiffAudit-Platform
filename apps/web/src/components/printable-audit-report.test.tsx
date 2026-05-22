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
  const baseRow = {
    track: "black-box",
    attack: "recon",
    defense: "none",
    model: "stable-diffusion-v1-4",
    aucLabel: "0.849",
    asrLabel: "0.510",
    tprLabel: "1.000",
    evidenceLevel: "admitted",
    qualityCost: "100 public samples per split",
    note: "",
    provenanceStatus: "review-snapshot-verified",
    boundary: "publish-time snapshot boundary",
    sourcePath: "research://workspaces/recon/mainline/very-long-public-safe-evidence-source/score-table.json",
    riskLevel: "medium",
  } as const;

  const baseContract = {
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
  } as const;

  it("renders the full reports-page structure in a printable container", () => {
    const markup = renderToStaticMarkup(
      <PrintableAuditReport
        locale="en-US"
        rows={[baseRow]}
        contracts={[baseContract]}
      />,
    );

    expect(markup).toContain("Audit results and coverage gaps");
    expect(markup).toContain("AUC Score Distribution");
    expect(markup).toContain("ROC Curve");
    expect(markup).toContain("Risk Distribution");
    expect(markup).toContain("Attack Comparison");
    expect(markup).toContain("Coverage gaps");
    expect(markup).toContain("Defense Effectiveness");
    expect(markup).toContain("Audit results");
    expect(markup).toContain("100 public samples per split");
    expect(markup).toContain("Provenance");
    expect(markup).toContain("review-snapshot-verified");
    expect(markup).toContain("Boundary");
    expect(markup).toContain("publish-time snapshot boundary");
    expect(markup).toContain("Source Path");
    expect(markup).toContain("research://workspaces/recon/mainline/very-long-public-safe-evidence-source/score-table.json");
    expect(markup).toContain("page-break-inside:avoid");
    expect(markup).toContain("overflow-wrap:anywhere");
    expect(markup).toContain("recon_artifact_mainline");
    expect(markup).toContain("width:794px");
  });

  it("splits dense evidence result rows before a printable page becomes crowded", () => {
    const markup = renderToStaticMarkup(
      <PrintableAuditReport
        locale="en-US"
        rows={Array.from({ length: 7 }, (_, index) => ({
          ...baseRow,
          model: `stable-diffusion-v1-4-${index}`,
        }))}
        contracts={[baseContract]}
      />,
    );

    const resultPageCount = markup.match(/<h2[^>]*>Audit results<\/h2>/g)?.length ?? 0;
    expect(resultPageCount).toBe(2);
  });
});
