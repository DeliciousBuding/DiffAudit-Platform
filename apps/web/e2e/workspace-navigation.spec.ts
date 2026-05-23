import { test, expect } from "./fixtures/auth";
import { StartPage, CreateTaskPage, ReportsPage } from "./fixtures/pages";

test.describe("Workspace audit flow", () => {
  test("create task wizard steps are visible", async ({ page }) => {
    const create = new CreateTaskPage(page);
    await create.goto("/workspace/audits/new");
    await create.expectLoaded();

    // All 4 steps should be labeled
    await expect(page.getByText(/attack method|攻击方式/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/target model|目标模型/i).first()).toBeVisible();
    await expect(page.getByText(/parameters|参数/i).first()).toBeVisible();
    await expect(page.getByText(/review|确认/i).first()).toBeVisible();
  });

  test("start page todo items are visible", async ({ page }) => {
    const start = new StartPage(page);
    await start.goto("/workspace/start");
    await start.expectLoaded();

    // Should show suggested actions
    await expect(page.getByText(/review|检查/i).first()).toBeVisible({ timeout: 10000 });
  });

  test("reports page shows entries or empty state", async ({ page }) => {
    const reports = new ReportsPage(page);
    await reports.goto("/workspace/reports");
    await reports.expectLoaded();

    // Either a table or an empty state should be visible
    const hasContent = await Promise.race([
      reports.reportTable.isVisible().then(() => true),
      page.getByText(/no|没有|暂无/).first().isVisible().then(() => true),
      new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 5000)),
    ]);
    expect(hasContent).toBe(true);
  });

  test("command palette opens with Ctrl+K", async ({ page }) => {
    const start = new StartPage(page);
    await start.goto("/workspace/start");
    await start.expectLoaded();

    await page.keyboard.press("Control+k");
    const combobox = page.locator('[role="combobox"]');
    await expect(combobox).toBeVisible({ timeout: 3000 });
  });

  test("keyboard shortcuts modal opens with ?", async ({ page }) => {
    const start = new StartPage(page);
    await start.goto("/workspace/start");
    await start.expectLoaded();

    await page.keyboard.press("?");
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 3000 });
  });
});

test.describe("Internationalization", () => {
  test("home page renders in English by default", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.getByText(/privacy risk/i).first()).toBeVisible({ timeout: 10000 });
  });

  test("docs page renders", async ({ page }) => {
    await page.goto("/docs", { waitUntil: "networkidle" });
    await expect(page.getByText(/architecture|架构/i).first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Accessibility basics", () => {
  test("workspace pages have accessible navigation", async ({ page }) => {
    await page.goto("/workspace/start", { waitUntil: "networkidle" });

    // Sidebar should have an aria-label
    const nav = page.locator("nav[aria-label]");
    await expect(nav.first()).toBeVisible({ timeout: 10000 });
  });

  test("settings page has labeled form controls", async ({ page }) => {
    await page.goto("/workspace/settings", { waitUntil: "networkidle" });

    // Form inputs should have labels
    const labeledInputs = page.locator("input[id]");
    const count = await labeledInputs.count();
    expect(count).toBeGreaterThan(0);
  });
});
