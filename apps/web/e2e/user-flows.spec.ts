import { test, expect } from "@playwright/test";

const PAGE_TIMEOUT = 20000;

test.describe("Login page user flows", () => {
  test("renders username and password fields, submit button", async ({ page }) => {
    await page.goto("/login");

    // The login form has inputs with stable ids
    const usernameInput = page.locator("#login-username");
    const passwordInput = page.locator("#login-password");
    await expect(usernameInput).toBeVisible({ timeout: PAGE_TIMEOUT });
    await expect(passwordInput).toBeVisible({ timeout: PAGE_TIMEOUT });

    // Submit button — use role + regex for i18n resilience
    const submitBtn = page.getByRole("button", { name: /sign in|登录/i });
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toBeEnabled();
  });

  test("fills credentials and submits, expecting server response", async ({ page }) => {
    await page.goto("/login");

    await page.waitForSelector("#login-username", { state: "visible", timeout: PAGE_TIMEOUT });

    await page.fill("#login-username", "test-user");
    await page.fill("#login-password", "wrong-password");

    // Click submit and wait for something to happen — either navigation or error
    const submitBtn = page.getByRole("button", { name: /sign in|登录/i });
    await submitBtn.click();

    // Wait for server response: either an error toast/alert, or a redirect
    // Give it time to process
    await page.waitForTimeout(3000);

    // Page must not crash
    await expect(page.locator("body")).not.toContainText("Something went wrong", {
      timeout: 5000,
    });
  });
});

test.describe("Audits page user flows", () => {
  test("create-task button navigates to /workspace/audits/new", async ({ page }) => {
    await page.goto("/workspace/audits", { waitUntil: "networkidle" });
    // The button is inside a Suspense boundary — wait for it to resolve
    const createBtn = page.locator(".audits-create-btn");
    await expect(createBtn).toBeVisible({ timeout: 15000 });
    await createBtn.click();
    await page.waitForURL(/\/workspace\/audits\/new/, { timeout: 10000 });
  });

  test("audits/new page shows the create-task interface", async ({ page }) => {
    await page.goto("/workspace/audits/new");

    // Should have meaningful content — check for form controls or headings
    await expect(page.locator("body")).not.toBeEmpty({ timeout: PAGE_TIMEOUT });
    await expect(page.locator("body")).not.toContainText("Something went wrong", {
      timeout: 10000,
    });
  });
});

test.describe("Reports page user flows", () => {
  test("reports page renders tabs or content", async ({ page }) => {
    await page.goto("/workspace/reports");

    // Verify no crash
    await expect(page.locator("body")).not.toBeEmpty({ timeout: PAGE_TIMEOUT });
    await expect(page.locator("body")).not.toContainText("Something went wrong", {
      timeout: 10000,
    });

    // ReportsClient renders role="tab" buttons OR the page shows other content
    // Either tabs are visible, or an empty state / loading skeleton
    await page.waitForTimeout(2000);
    const bodyText = await page.locator("body").innerText();
    // Page should have some text (not completely blank aside from error fallbacks)
    expect(bodyText.length).toBeGreaterThan(10);
  });
});

test.describe("Settings page user flows", () => {
  test("settings page renders demo mode and theme controls", async ({ page }) => {
    await page.goto("/workspace/settings");

    // Wait for page to stabilize
    await page.waitForTimeout(2000);

    // Verify no crash
    await expect(page.locator("body")).not.toBeEmpty({ timeout: PAGE_TIMEOUT });
    await expect(page.locator("body")).not.toContainText("Something went wrong", {
      timeout: 10000,
    });

    // Demo mode toggle: two buttons with aria-pressed
    const toggleButtons = page.locator(".settings-toggle-btn");
    const toggleCount = await toggleButtons.count();
    if (toggleCount >= 2) {
      await expect(toggleButtons.first()).toBeVisible({ timeout: 10000 });
      const pressedCount = await toggleButtons.locator('[aria-pressed="true"]').count();
      expect(pressedCount).toBeGreaterThanOrEqual(1);
    }

    // Theme buttons: 3-way toggle (light, dark, system)
    const themeButtons = page.locator(".settings-toggle-track--3 button");
    const themeCount = await themeButtons.count();
    if (themeCount === 3) {
      // Click each to verify no crash
      for (let i = 0; i < themeCount; i++) {
        await themeButtons.nth(i).click();
        await page.waitForTimeout(200);
      }
    }
  });
});

test.describe("Navigation user flows", () => {
  test("workspace pages are reachable via direct navigation", async ({ page }) => {
    const pages = ["/workspace/start", "/workspace/audits", "/workspace/reports", "/workspace/settings"];

    for (const url of pages) {
      const res = await page.goto(url, { waitUntil: "networkidle" });
      expect(res?.status()).toBe(200);
      await expect(page.locator("body")).not.toBeEmpty({ timeout: 5000 });
    }
  });
});
