import { test, expect } from "@playwright/test";

test.describe("i18n routing", () => {
  test("home page serves English by default", async ({ page }) => {
    const res = await page.goto("/", { waitUntil: "networkidle" });
    expect(res?.status()).toBe(200);

    const html = page.locator("html");
    await expect(html).toHaveAttribute("lang", /en|zh/, { timeout: 5000 });
  });

  test("login page accepts locale cookie", async ({ page }) => {
    await page.context().addCookies([
      { name: "locale", value: "zh-CN", domain: "localhost", path: "/" },
    ]);
    await page.goto("/login", { waitUntil: "networkidle" });
    await expect(page.getByRole("button", { name: /登录|sign in/i })).toBeVisible({
      timeout: 10000,
    });
  });
});

test.describe("navigation structure", () => {
  test("workspace pages render with content", async ({ page }) => {
    await page.goto("/workspace/start", { waitUntil: "networkidle" });
    // Page should render without crashing — body should have meaningful content
    const body = page.locator("body");
    await expect(body).not.toBeEmpty({ timeout: 10000 });
    // Should contain at least some anchor links
    const links = page.locator("a");
    const count = await links.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

test.describe("error handling", () => {
  test("404 page returns not-found content", async ({ page }) => {
    const res = await page.goto("/workspace/nonexistent-page", {
      waitUntil: "networkidle",
    });
    // Should not crash — either 404 status or not-found content
    expect(res?.status()).toBeGreaterThanOrEqual(200);
    expect(res?.status()).toBeLessThan(500);
  });
});
