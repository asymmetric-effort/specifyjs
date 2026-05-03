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
    const hrefs = await collectSourceLinks(page);

    // There should be a meaningful number of source links
    expect(hrefs.size).toBeGreaterThan(0);

    // Verify each unique source link returns a successful HTTP response
    const failures: string[] = [];
    for (const href of hrefs) {
      try {
        const response = await request.head(href);
        const status = response.status();
        // Accept 200-399 (success + redirects)
        if (status >= 400) {
          failures.push(`${href} => HTTP ${status}`);
        }
      } catch (err) {
        failures.push(`${href} => network error: ${(err as Error).message}`);
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
    const hrefs = await collectSourceLinks(page);
    expect(hrefs.size).toBeGreaterThan(0);

    // For each source link, verify the corresponding README.md exists on GitHub
    const failures: string[] = [];
    for (const href of hrefs) {
      // Source links point to directories like .../tree/main/components/form/button
      // The README.md should be at .../blob/main/components/form/button/README.md
      const readmeUrl = href
        .replace('/tree/main/', '/blob/main/')
        .replace(/\/?$/, '/README.md');

      try {
        const response = await request.head(readmeUrl);
        const status = response.status();
        if (status >= 400) {
          failures.push(`${readmeUrl} => HTTP ${status}`);
        }
      } catch (err) {
        failures.push(
          `${readmeUrl} => network error: ${(err as Error).message}`,
        );
      }
    }

    expect(
      failures,
      `Missing README.md files on GitHub:\n${failures.join('\n')}`,
    ).toHaveLength(0);
  });
});
