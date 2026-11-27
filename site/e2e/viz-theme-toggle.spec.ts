import { test, expect } from '@playwright/test';

/**
 * Viz Theme Toggle E2E Tests (#185)
 *
 * Verifies the theme dropdown at the top of the component gallery
 * switches between casual and crisp themes.
 */

test.describe('Viz Theme Toggle (#185)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/components');
    await expect(page.locator('.dialog-body')).toBeVisible({ timeout: 15_000 });
  });

  test('theme dropdown is visible at the top of the gallery', async ({ page }) => {
    const toggleBar = page.locator('[data-testid="viz-theme-toggle"]');
    await expect(toggleBar).toBeVisible({ timeout: 10_000 });
    const select = toggleBar.locator('select');
    await expect(select).toBeVisible();
  });

  test('default theme is casual', async ({ page }) => {
    const select = page.locator('[data-testid="viz-theme-toggle"] select');
    await expect(select).toBeVisible({ timeout: 10_000 });
    await expect(select).toHaveValue('casual');
  });

  test('selecting crisp changes the dropdown value', async ({ page }) => {
    const select = page.locator('[data-testid="viz-theme-toggle"] select');
    await expect(select).toBeVisible({ timeout: 10_000 });
    await select.selectOption('crisp');
    await expect(select).toHaveValue('crisp');
  });

  test('selecting casual after crisp restores the value', async ({ page }) => {
    const select = page.locator('[data-testid="viz-theme-toggle"] select');
    await expect(select).toBeVisible({ timeout: 10_000 });
    await select.selectOption('crisp');
    await expect(select).toHaveValue('crisp');
    await select.selectOption('casual');
    await expect(select).toHaveValue('casual');
  });

  test('no JavaScript errors during theme change', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    const select = page.locator('[data-testid="viz-theme-toggle"] select');
    await expect(select).toBeVisible({ timeout: 10_000 });
    await select.selectOption('crisp');
    await page.waitForTimeout(300);
    await select.selectOption('casual');
    await page.waitForTimeout(300);

    expect(errors).toEqual([]);
  });

  test('theme selection persists across accordion open/close', async ({ page }) => {
    const select = page.locator('[data-testid="viz-theme-toggle"] select');
    await expect(select).toBeVisible({ timeout: 10_000 });

    // Switch to crisp
    await select.selectOption('crisp');
    await expect(select).toHaveValue('crisp');

    // Open and close an accordion section
    const chartsHeader = page.locator('button', { hasText: 'Charts & Graphs' });
    await chartsHeader.scrollIntoViewIfNeeded();
    await chartsHeader.click();
    await page.waitForTimeout(300);
    await chartsHeader.click();
    await page.waitForTimeout(300);

    // Should still be crisp
    await expect(select).toHaveValue('crisp');
  });
});
