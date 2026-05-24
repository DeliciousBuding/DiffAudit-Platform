import { beforeEach, describe, expect, it, vi } from "vitest";

const createEmailVerificationRequest = vi.fn();
const getCurrentUserProfile = vi.fn();
const cookiesGet = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: cookiesGet,
  })),
}));

vi.mock("@/lib/auth", () => ({
  createEmailVerificationRequest,
  getCurrentUserProfile,
  SESSION_COOKIE_NAME: "diffaudit_session",
}));

describe("email verification route", () => {
  beforeEach(() => {
    vi.resetModules();
    createEmailVerificationRequest.mockReset();
    getCurrentUserProfile.mockReset();
    cookiesGet.mockReset();
  });

  it("keeps unauthenticated requests rejected", async () => {
    cookiesGet.mockReturnValue(undefined);
    const route = await import("./route");

    const response = await route.POST();
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload).toEqual({ message: "Unauthorized." });
    expect(createEmailVerificationRequest).not.toHaveBeenCalled();
  });

  it("does not create or return browser-visible verification tokens", async () => {
    cookiesGet.mockReturnValue({ value: "session-token" });
    getCurrentUserProfile.mockReturnValue({
      id: "user-1",
      username: "reviewer",
      pendingEmail: "reviewer@example.test",
    });
    const route = await import("./route");

    const response = await route.POST();
    const payload = await response.json();

    expect(response.status).toBe(501);
    expect(payload).toEqual({
      message: "Email verification is not available.",
      code: "email_verification_unavailable",
    });
    expect(getCurrentUserProfile).toHaveBeenCalledWith("session-token");
    expect(createEmailVerificationRequest).not.toHaveBeenCalled();
    expect(JSON.stringify(payload)).not.toContain("verificationUrl");
  });
});
