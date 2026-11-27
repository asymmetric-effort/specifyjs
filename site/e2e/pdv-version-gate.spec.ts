import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

/**
 * PDV Version Gate — runs FIRST in PDV to verify the deployed site
 * is serving the expected version. All other PDV tests are meaningless
 * if the deployed version doesn't match.
 *
 * Uses the <meta name="specifyjs-version"> tag injected at build time
 * and cache-busted page loads to defeat CDN caching.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

test.describe('PDV Version Gate', () => {
  test('deployed site serves the expected version', async ({ page }) => {
    const pkgPath = resolve(__dirname, '../../core/package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    const expected = pkg.version as string;

    const baseURL = process.env.SITE_URL || 'https://specifyjs.asymmetric-effort.com';

    // Cache-busted load
    const cacheBust = `?_v=${Date.now()}`;
    await page.goto(`${baseURL}/${cacheBust}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });

    // Read the version meta tag
    const deployedVersion = await page.locator('meta[name="specifyjs-version"]').getAttribute('content');

    expect(
      deployedVersion,
      `Deployed version "${deployedVersion}" does not match expected "${expected}". ` +
      `The staging/production site may still be serving a stale version. ` +
      `Check that the deploy step completed and CDN cache has been invalidated.`,
    ).toBe(expected);
  });
});
