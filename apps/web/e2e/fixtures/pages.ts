import type { Page, Locator } from "@playwright/test";

/** Base workspace page with shared selectors across all pages. */
export class WorkspaceShell {
  readonly sidebar: Locator;
  readonly searchInput: Locator;
  readonly topbarTitle: Locator;
  readonly statusDrawer: Locator;

  constructor(readonly page: Page) {
    this.sidebar = page.locator("nav[aria-label]");
    this.searchInput = page.locator('[role="combobox"][aria-label*="Search"]');
    this.topbarTitle = page.locator("header h1");
    this.statusDrawer = page.locator('[role="dialog"]');
  }

  async goto(path: string) {
    await this.page.goto(path, { waitUntil: "networkidle" });
  }

  async openSearch() {
    await this.page.keyboard.press("Control+k");
    return this.page.locator('[role="combobox"]');
  }

  async navigateTo(label: string) {
    await this.sidebar.getByRole("link", { name: label }).click();
    await this.page.waitForLoadState("networkidle");
  }
}

/** Start / Dashboard page (workspace/start). */
export class StartPage extends WorkspaceShell {
  readonly kpiCards: Locator;
  readonly riskChart: Locator;
  readonly recentResults: Locator;
  readonly suggestedActions: Locator;

  constructor(page: Page) {
    super(page);
    this.kpiCards = page.locator(".workspace-section-card >> h2");
    this.riskChart = page.locator("svg");
    this.recentResults = page.getByText("Recent results");
    this.suggestedActions = page.getByText("Suggested actions");
  }

  async expectLoaded() {
    await this.page.waitForURL("**/workspace/start");
    await this.page.waitForLoadState("networkidle");
  }
}

/** Audit Tasks page (workspace/audits). */
export class AuditsPage extends WorkspaceShell {
  readonly createTaskButton: Locator;
  readonly taskTable: Locator;
  readonly statusFilter: Locator;
  readonly trackFilter: Locator;

  constructor(page: Page) {
    super(page);
    this.createTaskButton = page.getByRole("link", { name: /Create/ });
    this.taskTable = page.locator("table");
    this.statusFilter = page.getByLabel(/status/i);
    this.trackFilter = page.getByLabel(/track/i);
  }

  async expectLoaded() {
    await this.page.waitForURL("**/workspace/audits");
  }
}

/** Create Task page (workspace/audits/new). */
export class CreateTaskPage extends WorkspaceShell {
  readonly step1: Locator;
  readonly step2: Locator;
  readonly step3: Locator;
  readonly step4: Locator;

  constructor(page: Page) {
    super(page);
    this.step1 = page.getByText(/attack method/i);
    this.step2 = page.getByText(/target model/i);
    this.step3 = page.getByText(/parameters/i);
    this.step4 = page.getByText(/review/i);
  }

  async selectAttackType(type: "black-box" | "gray-box" | "white-box") {
    await this.page.getByRole("button", { name: new RegExp(type, "i") }).click();
  }

  async expectLoaded() {
    await this.page.waitForURL("**/workspace/audits/new");
  }
}

/** Model Assets page (workspace/model-assets). */
export class ModelAssetsPage extends WorkspaceShell {
  readonly modelList: Locator;

  constructor(page: Page) {
    super(page);
    this.modelList = page.locator("table");
  }

  async expectLoaded() {
    await this.page.waitForURL("**/workspace/model-assets");
  }
}

/** Risk Findings page (workspace/risk-findings). */
export class RiskFindingsPage extends WorkspaceShell {
  readonly findingsTable: Locator;
  readonly prioritySort: Locator;

  constructor(page: Page) {
    super(page);
    this.findingsTable = page.locator("table");
    this.prioritySort = page.getByText(/priority/i);
  }

  async expectLoaded() {
    await this.page.waitForURL("**/workspace/risk-findings");
  }
}

/** Reports page (workspace/reports). */
export class ReportsPage extends WorkspaceShell {
  readonly reportTable: Locator;
  readonly exportButton: Locator;

  constructor(page: Page) {
    super(page);
    this.reportTable = page.locator("table");
    this.exportButton = page.getByRole("button", { name: /export/i });
  }

  async expectLoaded() {
    await this.page.waitForURL("**/workspace/reports");
  }
}

/** API Keys page (workspace/api-keys). */
export class ApiKeysPage extends WorkspaceShell {
  readonly createKeyButton: Locator;
  readonly keysTable: Locator;

  constructor(page: Page) {
    super(page);
    this.createKeyButton = page.getByRole("button", { name: /create/i });
    this.keysTable = page.locator("table");
  }

  async expectLoaded() {
    await this.page.waitForURL("**/workspace/api-keys");
  }
}

/** Settings page (workspace/settings). */
export class SettingsPage extends WorkspaceShell {
  readonly themeToggle: Locator;
  readonly languagePicker: Locator;

  constructor(page: Page) {
    super(page);
    this.themeToggle = page.getByRole("group", { name: /theme/i });
    this.languagePicker = page.getByRole("button", { name: /language/i });
  }

  async expectLoaded() {
    await this.page.waitForURL("**/workspace/settings");
  }
}

/** Account page (workspace/account). */
export class AccountPage extends WorkspaceShell {
  readonly profileSection: Locator;
  readonly signOutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.profileSection = page.getByText(/account/i).first();
    this.signOutButton = page.getByRole("button", { name: /sign out/i });
  }

  async expectLoaded() {
    await this.page.waitForURL("**/workspace/account");
  }
}

/** Login page. */
export class LoginPage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly registerLink: Locator;

  constructor(readonly page: Page) {
    this.usernameInput = page.getByLabel(/username/i);
    this.passwordInput = page.getByLabel(/password/i);
    this.submitButton = page.getByRole("button", { name: /sign in/i });
    this.errorMessage = page.locator('[role="alert"]');
    this.registerLink = page.getByRole("link", { name: /create/i });
  }

  async goto() {
    await this.page.goto("/login", { waitUntil: "networkidle" });
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectLoaded() {
    await this.page.waitForURL("**/login");
  }
}
