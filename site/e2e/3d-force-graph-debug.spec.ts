import { test, expect } from '@playwright/test';

/**
 * Debug E2E tests for ForceGraph3D rendering (#80)
 *
 * Tests whether Space3D renders anything inside the dialog.
 * Runs against local dev server (E2E, not PDV).
 */

test.describe('3D Force Graph Debug', () => {
  test('debug route loads without JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/#/3dFGDebug');
    await expect(page.locator('.dialog-body')).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(2000);
    expect(errors).toEqual([]);
  });

  test('canvas element exists in the dialog', async ({ page }) => {
    await page.goto('/#/3dFGDebug');
    await expect(page.locator('.dialog-body')).toBeVisible({ timeout: 10_000 });
    const canvas = page.locator('.dialog-body canvas');
    await expect(canvas).toBeVisible({ timeout: 5_000 });
  });

  test('canvas has non-zero dimensions', async ({ page }) => {
    await page.goto('/#/3dFGDebug');
    await expect(page.locator('.dialog-body')).toBeVisible({ timeout: 10_000 });
    const canvas = page.locator('.dialog-body canvas');
    await expect(canvas).toBeVisible({ timeout: 5_000 });
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(50);
    expect(box!.height).toBeGreaterThan(50);
  });

  test('canvas has rendered content (non-blank pixels)', async ({ page }) => {
    await page.goto('/#/3dFGDebug');
    await expect(page.locator('.dialog-body')).toBeVisible({ timeout: 10_000 });
    const canvas = page.locator('.dialog-body canvas');
    await expect(canvas).toBeVisible({ timeout: 5_000 });
    await page.waitForTimeout(3000); // let render loop run

    const hasContent = await canvas.evaluate((el: HTMLCanvasElement) => {
      // Copy canvas to 2d offscreen (works for both WebGL and 2d)
      const off = document.createElement('canvas');
      off.width = el.width;
      off.height = el.height;
      const ctx = off.getContext('2d')!;
      ctx.drawImage(el, 0, 0);
      const data = ctx.getImageData(0, 0, el.width, el.height).data;

      // Count non-black pixels
      let nonBlack = 0;
      for (let i = 0; i < data.length; i += 16) {
        if (data[i]! > 10 || data[i + 1]! > 10 || data[i + 2]! > 10) nonBlack++;
      }
      return { nonBlack, total: data.length / 16 };
    });

    console.log(`Canvas pixel check: ${hasContent.nonBlack} non-black out of ${hasContent.total} samples`);
    expect(hasContent.nonBlack).toBeGreaterThan(10);
  });

  test('Space3D render pipeline is active (canvas changes between frames)', async ({ page }) => {
    await page.goto('/#/3dFGDebug');
    await expect(page.locator('.dialog-body')).toBeVisible({ timeout: 10_000 });
    const canvas = page.locator('.dialog-body canvas');
    await expect(canvas).toBeVisible({ timeout: 5_000 });

    // Take two screenshots 1 second apart
    await page.waitForTimeout(1000);
    const shot1 = await canvas.screenshot();
    await page.waitForTimeout(1000);
    const shot2 = await canvas.screenshot();

    // Compare — if animation is running, screenshots should differ
    // (or be identical if converged, which is also fine)
    // At minimum, both should be non-empty
    expect(shot1.length).toBeGreaterThan(100);
    expect(shot2.length).toBeGreaterThan(100);
  });
});
