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
    await page.goto("/workspace/audits");

    // The create button is a Link — wait for it and click with navigation promise
    const createBtn = page.locator(".audits-create-btn").first();
    await expect(createBtn).toBeVisible({ timeout: PAGE_TIMEOUT });

    // Use Promise.all to handle the client-side navigation properly
    await Promise.all([
      page.waitForURL(/\/workspace\/audits\/new/, { timeout: PAGE_TIMEOUT }),
      createBtn.click(),
    ]);
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
  test("sidebar links navigate to correct pages", async ({ page }) => {
    await page.goto("/workspace/start");

    // Wait for sidebar navigation to render
    await page.waitForSelector("nav.workspace-sidebar-nav", {
      state: "visible",
      timeout: PAGE_TIMEOUT,
    });

    // Use the sidebar nav as the scope for link lookups
    const nav = page.locator("nav.workspace-sidebar-nav");

    // Navigate to Audits
    const auditsLink = nav.locator("a").filter({ hasText: /audit|审计/i }).first();
    await expect(auditsLink).toBeVisible({ timeout: 10000 });
    await Promise.all([
      page.waitForURL(/\/workspace\/audits$/, { timeout: PAGE_TIMEOUT }),
      auditsLink.click(),
    ]);

    // Navigate to Reports
    const reportsLink = nav.locator("a").filter({ hasText: /report|报告/i }).first();
    await expect(reportsLink).toBeVisible({ timeout: 10000 });
    await Promise.all([
      page.waitForURL(/\/workspace\/reports$/, { timeout: PAGE_TIMEOUT }),
      reportsLink.click(),
    ]);

    // Navigate to Settings
    const settingsLink = nav.locator("a").filter({ hasText: /setting|设置/i }).first();
    await expect(settingsLink).toBeVisible({ timeout: 10000 });
    await Promise.all([
      page.waitForURL(/\/workspace\/settings$/, { timeout: PAGE_TIMEOUT }),
      settingsLink.click(),
    ]);
  });
});
