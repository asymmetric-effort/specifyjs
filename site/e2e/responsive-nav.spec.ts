import { test, expect } from '@playwright/test';

/**
 * Responsive navigation tests.
 *
 * Verifies that the showcase site's navigation collapses into a hamburger
 * menu on mobile viewports and displays normally on desktop, matching the
 * NavWrapper component's automatic responsive behavior.
 */


// ── Desktop: nav links visible, no hamburger ───────────────────────────

test.describe('Desktop navigation (1920x1080)', () => {
  test.use({ viewport: { width: 1920, height: 1080 } });

  test('nav links are visible on desktop', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.nav-links')).toBeVisible({ timeout: 10000 });
  });

  test('hamburger button is hidden on desktop', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.nav-hamburger')).not.toBeVisible();
  });

  test('no JavaScript errors on desktop', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
    expect(errors).toEqual([]);
  });
});

// ── Tablet landscape: nav links visible ────────────────────────────────

test.describe('Tablet landscape (1024x768)', () => {
  test.use({ viewport: { width: 1024, height: 768 } });

  test('nav links are visible on tablet landscape', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.nav-links')).toBeVisible({ timeout: 10000 });
  });
});

// ── Mobile: hamburger visible, nav links hidden ────────────────────────

test.describe('Mobile navigation (393x852)', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test('hamburger button is visible on mobile', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.nav-hamburger')).toBeVisible({ timeout: 10000 });
  });

  test('nav links are hidden by default on mobile', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.nav-links')).not.toBeVisible();
  });

  test('hamburger button has correct aria attributes', async ({ page }) => {
    await page.goto('/');
    const btn = page.locator('.nav-hamburger');
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
    await expect(btn).toHaveAttribute('aria-label', 'Open menu');
  });

  test('clicking hamburger opens the nav menu', async ({ page }) => {
    await page.goto('/');
    await page.locator('.nav-hamburger').click();
    await expect(page.locator('.nav-links')).toBeVisible();
  });

  test('hamburger aria-expanded updates after toggle', async ({ page }) => {
    await page.goto('/');
    const btn = page.locator('.nav-hamburger');
    await btn.click();
    await expect(btn).toHaveAttribute('aria-expanded', 'true');
    await expect(btn).toHaveAttribute('aria-label', 'Close menu');
  });

  test('clicking hamburger again closes the menu', async ({ page }) => {
    await page.goto('/');
    const btn = page.locator('.nav-hamburger');
    await btn.click();
    await expect(page.locator('.nav-links')).toBeVisible();
    await btn.click();
    await expect(page.locator('.nav-links')).not.toBeVisible();
  });

  test('hamburger button is at least 44x44px (touch target)', async ({ page }) => {
    await page.goto('/');
    const btn = page.locator('.nav-hamburger');
    const box = await btn.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });

  test('nav menu shows all navigation links', async ({ page }) => {
    await page.goto('/');
    await page.locator('.nav-hamburger').click();
    // Check for key nav links
    await expect(page.locator('.nav-links >> text=Home')).toBeVisible();
    await expect(page.locator('.nav-links >> text=Components')).toBeVisible();
  });

  test('no JavaScript errors during mobile navigation', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/');
    await page.locator('.nav-hamburger').click();
    await page.waitForTimeout(200);
    await page.locator('.nav-hamburger').click();
    expect(errors).toEqual([]);
  });
});

// ── iPhone SE portrait ─────────────────────────────────────────────────

test.describe('iPhone SE (375x667)', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('hamburger visible on iPhone SE', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.nav-hamburger')).toBeVisible({ timeout: 10000 });
  });

  test('nav links hidden on iPhone SE', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.nav-links')).not.toBeVisible();
  });
});

// ── iPad portrait (768px breakpoint edge) ──────────────────────────────

test.describe('iPad portrait (768x1024)', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('nav links visible at exactly 768px (breakpoint boundary)', async ({ page }) => {
    await page.goto('/');
    // 768px is >= 768, so nav should be visible (hamburger at <768)
    await expect(page.locator('.nav-links')).toBeVisible({ timeout: 10000 });
  });
});

// ── Viewport resize transition ─────────────────────────────────────────

test.describe('Viewport resize', () => {
  test('resizing from desktop to mobile shows hamburger', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await expect(page.locator('.nav-links')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.nav-hamburger')).not.toBeVisible();

    // Resize to mobile
    await page.setViewportSize({ width: 393, height: 852 });
    await page.waitForTimeout(300);
    await expect(page.locator('.nav-hamburger')).toBeVisible();
  });

  test('resizing from mobile to desktop hides hamburger', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/');
    await expect(page.locator('.nav-hamburger')).toBeVisible({ timeout: 10000 });

    // Resize to desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(300);
    await expect(page.locator('.nav-links')).toBeVisible();
  });

  test('open mobile menu closes automatically on resize to desktop', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/');
    // Open mobile menu
    await page.locator('.nav-hamburger').click();
    await expect(page.locator('.nav-links')).toBeVisible();

    // Resize to desktop — menu should close and show inline
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(300);
    await expect(page.locator('.nav-links')).toBeVisible();
    await expect(page.locator('.nav-hamburger')).not.toBeVisible();
  });
});
