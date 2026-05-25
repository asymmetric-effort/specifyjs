/**
 * Component PDV test template (#63)
 *
 * Reusable function that generates standard post-deployment verification
 * tests for component gallery sections. Ensures every component:
 * - Renders non-blank with non-zero dimensions
 * - Contains expected text content
 * - Produces no JavaScript console errors
 */

import { test, expect, type Page } from '@playwright/test';

export interface ComponentPDVOptions {
  /** Minimum number of child elements expected in the section body. Default: 1 */
  expectMinElements?: number;
  /** Text strings that must appear in the rendered section */
  expectText?: string[];
  /** Whether to test for interactive elements (buttons, inputs, toggles). Default: false */
  expectInteractive?: boolean;
}

/**
 * Navigate to the component gallery and open a specific accordion section.
 */
async function openGallerySection(page: Page, sectionName: string): Promise<void> {
  await page.goto('/#/components');
  await expect(page.locator('.dialog-body')).toBeVisible({ timeout: 15_000 });

  const header = page.locator('.accordion-header', { hasText: sectionName });
  await header.waitFor({ state: 'visible', timeout: 15_000 });
  await header.scrollIntoViewIfNeeded();
  await header.click();
  await page.waitForTimeout(300);
}

/**
 * Generate a standard PDV test suite for a component gallery section.
 *
 * @param name - Human-readable name for the test suite (e.g. "Toggle", "BarChart")
 * @param gallerySection - Accordion section header text (e.g. "Form", "Charts & Graphs")
 * @param options - Configuration for expected content and behavior
 *
 * @example
 * ```ts
 * componentPDVSuite('Toggle', 'Form', {
 *   expectMinElements: 1,
 *   expectText: ['On', 'Off'],
 *   expectInteractive: true,
 * });
 * ```
 */
export function componentPDVSuite(
  name: string,
  gallerySection: string,
  options: ComponentPDVOptions = {},
): void {
  const {
    expectMinElements = 1,
    expectText = [],
    expectInteractive = false,
  } = options;

  test.describe(`${name} — PDV`, () => {
    test(`${name} section renders non-blank`, async ({ page }) => {
      await openGallerySection(page, gallerySection);

      const sectionBody = page.locator('.accordion-body').first();
      await expect(sectionBody).toBeVisible({ timeout: 10_000 });

      // Verify section has content (non-zero dimensions)
      const box = await sectionBody.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThan(0);
      expect(box!.height).toBeGreaterThan(0);

      // Verify minimum number of child elements
      const children = sectionBody.locator('*');
      const count = await children.count();
      expect(count).toBeGreaterThanOrEqual(expectMinElements);
    });

    if (expectText.length > 0) {
      test(`${name} contains expected text`, async ({ page }) => {
        await openGallerySection(page, gallerySection);

        const sectionBody = page.locator('.accordion-body').first();
        await expect(sectionBody).toBeVisible({ timeout: 10_000 });

        for (const text of expectText) {
          await expect(sectionBody).toContainText(text, { timeout: 5_000 });
        }
      });
    }

    if (expectInteractive) {
      test(`${name} has visible interactive elements`, async ({ page }) => {
        await openGallerySection(page, gallerySection);

        const sectionBody = page.locator('.accordion-body').first();
        await expect(sectionBody).toBeVisible({ timeout: 10_000 });

        // Look for interactive elements: buttons, inputs, toggles, selects
        const interactive = sectionBody.locator(
          'button, input, select, textarea, [role="switch"], [role="button"], [role="slider"]',
        );
        const count = await interactive.count();
        expect(count).toBeGreaterThan(0);

        // Verify at least one interactive element has non-zero dimensions
        const firstInteractive = interactive.first();
        const box = await firstInteractive.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.width).toBeGreaterThan(0);
        expect(box!.height).toBeGreaterThan(0);
      });
    }

    test(`${name} produces no JavaScript errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (err) => errors.push(err.message));

      await openGallerySection(page, gallerySection);

      const sectionBody = page.locator('.accordion-body').first();
      await expect(sectionBody).toBeVisible({ timeout: 10_000 });

      // Allow time for any deferred rendering
      await page.waitForTimeout(500);

      expect(errors).toEqual([]);
    });
  });
}
