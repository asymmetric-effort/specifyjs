import { test, expect } from '@playwright/test';

test.describe('3D Space WebGL Demo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/3dSpaceWebGl');
  });

  test('renders dialog with title', async ({ page }) => {
    await expect(page.locator('.dialog-title')).toContainText('3D Space (WebGL)');
  });

  test('canvas is present', async ({ page }) => {
    const canvas = page.locator('.dialog-body canvas');
    await expect(canvas).toBeVisible();
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(100);
    expect(box!.height).toBeGreaterThan(100);
  });

  test('no JavaScript errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/#/3dSpaceWebGl');
    await expect(page.locator('.dialog-title')).toContainText('3D Space (WebGL)');
    await page.waitForTimeout(2000);
    expect(errors).toEqual([]);
  });
});
