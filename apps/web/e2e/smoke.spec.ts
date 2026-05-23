import { test, expect } from "./fixtures/auth";
import {
  StartPage,
  AuditsPage,
  ModelAssetsPage,
  RiskFindingsPage,
  ReportsPage,
  ApiKeysPage,
  SettingsPage,
  AccountPage,
} from "./fixtures/pages";

test.describe("Workspace smoke tests", () => {
  test("start page loads with KPIs and charts", async ({ page }) => {
    const start = new StartPage(page);
    await start.goto("/workspace/start");
    await start.expectLoaded();

    // KPIs should be visible
    await expect(page.getByText(/Auditable models/i).first()).toBeVisible({ timeout: 10000 });

    // Charts should render
    const charts = page.locator("svg");
    await expect(charts.first()).toBeVisible({ timeout: 5000 });
  });

  test("audits page loads with task list", async ({ page }) => {
    const audits = new AuditsPage(page);
    await audits.goto("/workspace/audits");
    await audits.expectLoaded();

    // Should show create task button
    await expect(audits.createTaskButton).toBeVisible({ timeout: 10000 });
  });

  test("model assets page loads", async ({ page }) => {
    const models = new ModelAssetsPage(page);
    await models.goto("/workspace/model-assets");
    await models.expectLoaded();
  });

  test("risk findings page loads", async ({ page }) => {
    const findings = new RiskFindingsPage(page);
    await findings.goto("/workspace/risk-findings");
    await findings.expectLoaded();
  });

  test("reports page loads", async ({ page }) => {
    const reports = new ReportsPage(page);
    await reports.goto("/workspace/reports");
    await reports.expectLoaded();
  });

  test("api keys page loads", async ({ page }) => {
    const apiKeys = new ApiKeysPage(page);
    await apiKeys.goto("/workspace/api-keys");
    await apiKeys.expectLoaded();

    await expect(apiKeys.createKeyButton).toBeVisible({ timeout: 10000 });
  });

  test("settings page loads", async ({ page }) => {
    const settings = new SettingsPage(page);
    await settings.goto("/workspace/settings");
    await settings.expectLoaded();
  });

  test("account page loads", async ({ page }) => {
    const account = new AccountPage(page);
    await account.goto("/workspace/account");
    await account.expectLoaded();
  });

  test("sidebar navigation works", async ({ page }) => {
    const start = new StartPage(page);
    await start.goto("/workspace/start");
    await start.expectLoaded();

    // Navigate to each section via sidebar
    const navItems = [
      { label: /Overview|总览/, url: /start/ },
      { label: /Audits|审计任务/, url: /audits/ },
      { label: /Models|模型/, url: /model-assets/ },
      { label: /Risks|风险/, url: /risk-findings/ },
      { label: /Reports|报告/, url: /reports/ },
      { label: /Settings|设置/, url: /settings/ },
    ];

    for (const item of navItems) {
      await start.navigateTo(item.label);
      await expect(page).toHaveURL(item.url);
    }
  });
});
