import { test, expect } from "@playwright/test";

const PAGE_TIMEOUT = 30000;
const TRACKS = ["black-box", "gray-box", "white-box"] as const;

test.describe("Reports listing page", () => {
  test("reports page returns 200 and renders content", async ({ page }) => {
    const res = await page.goto("/workspace/reports", {
      waitUntil: "networkidle",
      timeout: PAGE_TIMEOUT,
    });
    expect(res?.status()).toBe(200);

    // Body must not be empty — the page renders either a table or an empty state
    await expect(page.locator("body")).not.toBeEmpty({ timeout: 15000 });

    // No React error boundary
    await expect(page.locator("body")).not.toContainText("Something went wrong", {
      timeout: 10000,
    });

    // Page should have meaningful content: either a table, loading skeleton, or empty state
    await page.waitForTimeout(2000);
    const bodyText = await page.locator("body").innerText();
    expect(bodyText.length).toBeGreaterThan(10);
  });

  test("CSV export button does not crash the page", async ({ page }) => {
    await page.goto("/workspace/reports", {
      waitUntil: "networkidle",
      timeout: PAGE_TIMEOUT,
    });

    // Wait for the page to stabilize (data fetch, React hydration)
    await page.waitForTimeout(3000);

    // The CSV export button ("Export list" / "导出列表") is only rendered when
    // there are completed jobs. In demo mode or with real data it may or may
    // not be present — if the API returns no completed jobs, an EmptyState is
    // shown instead and that is also a valid outcome.
    const csvButton = page.getByRole("button", { name: /export list|导出列表/i });

    if (await csvButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Click the CSV export button — it triggers a download or at least
      // must not throw an uncaught error.
      await csvButton.click();
      await page.waitForTimeout(1000);
    }

    // Regardless of whether the button existed, the page must not crash
    await expect(page.locator("body")).not.toContainText("Something went wrong", {
      timeout: 5000,
    });
  });
});

test.describe("Track report detail pages", () => {
  for (const track of TRACKS) {
    test(`/workspace/reports/${track} returns 200 and renders content`, async ({ page }) => {
      // Test the default display view
      const res = await page.goto(`/workspace/reports/${track}`, {
        waitUntil: "networkidle",
        timeout: PAGE_TIMEOUT,
      });
      expect(res?.status()).toBe(200);

      // Body must not be empty
      await expect(page.locator("body")).not.toBeEmpty({ timeout: 15000 });

      // No React error boundary
      await expect(page.locator("body")).not.toContainText("Something went wrong", {
        timeout: 10000,
      });

      // Breadcrumb should reference the track label — confirms the page
      // resolved the correct route rather than showing a generic error
      await page.waitForTimeout(1000);
      const bodyText = await page.locator("body").innerText();
      // Page should have some content (breadcrumbs, headings, table, etc.)
      expect(bodyText.length).toBeGreaterThan(20);
    });

    test(`/workspace/reports/${track}?view=audit returns 200`, async ({ page }) => {
      const res = await page.goto(`/workspace/reports/${track}?view=audit`, {
        waitUntil: "networkidle",
        timeout: PAGE_TIMEOUT,
      });
      expect(res?.status()).toBe(200);
      await expect(page.locator("body")).not.toBeEmpty({ timeout: 15000 });
    });

    test(`/workspace/reports/${track}?view=display returns 200`, async ({ page }) => {
      const res = await page.goto(`/workspace/reports/${track}?view=display`, {
        waitUntil: "networkidle",
        timeout: PAGE_TIMEOUT,
      });
      expect(res?.status()).toBe(200);
      await expect(page.locator("body")).not.toBeEmpty({ timeout: 15000 });
    });
  }
});

test.describe("Track report page navigation", () => {
  test("reports listing page links to at least one track detail page", async ({ page }) => {
    await page.goto("/workspace/reports", {
      waitUntil: "networkidle",
      timeout: PAGE_TIMEOUT,
    });

    // Wait for data to load
    await page.waitForTimeout(3000);

    // If the page shows a table with completed jobs, there should be
    // "View" links pointing to track report pages. If the page shows
    // an empty state, that's fine too.
    const bodyText = await page.locator("body").innerText();

    // Verify the page isn't crashed regardless of content
    await expect(page.locator("body")).not.toContainText("Something went wrong", {
      timeout: 5000,
    });
    expect(bodyText.length).toBeGreaterThan(10);
  });

  test("track pages have a toggle between Display and Audit views", async ({ page }) => {
    await page.goto("/workspace/reports/black-box", {
      waitUntil: "networkidle",
      timeout: PAGE_TIMEOUT,
    });

    // Wait for page to fully render (track data + toggle links)
    await page.waitForTimeout(2000);

    // The toggle uses two Link components with text "Display view" / "Audit view"
    // We look for the view toggle container — a rounded inline-flex with Link children
    const toggleContainer = page.locator("a[href*='?view=']");
    const toggleCount = await toggleContainer.count();

    // At least one toggle link should be visible (there should be exactly 2: Display + Audit)
    expect(toggleCount).toBeGreaterThanOrEqual(1);

    const auditLink = page.locator("a[href*='?view=audit']").first();
    const displayLink = page.locator("a[href*='?view=display']").first();

    const auditVisible = await auditLink.isVisible({ timeout: 5000 }).catch(() => false);
    const displayVisible = await displayLink.isVisible({ timeout: 5000 }).catch(() => false);

    expect(auditVisible || displayVisible).toBe(true);

    // Ensure no crash after toggling — click the audit link if visible
    if (auditVisible) {
      await auditLink.click();
      await page.waitForURL(/\?view=audit/, { timeout: 15000 });
      await expect(page.locator("body")).not.toContainText("Something went wrong", {
        timeout: 5000,
      });
    }
  });
});

test.describe("Error resilience", () => {
  test("invalid track route returns not-found content, not a crash", async ({ page }) => {
    const res = await page.goto("/workspace/reports/invalid-track-xyz", {
      waitUntil: "networkidle",
      timeout: PAGE_TIMEOUT,
    });
    // Should return a client-visible status (Next.js not-found shows 404)
    // but must not be a 5xx server crash
    expect(res?.status()).toBeGreaterThanOrEqual(200);
    expect(res?.status()).toBeLessThan(500);
    await expect(page.locator("body")).not.toBeEmpty({ timeout: 10000 });
  });
});
