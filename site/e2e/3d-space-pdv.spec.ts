import { test, expect } from '@playwright/test';

test.describe('3D Space — PDV', () => {
  test('/#/3dSpace route is accessible without JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/#/3dSpace');
    await expect(page.locator('.dialog-title')).toContainText('3D Space');
    expect(errors).toEqual([]);
  });

  test('dialog title renders correctly', async ({ page }) => {
    await page.goto('/#/3dSpace');
    const title = page.locator('.dialog-title');
    await expect(title).toBeVisible();
    await expect(title).toHaveText('3D Space');
  });

  test('canvas is visible with non-zero dimensions', async ({ page }) => {
    await page.goto('/#/3dSpace');
    const canvas = page.locator('.dialog-body canvas');
    await expect(canvas).toBeVisible();
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(100);
    expect(box!.height).toBeGreaterThan(100);
  });

  test('canvas renders content (not blank)', async ({ page }) => {
    await page.goto('/#/3dSpace');
    await page.waitForTimeout(1000); // Wait for first frames
    const canvas = page.locator('.dialog-body canvas');
    const isBlank = await canvas.evaluate((el: HTMLCanvasElement) => {
      const ctx = el.getContext('2d') || el.getContext('webgl');
      if (!ctx) return true;
      if ('getImageData' in ctx) {
        const data = ctx.getImageData(0, 0, el.width, el.height).data;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i] !== 0 || data[i + 1] !== 0 || data[i + 2] !== 0) return false;
        }
        return true;
      }
      const pixels = new Uint8Array(4);
      (ctx as WebGLRenderingContext).readPixels(
        Math.floor(el.width / 2), Math.floor(el.height / 2), 1, 1,
        (ctx as WebGLRenderingContext).RGBA, (ctx as WebGLRenderingContext).UNSIGNED_BYTE, pixels,
      );
      return pixels[0] === 0 && pixels[1] === 0 && pixels[2] === 0;
    });
    expect(isBlank).toBe(false);
  });

  test('no JS errors during animation', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/#/3dSpace');
    await expect(page.locator('.dialog-body canvas')).toBeVisible();
    await page.waitForTimeout(3000); // Let animation run for several frames
    expect(errors).toEqual([]);
  });

  test('no broken layout — dialog body has non-zero dimensions', async ({ page }) => {
    await page.goto('/#/3dSpace');
    const body = page.locator('.dialog-body');
    await expect(body).toBeVisible();
    const box = await body.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(100);
    expect(box!.height).toBeGreaterThan(100);
  });

  test('sidebar content renders — About section', async ({ page }) => {
    await page.goto('/#/3dSpace');
    await expect(page.locator('.dialog-body')).toBeVisible();
    const body = page.locator('.dialog-body');
    await expect(body).toContainText('About This Demo');
    await expect(body).toContainText('3dSpace');
  });

  test('sidebar content renders — Scene Objects list', async ({ page }) => {
    await page.goto('/#/3dSpace');
    await expect(page.locator('.dialog-body')).toBeVisible();
    const body = page.locator('.dialog-body');
    for (const label of ['Red', 'Green', 'Blue', 'Yellow', 'Cyan']) {
      await expect(body).toContainText(label);
    }
  });
});
