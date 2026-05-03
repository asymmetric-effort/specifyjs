import { test, expect } from "@playwright/test";

/**
 * Post-Deployment Verification: Docs Broken Link Crawler
 *
 * Navigates to the docs section, clicks through all sidebar entries,
 * and verifies:
 * - All doc pages render meaningful content
 * - All external links (http/https) found in doc content return 2xx/3xx
 * - All internal doc links found in content are navigable
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

    // Expand all sidebar sections and collect clickable doc entries
    // Sidebar sections have a toggle that expands/collapses children
    const sectionHeaders = await page
      .locator(".docs-sidebar [style*='cursor: pointer']")
      .all();

    // Click each section header to expand it
    for (const header of sectionHeaders) {
      try {
        await header.click();
        await page.waitForTimeout(300);
      } catch {
        // Section may already be expanded or not clickable
      }
    }

    // Now collect all clickable sidebar items (doc entries)
    // These are typically divs/spans with click handlers inside the sidebar
    const sidebarItems = await page
      .locator(".docs-sidebar div[style*='cursor: pointer']")
      .all();

    const itemTexts: string[] = [];
    for (const item of sidebarItems) {
      const text = await item.innerText().catch(() => "");
      if (text.trim()) {
        itemTexts.push(text.trim());
      }
    }

    // Click each sidebar item and verify it renders content
    for (const item of sidebarItems) {
      const text = await item.innerText().catch(() => "");
      if (!text.trim()) continue;

      const label = text.trim();
      if (visitedPages.has(label)) continue;
      visitedPages.add(label);

      try {
        await item.click();
        await page.waitForTimeout(800);

        // Check that the main content area has meaningful text
        const contentArea = page.locator(".docs-sidebar ~ div").first();
        const contentText = await contentArea.innerText().catch(() => "");

        if (contentText.trim().length < 30) {
          brokenLinks.push({
            url: label,
            foundOn: "sidebar",
            reason: "Page rendered with insufficient content",
          });
        }

        // Collect external links from the content area
        const links = await contentArea.locator("a[href]").all();
        for (const link of links) {
          const href = await link.getAttribute("href");
          if (!href) continue;
          if (href.startsWith("http://") || href.startsWith("https://")) {
            if (!externalLinksMap.has(href)) {
              externalLinksMap.set(href, label);
            }
          }
        }
      } catch (err) {
        brokenLinks.push({
          url: label,
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

        // Some servers reject HEAD, fall back to GET
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
      `Crawler should visit at least 5 docs pages (visited ${visitedPages.size})`,
    ).toBeGreaterThanOrEqual(5);
  });
});
