import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderTrackReportPage } from "./track-report-page";

function responseJson(payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

describe("TrackReportPage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("defaults to the display view and renders the view toggle", async () => {
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;

      if (url.includes("/api/v1/catalog")) {
        return responseJson([
            {
              contract_key: "black-box/recon/sd15-ddim",
              track: "black-box",
              attack_family: "recon",
              target_key: "sd15-ddim",
              label: "Stable Diffusion 1.5 DDIM Recon",
              availability: "ready",
              evidence_level: "best-summary",
              best_workspace: "recon-runtime-mainline-ddim-public-100-step30",
              best_summary_path: "runs/recon-runtime-mainline-ddim-public-100-step30/summary.json",
              scheduler: "ddim",
              system_gap: "surface semantic limits cleanly",
              admission_status: "admitted",
              admission_level: "runtime-mainline",
              provenance_status: "workspace-verified",
              intake_manifest: "workspaces/intake/manifests/recon.json",
            },
          ]);
      }

      if (url.includes("/api/v1/evidence/attack-defense-table")) {
        return responseJson({
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
              boundary: "controlled / public-subset / proxy-shadow-member / risk-exists",
              source: "experiments/recon-runtime-mainline-ddim-public-100-step30/summary.json",
              provenance_status: "workspace-verified",
            },
            {
              track: "gray-box",
              attack: "PIA GPU512 baseline",
              defense: "stochastic-dropout",
              model: "CIFAR-10 DDPM",
              auc: 0.829,
              asr: 0.77,
              tpr_at_1pct_fpr: 0.023,
              quality_cost: "512 samples per split",
              evidence_level: "runtime-mainline",
              note: "gray-box comparator",
            },
          ],
        });
      }

      if (url.includes("/api/v1/experiments/")) {
        return responseJson({
            workspace: "../Research/experiments/recon-runtime-mainline-ddim-public-100-step30",
            summary_path: "../Research/experiments/recon-runtime-mainline-ddim-public-100-step30/summary.json",
            backend: "runtime-go",
            scheduler: "ddim",
            metrics: {
              auc: 0.849,
              asr: 0.51,
              tpr_at_1pct_fpr: 1,
            },
        });
      }

      throw new Error(`Unexpected fetch URL: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

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
    expect(markup).toContain("recon DDIM public-100 step30");
    expect(markup).not.toContain("实验溯源");
    expect(markup).not.toContain("历史对照");
  });

  it("switches to the audit view and falls back to em dash when provenance is missing", async () => {
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;

      if (url.includes("/api/v1/catalog")) {
        return responseJson([
            {
              contract_key: "gray-box/pia/cifar10-ddpm",
              track: "gray-box",
              attack_family: "PIA",
              target_key: "cifar10-ddpm",
              label: "PIA + CIFAR-10 DDPM",
              availability: "ready",
              evidence_level: "mainline",
              best_workspace: "pia-runtime-mainline",
              system_gap: "pending",
              admission_status: "admitted",
              admission_level: "runtime-mainline",
              provenance_status: "workspace-verified",
              intake_manifest: "workspaces/intake/manifests/pia.json",
            },
          ]);
      }

      if (url.includes("/api/v1/evidence/attack-defense-table")) {
        return responseJson({
          rows: [
            {
              track: "gray-box",
              attack: "PIA GPU512 baseline",
              defense: "none",
              model: "CIFAR-10 DDPM",
              auc: 0.829,
              asr: 0.77,
              tpr_at_1pct_fpr: 0.023,
              evidence_level: "runtime-mainline",
              note: "current gray-box main evidence",
              boundary: "workspace-verified + adaptive-reviewed",
              source: "workspaces/gray-box/runs/pia-runtime-mainline/summary.json",
              provenance_status: "workspace-verified",
            },
          ],
        });
      }

      if (url.includes("/api/v1/experiments/")) {
        return responseJson({
            workspace: "../Research/experiments/pia-runtime-mainline",
            metrics: {
              auc: 0.829,
              asr: 0.77,
              tpr_at_1pct_fpr: 0.023,
            },
        });
      }

      throw new Error(`Unexpected fetch URL: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    const markup = renderToStaticMarkup(
      await renderTrackReportPage({
        locale: "zh-CN",
        params: { track: "gray-box" },
        searchParams: { view: "audit" },
      }),
    );

    expect(markup).toContain("实验溯源");
    expect(markup).toContain("历史对照");
    expect(markup).toContain("../Research/experiments/pia-runtime-mainline");
    expect(markup).toContain("runtime-mainline");
    expect(markup).toContain("workspaces/intake/manifests/pia.json");
    expect(markup).toContain("来源路径");
    expect(markup).toContain("调度");
    expect(markup).toContain("Seed");
    expect(markup).toContain("Fixture 版本");
    expect(markup).toContain("—");
  });
});
