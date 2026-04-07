import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchBestEvidenceSourceSnapshot } from "./evidence-report";

describe("fetchBestEvidenceSourceSnapshot", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("prefers the requested contract when a best workspace is available", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              contract_key: "gray-box/pia/cifar10-ddpm",
              track: "gray-box",
              attack_family: "pia",
              target_key: "cifar10-ddpm",
              label: "PIA",
              availability: "ready",
              best_workspace: "pia-workspace-001",
            },
            {
              contract_key: "black-box/recon/sd15-ddim",
              track: "black-box",
              attack_family: "recon",
              target_key: "sd15-ddim",
              label: "Recon",
              availability: "partial",
              best_workspace: "recon-runtime-mainline-ddim-public-100-step30",
            },
          ]),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: "ready",
            workspace:
              "D:\\Code\\DiffAudit\\Project\\experiments\\recon-runtime-mainline-ddim-public-100-step30",
            summary_path:
              "D:\\Code\\DiffAudit\\Project\\experiments\\recon-runtime-mainline-ddim-public-100-step30\\summary.json",
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      );

    vi.stubGlobal("fetch", fetchMock);

    const report = await fetchBestEvidenceSourceSnapshot({
      preferredContractKey: "black-box/recon/sd15-ddim",
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("/api/v1/catalog");
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain(
      "/api/v1/experiments/recon-runtime-mainline-ddim-public-100-step30/summary",
    );
    expect(report?.statusLabel).toBe("ready");
    expect(report?.statusTone).toBe("success");
    expect(report?.workspacePath).toContain(
      "recon-runtime-mainline-ddim-public-100-step30",
    );
    expect(report?.summaryPath).toContain("summary.json");
  });

  it("falls back to the first ready entry when the preferred contract is missing", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              contract_key: "gray-box/pia/cifar10-ddpm",
              track: "gray-box",
              attack_family: "pia",
              target_key: "cifar10-ddpm",
              label: "PIA",
              availability: "ready",
              best_workspace: "pia-cifar10-runtime-mainline-20260407-cpu",
            },
            {
              contract_key: "white-box/gsa/ddpm-cifar10",
              track: "white-box",
              attack_family: "gsa",
              target_key: "ddpm-cifar10",
              label: "GSA",
              availability: "partial",
              best_workspace: "gsa-runtime-mainline-20260407-cpu",
            },
          ]),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: "running",
            paper: "PIA",
            method: "pia",
            mode: "runtime-mainline",
            backend: null,
            scheduler: null,
            workspace:
              "D:\\Code\\DiffAudit\\Project\\experiments\\pia-cifar10-runtime-mainline-20260407-cpu",
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      );

    vi.stubGlobal("fetch", fetchMock);

    const report = await fetchBestEvidenceSourceSnapshot({
      preferredContractKey: "black-box/recon/sd15-ddim",
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain(
      "/api/v1/experiments/pia-cifar10-runtime-mainline-20260407-cpu/summary",
    );
    expect(report?.statusLabel).toBe("running");
    expect(report?.statusTone).toBe("warning");
    expect(report?.paper).toBe("PIA");
  });

  it("returns null without fetching summary when no catalog entry exposes a workspace", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(
      new Response(
        JSON.stringify([
          {
            contract_key: "black-box/recon/sd15-ddim",
            track: "black-box",
            attack_family: "recon",
            target_key: "sd15-ddim",
            label: "Recon",
            availability: "ready",
            best_workspace: null,
          },
        ]),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );

    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchBestEvidenceSourceSnapshot()).resolves.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("returns null when the summary payload does not provide a workspace", async () => {
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
              label: "Recon",
              availability: "ready",
              best_workspace: "recon-runtime-mainline-ddim-public-100-step30",
            },
          ]),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ status: "ready" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );

    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchBestEvidenceSourceSnapshot()).resolves.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

