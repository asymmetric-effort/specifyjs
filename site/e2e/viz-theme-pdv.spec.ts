import { test, expect } from '@playwright/test';

/**
 * PDV: Visualization Theme Verification
 *
 * Verifies that the casual and crisp themes produce visually different
 * chart output on the deployed site. These tests interact with the
 * component gallery to toggle themes and inspect actual SVG attributes.
 *
 * NOT skipped in PDV — these verify deployed production quality.
 */

/** Helper: get the theme select dropdown, scrolling to it and waiting for visibility */
async function getThemeSelect(page: import('@playwright/test').Page) {
  const select = page.locator('[data-testid="viz-theme-toggle"] select');
  await select.scrollIntoViewIfNeeded();
  await expect(select).toBeVisible({ timeout: 15000 });
  return select;
}

test.describe('Viz Theme PDV — Chart Rendering Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/components', { waitUntil: 'networkidle' });
    await expect(page.locator('.dialog-body')).toBeVisible({ timeout: 30000 });
    // Wait for JS hydration
    await page.waitForTimeout(1000);
    // Open Charts & Graphs accordion
    const chartsHeader = page.locator('button', { hasText: 'Charts & Graphs' });
    await chartsHeader.scrollIntoViewIfNeeded();
    await chartsHeader.click();
    await page.waitForTimeout(500);
  });

  test('casual theme: line chart SVG uses sans-serif font', async ({ page }) => {
    // Ensure casual is selected (default)
    const select = await getThemeSelect(page);
    if (await select.count() > 0) {
      await select.selectOption('casual');
      await page.waitForTimeout(300);
    }

    const svgText = page.locator('.dialog-body svg text').first();
    await expect(svgText).toBeVisible({ timeout: 10000 });
    const fontFamily = await svgText.evaluate((el) =>
      el.getAttribute('font-family') || getComputedStyle(el).fontFamily || '',
    );
    expect(fontFamily.toLowerCase()).toContain('sans-serif');
  });

  test('crisp theme: line chart SVG uses Inter font stack', async ({ page }) => {
    const select = await getThemeSelect(page);
    await select.selectOption('crisp');
    await page.waitForTimeout(500);

    const svgText = page.locator('.dialog-body svg text').first();
    await expect(svgText).toBeVisible({ timeout: 10000 });
    const fontFamily = await svgText.evaluate((el) =>
      el.getAttribute('font-family') || getComputedStyle(el).fontFamily || '',
    );
    // Crisp uses Inter stack — must NOT be plain 'sans-serif'
    expect(fontFamily.toLowerCase()).not.toBe('sans-serif');
    expect(fontFamily).toContain('Inter');
  });

  test('crisp theme: line chart has no visible data point circles', async ({ page }) => {
    const select = await getThemeSelect(page);
    await select.selectOption('crisp');
    await page.waitForTimeout(500);

    // In the line graph preview, there should be no circle elements
    // (data point markers) when showPoints=false (crisp default)
    const lineGraphPreview = page.locator('.preview-body').first();
    const circles = lineGraphPreview.locator('svg circle');
    const count = await circles.count();
    // crisp: no data point circles (may have 0 circles)
    // casual: would have circles for each data point
    expect(count).toBe(0);
  });

  test('casual theme: line chart has visible data point circles', async ({ page }) => {
    const select = await getThemeSelect(page);
    if (await select.count() > 0) {
      await select.selectOption('casual');
      await page.waitForTimeout(300);
    }

    const lineGraphPreview = page.locator('.preview-body').first();
    const circles = lineGraphPreview.locator('svg circle');
    const count = await circles.count();
    expect(count).toBeGreaterThan(0);
  });

  test('crisp theme: pie chart slices have no white stroke borders', async ({ page }) => {
    const select = await getThemeSelect(page);
    await select.selectOption('crisp');
    await page.waitForTimeout(500);

    // Find pie chart preview — look for path elements with fill colors
    const piePaths = page.locator('.dialog-body svg path[fill]');
    const count = await piePaths.count();
    if (count > 0) {
      // Check that stroke is 'none' or absent (not white)
      for (let i = 0; i < Math.min(count, 5); i++) {
        const stroke = await piePaths.nth(i).evaluate((el) =>
          el.getAttribute('stroke') || getComputedStyle(el).stroke || '',
        );
        if (stroke && stroke !== 'none') {
          // If there's a stroke, it shouldn't be white
          expect(stroke).not.toBe('#fff');
          expect(stroke).not.toBe('#ffffff');
          expect(stroke).not.toBe('rgb(255, 255, 255)');
          expect(stroke).not.toBe('white');
        }
      }
    }
  });

  test('theme toggle changes SVG attributes (not just dropdown value)', async ({ page }) => {
    const select = await getThemeSelect(page);

    // Read a font-family in casual
    await select.selectOption('casual');
    await page.waitForTimeout(300);
    const svgText = page.locator('.dialog-body svg text').first();
    await expect(svgText).toBeVisible({ timeout: 10000 });
    const casualFont = await svgText.evaluate((el) =>
      el.getAttribute('font-family') || '',
    );

    // Switch to crisp and read again
    await select.selectOption('crisp');
    await page.waitForTimeout(500);
    const crispFont = await svgText.evaluate((el) =>
      el.getAttribute('font-family') || '',
    );

    // The fonts must be different — proving the theme actually propagates
    expect(casualFont).not.toBe(crispFont);
  });
});
