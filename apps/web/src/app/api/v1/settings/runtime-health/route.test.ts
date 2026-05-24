import { beforeEach, describe, expect, it, vi } from "vitest";

const isDemoModeEnabledServer = vi.fn();
const proxyToBackend = vi.fn();
const validateSession = vi.fn();

vi.mock("@/lib/demo-mode", () => ({
  isDemoModeEnabledServer,
}));

vi.mock("@/lib/api-proxy", () => ({
  proxyToBackend,
}));

vi.mock("@/lib/auth", () => ({
  SESSION_COOKIE_NAME: "diffaudit_session",
  validateSession,
}));

describe("runtime health settings route", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
    isDemoModeEnabledServer.mockReset();
    proxyToBackend.mockReset();
    proxyToBackend.mockResolvedValue(Response.json({ connected: true }));
    validateSession.mockReset();
    validateSession.mockReturnValue({
      userId: "user-1",
      username: "demo-reviewer",
      avatarUrl: null,
    });
  });

  it("checks the configured backend runtime status instead of fetching query-provided targets", async () => {
    isDemoModeEnabledServer.mockResolvedValue(false);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const route = await import("./route");

    await route.GET(new Request(
      "http://localhost/api/v1/settings/runtime-health?host=http://169.254.169.254&port=80",
      {
        headers: { cookie: "platform-demo-mode=0; diffaudit_session=session-token" },
      },
    ));

    expect(validateSession).toHaveBeenCalledWith("session-token");
    expect(proxyToBackend).toHaveBeenCalledWith("/api/v1/control/runtime");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects unauthenticated live runtime checks before reaching the backend", async () => {
    isDemoModeEnabledServer.mockResolvedValue(false);
    validateSession.mockReturnValue(null);
    const route = await import("./route");

    const response = await route.GET(new Request(
      "http://localhost/api/v1/settings/runtime-health?host=http://127.0.0.1&port=8765",
      {
        headers: { cookie: "platform-demo-mode=0; diffaudit_session=12345678901234567890123456789012" },
      },
    ));
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload).toEqual({ message: "Authentication required." });
    expect(proxyToBackend).not.toHaveBeenCalled();
  });

  it("keeps demo runtime health available without a session", async () => {
    isDemoModeEnabledServer.mockResolvedValue(true);
    const route = await import("./route");

    const response = await route.GET(new Request("http://localhost/api/v1/settings/runtime-health"));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({ connected: true, demo_mode: true });
    expect(validateSession).not.toHaveBeenCalled();
    expect(proxyToBackend).not.toHaveBeenCalled();
  });
});
