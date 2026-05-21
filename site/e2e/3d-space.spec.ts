import { test, expect } from '@playwright/test';

test.describe('3D Space Demo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/3dSpace');
  });

  test('renders dialog with title', async ({ page }) => {
    await expect(page.locator('.dialog-title')).toContainText('3D Space');
  });

  test('canvas element is present and wide enough for dual viewports', async ({ page }) => {
    const canvas = page.locator('.dialog-body canvas');
    await expect(canvas).toBeVisible();
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(400); // Wide enough for two viewports
    expect(box!.height).toBeGreaterThan(100);
  });

  test('no JavaScript errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/#/3dSpace');
    await expect(page.locator('.dialog-title')).toContainText('3D Space');
    await page.waitForTimeout(2000);
    expect(errors).toEqual([]);
  });

  test('canvas renders content (not blank)', async ({ page }) => {
    await page.waitForTimeout(1000);
    const canvas = page.locator('.dialog-body canvas');
    const isBlank = await canvas.evaluate((el: HTMLCanvasElement) => {
      const ctx = el.getContext('2d');
      if (!ctx) return true;
      const data = ctx.getImageData(0, 0, el.width, el.height).data;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] !== 0 || data[i + 1] !== 0 || data[i + 2] !== 0) return false;
      }
      return true;
    });
    expect(isBlank).toBe(false);
  });

  test('both viewports have rendered content (left and right halves)', async ({ page }) => {
    await page.waitForTimeout(1000);
    const canvas = page.locator('.dialog-body canvas');
    const bothHalvesRendered = await canvas.evaluate((el: HTMLCanvasElement) => {
      const ctx = el.getContext('2d');
      if (!ctx) return false;
      const w = el.width;
      const h = el.height;
      // Check left quarter (viewport 1)
      const leftData = ctx.getImageData(w / 4, h / 2, 1, 1).data;
      const leftHasContent = leftData[0] !== 0 || leftData[1] !== 0 || leftData[2] !== 0;
      // Check right quarter (viewport 2)
      const rightData = ctx.getImageData((3 * w) / 4, h / 2, 1, 1).data;
      const rightHasContent = rightData[0] !== 0 || rightData[1] !== 0 || rightData[2] !== 0;
      return leftHasContent && rightHasContent;
    });
    expect(bothHalvesRendered).toBe(true);
  });

  test('sidebar mentions dual viewports', async ({ page }) => {
    const body = page.locator('.dialog-body');
    await expect(body).toContainText('Dual Viewport');
    await expect(body).toContainText('Perspective');
    await expect(body).toContainText('Top-Down');
  });

  test('sidebar lists all five boxes', async ({ page }) => {
    const body = page.locator('.dialog-body');
    for (const color of ['Red', 'Green', 'Blue', 'Yellow', 'Cyan']) {
      await expect(body).toContainText(color);
    }
  });

  test('close button returns to home', async ({ page }) => {
    await page.locator('.dialog-close').click();
    await expect(page.locator('.dialog-title')).not.toBeVisible();
  });
});
