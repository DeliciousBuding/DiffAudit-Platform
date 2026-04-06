import { beforeEach, describe, expect, it, vi } from "vitest";

const proxyToBackend = vi.fn();

vi.mock("@/lib/api-proxy", () => ({
  proxyToBackend,
}));

describe("platform api proxy routes", () => {
  beforeEach(() => {
    proxyToBackend.mockReset();
    proxyToBackend.mockResolvedValue(new Response(null, { status: 200 }));
  });

  it("proxies recon best requests to the backend", async () => {
    const route = await import("./experiments/recon/best/route");

    await route.GET();

    expect(proxyToBackend).toHaveBeenCalledWith("/api/v1/experiments/recon/best");
  });

  it("proxies audit job list requests to the backend", async () => {
    const route = await import("./audit/jobs/route");

    await route.GET();

    expect(proxyToBackend).toHaveBeenCalledWith("/api/v1/audit/jobs");
  });
});
