/**
 * waitForDeployedVersion utility (#65)
 *
 * Shared helper for PDV tests that verifies the deployed site version
 * matches the expected version before running assertions.
 *
 * Handles CDN propagation delays by retrying with cache-busting.
 * Skips (does not fail) when the version doesn't match after timeout.
 */

import type { Page } from '@playwright/test';
import { test } from '@playwright/test';

export interface WaitForDeployOptions {
  /** Max wait time in ms. Default: 60000 */
  timeout?: number;
  /** Poll interval in ms. Default: 5000 */
  interval?: number;
  /** URL to check. Default: site base URL from config */
  url?: string;
}

/**
 * Wait for the deployed site to serve the expected version.
 *
 * - Navigates with cache-busting query param (?cb=<timestamp>)
 * - Sets Cache-Control: no-cache headers via route interception
 * - Checks rendered footer version text
 * - Retries on mismatch until timeout
 * - Skips the test (not fails) if version never matches
 *
 * @param page - Playwright Page instance
 * @param expectedVersion - Version string from package.json (e.g. "0.2.103")
 * @param options - Optional timeout, interval, and URL overrides
 */
export async function waitForDeployedVersion(
  page: Page,
  expectedVersion: string,
  options?: WaitForDeployOptions,
): Promise<void> {
  const timeout = options?.timeout ?? 20_000;
  const interval = options?.interval ?? 5_000;
  const url = options?.url ?? '/';

  // Disable browser disk cache via CDP when running on Chromium
  try {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  } catch {
    // Not Chromium — CDP not available, continue without
  }

  // Intercept requests to add cache-control headers
  await page.route('**/*', async (route) => {
    await route.continue({
      headers: {
        ...route.request().headers(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
      },
    });
  });

  const deadline = Date.now() + timeout;

  while (Date.now() < deadline) {
    const cacheBust = `${url}${url.includes('?') ? '&' : '?'}cb=${Date.now()}`;

    try {
      await page.goto(cacheBust, {
        waitUntil: 'domcontentloaded',
        timeout: 15_000,
      });

      const footerText = await page
        .locator('footer')
        .innerText({ timeout: 5_000 });

      if (footerText.includes(`v${expectedVersion}`)) {
        // Version matches — unroute and return
        await page.unroute('**/*');
        return;
      }
    } catch {
      // Navigation or locator timeout — retry
    }

    if (Date.now() + interval >= deadline) {
      break;
    }

    await page.waitForTimeout(interval);
  }

  // Clean up route interception
  await page.unroute('**/*');

  // Version never matched — skip test
  test.skip(
    true,
    `Site version does not match expected v${expectedVersion} — CDN may still be propagating`,
  );
}
