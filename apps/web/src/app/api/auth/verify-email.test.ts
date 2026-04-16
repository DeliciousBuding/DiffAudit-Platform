import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createSession, createUser, getCurrentUserProfile, SESSION_COOKIE_NAME } from "@/lib/auth";
import { getDb, resetDbForTests, schema } from "@/lib/db";

let tempDir = "";
let sessionToken = "";

async function removeTempDirWithRetry(dir: string) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
      return;
    } catch (error) {
      if (
        !(error instanceof Error)
        || !("code" in error)
        || (error as NodeJS.ErrnoException).code !== "EPERM"
        || attempt === 4
      ) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 25 * (attempt + 1)));
    }
  }
}

const cookiesMock = vi.fn(async () => ({
  get: (name: string) => (name === SESSION_COOKIE_NAME && sessionToken ? { value: sessionToken } : undefined),
}));

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

describe("email verification routes", () => {
  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "diffaudit-email-verify-"));
    process.env.DIFFAUDIT_DB_PATH = path.join(tempDir, "diffaudit.db");
    process.env.DIFFAUDIT_PLATFORM_URL = "https://diffaudit.vectorcontrol.tech";
    sessionToken = "";
    resetDbForTests();
  });

  afterEach(async () => {
    resetDbForTests();
    vi.resetModules();
    delete process.env.DIFFAUDIT_DB_PATH;
    delete process.env.DIFFAUDIT_PLATFORM_URL;
    try {
      await removeTempDirWithRetry(tempDir);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EPERM") {
        throw error;
      }
    }
  });

  it("creates a verification link for the current user's pending email", async () => {
    const user = await createUser("delicious233", null, "DiffAuditTemp!2026");
    const db = getDb();
    db.update(schema.users)
      .set({ pendingEmail: "verify@diffaudit.test" })
      .where(eq(schema.users.id, user.id))
      .run();
    sessionToken = createSession(user.id);

    const route = await import("./email-verification/route");
    const response = await route.POST();
    const payload = await response.json() as { email?: string; verificationUrl?: string };

    expect(response.status).toBe(200);
    expect(payload.email).toBe("verify@diffaudit.test");
    expect(payload.verificationUrl).toContain("/api/auth/verify-email?token=");
  });

  it("promotes the pending email after the verification link is visited", async () => {
    const user = await createUser("delicious233", null, "DiffAuditTemp!2026");
    const db = getDb();
    db.update(schema.users)
      .set({ pendingEmail: "verify@diffaudit.test" })
      .where(eq(schema.users.id, user.id))
      .run();
    sessionToken = createSession(user.id);

    const requestRoute = await import("./email-verification/route");
    const requestResponse = await requestRoute.POST();
    const requestPayload = await requestResponse.json() as { verificationUrl: string };
    const verificationUrl = new URL(requestPayload.verificationUrl);

    const verifyRoute = await import("./verify-email/route");
    const verifyResponse = await verifyRoute.GET(new Request(verificationUrl.toString()));

    expect(verifyResponse.status).toBe(307);
    expect(verifyResponse.headers.get("location")).toContain("/workspace/settings?emailVerified=1");

    expect(getCurrentUserProfile(sessionToken)).toMatchObject({
      email: "verify@diffaudit.test",
      pendingEmail: null,
      emailVerified: true,
    });
  });
});
