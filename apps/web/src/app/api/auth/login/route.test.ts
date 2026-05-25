import { beforeEach, describe, expect, it, vi } from "vitest";

import { resetLoginRateLimitForTests } from "@/lib/auth-rate-limit";

const authMocks = vi.hoisted(() => ({
  createSession: vi.fn(() => "session-token"),
  ensureLegacySharedUser: vi.fn(async () => null),
  verifyCredentials: vi.fn(),
}));

const cookieStoreMock = vi.hoisted(() => ({
  set: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => cookieStoreMock),
}));

vi.mock("@/lib/auth", () => ({
  createSession: authMocks.createSession,
  ensureLegacySharedUser: authMocks.ensureLegacySharedUser,
  SESSION_COOKIE_NAME: "diffaudit_session",
  SESSION_COOKIE_OPTIONS: {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 43_200,
  },
  verifyCredentials: authMocks.verifyCredentials,
}));

function loginRequest(username = "demo-reviewer", password = "wrong-password") {
  return new Request("http://localhost/api/auth/login", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "user-agent": "vitest",
      "x-forwarded-for": "203.0.113.10",
    },
    body: JSON.stringify({ username, password }),
  });
}

describe("login route rate limiting", () => {
  beforeEach(() => {
    resetLoginRateLimitForTests();
    vi.clearAllMocks();
    authMocks.verifyCredentials.mockResolvedValue(null);
  });

  it("stops repeated failed attempts before running password verification again", async () => {
    const route = await import("./route");

    for (let i = 0; i < 5; i += 1) {
      const response = await route.POST(loginRequest());
      expect(response.status).toBe(401);
    }

    const limited = await route.POST(loginRequest());
    const payload = await limited.json();

    expect(limited.status).toBe(429);
    expect(payload).toEqual({ message: "Too many login attempts. Try again later." });
    expect(Number(limited.headers.get("Retry-After"))).toBeGreaterThan(0);
    expect(authMocks.verifyCredentials).toHaveBeenCalledTimes(5);
    expect(authMocks.ensureLegacySharedUser).toHaveBeenCalledTimes(5);
  });

  it("clears the failed-attempt bucket after a successful login", async () => {
    const route = await import("./route");

    const failed = await route.POST(loginRequest());
    expect(failed.status).toBe(401);

    authMocks.verifyCredentials.mockResolvedValueOnce({
      id: "user-1",
      username: "demo-reviewer",
      avatarUrl: null,
    });
    const success = await route.POST(loginRequest("demo-reviewer", "correct-password"));
    expect(success.status).toBe(200);
    expect(cookieStoreMock.set).toHaveBeenCalledWith(
      "diffaudit_session",
      "session-token",
      expect.objectContaining({ httpOnly: true }),
    );

    authMocks.verifyCredentials.mockResolvedValue(null);
    for (let i = 0; i < 5; i += 1) {
      const response = await route.POST(loginRequest());
      expect(response.status).toBe(401);
    }

    const limited = await route.POST(loginRequest());
    expect(limited.status).toBe(429);
  });
});
