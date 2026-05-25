/**
 * PDV test fixture that automatically verifies the deployed version
 * before running tests. Import this instead of '@playwright/test' in PDV tests.
 *
 * Usage:
 *   import { test, expect } from './helpers/pdv-fixture';
 *   // All tests automatically skip if CDN hasn't propagated
 */

import { test as base, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { waitForDeployedVersion } from './wait-for-deploy';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const expectedVersion = JSON.parse(
  readFileSync(resolve(__dirname, '../../../core/package.json'), 'utf-8'),
).version;

export { expect };

export const test = base.extend({
  page: async ({ page }, use) => {
    // Only run version check for PDV (against deployed site, not local dev)
    const baseURL = page.context().browser()?.contexts()[0]?.pages()[0]?.url() || '';
    const isLocalDev = baseURL.includes('localhost') || baseURL.includes('127.0.0.1');

    if (!isLocalDev) {
      await waitForDeployedVersion(page, expectedVersion);
    }

    await use(page);
  },
});
