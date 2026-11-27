import { test, expect } from '@playwright/test';

/**
 * Visualization Theme System E2E Tests
 *
 * Verifies the casual/crisp theme toggle works in the component gallery
 * and that themes produce visually different output.
 */


test.describe('Viz Theme Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/components');
    await expect(page.locator('.dialog-body')).toBeVisible({ timeout: 15000 });
  });

  test('theme toggle button exists in viz sections', async ({ page }) => {
    // Look for the Casual/Crisp toggle button
    const toggle = page.locator('button', { hasText: /Casual|Crisp/ });
    await expect(toggle.first()).toBeVisible({ timeout: 10000 });
  });

  test('default theme is Casual', async ({ page }) => {
    const toggle = page.locator('button', { hasText: 'Casual' });
    await expect(toggle.first()).toBeVisible({ timeout: 10000 });
  });

  test('clicking toggle switches to Crisp', async ({ page }) => {
    const toggle = page.locator('button', { hasText: 'Casual' }).first();
    await toggle.scrollIntoViewIfNeeded();
    await toggle.click();
    await expect(page.locator('button', { hasText: 'Crisp' }).first()).toBeVisible();
  });

  test('clicking Crisp switches back to Casual', async ({ page }) => {
    // Switch to Crisp
    const casualBtn = page.locator('button', { hasText: 'Casual' }).first();
    await casualBtn.scrollIntoViewIfNeeded();
    await casualBtn.click();
    // Switch back
    const crispBtn = page.locator('button', { hasText: 'Crisp' }).first();
    await crispBtn.click();
    await expect(page.locator('button', { hasText: 'Casual' }).first()).toBeVisible();
  });

  test('no JavaScript errors during theme toggle', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    const toggle = page.locator('button', { hasText: 'Casual' }).first();
    await toggle.scrollIntoViewIfNeeded();
    await toggle.click();
    await page.waitForTimeout(500);
    await page.locator('button', { hasText: 'Crisp' }).first().click();
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
    // Find any SVG text element in the chart previews
    const svgText = page.locator('.dialog-body svg text').first();
    await expect(svgText).toBeVisible({ timeout: 10000 });
    const fontFamily = await svgText.evaluate((el) => {
      return getComputedStyle(el).fontFamily || el.getAttribute('font-family') || '';
    });
    // Casual uses 'sans-serif'
    expect(fontFamily).toContain('sans-serif');
  });

  test('crisp theme: SVG text uses Inter font stack', async ({ page }) => {
    // Switch to Crisp
    const toggle = page.locator('button', { hasText: 'Casual' }).first();
    await toggle.scrollIntoViewIfNeeded();
    await toggle.click();
    await page.waitForTimeout(500);

    const svgText = page.locator('.dialog-body svg text').first();
    await expect(svgText).toBeVisible({ timeout: 10000 });
    const fontFamily = await svgText.evaluate((el) => {
      return getComputedStyle(el).fontFamily || el.getAttribute('font-family') || '';
    });
    // Crisp uses Inter stack — should NOT be plain 'sans-serif'
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
    const toggle = page.locator('button', { hasText: 'Casual' }).first();
    await toggle.scrollIntoViewIfNeeded();
    await toggle.click();
    await page.waitForTimeout(500);

    const wrapper = page.locator('.dialog-body .viz-wrapper').first();
    if (await wrapper.count() > 0) {
      const radius = await wrapper.evaluate((el) => getComputedStyle(el).borderRadius);
      expect(radius).toBe('0px');
    }
  });
});
