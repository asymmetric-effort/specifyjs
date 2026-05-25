/**
 * Component Gallery Smoke Tests (#63)
 *
 * Opens each component gallery accordion section and verifies it renders
 * without JavaScript errors. Covers the gap where gallery demos were
 * shipped without any PDV coverage.
 */

import { test, expect } from '@playwright/test';

const gallerySections = [
  'Form Components',
  'Data Display',
  'Feedback',
  'Navigation',
  'Layout',
  'Charts & Graphs',
  'Data & Analytics',
  'Geospatial Maps',
  'Mathematical',
  '3D & Advanced',
  'Page Layouts',
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
      // Scope to the parent .accordion-section of the clicked header
      const sectionContainer = header.locator('..');
      const sectionBody = sectionContainer.locator('.accordion-body');
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
