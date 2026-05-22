import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { ChartAttackComparison } from "./chart-attack-comparison";
import { ChartAucDistribution } from "./chart-auc-distribution";
import { ChartRiskDonut } from "./chart-risk-donut";
import { ChartRocCurve } from "./chart-roc-curve";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("SVG chart accessibility", () => {
  it("exposes a text summary for AUC distribution", () => {
    const markup = renderToStaticMarkup(
      <ChartAucDistribution data={[
        { auc: 0.4, count: 2 },
        { auc: 0.8, count: 5 },
      ]} />,
    );

    expect(markup).toContain('aria-labelledby="');
    expect(markup).toContain("<title");
    expect(markup).toContain("<desc");
    expect(markup).toContain("Peak bin 0.8 with 5 results");
  });

  it("exposes a text summary for ROC curve endpoints", () => {
    const markup = renderToStaticMarkup(
      <ChartRocCurve data={[
        { fpr: 0, tpr: 0 },
        { fpr: 1, tpr: 0.92 },
      ]} />,
    );

    expect(markup).toContain('aria-labelledby="');
    expect(markup).toContain("2 ROC points");
    expect(markup).toContain("ending at FPR 1.00 and TPR 0.92");
  });

  it("exposes a text summary for risk distribution", () => {
    const markup = renderToStaticMarkup(
      <ChartRiskDonut
        totalLabel="Total"
        data={[
          { key: "high", label: "High", count: 3 },
          { key: "medium", label: "Medium", count: 2 },
          { key: "low", label: "Low", count: 1 },
        ]}
      />,
    );

    expect(markup).toContain('aria-labelledby="');
    expect(markup).toContain("Risk distribution");
    expect(markup).toContain("6 total results");
    expect(markup).toContain("largest segment High with 3 results");
  });

  it("exposes a text summary for attack comparison radar", () => {
    const markup = renderToStaticMarkup(
      <ChartAttackComparison data={[
        { dimension: "Detection", Recon: 0.7, PIA: 0.8 },
        { dimension: "Stealth", Recon: 0.5, PIA: 0.6 },
      ]} />,
    );

    expect(markup).toContain('aria-labelledby="');
    expect(markup).toContain("Attack comparison");
    expect(markup).toContain("2 dimensions");
    expect(markup).toContain("2 attack families");
  });
});
