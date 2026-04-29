import { afterEach, describe, expect, it, vi } from "vitest";

import { proxyToBackend } from "./api-proxy";

describe("api proxy public boundary", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("does not expose backend network errors or urls", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("connect ECONNREFUSED http://127.0.0.1:8780/internal")),
    );

    const response = await proxyToBackend("/api/v1/catalog");
    const body = await response.text();

    expect(response.status).toBe(502);
    expect(body).toContain("Platform gateway unavailable.");
    expect(body).not.toContain("127.0.0.1");
    expect(body).not.toContain("ECONNREFUSED");
  });
});
