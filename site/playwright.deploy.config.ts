import { defineConfig } from '@playwright/test';

/**
 * Post-deployment verification config.
 * Runs the same E2E tests against the live production site.
 *
 * Uses a global setup to configure cache-busting for CDN.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: 2,
  timeout: 30000,
  use: {
    baseURL: process.env.SITE_URL || 'https://specifyjs.asymmetric-effort.com',
    trace: 'on-first-retry',
    ignoreHTTPSErrors: true,
    // Add cache-busting query param to bypass CDN cache on every navigation
    extraHTTPHeaders: {
      'Cache-Control': 'no-cache',
    },
  },
  // No webServer — tests run against the already-deployed site
});
