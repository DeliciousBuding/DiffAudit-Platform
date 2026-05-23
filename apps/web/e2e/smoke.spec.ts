import { test, expect } from "@playwright/test";

test.describe("Public pages render without error", () => {
  test("home page loads", async ({ page }) => {
    const res = await page.goto("/", { waitUntil: "networkidle" });
    expect(res?.status()).toBe(200);
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("docs page loads", async ({ page }) => {
    const res = await page.goto("/docs", { waitUntil: "networkidle" });
    expect(res?.status()).toBe(200);
  });

  test("login page loads", async ({ page }) => {
    await page.goto("/login", { waitUntil: "networkidle" });
    await expect(page.getByLabel(/username|账号/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("button", { name: /sign in|登录/i })).toBeVisible();
  });

  test("register page loads", async ({ page }) => {
    await page.goto("/register", { waitUntil: "networkidle" });
    await expect(page.getByLabel(/username|账号/i)).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Workspace pages render", () => {
  test("start page loads", async ({ page }) => {
    const res = await page.goto("/workspace/start", { waitUntil: "networkidle" });
    expect(res?.status()).toBe(200);
  });

  test("audits page loads", async ({ page }) => {
    const res = await page.goto("/workspace/audits", { waitUntil: "networkidle" });
    expect(res?.status()).toBe(200);
  });

  test("audits/new page loads", async ({ page }) => {
    const res = await page.goto("/workspace/audits/new", { waitUntil: "networkidle" });
    expect(res?.status()).toBe(200);
  });

  test("model-assets page loads", async ({ page }) => {
    const res = await page.goto("/workspace/model-assets", { waitUntil: "networkidle" });
    expect(res?.status()).toBe(200);
  });

  test("risk-findings page loads", async ({ page }) => {
    const res = await page.goto("/workspace/risk-findings", { waitUntil: "networkidle" });
    expect(res?.status()).toBe(200);
  });

  test("reports page loads", async ({ page }) => {
    const res = await page.goto("/workspace/reports", { waitUntil: "networkidle" });
    expect(res?.status()).toBe(200);
  });

  test("api-keys page loads", async ({ page }) => {
    const res = await page.goto("/workspace/api-keys", { waitUntil: "networkidle" });
    expect(res?.status()).toBe(200);
  });

  test("settings page loads", async ({ page }) => {
    const res = await page.goto("/workspace/settings", { waitUntil: "networkidle" });
    expect(res?.status()).toBe(200);
  });

  test("account page loads", async ({ page }) => {
    const res = await page.goto("/workspace/account", { waitUntil: "networkidle" });
    expect(res?.status()).toBe(200);
  });
});

test.describe("No client-side crash on interaction", () => {
  test("start page renders interactive elements", async ({ page }) => {
    await page.goto("/workspace/start", { waitUntil: "networkidle" });
    // Wait for React hydration — page should not show error boundary
    await page.waitForTimeout(1000);
    await expect(page.locator("body")).not.toContainText("Something went wrong", { timeout: 5000 });
  });

  test("settings page renders interactive elements", async ({ page }) => {
    await page.goto("/workspace/settings", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await expect(page.locator("body")).not.toContainText("Something went wrong", { timeout: 5000 });
  });
});

test.describe("Job detail page", () => {
  test("job detail page renders for demo job ID without crashing", async ({ page }) => {
    const res = await page.goto("/workspace/audits/job_demo_001", {
      waitUntil: "networkidle",
      timeout: 30000,
    });
    // Must return a valid HTTP status (not 500)
    expect(res?.status()).toBeLessThan(500);

    // Wait for the client-side fetch to settle (loading skeleton → content or error state)
    await page.waitForTimeout(4000);

    // Verify no React error boundary crash
    await expect(page.locator("body")).not.toContainText("Something went wrong", {
      timeout: 10000,
    });

    // Body must not be empty
    await expect(page.locator("body")).not.toBeEmpty({ timeout: 10000 });

    // Even if the demo job doesn't exist in the backend, the page should
    // show a graceful error state — not a white screen or crash
    const bodyText = await page.locator("body").innerText();
    expect(bodyText.length).toBeGreaterThan(10);
  });
});
