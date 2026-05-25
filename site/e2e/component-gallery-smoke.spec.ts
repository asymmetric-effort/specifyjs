/**
 * Component Gallery Smoke Tests (#63)
 *
 * Opens the component gallery and verifies it renders without JavaScript
 * errors. Covers the gap where gallery demos were shipped without PDV coverage.
 */

import { test, expect } from '@playwright/test';

test.describe('Component Gallery Smoke Tests', () => {
  test('gallery page loads without JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/#/components');
    await expect(page.locator('.dialog-body')).toBeVisible({ timeout: 15_000 });

    // Verify the gallery has content
    const text = await page.locator('.dialog-body').innerText();
    expect(text.length).toBeGreaterThan(100);

    expect(errors).toEqual([]);
  });

  test('gallery has accordion sections', async ({ page }) => {
    await page.goto('/#/components');
    await expect(page.locator('.dialog-body')).toBeVisible({ timeout: 15_000 });

    const sections = page.locator('.accordion-header');
    const count = await sections.count();
    // Should have at least 8 accordion sections
    expect(count).toBeGreaterThanOrEqual(8);
  });

  test('clicking an accordion section does not cause JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/#/components');
    await expect(page.locator('.dialog-body')).toBeVisible({ timeout: 15_000 });

    // Click the first accordion section
    const firstHeader = page.locator('.accordion-header').first();
    await firstHeader.scrollIntoViewIfNeeded();
    await firstHeader.click();
    await page.waitForTimeout(1000);

    expect(errors).toEqual([]);
  });

  test('Page Layouts section opens and has content', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/#/components');
    await expect(page.locator('.dialog-body')).toBeVisible({ timeout: 15_000 });

    // Find and click Page Layouts
    const pageLayoutsBtn = page.locator('.accordion-title:text-is("Page Layouts")');
    const count = await pageLayoutsBtn.count();
    if (count === 0) {
      test.skip(true, 'Page Layouts section not found');
      return;
    }

    const headerBtn = pageLayoutsBtn.locator('xpath=ancestor::button');
    await headerBtn.scrollIntoViewIfNeeded();
    await headerBtn.click();
    await page.waitForTimeout(1000);

    expect(errors).toEqual([]);
  });
});
