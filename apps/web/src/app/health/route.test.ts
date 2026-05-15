import { beforeEach, describe, expect, it, vi } from "vitest";

const isDemoModeEnabledServer = vi.fn();
const proxyToBackend = vi.fn();

vi.mock("@/lib/demo-mode", () => ({
  isDemoModeEnabledServer,
}));

vi.mock("@/lib/api-proxy", () => ({
  proxyToBackend,
}));

describe("health route", () => {
  beforeEach(() => {
    vi.resetModules();
    isDemoModeEnabledServer.mockReset();
    proxyToBackend.mockReset();
    proxyToBackend.mockResolvedValue(Response.json({ upstream: true }));
  });

  it("returns demo health without proxying when demo mode is enabled", async () => {
    isDemoModeEnabledServer.mockResolvedValue(true);
    const route = await import("./route");

    const response = await route.GET(new Request("http://localhost/health"));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      demo_mode: true,
      snapshot_available: true,
      build: { revision: "demo-snapshot" },
    });
    expect(proxyToBackend).not.toHaveBeenCalled();
  });

  it("proxies backend health outside demo mode", async () => {
    isDemoModeEnabledServer.mockResolvedValue(false);
    const route = await import("./route");

    await route.GET(new Request("http://localhost/health"));

    expect(proxyToBackend).toHaveBeenCalledWith("/health");
  });
});
