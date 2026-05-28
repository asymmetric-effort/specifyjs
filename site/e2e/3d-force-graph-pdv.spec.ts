import { test, expect } from '@playwright/test';

/**
 * Post-Deployment Verification: 3D Force Graph AS Topology Demo
 *
 * Validates the entire deployed structure of the /#/3dForcedGraph route:
 * route loading, dialog structure, canvas rendering, sidebar content,
 * dataset presence, and absence of JS errors.
 */

test.describe('3D Force Graph AS Topology PDV', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./#/3dForcedGraph');
    await expect(page.locator('.dialog-body')).toBeVisible({ timeout: 15_000 });
  });

  // ── Route and structure ──────────────────────────────────────────────

  test('route loads with correct dialog title', async ({ page }) => {
    await expect(page.locator('.dialog-title')).toContainText('3D Force Graph');
  });

  test('no JavaScript errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.waitForTimeout(2000);
    expect(errors).toEqual([]);
  });

  // ── Canvas rendering ─────────────────────────────────────────────────

  /** @feature ForceGraph3DProps.width */
  /** @feature ForceGraph3DProps.height */
  test('canvas element is present and visible', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas.first()).toBeVisible({ timeout: 10_000 });
  });

  /** @feature ForceGraph3DProps.width */
  /** @feature ForceGraph3DProps.height */
  test('canvas has non-zero dimensions', async ({ page }) => {
    const canvas = page.locator('canvas').first();
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(100);
    expect(box!.height).toBeGreaterThan(100);
  });

  /** @feature ForceGraph3DProps.nodes */
  /** @feature ForceGraph3DProps.edges */
  /** @feature ForceGraph3DProps.backgroundColor */
  test('canvas is not blank (has rendered content)', async ({ page }) => {
    await page.waitForTimeout(3000); // let simulation run and render
    const canvas = page.locator('canvas').first();
    // Read actual pixel data from canvas in browser context.
    // For CPU pipeline (2d context), use getImageData directly.
    // For WebGL, draw to a 2d canvas first via drawImage.
    const hasContent = await canvas.evaluate((el: HTMLCanvasElement) => {
      // Create a 2d canvas and draw the source canvas onto it
      const offscreen = document.createElement('canvas');
      offscreen.width = el.width;
      offscreen.height = el.height;
      const ctx = offscreen.getContext('2d')!;
      ctx.drawImage(el, 0, 0);
      const data = ctx.getImageData(0, 0, el.width, el.height).data;
      // Sample pixels across the canvas and count non-black ones
      let nonBlack = 0;
      const step = Math.max(4, Math.floor(data.length / 1000)); // ~1000 samples
      for (let i = 0; i < data.length; i += step) {
        const r = data[i]!, g = data[i + 1]!, b = data[i + 2]!;
        if (r > 10 || g > 10 || b > 10) nonBlack++;
      }
      return nonBlack > 20; // at least 20 non-black samples out of ~1000
    });
    expect(hasContent).toBe(true);
  });

  // ── Sidebar content ──────────────────────────────────────────────────

  test('sidebar shows "Internet AS Topology" title', async ({ page }) => {
    const text = await page.locator('.dialog-body').innerText();
    expect(text).toContain('Internet AS Topology');
  });

  test('sidebar shows legend with tier descriptions', async ({ page }) => {
    const text = await page.locator('.dialog-body').innerText();
    expect(text).toContain('Tier 1');
    expect(text).toContain('Tier 2');
    expect(text).toContain('Tier 3');
  });

  /** @feature ForceGraph3DProps.nodes */
  /** @feature ForceGraph3DProps.edges */
  test('sidebar shows node and edge counts', async ({ page }) => {
    const text = await page.locator('.dialog-body').innerText();
    // Sidebar format is "Nodes: 35" and "Edges: 86"
    expect(text).toMatch(/Nodes:\s*\d+/);
    expect(text).toMatch(/Edges:\s*\d+/);
  });

  test('sidebar explains autonomous systems', async ({ page }) => {
    const text = await page.locator('.dialog-body').innerText();
    expect(text.toLowerCase()).toContain('autonomous system');
  });

  // ── Dataset validation ───────────────────────────────────────────────

  test('dataset includes known AS references in page', async ({ page }) => {
    // AS names appear as 3D labels on the canvas and possibly in the sidebar.
    // Check the full page text (sidebar + any rendered text).
    const text = await page.locator('.dialog-body').innerText();
    // The sidebar should reference BGP peering types or tier examples
    expect(text).toContain('BGP');
    // Verify the node count matches expected AS dataset size
    const nodeMatch = text.match(/Nodes:\s*(\d+)/);
    expect(nodeMatch).not.toBeNull();
    expect(parseInt(nodeMatch![1])).toBeGreaterThanOrEqual(30);
  });

  // ── Camera orbit ──────────────────────────────────────────────────────

  /** @feature ForceGraph3DProps.orbitControls */
  test('camera orbits — canvas pixel content changes between frames', async ({ page }) => {
    await page.waitForTimeout(3000); // let simulation settle and orbit start
    const canvas = page.locator('canvas').first();

    // Sample the center of the canvas where geometry is rendered
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
    expect(frame1).not.toBe(frame2);
  });

  // ── Mouse interaction stability ──────────────────────────────────────

  /** @feature ForceGraph3DProps.onNodeClick */
  /** @feature ForceGraph3DProps.onNodeRightClick */
  test('mouse click on canvas does not cause JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 10_000 });
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();

    await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.mouse.dblclick(box!.x + box!.width / 3, box!.y + box!.height / 3);
    await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2, { button: 'right' });
    await page.mouse.move(box!.x + 10, box!.y + 10);
    await page.waitForTimeout(1000);

    expect(errors).toEqual([]);
  });

  // ── Extended rendering stability ─────────────────────────────────────

  /** @feature ForceGraph3DProps.running */
  /** @feature ForceGraph3DProps.collisionEnabled */
  /** @feature ForceGraph3DProps.damping */
  test('no JS errors during extended rendering (5s)', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.waitForTimeout(5000);
    expect(errors).toEqual([]);
  });

  // ── Component Gallery integration ────────────────────────────────────

  test('3D Force Graph appears in Component Gallery', async ({ page }) => {
    await page.goto('./#/components');
    await expect(page.locator('.accordion')).toBeVisible({ timeout: 10_000 });

    // Open Data & Analytics section
    const section = page.locator('button.accordion-header', { hasText: 'Data & Analytics' });
    await section.click();
    await page.waitForTimeout(500);

    // Verify 3D Force Graph card exists
    const card = page.locator('.preview-card', { hasText: '3D Force Graph' });
    await expect(card).toBeVisible({ timeout: 5_000 });
  });
});
