import { chromium } from "playwright";

async function check(url, label) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    await page.context().clearCookies();
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(4000);
    const text = await page.evaluate(() => document.body.innerText.slice(0, 300));
    const crashed = text.includes("Maximum update depth") ||
      text.includes("页面发生错误") ||
      text.includes("An unexpected error occurred");
    console.log(`${crashed ? "CRASH" : "OK"} | ${label}`);
    if (crashed) console.log("  ", text.split("\n")[0], "...");
  } finally {
    await browser.close();
  }
}

// Test a broad set of workspace pages
await check("http://localhost:3000/workspace/start", "Start");
await check("http://localhost:3000/workspace/audits", "Audits");
await check("http://localhost:3000/workspace/reports", "Reports");
await check("http://localhost:3000/workspace/reports/black-box", "Reports/BB");
await check("http://localhost:3000/workspace/settings", "Settings");
await check("http://localhost:3000/workspace/account", "Account");
await check("http://localhost:3000/workspace/audits/new", "Audits/New");
await check("http://localhost:3000/workspace/model-assets", "Model Assets");
await check("http://localhost:3000/workspace/risk-findings", "Risk Findings");
await check("http://localhost:3000/workspace/api-keys", "API Keys");
await check("http://localhost:3000/", "Home");
