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

  it("switches to the audit view and hides empty provenance fields", async () => {
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
    expect(markup).toContain("来源路径");
    expect(markup).toContain("调度");
    // Empty provenance fields are now hidden
    expect(markup).not.toContain("Seed");
    expect(markup).not.toContain("Fixture 版本");
  });

  it("renders completed job context and highlights matching rows", async () => {
    const markup = renderToStaticMarkup(
      await renderTrackReportPage({
        locale: "en-US",
        params: { track: "black-box" },
        searchParams: {
          view: "audit",
          job: "job_demo_004",
          contract: "recon_artifact_mainline",
          model: "stable-diffusion-v1-4",
          auc: "0.849",
        },
      }),
    );

    expect(markup).toContain("Reviewing completed job");
    expect(markup).toContain("matching admitted result row");
    expect(markup).toContain("Matched job");
    expect(markup).toContain("job_demo_004");
    expect(markup).toContain("recon_artifact_mainline");
  });

  it("hydrates sanitized producer context from the completed job detail facade", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/api/v1/audit/jobs/job_demo_004")) {
        return Response.json({
          job: {
            status: "completed",
            updated_at: "2026-05-15T08:12:30Z",
            stdout_tail: "saved C:\\runtime\\private\\score.json\nreported token=abc123",
            stderr_tail: "upload to http://localhost:8780 failed",
            state_history: [
              { state: "queued", timestamp: "2026-05-15T08:12:00Z" },
              { state: "completed", timestamp: "2026-05-15T08:12:30Z" },
            ],
          },
        });
      }

      return new Response(null, { status: 404 });
    }));

    const markup = renderToStaticMarkup(
      await renderTrackReportPage({
        locale: "en-US",
        params: { track: "black-box" },
        searchParams: {
          view: "audit",
          job: "job_demo_004",
          contract: "recon_artifact_mainline",
          model: "stable-diffusion-v1-4",
          auc: "0.849",
        },
      }),
    );

    expect(markup).toContain("Producer context");
    expect(markup).toContain("Runtime output tail");
    expect(markup).toContain("&lt;local-path&gt;");
    expect(markup).toContain("token=&lt;redacted&gt;");
    expect(markup).toContain("&lt;runtime-url&gt;");
    expect(markup).not.toContain("C:\\runtime\\private");
    expect(markup).not.toContain("abc123");
    expect(markup).not.toContain("localhost:8780");
  });

  it("keeps completed job context safe when no snapshot row matches", async () => {
    const markup = renderToStaticMarkup(
      await renderTrackReportPage({
        locale: "en-US",
        params: { track: "black-box" },
        searchParams: {
          view: "audit",
          job: "job_unadmitted",
          contract: "recon_new_runtime",
          model: "not-in-snapshot",
          auc: "0.999",
        },
      }),
    );

    expect(markup).toContain("Reviewing completed job");
    expect(markup).toContain("has not been admitted into the current public snapshot yet");
    expect(markup).not.toContain("Matched job");
  });
});
