/**
 * 3D Space Visual Validation (#64)
 *
 * PDV tests for /#/3dSpace that verify the canvas renders visible content,
 * has non-zero dimensions, and produces no WebGL or console errors.
 */

import { test, expect } from '@playwright/test';

test.describe('3D Space — Visual Validation', () => {
  test('canvas renders non-blank (screenshot has pixel variation)', async ({ page }) => {
    await page.goto('./#/3dSpace');
    await page.waitForTimeout(2000);

    const canvas = page.locator('.dialog-body canvas');
    await expect(canvas).toBeVisible({ timeout: 10_000 });

    // Take a screenshot of the canvas
    const screenshot = await canvas.screenshot();
    expect(screenshot).toBeTruthy();
    expect(screenshot.length).toBeGreaterThan(0);

    // Verify the canvas is not a single solid color by sampling pixels
    const hasVariation = await canvas.evaluate((el: HTMLCanvasElement) => {
      const ctx = el.getContext('2d');
      if (!ctx) return false;

      const w = el.width;
      const h = el.height;
      const data = ctx.getImageData(0, 0, w, h).data;

      // Sample pixels at different positions and check for variation
      const firstR = data[0];
      const firstG = data[1];
      const firstB = data[2];
      let different = 0;

      // Sample every 100th pixel for performance
      for (let i = 0; i < data.length; i += 400) {
        if (
          data[i] !== firstR ||
          data[i + 1] !== firstG ||
          data[i + 2] !== firstB
        ) {
          different++;
        }
        if (different > 10) return true;
      }

      return different > 0;
    });

    expect(hasVariation).toBe(true);
  });

  test('canvas has non-zero dimensions', async ({ page }) => {
    await page.goto('./#/3dSpace');
    const canvas = page.locator('.dialog-body canvas');
    await expect(canvas).toBeVisible({ timeout: 10_000 });

    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(100);
    expect(box!.height).toBeGreaterThan(100);

    // Also verify the underlying canvas element dimensions
    const dims = await canvas.evaluate((el: HTMLCanvasElement) => ({
      width: el.width,
      height: el.height,
    }));
    expect(dims.width).toBeGreaterThan(0);
    expect(dims.height).toBeGreaterThan(0);
  });

  test('no WebGL or console errors during render', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    // Also capture console.error messages (WebGL errors appear here)
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('./#/3dSpace');
    await page.waitForTimeout(3000);

    // Filter out known non-critical errors (e.g., favicon 404)
    const criticalErrors = errors.filter(
      (e) => !e.includes('favicon'),
    );
    const criticalConsoleErrors = consoleErrors.filter(
      (e) =>
        e.includes('WebGL') ||
        e.includes('GL_') ||
        e.includes('shader') ||
        e.includes('context lost'),
    );

    expect(criticalErrors).toEqual([]);
    expect(criticalConsoleErrors).toEqual([]);
  });

  test('canvas reaches stable render within 5 seconds', async ({ page }) => {
    await page.goto('./#/3dSpace');

    const canvas = page.locator('.dialog-body canvas');
    await expect(canvas).toBeVisible({ timeout: 10_000 });

    // Wait up to 5 seconds for the canvas to have non-uniform content
    let isRendered = false;
    for (let attempt = 0; attempt < 10; attempt++) {
      isRendered = await canvas.evaluate((el: HTMLCanvasElement) => {
        const ctx = el.getContext('2d');
        if (!ctx) return false;
        const data = ctx.getImageData(0, 0, el.width, el.height).data;
        for (let i = 0; i < data.length; i += 400) {
          if (data[i] !== 0 || data[i + 1] !== 0 || data[i + 2] !== 0) {
            return true;
          }
        }
        return false;
      });

      if (isRendered) break;
      await page.waitForTimeout(500);
    }

    expect(isRendered).toBe(true);
  });
});
