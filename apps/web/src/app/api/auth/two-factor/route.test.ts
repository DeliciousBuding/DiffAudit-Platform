import { beforeEach, describe, expect, it, vi } from "vitest";

const cookiesMock = vi.fn();
const getCurrentUserProfile = vi.fn();
const setTwoFactorEnabled = vi.fn();

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

vi.mock("@/lib/auth", () => ({
  getCurrentUserProfile,
  SESSION_COOKIE_NAME: "diffaudit_session",
  setTwoFactorEnabled,
}));

describe("two-factor auth route", () => {
  beforeEach(() => {
    vi.resetModules();
    cookiesMock.mockReset();
    cookiesMock.mockResolvedValue({
      get: (name: string) => (name === "diffaudit_session" ? { value: "session-token" } : undefined),
    });
    getCurrentUserProfile.mockReset();
    getCurrentUserProfile.mockReturnValue({
      id: "user-1",
      username: "demo-reviewer",
    });
    setTwoFactorEnabled.mockReset();
  });

  it("rejects attempts to enable 2FA until second-factor verification is implemented", async () => {
    const route = await import("./route");

    const response = await route.POST(new Request("http://localhost/api/auth/two-factor", {
      method: "POST",
      body: JSON.stringify({ enabled: true }),
    }));
    const payload = await response.json();

    expect(response.status).toBe(501);
    expect(payload).toEqual({
      code: "two_factor_unavailable",
      enabled: false,
    });
    expect(setTwoFactorEnabled).not.toHaveBeenCalled();
  });

  it("allows disabling stale 2FA state", async () => {
    const route = await import("./route");

    const response = await route.POST(new Request("http://localhost/api/auth/two-factor", {
      method: "POST",
      body: JSON.stringify({ enabled: false }),
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ ok: true, enabled: false });
    expect(setTwoFactorEnabled).toHaveBeenCalledWith("user-1", false);
  });
});
