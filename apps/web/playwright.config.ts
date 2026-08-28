import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["html", { open: "never" }],
    ["list"],
  ],

  timeout: 30000,
  expect: { timeout: 10000 },

  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: process.env.CI ? "on-first-retry" : "retain-on-failure",
    screenshot: "only-on-failure",
    video: process.env.CI ? "on-first-retry" : "off",
  },

  projects: [
    {
      // Chromium is the e2e baseline; browsers are hard to keep green on
      // every OS when the product does not require a multi-browser matrix.
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: [
    {
      command:
        "cd ../api-go && go run ./cmd/platform-api --host 127.0.0.1 --port 8780 --static-dir ../web/dist",
      url: "http://127.0.0.1:8780/health",
      reuseExistingServer: !process.env.CI,
      timeout: 90000,
    },
    {
      command: "npm run dev",
      url: "http://localhost:3000",
      reuseExistingServer: !process.env.CI,
      timeout: 60000,
    },
  ],
});
