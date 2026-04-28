import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderTrackReportPage } from "./track-report-page";

describe("TrackReportPage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("defaults to the display view and renders the view toggle", async () => {
    const markup = renderToStaticMarkup(
      await renderTrackReportPage({
        locale: "zh-CN",
        params: { track: "black-box" },
        searchParams: {},
      }),
    );

    expect(markup).toContain("展示视图");
    expect(markup).toContain("审计视图");
    expect(markup).toContain('href="/workspace/reports/black-box?view=display"');
    expect(markup).toContain('href="/workspace/reports/black-box?view=audit"');
    expect(markup).toContain("recon");
    expect(markup).not.toContain("实验溯源");
    expect(markup).not.toContain("历史对照");
  });

  it("switches to the audit view and falls back to em dash when provenance is missing", async () => {
    const markup = renderToStaticMarkup(
      await renderTrackReportPage({
        locale: "zh-CN",
        params: { track: "gray-box" },
        searchParams: { view: "audit" },
      }),
    );

    expect(markup).toContain("实验溯源");
    expect(markup).toContain("历史对照");
    expect(markup).not.toContain("pending workspace");
    expect(markup).toContain("mainline");
    expect(markup).toContain("—");
    expect(markup).toContain("来源路径");
    expect(markup).toContain("调度");
    expect(markup).toContain("Seed");
    expect(markup).toContain("Fixture 版本");
  });
});
