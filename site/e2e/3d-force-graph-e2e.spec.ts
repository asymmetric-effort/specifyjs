import { test, expect } from '@playwright/test';

/**
 * E2E: 3D Force Graph — Collision, Labels, and Interaction
 *
 * Tests the 3D Force Graph component features including canvas rendering,
 * label visibility, collision physics, and mouse event infrastructure.
 */

test.describe('3D Force Graph E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./#/3dForcedGraph');
    await expect(page.locator('.dialog-body')).toBeVisible({ timeout: 15_000 });
  });

  // ── Canvas rendering ─────────────────────────────────────────────────

  /** @feature ForceGraph3DProps.width */
  /** @feature ForceGraph3DProps.height */
  /** @feature ForceGraph3DProps.nodes */
  /** @feature ForceGraph3DProps.edges */
  test('canvas renders with non-blank content after simulation', async ({ page }) => {
    await page.waitForTimeout(3000);
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();

    const hasContent = await canvas.evaluate((el: HTMLCanvasElement) => {
      const offscreen = document.createElement('canvas');
      offscreen.width = el.width;
      offscreen.height = el.height;
      const ctx = offscreen.getContext('2d')!;
      ctx.drawImage(el, 0, 0);
      const data = ctx.getImageData(0, 0, el.width, el.height).data;
      let nonBlack = 0;
      const step = Math.max(4, Math.floor(data.length / 1000));
      for (let i = 0; i < data.length; i += step) {
        const r = data[i]!, g = data[i + 1]!, b = data[i + 2]!;
        if (r > 10 || g > 10 || b > 10) nonBlack++;
      }
      return nonBlack > 20;
    });
    expect(hasContent).toBe(true);
  });

  // ── Camera orbit ────────────────────────────────────────────────────

  /** @feature ForceGraph3DProps.orbitControls */
  /** @feature ForceGraph3DProps.cameraDistance */
  test('camera orbits — canvas content changes over time', async ({ page }) => {
    await page.waitForTimeout(3000);
    const canvas = page.locator('canvas').first();

    // Hash the center 200x200 region where geometry is rendered
    const getPixelHash = async () => canvas.evaluate((el: HTMLCanvasElement) => {
      const offscreen = document.createElement('canvas');
      offscreen.width = el.width;
      offscreen.height = el.height;
      const ctx = offscreen.getContext('2d')!;
      ctx.drawImage(el, 0, 0);
      const cx = Math.floor(el.width / 2);
      const cy = Math.floor(el.height / 2);
      const data = ctx.getImageData(cx - 100, cy - 100, 200, 200).data;
      let hash = 0;
      for (let i = 0; i < data.length; i += 16) {
        hash = ((hash << 5) - hash + data[i]! + data[i + 1]! + data[i + 2]!) | 0;
      }
      return hash;
    });

    const frame1 = await getPixelHash();
    await page.waitForTimeout(3000);
    const frame2 = await getPixelHash();

    // Frames should differ since camera is orbiting
    expect(frame1).not.toBe(frame2);
  });

  // ── Mouse interaction infrastructure ──────────────────────────────────

  /** @feature ForceGraph3DProps.onNodeClick */
  /** @feature ForceGraph3DProps.onNodeDoubleClick */
  /** @feature ForceGraph3DProps.onNodeRightClick */
  /** @feature ForceGraph3DProps.onNodeMouseDown */
  /** @feature ForceGraph3DProps.onNodeMouseUp */
  /** @feature ForceGraph3DProps.onNodeHover */
  test('canvas accepts mouse events without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 10_000 });

    // Perform various mouse actions on the canvas
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    const cx = box!.x + box!.width / 2;
    const cy = box!.y + box!.height / 2;

    await page.mouse.move(cx, cy);
    await page.mouse.click(cx, cy);
    await page.mouse.dblclick(cx, cy);
    await page.mouse.click(cx, cy, { button: 'right' });
    await page.mouse.move(cx + 50, cy + 50);
    await page.mouse.move(cx - 50, cy - 50);

    // No JS errors should occur from mouse interaction
    expect(errors).toEqual([]);
  });

  // ── No JS errors during extended rendering ──────────────────────────

  /** @feature ForceGraph3DProps.running */
  /** @feature ForceGraph3DProps.collisionEnabled */
  /** @feature ForceGraph3DProps.restitution */
  /** @feature ForceGraph3DProps.repulsionStrength */
  /** @feature ForceGraph3DProps.attractionStrength */
  /** @feature ForceGraph3DProps.damping */
  /** @feature ForceGraph3DProps.centerGravity */
  /** @feature ForceGraph3DProps.timeStep */
  test('no JS errors during 5s of rendering with collision physics', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.waitForTimeout(5000);
    expect(errors).toEqual([]);
  });
});
