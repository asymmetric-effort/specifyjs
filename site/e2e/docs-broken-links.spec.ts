import { test, expect } from "@playwright/test";

/**
 * Post-Deployment Verification: Docs Broken Link Crawler
 *
 * Crawls the entire /#/docs section of the SPA and verifies:
 * - All internal hash links render valid content (not empty/404)
 * - All external links return 2xx or 3xx HTTP status codes
 */

interface BrokenLink {
  url: string;
  foundOn: string;
  reason: string;
}

interface LinkInfo {
  href: string;
  foundOn: string;
}

test.describe("Docs Broken Link Crawler", () => {
  test("all links in the docs section are valid", async ({ page, request }) => {
    // Increase timeout for crawling — this test visits many pages
    test.setTimeout(120_000);

    const baseURL =
      process.env.SITE_URL || "https://specifyjs.asymmetric-effort.com";

    const visited = new Set<string>();
    const internalQueue: string[] = ["/#/docs"];
    const externalLinks: LinkInfo[] = [];
    const brokenLinks: BrokenLink[] = [];

    // Crawl all internal /#/docs pages
    while (internalQueue.length > 0) {
      const path = internalQueue.shift()!;

      // Normalise: strip trailing slash, treat '' same as '/'
      const normPath = path.replace(/\/$/, "") || "/";
      if (visited.has(normPath)) continue;
      visited.add(normPath);

      // Navigate to the page
      const fullURL = `${baseURL}${path}`;
      const response = await page.goto(fullURL, {
        waitUntil: "domcontentloaded",
        timeout: 15_000,
      });

      if (!response || response.status() >= 400) {
        brokenLinks.push({
          url: path,
          foundOn: "crawler",
          reason: `HTTP ${response?.status() ?? "no response"}`,
        });
        continue;
      }

      // Wait for SPA content to render
      await page.waitForTimeout(1000);

      // Verify the page rendered meaningful content (not blank/404)
      const bodyText = await page.locator("body").innerText();
      if (bodyText.trim().length < 50) {
        brokenLinks.push({
          url: path,
          foundOn: "crawler",
          reason:
            "Page rendered with insufficient content (possibly empty or 404)",
        });
      }

      // Collect all links on this page
      const links = await page.locator("a[href]").all();
      for (const link of links) {
        const href = await link.getAttribute("href");
        if (!href) continue;

        // Skip anchors that are just "#" or empty
        if (href === "#" || href === "") continue;

        // Skip mailto: and javascript: links
        if (href.startsWith("mailto:") || href.startsWith("javascript:"))
          continue;

        if (href.startsWith("#/docs")) {
          // Internal docs hash link — add to crawl queue
          const normHref = href.replace(/\/$/, "") || "/";
          if (!visited.has(normHref)) {
            internalQueue.push(href);
          }
        } else if (href.startsWith("#/")) {
          // Internal non-docs hash link — verify it navigates without error
          const normHref = href.replace(/\/$/, "") || "/";
          if (!visited.has(normHref)) {
            internalQueue.push(href);
          }
        } else if (href.startsWith("http://") || href.startsWith("https://")) {
          // External link — collect for later verification
          externalLinks.push({ href, foundOn: normPath });
        }
        // Relative links without hash are anchors within the page — skip
      }
    }

    // Deduplicate external links
    const uniqueExternal = new Map<string, string>();
    for (const { href, foundOn } of externalLinks) {
      if (!uniqueExternal.has(href)) {
        uniqueExternal.set(href, foundOn);
      }
    }

    // Verify external links with HTTP HEAD requests (fall back to GET)
    for (const [url, foundOn] of uniqueExternal) {
      try {
        // Skip known domains that block automated HEAD requests
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
    const docsPages = [...visited].filter(
      (p) => p.startsWith("#/docs") || p.startsWith("/#/docs"),
    );
    expect(
      docsPages.length,
      "Crawler should visit at least 5 docs pages",
    ).toBeGreaterThanOrEqual(5);
  });
});
