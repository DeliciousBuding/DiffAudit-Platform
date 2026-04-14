import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import WorkspaceAuditsPage from "./page";

describe("WorkspaceAuditsPage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders zh-CN copy with live jobs", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              contract_key: "black-box/recon/sd15-ddim",
              track: "black-box",
              attack_family: "recon",
              target_key: "sd15-ddim",
              label: "Stable Diffusion 1.5 DDIM Recon",
              availability: "ready",
              evidence_level: "best-summary",
              best_workspace: "recon-runtime-mainline-ddim-public-100-step30",
              system_gap: "surface semantic limits cleanly",
            },
          ]),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            rows: [
              {
                track: "black-box",
                attack: "recon DDIM public-100 step30",
                defense: "none",
                model: "Stable Diffusion v1.5 + DDIM",
                auc: 0.849,
                asr: 0.51,
                tpr_at_1pct_fpr: 1,
                quality_cost: "100 public samples per split",
                evidence_level: "runtime-mainline",
                note: "current black-box main evidence",
              },
            ],
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              job_id: "job_123",
              status: "running",
              contract_key: "black-box/recon/sd15-ddim",
              workspace_name: "audit-replay-001",
              updated_at: "2026-04-13T10:00:00Z",
            },
            {
              job_id: "job_124",
              status: "queued",
              contract_key: "gray-box/pia/cifar10-ddpm",
              workspace_name: "pia-runtime-001",
              updated_at: "2026-04-13T10:03:00Z",
            },
          ]),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      );

    vi.stubGlobal("fetch", fetchMock);

    const markup = renderToStaticMarkup(await WorkspaceAuditsPage({ locale: "zh-CN" }));

    expect(markup).toContain("创建任务、跟踪运行、查看结果。");
    expect(markup).toContain("推荐合同项");
    expect(markup).toContain("运行中任务");
    expect(markup).toContain("job_123");
    expect(markup).toContain("audit-replay-001");
    expect(markup).toContain("running");
    expect(markup).toContain("gray-box/pia/cifar10-ddpm");
  });

  it("renders en-US empty states when jobs are unavailable", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              contract_key: "black-box/recon/sd15-ddim",
              track: "black-box",
              attack_family: "recon",
              target_key: "sd15-ddim",
              label: "Stable Diffusion 1.5 DDIM Recon",
              availability: "ready",
            },
          ]),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ rows: [] }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      )
      .mockRejectedValueOnce(new Error("connect ECONNREFUSED"));

    vi.stubGlobal("fetch", fetchMock);

    const markup = renderToStaticMarkup(await WorkspaceAuditsPage({ locale: "en-US" }));

    expect(markup).toContain("Create jobs, track runs, review results.");
    expect(markup).toContain("No running jobs.");
    expect(markup).toContain("Recommended contracts");
    expect(markup).toContain("No audit results yet.");
  });
});