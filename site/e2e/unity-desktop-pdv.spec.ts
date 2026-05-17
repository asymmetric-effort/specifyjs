import { test, expect } from '@playwright/test';

/**
 * Post-Deployment Verification: Unity Desktop Page Layout Demo
 *
 * Verifies the Unity Desktop demo in the component gallery's Page Layouts
 * section renders correctly and is interactive.
 */

test.describe('Unity Desktop PDV', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/components');
    // Wait for the component gallery dialog to render
    await expect(page.locator('.dialog-body')).toBeVisible({ timeout: 10000 });
    // Open the "Page Layouts" accordion section
    const pageLayoutsHeader = page.locator('button', { hasText: 'Page Layouts' });
    await pageLayoutsHeader.scrollIntoViewIfNeeded();
    await pageLayoutsHeader.click();
    // Click the "Unity Desktop" button inside the accordion
    const unityBtn = page.locator('button', { hasText: 'Unity Desktop' });
    await unityBtn.waitFor({ state: 'visible', timeout: 5000 });
    await unityBtn.click();
    // Wait for the Unity Desktop layout to appear
    await expect(page.locator('.unity-desktop')).toBeVisible({ timeout: 10000 });
  });

  // ── Dock visibility ──────────────────────────────────────────────────

  test('dock icons are visible with colored backgrounds', async ({ page }) => {
    const dock = page.locator('[role="toolbar"][aria-label="Application launcher"]');
    await expect(dock).toBeVisible();

    // Each dock icon button should exist
    const buttons = dock.locator('button[role="button"]');
    await expect(buttons).toHaveCount(8); // 8 apps in gallery demo

    // Each icon should have a visible colored background (not transparent/black)
    for (let i = 0; i < 8; i++) {
      const btn = buttons.nth(i);
      await expect(btn).toBeVisible();
      // The icon span inside should have a background-color that isn't transparent
      const iconSpan = btn.locator('span[aria-hidden="true"]');
      const bg = await iconSpan.evaluate((el) => getComputedStyle(el).backgroundColor);
      expect(bg).not.toBe('rgba(0, 0, 0, 0)');
      expect(bg).not.toBe('transparent');
      // Text should be white
      const color = await iconSpan.evaluate((el) => getComputedStyle(el).color);
      expect(color).toBe('rgb(255, 255, 255)');
    }
  });

  test('dock icon text is readable (not invisible)', async ({ page }) => {
    const dock = page.locator('[role="toolbar"][aria-label="Application launcher"]');
    const firstBtn = dock.locator('button[role="button"]').first();
    const text = await firstBtn.innerText();
    expect(text.trim().length).toBeGreaterThan(0);
  });

  // ── System tray / top panel ──────────────────────────────────────────

  test('clock displays date and time on a single line', async ({ page }) => {
    const clock = page.locator('[role="timer"]');
    await expect(clock).toBeVisible();
    // Clock should be single-line (flexDirection: row)
    const flexDir = await clock.evaluate((el) => getComputedStyle(el).flexDirection);
    expect(flexDir).toBe('row');
    // Clock height should be small (single line, not stacked)
    const box = await clock.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeLessThan(40); // single line won't exceed 40px
  });

  test('Activities button is present and clickable', async ({ page }) => {
    const activitiesBtn = page.locator('button[aria-label="Activities"]');
    await expect(activitiesBtn).toBeVisible();
  });

  test('clicking Activities shows app grid overlay', async ({ page }) => {
    const activitiesBtn = page.locator('button[aria-label="Activities"]');
    await activitiesBtn.click();
    // App grid should appear with app buttons
    const overlay = page.locator('button:has-text("Files")').last();
    await expect(overlay).toBeVisible();
  });

  // ── Dock click opens window ──────────────────────────────────────────

  test('clicking a dock icon opens a demo window', async ({ page }) => {
    const dock = page.locator('[role="toolbar"][aria-label="Application launcher"]');
    const firstBtn = dock.locator('button[role="button"]').first();
    await firstBtn.click();
    // Wait for microtask flush
    await page.waitForTimeout(200);
    // A DraggableWindow should appear (role="dialog")
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog.first()).toBeVisible();
  });

  test('opened window has title bar with controls', async ({ page }) => {
    const dock = page.locator('[role="toolbar"][aria-label="Application launcher"]');
    await dock.locator('button[role="button"]').first().click();
    await page.waitForTimeout(200);
    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toBeVisible();
    // Title bar with close/minimize/maximize buttons
    await expect(dialog.locator('[aria-label="Close"]')).toBeVisible();
    await expect(dialog.locator('[aria-label="Minimize"]')).toBeVisible();
  });

  test('opened window contains mock content', async ({ page }) => {
    const dock = page.locator('[role="toolbar"][aria-label="Application launcher"]');
    await dock.locator('button[role="button"]').first().click();
    await page.waitForTimeout(200);
    const dialog = page.locator('[role="dialog"]').first();
    // Window should have some text content (mock app)
    const text = await dialog.innerText();
    expect(text.length).toBeGreaterThan(10);
  });

  test('closing a window removes it from the desktop', async ({ page }) => {
    const dock = page.locator('[role="toolbar"][aria-label="Application launcher"]');
    await dock.locator('button[role="button"]').first().click();
    await page.waitForTimeout(200);
    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toBeVisible();
    // Click close
    await dialog.locator('[aria-label="Close"]').click();
    await page.waitForTimeout(200);
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);
  });

  // ── Multiple windows ─────────────────────────────────────────────────

  test('multiple dock icons open multiple windows', async ({ page }) => {
    const dock = page.locator('[role="toolbar"][aria-label="Application launcher"]');
    const buttons = dock.locator('button[role="button"]');
    await buttons.nth(0).click();
    await page.waitForTimeout(200);
    await buttons.nth(1).click();
    await page.waitForTimeout(200);
    const dialogs = page.locator('[role="dialog"]');
    await expect(dialogs).toHaveCount(2);
  });

  // ── No JS errors ─────────────────────────────────────────────────────

  test('no JavaScript errors during interaction', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    const dock = page.locator('[role="toolbar"][aria-label="Application launcher"]');
    await dock.locator('button[role="button"]').first().click();
    await page.waitForTimeout(300);

    expect(errors).toEqual([]);
  });

  // ── Lock & Logout ────────────────────────────────────────────────────

  test('user menu has Lock and Logout options', async ({ page }) => {
    // Open user menu
    const userTrigger = page.locator('[aria-haspopup="true"]');
    await userTrigger.click();
    await expect(page.locator('[role="menu"]')).toBeVisible();
    await expect(page.locator('[role="menuitem"]:has-text("Lock")')).toBeVisible();
    await expect(page.locator('[role="menuitem"]:has-text("Logout")')).toBeVisible();
  });

  test('Lock button shows lock overlay', async ({ page }) => {
    const userTrigger = page.locator('[aria-haspopup="true"]');
    await userTrigger.click();
    await page.locator('[role="menuitem"]:has-text("Lock")').click();
    // Lock overlay should cover the screen
    const overlay = page.locator('text=Locked');
    await expect(overlay).toBeVisible();
  });

  test('clicking lock overlay unlocks', async ({ page }) => {
    const userTrigger = page.locator('[aria-haspopup="true"]');
    await userTrigger.click();
    await page.locator('[role="menuitem"]:has-text("Lock")').click();
    await expect(page.locator('text=Locked')).toBeVisible();
    // Click to unlock
    await page.locator('text=Click to unlock').click();
    await expect(page.locator('text=Locked')).not.toBeVisible();
  });

  // ── Right-click context menu ─────────────────────────────────────────

  test('right-clicking dock icon shows context menu with About', async ({ page }) => {
    const dock = page.locator('[role="toolbar"][aria-label="Application launcher"]');
    const firstBtn = dock.locator('button[role="button"]').first();
    await firstBtn.click({ button: 'right' });
    await page.waitForTimeout(200);
    await expect(page.locator('text=About')).toBeVisible();
  });

  test('About context menu item shows app info dialog', async ({ page }) => {
    const dock = page.locator('[role="toolbar"][aria-label="Application launcher"]');
    const firstBtn = dock.locator('button[role="button"]').first();
    await firstBtn.click({ button: 'right' });
    await page.waitForTimeout(200);
    await page.locator('text=About').click();
    await expect(page.locator('text=MIT License')).toBeVisible();
  });

  // ── New app dock items ───────────────────────────────────────────────

  test('Word Processor app opens from dock', async ({ page }) => {
    const dock = page.locator('[role="toolbar"][aria-label="Application launcher"]');
    await dock.locator('[data-dock-item-id="word"]').click();
    await page.waitForTimeout(300);
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog.first()).toBeVisible();
  });

  test('IDE app opens from dock', async ({ page }) => {
    const dock = page.locator('[role="toolbar"][aria-label="Application launcher"]');
    await dock.locator('[data-dock-item-id="ide"]').click();
    await page.waitForTimeout(300);
    await expect(page.locator('[role="dialog"]').first()).toBeVisible();
  });
});
