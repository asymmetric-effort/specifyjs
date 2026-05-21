import { test, expect } from '@playwright/test';

test.describe('3D Space Demo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/3dSpace');
  });

  test('renders dialog with title', async ({ page }) => {
    await expect(page.locator('.dialog-title')).toContainText('3D Space');
  });

  test('canvas element is present', async ({ page }) => {
    const canvas = page.locator('.dialog-body canvas');
    await expect(canvas).toBeVisible();
  });

  test('canvas has non-zero dimensions', async ({ page }) => {
    const canvas = page.locator('.dialog-body canvas');
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(100);
    expect(box!.height).toBeGreaterThan(100);
  });

  test('no JavaScript errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/#/3dSpace');
    await expect(page.locator('.dialog-title')).toContainText('3D Space');
    await page.waitForTimeout(2000); // Let animation run
    expect(errors).toEqual([]);
  });

  // Canvas pixel test — verify something renders (not all black)
  test('canvas renders content (not blank)', async ({ page }) => {
    await page.waitForTimeout(1000); // Wait for first frames
    const canvas = page.locator('.dialog-body canvas');
    const isBlank = await canvas.evaluate((el: HTMLCanvasElement) => {
      const ctx = el.getContext('2d') || el.getContext('webgl');
      if (!ctx) return true;
      // For 2D context, check pixels
      if ('getImageData' in ctx) {
        const data = ctx.getImageData(0, 0, el.width, el.height).data;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i] !== 0 || data[i + 1] !== 0 || data[i + 2] !== 0) return false;
        }
        return true;
      }
      // For WebGL, read pixels
      const pixels = new Uint8Array(4);
      (ctx as WebGLRenderingContext).readPixels(
        Math.floor(el.width / 2), Math.floor(el.height / 2), 1, 1,
        (ctx as WebGLRenderingContext).RGBA, (ctx as WebGLRenderingContext).UNSIGNED_BYTE, pixels,
      );
      return pixels[0] === 0 && pixels[1] === 0 && pixels[2] === 0;
    });
    expect(isBlank).toBe(false);
  });

  test('close button returns to home', async ({ page }) => {
    await expect(page.locator('.dialog-title')).toContainText('3D Space');
    await page.locator('.dialog-close').click();
    await expect(page.locator('.dialog-title')).not.toBeVisible();
  });

  test('sidebar content is visible', async ({ page }) => {
    await expect(page.locator('.dialog-body')).toBeVisible();
    const body = page.locator('.dialog-body');
    await expect(body).toContainText('About This Demo');
    await expect(body).toContainText('Scene Objects');
    await expect(body).toContainText('Camera Orbit');
    await expect(body).toContainText('Rendering Pipeline');
  });

  test('sidebar lists all five boxes', async ({ page }) => {
    await expect(page.locator('.dialog-body')).toBeVisible();
    const body = page.locator('.dialog-body');
    await expect(body).toContainText('Red');
    await expect(body).toContainText('Green');
    await expect(body).toContainText('Blue');
    await expect(body).toContainText('Yellow');
    await expect(body).toContainText('Cyan');
  });
});
