import { test, expect } from "@playwright/test";
import { LoginPage } from "./fixtures/pages";
import { DEMO_CREDENTIALS } from "./fixtures/auth";

test.describe("Authentication flows", () => {
  test("login page loads with all elements", async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.expectLoaded();

    await expect(login.usernameInput).toBeVisible();
    await expect(login.passwordInput).toBeVisible();
    await expect(login.submitButton).toBeVisible();

    // OAuth providers
    await expect(page.getByText(/Google/i).first()).toBeVisible();
    await expect(page.getByText(/GitHub/i).first()).toBeVisible();
  });

  test("login with empty fields shows validation", async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.submitButton.click();

    // Should show validation errors
    await expect(page.getByText(/required/i).first()).toBeVisible({ timeout: 5000 });
  });

  test("login with demo credentials navigates to workspace", async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(DEMO_CREDENTIALS.username, DEMO_CREDENTIALS.password);

    // Should redirect to workspace
    await page.waitForURL("**/workspace/**", { timeout: 15000 });
  });

  test("register page loads", async ({ page }) => {
    await page.goto("/register", { waitUntil: "networkidle" });

    await expect(page.getByLabel(/username/i)).toBeVisible();
    await expect(page.getByLabel(/password/i).first()).toBeVisible();
  });

  test("register with short password shows error", async ({ page }) => {
    await page.goto("/register", { waitUntil: "networkidle" });

    await page.getByLabel(/username/i).fill("testuser");
    await page.getByLabel(/password/i).first().fill("12345"); // too short
    await page.getByRole("button", { name: /create/i }).click();

    await expect(page.getByText(/8 characters/i)).toBeVisible({ timeout: 5000 });
  });

  test("unauthenticated access redirects to login", async ({ page }) => {
    await page.goto("/workspace/start", { waitUntil: "networkidle" });
    await page.waitForURL("**/login**", { timeout: 10000 });
  });
});
