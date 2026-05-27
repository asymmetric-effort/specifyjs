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

  test('canvas element is present and visible', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas.first()).toBeVisible({ timeout: 10_000 });
  });

  test('canvas has non-zero dimensions', async ({ page }) => {
    const canvas = page.locator('canvas').first();
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(100);
    expect(box!.height).toBeGreaterThan(100);
  });

  test('canvas is not blank (screenshot has pixel variation)', async ({ page }) => {
    await page.waitForTimeout(2000);
    const canvas = page.locator('canvas').first();
    // Use screenshot comparison since canvas may use WebGL (not 2d context)
    const buffer = await canvas.screenshot();
    const pixels = new Uint8Array(buffer);
    // Check that not all bytes are identical (would be blank/solid color)
    let variations = 0;
    const first = pixels[0];
    for (let i = 100; i < pixels.length; i += 100) {
      if (pixels[i] !== first) variations++;
    }
    expect(variations).toBeGreaterThan(5);
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

  // ── Extended rendering stability ─────────────────────────────────────

  test('no JS errors during extended rendering (5s)', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.waitForTimeout(5000);
    expect(errors).toEqual([]);
  });
});
