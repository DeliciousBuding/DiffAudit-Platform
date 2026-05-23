import { test as base } from "@playwright/test";
import { randomBytes } from "node:crypto";

/** Pre-seeded demo credentials. These work with the demo auth backend. */
export const DEMO_CREDENTIALS = {
  username: "demo-reviewer",
  password: "demo-password-2024",
} as const;

/** Create a fresh demo session cookie value for bypassing UI login in tests. */
export function createDemoSessionCookie(): { name: string; value: string; domain: string; path: string } {
  return {
    name: "diffaudit_session",
    value: `demo_${randomBytes(16).toString("hex")}`,
    domain: "localhost",
    path: "/",
  };
}

/**
 * Auth fixture that provides pre-authenticated context.
 * Skips the login page by setting a demo session cookie.
 */
export const test = base.extend<{
  authenticatedPage: void;
}>({
  authenticatedPage: [
    async ({ browser }, use) => {
      const context = await browser.newContext();
      await context.addCookies([createDemoSessionCookie()]);
      const page = await context.newPage();
      await use(page);
      await context.close();
    },
    { timeout: 15000 },
  ],
});

export { expect } from "@playwright/test";
