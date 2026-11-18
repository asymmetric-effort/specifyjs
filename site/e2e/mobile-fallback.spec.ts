// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { test, expect } from '@playwright/test';

test.describe('Mobile fallback for desktop layouts', () => {
  test.use({ viewport: { width: 393, height: 851 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/#/components');
    await expect(page.locator('.dialog-body')).toBeVisible({ timeout: 10000 });
    // Open Page Layouts accordion
    const header = page.locator('button', { hasText: 'Page Layouts' });
    await header.scrollIntoViewIfNeeded();
    await header.click();
  });

  test('Unity Desktop shows mobile fallback', async ({ page }) => {
    await page.locator('button', { hasText: 'Unity Desktop' }).click();
    await expect(page.locator('text=Desktop Experience')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=desktop screens')).toBeVisible();
  });

  test('IDE shows mobile fallback', async ({ page }) => {
    await page.locator('button', { hasText: 'IDE' }).click();
    await expect(page.locator('text=Desktop Experience')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=desktop-sized screen')).toBeVisible();
  });

  test('Trading Dashboard shows mobile fallback', async ({ page }) => {
    await page.locator('button', { hasText: 'Trading Dashboard' }).click();
    await expect(page.locator('text=Desktop Experience')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=desktop-sized screen')).toBeVisible();
  });
});
