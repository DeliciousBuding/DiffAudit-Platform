import { beforeEach, describe, expect, it, vi } from "vitest";

const proxyToBackend = vi.fn();
const proxyJsonToBackend = vi.fn();
const cookiesMock = vi.fn();

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

vi.mock("@/lib/api-proxy", () => ({
  proxyToBackend,
  proxyJsonToBackend,
}));

describe("platform api proxy routes", () => {
  beforeEach(() => {
    vi.resetModules();
    proxyToBackend.mockReset();
    proxyToBackend.mockResolvedValue(new Response(null, { status: 200 }));
    proxyJsonToBackend.mockReset();
    proxyJsonToBackend.mockResolvedValue(Response.json({}));
    cookiesMock.mockReset();
    cookiesMock.mockResolvedValue({
      get: () => undefined,
    });
    delete process.env.DIFFAUDIT_FORCE_DEMO_MODE;
    delete process.env.DIFFAUDIT_DEMO_MODE;
  });

  it("proxies workspace summary requests to the backend", async () => {
    const route = await import("./experiments/[workspace]/summary/route");

    await route.GET(new Request("http://localhost"), {
      params: Promise.resolve({ workspace: "gray-box-pia-probe-001" }),
    });

    expect(proxyToBackend).toHaveBeenCalledWith(
      "/api/v1/experiments/gray-box-pia-probe-001/summary",
    );
  });

  it("proxies catalog requests to the backend", async () => {
    const route = await import("./catalog/route");

    await route.GET();

    expect(proxyToBackend).toHaveBeenCalledWith("/api/v1/catalog");
  });

  it("proxies attack-defense table requests to the backend", async () => {
    const route = await import("./evidence/attack-defense-table/route");

    await route.GET();

    expect(proxyToBackend).toHaveBeenCalledWith("/api/v1/evidence/attack-defense-table");
  });

  it("proxies workspace summary requests to the backend", async () => {
    const route = await import("./experiments/[workspace]/summary/route");

    await route.GET(new Request("http://localhost"), {
      params: Promise.resolve({
        workspace: "recon-runtime-mainline-ddim-public-100-step30",
      }),
    });

    expect(proxyToBackend).toHaveBeenCalledWith(
      "/api/v1/experiments/recon-runtime-mainline-ddim-public-100-step30/summary",
    );
  });

  it("proxies audit job list requests to the backend", async () => {
    const route = await import("./audit/jobs/route");

    await route.GET(new Request("http://localhost", {
      headers: { cookie: "platform-demo-mode=0" },
    }));

    expect(proxyJsonToBackend).toHaveBeenCalledWith(
      "/api/v1/audit/jobs",
      undefined,
      expect.any(Function),
    );
  });

  it("proxies runtime control health requests to the backend", async () => {
    const route = await import("./control/runtime/route");

    await route.GET(new Request("http://localhost", {
      headers: { cookie: "platform-demo-mode=0" },
    }));

    expect(proxyToBackend).toHaveBeenCalledWith("/api/v1/control/runtime");
  });

  it("returns demo runtime status without proxying when demo is forced", async () => {
    process.env.DIFFAUDIT_FORCE_DEMO_MODE = "1";
    const route = await import("./control/runtime/route");

    const response = await route.GET(new Request("http://localhost"));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      connected: true,
      demo_mode: true,
      forced: true,
    });
    expect(proxyToBackend).not.toHaveBeenCalled();
  });

  it("returns a demo audit template without proxying when demo is forced", async () => {
    process.env.DIFFAUDIT_FORCE_DEMO_MODE = "true";
    const route = await import("./audit/job-template/route");

    const response = await route.GET(
      new Request("http://localhost/api/v1/audit/job-template?contract_key=pia_runtime_mainline"),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      contract_key: "pia_runtime_mainline",
      job_type: "pia_runtime_mainline",
      runtime_profile: "demo",
      demo_mode: true,
    });
    expect(proxyToBackend).not.toHaveBeenCalled();
  });
});
