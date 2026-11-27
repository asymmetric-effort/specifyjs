import { test, expect } from '@playwright/test';

/**
 * Viz Theme Toggle E2E Tests (#185)
 *
 * Verifies the theme toggle bar at the top of the component gallery.
 * Skipped in PDV — gallery UI interactions are unreliable on deployed site.
 * Validated in E2E across chromium/firefox/webkit.
 */

const isPDV = !!process.env.SITE_URL;

(isPDV ? test.describe.skip : test.describe)('Viz Theme Toggle (#185)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/components');
    await expect(page.locator('.dialog-body')).toBeVisible({ timeout: 15_000 });
  });

  test('toggle is visible at the top of the gallery', async ({ page }) => {
    const toggleBar = page.locator('[data-testid="viz-theme-toggle"]');
    await expect(toggleBar).toBeVisible({ timeout: 10_000 });

    // Verify it appears before any accordion section
    const toggleTop = await toggleBar.evaluate((el) => el.getBoundingClientRect().top);
    const firstAccordion = page.locator('.accordion-header').first();
    const accordionTop = await firstAccordion.evaluate((el) => el.getBoundingClientRect().top);
    expect(toggleTop).toBeLessThan(accordionTop);
  });

  test('default theme is Casual', async ({ page }) => {
    const toggleBar = page.locator('[data-testid="viz-theme-toggle"]');
    await expect(toggleBar).toBeVisible({ timeout: 10_000 });

    const button = toggleBar.locator('button', { hasText: 'Casual' });
    await expect(button).toBeVisible();
  });

  test('click switches to Crisp', async ({ page }) => {
    const toggleBar = page.locator('[data-testid="viz-theme-toggle"]');
    await expect(toggleBar).toBeVisible({ timeout: 10_000 });

    const casualBtn = toggleBar.locator('button', { hasText: 'Casual' });
    await casualBtn.click();

    const crispBtn = toggleBar.locator('button', { hasText: 'Crisp' });
    await expect(crispBtn).toBeVisible();
  });

  test('click again switches back to Casual', async ({ page }) => {
    const toggleBar = page.locator('[data-testid="viz-theme-toggle"]');
    await expect(toggleBar).toBeVisible({ timeout: 10_000 });

    // Switch to Crisp
    const casualBtn = toggleBar.locator('button', { hasText: 'Casual' });
    await casualBtn.click();
    await expect(toggleBar.locator('button', { hasText: 'Crisp' })).toBeVisible();

    // Switch back to Casual
    const crispBtn = toggleBar.locator('button', { hasText: 'Crisp' });
    await crispBtn.click();
    await expect(toggleBar.locator('button', { hasText: 'Casual' })).toBeVisible();
  });

  test('no JavaScript errors during toggle', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    const toggleBar = page.locator('[data-testid="viz-theme-toggle"]');
    await expect(toggleBar).toBeVisible({ timeout: 10_000 });

    // Toggle to Crisp
    await toggleBar.locator('button', { hasText: 'Casual' }).click();
    await page.waitForTimeout(300);

    // Toggle back to Casual
    await toggleBar.locator('button', { hasText: 'Crisp' }).click();
    await page.waitForTimeout(300);

    expect(errors).toEqual([]);
  });

  test('toggle state survives accordion open/close', async ({ page }) => {
    const toggleBar = page.locator('[data-testid="viz-theme-toggle"]');
    await expect(toggleBar).toBeVisible({ timeout: 10_000 });

    // Switch to Crisp
    await toggleBar.locator('button', { hasText: 'Casual' }).click();
    await expect(toggleBar.locator('button', { hasText: 'Crisp' })).toBeVisible();

    // Open a different accordion section
    const chartsHeader = page.locator('button', { hasText: 'Charts & Graphs' });
    await chartsHeader.scrollIntoViewIfNeeded();
    await chartsHeader.click();
    await page.waitForTimeout(300);

    // Close it
    await chartsHeader.click();
    await page.waitForTimeout(300);

    // Toggle should still show Crisp
    await expect(toggleBar.locator('button', { hasText: 'Crisp' })).toBeVisible();
  });
});
