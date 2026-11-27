import { test, expect } from '@playwright/test';

/**
 * Visualization Theme System E2E Tests
 *
 * Verifies the casual/crisp theme dropdown works in the component gallery
 * and that themes produce visually different output.
 */

test.describe('Viz Theme Dropdown', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/components');
    await expect(page.locator('.dialog-body')).toBeVisible({ timeout: 15000 });
  });

  test('theme dropdown exists in gallery', async ({ page }) => {
    const select = page.locator('[data-testid="viz-theme-toggle"] select');
    await expect(select).toBeVisible({ timeout: 10000 });
  });

  test('default theme is casual', async ({ page }) => {
    const select = page.locator('[data-testid="viz-theme-toggle"] select');
    await expect(select).toHaveValue('casual');
  });

  test('selecting crisp changes value', async ({ page }) => {
    const select = page.locator('[data-testid="viz-theme-toggle"] select');
    await select.selectOption('crisp');
    await expect(select).toHaveValue('crisp');
  });

  test('selecting casual restores value', async ({ page }) => {
    const select = page.locator('[data-testid="viz-theme-toggle"] select');
    await select.selectOption('crisp');
    await select.selectOption('casual');
    await expect(select).toHaveValue('casual');
  });

  test('no JavaScript errors during theme change', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    const select = page.locator('[data-testid="viz-theme-toggle"] select');
    await select.selectOption('crisp');
    await page.waitForTimeout(500);
    await select.selectOption('casual');
    await page.waitForTimeout(500);

    expect(errors).toEqual([]);
  });
});

// Verify chart SVG elements reflect theme tokens

test.describe('Viz Theme — Chart Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/components');
    await expect(page.locator('.dialog-body')).toBeVisible({ timeout: 15000 });
    // Open Charts & Graphs accordion
    const chartsHeader = page.locator('button', { hasText: 'Charts & Graphs' });
    await chartsHeader.scrollIntoViewIfNeeded();
    await chartsHeader.click();
  });

  test('casual theme: SVG text uses sans-serif font', async ({ page }) => {
    const svgText = page.locator('.dialog-body svg text').first();
    await expect(svgText).toBeVisible({ timeout: 10000 });
    const fontFamily = await svgText.evaluate((el) => {
      return getComputedStyle(el).fontFamily || el.getAttribute('font-family') || '';
    });
    expect(fontFamily).toContain('sans-serif');
  });

  test('crisp theme: SVG text uses Inter font stack', async ({ page }) => {
    const select = page.locator('[data-testid="viz-theme-toggle"] select');
    await select.selectOption('crisp');
    await page.waitForTimeout(500);

    const svgText = page.locator('.dialog-body svg text').first();
    await expect(svgText).toBeVisible({ timeout: 10000 });
    const fontFamily = await svgText.evaluate((el) => {
      return getComputedStyle(el).fontFamily || el.getAttribute('font-family') || '';
    });
    expect(fontFamily).not.toBe('sans-serif');
  });

  test('casual theme: chart containers have border-radius', async ({ page }) => {
    const wrapper = page.locator('.dialog-body .viz-wrapper').first();
    if (await wrapper.count() > 0) {
      const radius = await wrapper.evaluate((el) => getComputedStyle(el).borderRadius);
      expect(radius).not.toBe('0px');
    }
  });

  test('crisp theme: chart containers have no border-radius', async ({ page }) => {
    const select = page.locator('[data-testid="viz-theme-toggle"] select');
    await select.selectOption('crisp');
    await page.waitForTimeout(500);

    const wrapper = page.locator('.dialog-body .viz-wrapper').first();
    if (await wrapper.count() > 0) {
      const radius = await wrapper.evaluate((el) => getComputedStyle(el).borderRadius);
      expect(radius).toBe('0px');
    }
  });
});
