import { test, expect } from "@playwright/test";

/**
 * Post-Deployment Verification: Docs Broken Link Crawler
 *
 * Navigates to the docs section, clicks through all sidebar entries,
 * and verifies:
 * - All doc pages render meaningful content
 * - All external links (http/https) found in doc content return 2xx/3xx
 */

interface BrokenLink {
  url: string;
  foundOn: string;
  reason: string;
}

test.describe("Docs Broken Link Crawler", () => {
  test("all links in the docs section are valid", async ({ page, request }) => {
    test.setTimeout(180_000);

    const baseURL =
      process.env.SITE_URL || "https://specifyjs.asymmetric-effort.com";

    const brokenLinks: BrokenLink[] = [];
    const visitedPages = new Set<string>();
    const externalLinksMap = new Map<string, string>();

    // Navigate to docs
    await page.goto(`${baseURL}/#/docs`, {
      waitUntil: "domcontentloaded",
      timeout: 15_000,
    });
    await page.waitForTimeout(2000);

    // The sidebar has section header <button> elements (uppercase, with ▶ arrow)
    // and doc entry <button> elements (indented, within expanded sections).
    // We need to expand each section first, then click each doc entry.

    // Get all section header buttons in the sidebar nav
    const sidebarNav = page.locator("nav.docs-sidebar");

    // Expand all sections by clicking each section header button
    // Section headers are direct child div > button with uppercase text
    const sectionButtons = await sidebarNav
      .locator(":scope > div > button")
      .all();

    for (const btn of sectionButtons) {
      try {
        await btn.click();
        await page.waitForTimeout(200);
      } catch {
        // May already be expanded
      }
    }

    await page.waitForTimeout(500);

    // Now collect all doc entry buttons (the ones inside expanded sections)
    // These are nested deeper: nav > div > div > button (after the section header)
    const docButtons = await sidebarNav
      .locator(":scope > div > div > button")
      .all();

    // Click each doc entry and verify content
    for (const btn of docButtons) {
      const label = await btn.innerText().catch(() => "");
      if (!label.trim()) continue;

      const trimmedLabel = label.trim();
      if (visitedPages.has(trimmedLabel)) continue;
      visitedPages.add(trimmedLabel);

      try {
        // Scroll the button into view and click it
        await btn.scrollIntoViewIfNeeded();
        await btn.click();
        await page.waitForTimeout(800);

        // Check that the content area (sibling of sidebar nav) has text
        // The content is in a div adjacent to the nav.docs-sidebar
        const bodyText = await page.locator("body").innerText();
        // The body should have substantial content when a doc is displayed
        if (bodyText.trim().length < 100) {
          brokenLinks.push({
            url: trimmedLabel,
            foundOn: "sidebar",
            reason: "Page rendered with insufficient content",
          });
        }

        // Collect external links from the page
        const links = await page.locator("a[href^='http']").all();
        for (const link of links) {
          const href = await link.getAttribute("href");
          if (href && !externalLinksMap.has(href)) {
            externalLinksMap.set(href, trimmedLabel);
          }
        }
      } catch (err) {
        brokenLinks.push({
          url: trimmedLabel,
          foundOn: "sidebar",
          reason: `Navigation failed: ${err instanceof Error ? err.message : String(err)}`,
        });
      }
    }

    // Verify external links with HTTP HEAD requests (fall back to GET)
    for (const [url, foundOn] of externalLinksMap) {
      try {
        const parsedURL = new URL(url);
        if (
          parsedURL.hostname === "localhost" ||
          parsedURL.hostname === "127.0.0.1"
        ) {
          continue;
        }

        let resp = await request.head(url, {
          timeout: 10_000,
          ignoreHTTPSErrors: true,
        });

        if (resp.status() === 405 || resp.status() === 403) {
          resp = await request.get(url, {
            timeout: 10_000,
            ignoreHTTPSErrors: true,
          });
        }

        if (resp.status() >= 400) {
          brokenLinks.push({
            url,
            foundOn,
            reason: `HTTP ${resp.status()}`,
          });
        }
      } catch (err) {
        brokenLinks.push({
          url,
          foundOn,
          reason: `Request failed: ${err instanceof Error ? err.message : String(err)}`,
        });
      }
    }

    // Report results
    if (brokenLinks.length > 0) {
      const report = brokenLinks
        .map(
          (b) =>
            `  - ${b.url}\n    Found on: ${b.foundOn}\n    Reason: ${b.reason}`,
        )
        .join("\n");
      expect(
        brokenLinks,
        `Found ${brokenLinks.length} broken link(s):\n${report}`,
      ).toHaveLength(0);
    }

    // Sanity check: we should have visited multiple docs pages
    expect(
      visitedPages.size,
      `Crawler should visit at least 5 docs pages (visited ${visitedPages.size}: ${[...visitedPages].join(", ")})`,
    ).toBeGreaterThanOrEqual(5);
  });
});
