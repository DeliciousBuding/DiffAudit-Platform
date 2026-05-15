import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getCurrentUserProfile = vi.fn();
const isDemoModeEnabledServer = vi.fn();

vi.mock("@/lib/auth", () => ({
  getCurrentUserProfile,
  SESSION_COOKIE_NAME: "diffaudit_session",
}));

vi.mock("@/lib/demo-mode", () => ({
  isDemoModeEnabledServer,
}));

describe("auth me route", () => {
  beforeEach(() => {
    vi.resetModules();
    getCurrentUserProfile.mockReset();
    isDemoModeEnabledServer.mockReset();
  });

  it("returns anonymous profile without a 401 response when demo mode is enabled", async () => {
    isDemoModeEnabledServer.mockResolvedValue(true);
    const route = await import("./route");

    const response = await route.GET(new NextRequest("http://localhost/api/auth/me"));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ user: null });
    expect(getCurrentUserProfile).not.toHaveBeenCalled();
  });

  it("keeps the unauthenticated 401 response outside demo mode", async () => {
    isDemoModeEnabledServer.mockResolvedValue(false);
    const route = await import("./route");

    const response = await route.GET(new NextRequest("http://localhost/api/auth/me"));
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload).toEqual({ user: null });
  });

  it("returns the current user when a valid session exists", async () => {
    const user = { id: "user-1", username: "demo-reviewer" };
    getCurrentUserProfile.mockReturnValue(user);
    const route = await import("./route");

    const response = await route.GET(
      new NextRequest("http://localhost/api/auth/me", {
        headers: { cookie: "diffaudit_session=session-token" },
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ user });
    expect(getCurrentUserProfile).toHaveBeenCalledWith("session-token");
  });
});
