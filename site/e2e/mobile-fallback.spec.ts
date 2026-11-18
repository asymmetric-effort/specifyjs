// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { test, expect } from '@playwright/test';

test.describe('Mobile fallback for desktop layouts', () => {
  // Use a wide viewport for navigation (the gallery needs it),
  // then resize to mobile AFTER the layout loads.
  test('Unity Desktop shows mobile fallback at mobile width', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/#/components');
    await expect(page.locator('.dialog-body')).toBeVisible({ timeout: 15000 });
    const header = page.locator('button', { hasText: 'Page Layouts' });
    await header.scrollIntoViewIfNeeded();
    await header.click();
    await page.locator('button', { hasText: 'Unity Desktop' }).click();
    // Now resize to mobile — the component checks window.innerWidth on render
    await page.setViewportSize({ width: 393, height: 851 });
    await page.waitForTimeout(500);
    // Re-navigate to force re-render at mobile size
    await page.goto('/#/components');
    await expect(page.locator('.dialog-body')).toBeVisible({ timeout: 15000 });
    const header2 = page.locator('button', { hasText: 'Page Layouts' });
    await header2.scrollIntoViewIfNeeded();
    await header2.click();
    await page.locator('button', { hasText: 'Unity Desktop' }).click();
    await expect(page.locator('text=Desktop Experience')).toBeVisible({ timeout: 10000 });
  });

  test('IDE shows mobile fallback at mobile width', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });
    await page.goto('/#/components');
    await expect(page.locator('.dialog-body')).toBeVisible({ timeout: 15000 });
    const header = page.locator('button', { hasText: 'Page Layouts' });
    await header.scrollIntoViewIfNeeded();
    await header.click();
    await page.locator('button', { hasText: 'IDE' }).click();
    await expect(page.locator('text=Desktop Experience')).toBeVisible({ timeout: 10000 });
  });

  test('Trading Dashboard shows mobile fallback at mobile width', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });
    await page.goto('/#/components');
    await expect(page.locator('.dialog-body')).toBeVisible({ timeout: 15000 });
    const header = page.locator('button', { hasText: 'Page Layouts' });
    await header.scrollIntoViewIfNeeded();
    await header.click();
    await page.locator('button', { hasText: 'Trading' }).click();
    await expect(page.locator('text=Desktop Experience')).toBeVisible({ timeout: 10000 });
  });
});
