import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const cookiesMock = vi.fn();

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

function hostileRequest(path: string) {
  return new Request(`https://internal.invalid${path}`, {
    headers: {
      host: "attacker.example.test",
      "x-forwarded-host": "attacker.example.test",
      "x-forwarded-proto": "https",
    },
  });
}

describe("OAuth public origin", () => {
  beforeEach(() => {
    vi.resetModules();
    cookiesMock.mockReset();
    cookiesMock.mockResolvedValue({
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
    });
    vi.stubEnv("NODE_ENV", "production");
    process.env.GITHUB_CLIENT_ID = "github-client";
    process.env.GITHUB_CLIENT_SECRET = "github-secret";
    process.env.GOOGLE_CLIENT_ID = "google-client";
    process.env.GOOGLE_CLIENT_SECRET = "google-secret";
    delete process.env.DIFFAUDIT_PLATFORM_URL;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    delete process.env.GITHUB_CLIENT_ID;
    delete process.env.GITHUB_CLIENT_SECRET;
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;
    delete process.env.DIFFAUDIT_PLATFORM_URL;
  });

  it("fails GitHub OAuth closed instead of deriving redirect_uri from Host headers", async () => {
    const route = await import("./github/route");

    const response = await route.GET(hostileRequest("/api/auth/github"));
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(response.headers.get("location")).toBeNull();
    expect(payload).toEqual({ message: "Platform public URL is not configured." });
    expect(cookiesMock).not.toHaveBeenCalled();
  });

  it("fails Google OAuth closed instead of deriving redirect_uri from Host headers", async () => {
    const route = await import("./google/route");

    const response = await route.GET(hostileRequest("/api/auth/google"));
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(response.headers.get("location")).toBeNull();
    expect(payload).toEqual({ message: "Platform public URL is not configured." });
    expect(cookiesMock).not.toHaveBeenCalled();
  });

  it("uses the configured public URL for GitHub OAuth redirect_uri", async () => {
    process.env.DIFFAUDIT_PLATFORM_URL = "https://diffaudit.example.test";
    const route = await import("./github/route");

    const response = await route.GET(hostileRequest("/api/auth/github"));
    const location = response.headers.get("location");
    const redirect = new URL(location ?? "");

    expect(response.status).toBe(307);
    expect(redirect.origin).toBe("https://github.com");
    expect(redirect.searchParams.get("redirect_uri")).toBe(
      "https://diffaudit.example.test/api/auth/github/callback",
    );
  });

  it("uses the configured public URL for unauthenticated connect redirects", async () => {
    process.env.DIFFAUDIT_PLATFORM_URL = "https://diffaudit.example.test";
    const route = await import("./github/route");

    const response = await route.GET(
      hostileRequest("/api/auth/github?intent=connect&redirectTo=/workspace/account"),
    );
    const location = response.headers.get("location");
    const redirect = new URL(location ?? "");

    expect(response.status).toBe(307);
    expect(redirect.origin).toBe("https://diffaudit.example.test");
    expect(redirect.pathname).toBe("/login");
    expect(redirect.searchParams.get("redirectTo")).toBe("/workspace/account");
  });

  it("does not redirect callback errors to Host-derived origins", async () => {
    const route = await import("./github/callback/route");

    const response = await route.GET(hostileRequest("/api/auth/github/callback?error=denied"));
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(response.headers.get("location")).toBeNull();
    expect(payload).toEqual({ message: "Platform public URL is not configured." });
    expect(cookiesMock).not.toHaveBeenCalled();
  });
});
