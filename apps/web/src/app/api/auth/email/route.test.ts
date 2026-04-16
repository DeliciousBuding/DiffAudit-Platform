import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createSession, createUser, SESSION_COOKIE_NAME } from "@/lib/auth";
import { getDb, resetDbForTests, schema } from "@/lib/db";

let tempDir = "";
let sessionToken = "";

const cookiesMock = vi.fn(async () => ({
  get: (name: string) => (name === SESSION_COOKIE_NAME && sessionToken ? { value: sessionToken } : undefined),
}));

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

describe("email settings route", () => {
  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "diffaudit-email-route-"));
    process.env.DIFFAUDIT_DB_PATH = path.join(tempDir, "diffaudit.db");
    sessionToken = "";
    resetDbForTests();
  });

  afterEach(() => {
    resetDbForTests();
    delete process.env.DIFFAUDIT_DB_PATH;
    vi.resetModules();
  });

  it("stores a pending email for the current user", async () => {
    const user = await createUser("delicious233", null, "DiffAuditTemp!2026");
    sessionToken = createSession(user.id);

    const route = await import("./route");
    const response = await route.POST(new Request("http://localhost/api/auth/email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "verify@diffaudit.test" }),
    }));
    const payload = await response.json() as { pendingEmail?: string };

    expect(response.status).toBe(200);
    expect(payload.pendingEmail).toBe("verify@diffaudit.test");
  });

  it("rejects emails that are already claimed by another verified account", async () => {
    const existing = await createUser("claimed", null, "DiffAuditTemp!2026");
    const local = await createUser("delicious233", null, "DiffAuditTemp!2026");
    const db = getDb();
    db.update(schema.users)
      .set({
        email: "claimed@diffaudit.test",
        pendingEmail: null,
        emailVerified: true,
      })
      .where(eq(schema.users.id, existing.id))
      .run();
    sessionToken = createSession(local.id);

    const route = await import("./route");
    const response = await route.POST(new Request("http://localhost/api/auth/email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "claimed@diffaudit.test" }),
    }));
    const payload = await response.json() as { message?: string };

    expect(response.status).toBe(409);
    expect(payload.message).toContain("already in use");
  });
});
