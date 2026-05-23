import { randomBytes } from "node:crypto";

/** Pre-seeded demo credentials for use in manual testing. */
export const DEMO_CREDENTIALS = {
  username: "demo-reviewer",
  password: "demo-password-2024",
} as const;

/** Create a demo session cookie value for bypassing UI login in tests. */
export function createDemoSessionCookie(): {
  name: string;
  value: string;
  domain: string;
  path: string;
} {
  return {
    name: "diffaudit_session",
    value: `demo_${randomBytes(16).toString("hex")}`,
    domain: "localhost",
    path: "/",
  };
}
