import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();
try {
  await page.goto("http://localhost:3000/workspace/audits", {
    waitUntil: "networkidle",
    timeout: 30000,
  });
  await page.waitForTimeout(2000);

  const bodyPreview = await page.evaluate(() => document.body.innerText.slice(0, 500));
  console.log("Audits page body:", bodyPreview);

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
} finally {
  await browser.close();
}
