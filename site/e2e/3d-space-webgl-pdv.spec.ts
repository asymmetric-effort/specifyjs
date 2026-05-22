import { test, expect } from '@playwright/test';

test.describe('3D Space WebGL — PDV', () => {
  test('route loads without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('./#/3dSpaceWebGl');
    await expect(page.locator('.dialog-title')).toContainText('3D Space (WebGL)');
    expect(errors).toEqual([]);
  });

  test('canvas is visible', async ({ page }) => {
    await page.goto('./#/3dSpaceWebGl');
    const canvas = page.locator('.dialog-body canvas');
    await expect(canvas).toBeVisible();
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(100);
    expect(box!.height).toBeGreaterThan(100);
  });

  test('canvas renders content (not blank)', async ({ page }) => {
    await page.goto('./#/3dSpaceWebGl');
    await page.waitForTimeout(1000);
    const canvas = page.locator('.dialog-body canvas');
    const isBlank = await canvas.evaluate((el: HTMLCanvasElement) => {
      const gl = el.getContext('webgl');
      if (!gl) return true;
      const pixels = new Uint8Array(4);
      gl.readPixels(
        Math.floor(el.width / 2), Math.floor(el.height / 2),
        1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels,
      );
      return pixels[0] === 0 && pixels[1] === 0 && pixels[2] === 0 && pixels[3] === 0;
    });
    expect(isBlank).toBe(false);
  });

  test('no JS errors during animation', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('./#/3dSpaceWebGl');
    await page.waitForTimeout(3000);
    expect(errors).toEqual([]);
  });

  test('sidebar describes WebGL pipeline', async ({ page }) => {
    await page.goto('./#/3dSpaceWebGl');
    const body = page.locator('.dialog-body');
    await expect(body).toContainText('WebGL Pipeline');
    await expect(body).toContainText('FlatShading');
  });
});
