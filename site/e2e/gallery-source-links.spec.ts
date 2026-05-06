import { test, expect } from '@playwright/test';

const REPO_BASE =
  'https://github.com/asymmetric-effort/specifyjs/tree/main';

/**
 * Helper: open each accordion section one at a time (only one can be open)
 * and collect all source-link hrefs from the preview headers.
 */
async function collectSourceLinks(
  page: import('@playwright/test').Page,
): Promise<Set<string>> {
  const hrefs = new Set<string>();
  const headers = page.locator('.accordion-header');
  const headerCount = await headers.count();

  for (let i = 0; i < headerCount; i++) {
    // Click the header to open this section (closes any other)
    await headers.nth(i).click();
    await page.waitForTimeout(300);

    // Collect all source links visible in the now-open section
    const links = page.locator(
      `.preview-header a[href^="${REPO_BASE}"]`,
    );
    const linkCount = await links.count();
    for (let j = 0; j < linkCount; j++) {
      const href = await links.nth(j).getAttribute('href');
      if (href) hrefs.add(href);
    }
  }

  return hrefs;
}

/**
 * Check a URL with retry and timeout handling.
 * Returns null on success, or an error string on failure.
 */
async function checkUrl(
  request: import('@playwright/test').APIRequestContext,
  url: string,
): Promise<string | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await request.head(url, { timeout: 15_000 });
      if (response.status() < 400) return null;
      // GitHub sometimes returns 429 for rate limiting — retry once
      if (response.status() === 429 && attempt === 0) {
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }
      return `${url} => HTTP ${response.status()}`;
    } catch (err) {
      if (attempt === 0) {
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }
      return `${url} => network error: ${(err as Error).message}`;
    }
  }
  return null;
}

test.describe('Component Gallery Source Links', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/components');
    await expect(page.locator('.dialog-title')).toContainText(
      'Component Gallery',
    );
  });

  test('every component entry with a source link points to a valid GitHub URL', async ({
    page,
    request,
  }) => {
    test.setTimeout(120_000);
    const hrefs = await collectSourceLinks(page);
    expect(hrefs.size).toBeGreaterThan(0);

    // Check links in batches of 5 to avoid overwhelming GitHub
    const failures: string[] = [];
    const hrefList = [...hrefs];
    for (let i = 0; i < hrefList.length; i += 5) {
      const batch = hrefList.slice(i, i + 5);
      const results = await Promise.all(
        batch.map((href) => checkUrl(request, href)),
      );
      for (const result of results) {
        if (result) failures.push(result);
      }
    }

    expect(
      failures,
      `Broken source links:\n${failures.join('\n')}`,
    ).toHaveLength(0);
  });

  test('source links point to component README.md files on GitHub', async ({
    page,
    request,
  }) => {
    test.setTimeout(120_000);
    const hrefs = await collectSourceLinks(page);
    expect(hrefs.size).toBeGreaterThan(0);

    const failures: string[] = [];
    const readmeUrls = [...hrefs].map((href) =>
      href.replace('/tree/main/', '/blob/main/').replace(/\/?$/, '/README.md'),
    );

    // Check in batches of 5
    for (let i = 0; i < readmeUrls.length; i += 5) {
      const batch = readmeUrls.slice(i, i + 5);
      const results = await Promise.all(
        batch.map((url) => checkUrl(request, url)),
      );
      for (const result of results) {
        if (result) failures.push(result);
      }
    }

    expect(
      failures,
      `Missing README.md files on GitHub:\n${failures.join('\n')}`,
    ).toHaveLength(0);
  });
});
