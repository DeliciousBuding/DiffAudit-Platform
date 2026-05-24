import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createUser, verifyCredentials } from "@/lib/auth";
import { resetDbForTests } from "@/lib/db";

const mocks = vi.hoisted(() => ({
  cookieSet: vi.fn(),
  cookies: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: mocks.cookies,
}));

let tempDir = "";

function loginRequest(username: string, password: string) {
  return new Request("http://localhost/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
}

describe("auth login route", () => {
  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "diffaudit-login-route-"));
    process.env.DIFFAUDIT_DB_PATH = path.join(tempDir, "diffaudit.db");
    delete process.env.DIFFAUDIT_SHARED_USERNAME;
    delete process.env.DIFFAUDIT_SHARED_PASSWORD;
    resetDbForTests();
    mocks.cookieSet.mockReset();
    mocks.cookies.mockReset();
    mocks.cookies.mockResolvedValue({
      set: mocks.cookieSet,
    });
  });

  afterEach(() => {
    resetDbForTests();
    delete process.env.DIFFAUDIT_DB_PATH;
    delete process.env.DIFFAUDIT_SHARED_USERNAME;
    delete process.env.DIFFAUDIT_SHARED_PASSWORD;
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("does not let legacy shared login overwrite a colliding normal user password", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await createUser("example-reviewer", null, "PersonalPassword!2026");
    process.env.DIFFAUDIT_SHARED_USERNAME = "example-reviewer";
    process.env.DIFFAUDIT_SHARED_PASSWORD = "SharedPassword!2026";
    const route = await import("./route");

    const response = await route.POST(loginRequest("example-reviewer", "SharedPassword!2026"));
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload).toEqual({ message: "Invalid credentials." });
    expect(mocks.cookieSet).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("Refusing to bootstrap legacy shared user"));
    await expect(
      verifyCredentials("example-reviewer", "PersonalPassword!2026"),
    ).resolves.toMatchObject({ username: "example-reviewer" });
    await expect(
      verifyCredentials("example-reviewer", "SharedPassword!2026"),
    ).resolves.toBeNull();
    warn.mockRestore();
  });
});
