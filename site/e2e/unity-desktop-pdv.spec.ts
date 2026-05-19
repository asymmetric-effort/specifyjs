import { test, expect } from '@playwright/test';

/**
 * Post-Deployment Verification: Unity Desktop Page Layout Demo
 *
 * Verifies the Unity Desktop demo in the component gallery's Page Layouts
 * section renders correctly and is interactive.
 *
 * IMPORTANT: All dialog/window selectors MUST be scoped to .unity-desktop
 * to avoid matching the component gallery's own dialog overlay.
 */

const desktop = '.unity-desktop';

test.describe('Unity Desktop PDV', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/components');
    await expect(page.locator('.dialog-body')).toBeVisible({ timeout: 15000 });
    const pageLayoutsHeader = page.locator('.accordion-header', { hasText: 'Page Layouts' });
    await pageLayoutsHeader.waitFor({ state: 'visible', timeout: 15000 });
    await pageLayoutsHeader.scrollIntoViewIfNeeded();
    await pageLayoutsHeader.click();
    await page.waitForTimeout(300);
    const unityBtn = page.locator('button', { hasText: 'Unity Desktop' }).last();
    await unityBtn.waitFor({ state: 'visible', timeout: 5000 });
    await unityBtn.click();
    await expect(page.locator(desktop)).toBeVisible({ timeout: 10000 });
  });

  // ── Dock visibility ──────────────────────────────────────────────────

  test('dock icons are visible with colored backgrounds', async ({ page }) => {
    const dock = page.locator(`${desktop} [role="toolbar"][aria-label="Application launcher"]`);
    await expect(dock).toBeVisible();
    const buttons = dock.locator('button[role="button"]');
    const count = await buttons.count();
    expect(count).toBeGreaterThanOrEqual(5);

    for (let i = 0; i < Math.min(count, 5); i++) {
      const btn = buttons.nth(i);
      await expect(btn).toBeVisible();
      const iconSpan = btn.locator('span[aria-hidden="true"]');
      const bg = await iconSpan.evaluate((el) => getComputedStyle(el).backgroundColor);
      expect(bg).not.toBe('rgba(0, 0, 0, 0)');
      expect(bg).not.toBe('transparent');
    }
  });

  // ── Dock click opens window (THE critical test) ──────────────────────

  test('clicking dock icon "F" opens a Files window inside unity-desktop', async ({ page }) => {
    const dock = page.locator(`${desktop} [role="toolbar"][aria-label="Application launcher"]`);
    const filesBtn = dock.locator('button[role="button"]').first();
    await filesBtn.click();

    // The window MUST appear inside .unity-desktop, not the gallery dialog
    const windowInDesktop = page.locator(`${desktop} [role="dialog"]`);
    await expect(windowInDesktop.first()).toBeVisible({ timeout: 10000 });

    // Verify the window has real dimensions (not clipped to zero)
    const winBox = await windowInDesktop.first().boundingBox();
    expect(winBox).not.toBeNull();
    expect(winBox!.width).toBeGreaterThan(100);
    expect(winBox!.height).toBeGreaterThan(100);

    // Verify the workspace container has real dimensions
    const workspace = page.locator(`${desktop} .unity-desktop__desktop`);
    const wsBox = await workspace.boundingBox();
    expect(wsBox).not.toBeNull();
    expect(wsBox!.width).toBeGreaterThan(100);
    expect(wsBox!.height).toBeGreaterThan(100);

    // Verify the window is within the workspace bounds (not clipped)
    if (wsBox && winBox) {
      expect(winBox.top).toBeGreaterThanOrEqual(wsBox.top - 10);
      expect(winBox.left).toBeGreaterThanOrEqual(wsBox.left - 10);
    }
  });

  test('opened window contains mock app content', async ({ page }) => {
    const dock = page.locator(`${desktop} [role="toolbar"][aria-label="Application launcher"]`);
    await dock.locator('button[role="button"]').first().click();

    const win = page.locator(`${desktop} [role="dialog"]`).first();
    await expect(win).toBeVisible({ timeout: 10000 });

    // Should contain app-specific content (Files shows Documents, Downloads, etc.)
    const text = await win.innerText();
    expect(text.length).toBeGreaterThan(5);
  });

  test('opened window has close button visible', async ({ page }) => {
    const dock = page.locator(`${desktop} [role="toolbar"][aria-label="Application launcher"]`);
    await dock.locator('button[role="button"]').first().click();
    const win = page.locator(`${desktop} [role="dialog"]`).first();
    await expect(win).toBeVisible({ timeout: 10000 });

    // Verify close button exists in the window
    const closeBtn = win.locator('[aria-label="Close"]');
    await expect(closeBtn).toBeVisible({ timeout: 5000 });
  });

  test('multiple dock clicks open multiple windows', async ({ page }) => {
    const dock = page.locator(`${desktop} [role="toolbar"][aria-label="Application launcher"]`);
    const buttons = dock.locator('button[role="button"]');

    await buttons.nth(0).click();
    await expect(page.locator(`${desktop} [role="dialog"]`)).toHaveCount(1, { timeout: 10000 });

    await buttons.nth(1).click();
    await expect(page.locator(`${desktop} [role="dialog"]`)).toHaveCount(2, { timeout: 10000 });
  });

  // ── System tray ──────────────────────────────────────────────────────

  test('clock displays on a single line', async ({ page }) => {
    const clock = page.locator(`${desktop} [role="timer"]`);
    await expect(clock).toBeVisible();
    const flexDir = await clock.evaluate((el) => getComputedStyle(el).flexDirection);
    expect(flexDir).toBe('row');
  });

  test('Activities button opens app grid', async ({ page }) => {
    await page.locator(`${desktop} button[aria-label="Activities"]`).click();
    const gridItem = page.locator(`${desktop} button:has-text("Files")`);
    await expect(gridItem).toBeVisible({ timeout: 5000 });
  });

  // ── Lock & Logout ────────────────────────────────────────────────────

  test('user menu has Lock and Logout', async ({ page }) => {
    const userTrigger = page.locator(`${desktop} [aria-haspopup="true"]`);
    await userTrigger.click();
    await expect(page.locator('[role="menu"]')).toBeVisible();
    await expect(page.locator('[role="menuitem"]:has-text("Lock")')).toBeVisible();
    await expect(page.locator('[role="menuitem"]:has-text("Logout")')).toBeVisible();
  });

  test('Lock overlay prevents interaction and can be dismissed', async ({ page }) => {
    await page.locator(`${desktop} [aria-haspopup="true"]`).click();
    await page.locator('[role="menuitem"]:has-text("Lock")').click();
    await expect(page.locator(`${desktop}:has-text("Locked")`)).toBeVisible();
    await page.locator('text=Click to unlock').click();
    await expect(page.locator('text=Locked')).not.toBeVisible();
  });

  // ── No JS errors ─────────────────────────────────────────────────────

  test('no JavaScript errors during dock interaction', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    const dock = page.locator(`${desktop} [role="toolbar"][aria-label="Application launcher"]`);
    await dock.locator('button[role="button"]').first().click();
    await page.waitForTimeout(500);

    expect(errors).toEqual([]);
  });
});
