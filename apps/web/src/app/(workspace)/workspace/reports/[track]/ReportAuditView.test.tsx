import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ReportAuditView } from "./ReportAuditView";
import type { AttackDefenseRowViewModel } from "@/lib/workspace-source";

const rows: AttackDefenseRowViewModel[] = [
  {
    track: "black-box",
    attack: "recon",
    defense: "none",
    model: "stable-diffusion-v1-4",
    aucLabel: "0.849",
    asrLabel: "0.510",
    tprLabel: "1.000",
    qualityCost: "No cost information provided.",
    evidenceLevel: "admitted",
    note: "High leakage.",
    riskLevel: "high",
  },
];

describe("ReportAuditView", () => {
  it("renders the zh-CN intake manifest label in Chinese when data is present", () => {
    const markup = renderToStaticMarkup(
      <ReportAuditView
        locale="zh-CN"
        rows={[]}
        provenance={{ intakeManifest: "manifest-v2.json" }}
        historyPlaceholder="暂无历史数据"
      />,
    );

    expect(markup).toContain("导入清单");
    expect(markup).toContain("manifest-v2.json");
    expect(markup).not.toContain("Intake Manifest");
  });

  it("hides empty provenance fields when no data is present", () => {
    const markup = renderToStaticMarkup(
      <ReportAuditView
        locale="zh-CN"
        rows={[]}
        provenance={{}}
        historyPlaceholder="暂无历史数据"
      />,
    );

    expect(markup).not.toContain("导入清单");
    expect(markup).not.toContain("Run 目录");
    expect(markup).not.toContain("Seed");
    expect(markup).toContain("暂无溯源数据。");
  });

  it("shows a compact completed-job banner and matched row marker", () => {
    const markup = renderToStaticMarkup(
      <ReportAuditView
        locale="en-US"
        rows={rows}
        provenance={{}}
        historyPlaceholder="No history data"
        jobContext={{
          jobId: "job_demo_004",
          contractKey: "recon_artifact_mainline",
          targetModel: "stable-diffusion-v1-4",
          aucLabel: "0.849",
        }}
        highlightedRowKeys={["black-box::recon::none::stable-diffusion-v1-4::0.849"]}
      />,
    );

    expect(markup).toContain("Reviewing completed job");
    expect(markup).toContain("1 matching admitted result row found in this snapshot.");
    expect(markup).toContain("Matched job");
    expect(markup).toContain("job_demo_004");
  });

  it("keeps the banner but avoids claiming a match when the row is absent", () => {
    const markup = renderToStaticMarkup(
      <ReportAuditView
        locale="zh-CN"
        rows={rows}
        provenance={{}}
        historyPlaceholder="暂无历史数据"
        jobContext={{
          jobId: "job_unadmitted",
          contractKey: "recon_future_runtime",
        }}
      />,
    );

    expect(markup).toContain("正在审阅已完成任务");
    expect(markup).toContain("尚未进入当前公开快照");
    expect(markup).not.toContain("匹配任务");
  });

  it("renders sanitized producer context when a completed job exposes runtime tails", () => {
    const markup = renderToStaticMarkup(
      <ReportAuditView
        locale="en-US"
        rows={rows}
        provenance={{}}
        historyPlaceholder="No history data"
        producerContext={{
          status: "completed",
          updatedAt: "2026-05-15T08:12:30Z",
          stdoutTail: "saved C:\\runtime\\private\\score.json\nreported token=abc123",
          stderrTail: "upload to http://localhost:8780 failed",
          stateHistory: [
            { state: "queued", timestamp: "2026-05-15T08:12:00Z" },
            { state: "completed", timestamp: "2026-05-15T08:12:30Z" },
          ],
        }}
      />,
    );

    expect(markup).toContain("Producer context");
    expect(markup).toContain("Completed");
    expect(markup).toContain("Runtime output tail");
    expect(markup).toContain("State history");
    expect(markup).toContain("&lt;local-path&gt;");
    expect(markup).toContain("token=&lt;redacted&gt;");
    expect(markup).toContain("&lt;runtime-url&gt;");
    expect(markup).not.toContain("C:\\runtime\\private");
    expect(markup).not.toContain("abc123");
    expect(markup).not.toContain("localhost:8780");
  });
});
