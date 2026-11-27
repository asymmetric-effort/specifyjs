import { defineConfig } from '@playwright/test';

/**
 * Post-deployment verification config.
 * Runs the same E2E tests against the live production site.
 *
 * Uses --disk-cache-size=0 to prevent Chromium from caching stale
 * GitHub Pages CDN content between test runs.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: 2,
  timeout: 45000,
  use: {
    baseURL: process.env.SITE_URL || 'https://specifyjs.asymmetric-effort.com',
    trace: 'on-first-retry',
    ignoreHTTPSErrors: true,
    // Defeat CDN caching: disable browser cache and add cache-control headers
    extraHTTPHeaders: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
    },
    launchOptions: {
      args: ['--disk-cache-size=0', '--disable-http-cache'],
    },
  },
  // No webServer — tests run against the already-deployed site
});
