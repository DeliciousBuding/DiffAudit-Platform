import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();
try {
  await page.goto("http://localhost:3000/workspace/reports/black-box", {
    waitUntil: "networkidle",
    timeout: 30000,
  });
  await page.waitForTimeout(2000);

  // Check toggle links
  const toggleLinks = await page.evaluate(() => {
    const anchors = document.querySelectorAll('a[href*="view="]');
    return Array.from(anchors).map((a) => ({
      href: a.getAttribute("href"),
      text: a.textContent?.trim().slice(0, 80),
    }));
  });
  console.log("Toggle links:", JSON.stringify(toggleLinks, null, 2));

  // Check all links
  const allLinks = await page.evaluate(() => {
    const anchors = document.querySelectorAll("a");
    return Array.from(anchors)
      .slice(0, 40)
      .map((a) => ({
        href: a.getAttribute("href")?.slice(0, 100),
        text: a.textContent?.trim().slice(0, 80),
        cls: a.className?.slice(0, 60),
      }));
  });
  console.log("All links:", JSON.stringify(allLinks, null, 2));

  // Check body text snippet
  const bodyPreview = await page.evaluate(() => document.body.innerText.slice(0, 500));
  console.log("Body preview:", bodyPreview);
} finally {
  await browser.close();
}
