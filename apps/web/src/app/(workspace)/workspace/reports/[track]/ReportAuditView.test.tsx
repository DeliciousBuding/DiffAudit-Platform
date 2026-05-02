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
});
