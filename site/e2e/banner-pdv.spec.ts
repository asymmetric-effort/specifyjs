import { test, expect } from '@playwright/test';

test.describe('Banner query parameter PDV', () => {
  test('banner is NOT visible without ?banner=true', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[role="status"]')).toHaveCount(0);
  });

  test('banner IS visible with ?banner=true', async ({ page }) => {
    await page.goto('/?banner=true');
    const banner = page.locator('[role="status"]');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('SpecifyJS showcase');
  });

  test('banner has info severity styling', async ({ page }) => {
    await page.goto('/?banner=true');
    const banner = page.locator('[role="status"]');
    await expect(banner).toBeVisible();
    // Info severity has blue-tinted background
    const bg = await banner.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toContain('239'); // rgb(239, 246, 255) = #eff6ff
  });

  test('banner has dismiss button', async ({ page }) => {
    await page.goto('/?banner=true');
    const dismissBtn = page.locator('[aria-label="Dismiss banner"]');
    await expect(dismissBtn).toBeVisible();
  });

  test('clicking dismiss removes the banner', async ({ page }) => {
    await page.goto('/?banner=true');
    const banner = page.locator('[role="status"]');
    await expect(banner).toBeVisible();
    await page.locator('[aria-label="Dismiss banner"]').click();
    await expect(banner).not.toBeVisible();
  });

  test('banner pushes content down (not an overlay)', async ({ page }) => {
    await page.goto('/?banner=true');
    const banner = page.locator('[role="status"]');
    const position = await banner.evaluate((el) => getComputedStyle(el).position);
    expect(position).toBe('relative');
  });

  test('banner has icon, message, and dismiss in three columns', async ({ page }) => {
    await page.goto('/?banner=true');
    const banner = page.locator('[role="status"]');
    // Should have 3 direct children (icon pane, message pane, dismiss pane)
    const childCount = await banner.evaluate((el) => el.children.length);
    expect(childCount).toBe(3);
  });

  test('no JavaScript errors with banner', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/?banner=true');
    await page.waitForTimeout(500);
    expect(errors).toEqual([]);
  });
});
