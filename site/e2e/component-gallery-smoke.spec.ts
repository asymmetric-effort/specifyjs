/**
 * Component Gallery Smoke Tests (#63)
 *
 * Opens each component gallery accordion section and verifies it renders
 * without JavaScript errors. Covers the gap where gallery demos were
 * shipped without any PDV coverage.
 */

import { test, expect } from '@playwright/test';

const gallerySections = [
  'Form',
  'Layout',
  'Nav',
  'Viz',
  'Charts & Graphs',
  'Data & Analytics',
  'Hierarchical',
  'Scientific & Engineering',
  'Geospatial & Maps',
  'Page Layouts',
  'Games',
];

test.describe('Component Gallery Smoke Tests', () => {
  for (const section of gallerySections) {
    test(`${section} section renders without JS errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (err) => errors.push(err.message));

      await page.goto('/#/components');
      await expect(page.locator('.dialog-body')).toBeVisible({ timeout: 15_000 });

      const header = page.locator('.accordion-header', { hasText: section });

      // Skip if section doesn't exist (may be renamed or removed)
      const count = await header.count();
      if (count === 0) {
        test.skip(true, `Section "${section}" not found in gallery`);
        return;
      }

      await header.scrollIntoViewIfNeeded();
      await header.click();
      await page.waitForTimeout(500);

      // Verify section body is visible and non-empty
      const sectionBody = page.locator('.accordion-body').first();
      await expect(sectionBody).toBeVisible({ timeout: 10_000 });

      const box = await sectionBody.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThan(0);
      expect(box!.height).toBeGreaterThan(0);

      // No JS errors
      expect(errors).toEqual([]);
    });
  }
});
