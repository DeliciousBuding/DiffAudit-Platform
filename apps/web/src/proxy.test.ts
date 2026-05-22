import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it } from "vitest";

import { proxy } from "./proxy";

function createRequest(path: string, cookie?: string) {
  return new NextRequest(`https://diffaudit.example${path}`, {
    headers: cookie ? { cookie } : undefined,
  });
}

describe("platform proxy", () => {
  beforeEach(() => {
    delete process.env.DIFFAUDIT_DEMO_MODE;
    delete process.env.DIFFAUDIT_FORCE_DEMO_MODE;
  });

  it("allows workspace pages without a session while demo mode is enabled by default", () => {
    const response = proxy(createRequest("/workspace/reports?view=latest"));

    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(response.headers.get("location")).toBeNull();
  });

  it("redirects protected workspace pages to login when demo mode is disabled", () => {
    const response = proxy(createRequest(
      "/workspace/reports?view=latest",
      "platform-demo-mode=0",
    ));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://diffaudit.example/login?redirectTo=%2Fworkspace%2Freports%3Fview%3Dlatest",
    );
  });

  it("returns a JSON 401 for protected API calls when demo mode is disabled", async () => {
    const response = proxy(createRequest("/api/v1/audit/jobs", "platform-demo-mode=0"));
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload).toEqual({ message: "Authentication required." });
  });

  it("allows protected routes when a session-shaped cookie is present", () => {
    const session = "diffaudit_session=12345678901234567890123456789012";
    const response = proxy(createRequest("/workspace/settings", `${session}; platform-demo-mode=0`));

    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("forwards supported locale cookies through the request header override", () => {
    const response = proxy(createRequest("/docs", "platform-locale-v2=zh-CN"));
    const overrideHeaders = response.headers.get("x-middleware-override-headers");

    expect(overrideHeaders?.split(",")).toContain("x-platform-locale");
    expect(response.headers.get("x-middleware-request-x-platform-locale")).toBe("zh-CN");
  });

  it("removes unsupported client-provided locale headers", () => {
    const request = new NextRequest("https://diffaudit.example/docs", {
      headers: {
        "x-platform-locale": "zh-CN",
        cookie: "platform-locale-v2=fr-FR",
      },
    });
    const response = proxy(request);
    const overrideHeaders = response.headers.get("x-middleware-override-headers");

    expect(overrideHeaders?.split(",")).not.toContain("x-platform-locale");
    expect(response.headers.get("x-middleware-request-x-platform-locale")).toBeNull();
  });
});
