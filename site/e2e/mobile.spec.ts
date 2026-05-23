import { test, expect, devices } from '@playwright/test';

test.use({ ...devices['iPhone 13'] });

test.describe('Mobile Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('page loads without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.waitForSelector('.hero');
    expect(errors).toEqual([]);
  });

  test('no horizontal overflow on home page', async ({ page }) => {
    await page.waitForSelector('.hero');
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
  });

  test('hamburger menu is visible on mobile', async ({ page }) => {
    await page.waitForSelector('.nav-bar');
    const hamburger = page.locator('.nav-hamburger');
    await expect(hamburger).toBeVisible();
  });

  test('nav links are hidden by default on mobile', async ({ page }) => {
    await page.waitForSelector('.nav-bar');
    const navLinks = page.locator('.nav-links');
    await expect(navLinks).toBeHidden();
  });

  test('hamburger menu reveals nav links when tapped', async ({ page }) => {
    await page.waitForSelector('.nav-bar');
    const hamburger = page.locator('.nav-hamburger');
    const navLinks = page.locator('.nav-links');

    await expect(navLinks).toBeHidden();
    await hamburger.click();
    await expect(navLinks).toBeVisible();
    await expect(navLinks).toHaveClass(/nav-links--open/);
  });

  test('hamburger menu hides nav links when tapped again', async ({ page }) => {
    await page.waitForSelector('.nav-bar');
    const hamburger = page.locator('.nav-hamburger');
    const navLinks = page.locator('.nav-links');

    await hamburger.click();
    await expect(navLinks).toBeVisible();
    await hamburger.click();
    await expect(navLinks).toBeHidden();
  });

  test('feature cards are stacked vertically', async ({ page }) => {
    await page.waitForSelector('.features-grid');
    const grid = page.locator('.features-grid');
    const gridColumns = await grid.evaluate((el) =>
      window.getComputedStyle(el).getPropertyValue('grid-template-columns'),
    );
    // On mobile, should be a single column
    const columnCount = gridColumns.trim().split(/\s+/).length;
    expect(columnCount).toBe(1);
  });

  test('dialog renders full-width on mobile', async ({ page }) => {
    await page.waitForSelector('.feature-card');
    await page.locator('.feature-card').first().click();
    await page.waitForSelector('.dialog-panel');

    const panelBox = await page.locator('.dialog-panel').boundingBox();
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(panelBox).not.toBeNull();
    // Panel should span the full viewport width (allow 2px tolerance)
    expect(panelBox!.width).toBeGreaterThanOrEqual(viewportWidth - 2);
  });

  test('dialog close button has adequate touch target', async ({ page }) => {
    await page.locator('.feature-card').first().click();
    await page.waitForSelector('.dialog-close');
    const closeBox = await page.locator('.dialog-close').boundingBox();
    expect(closeBox).not.toBeNull();
    expect(closeBox!.width).toBeGreaterThanOrEqual(44);
    expect(closeBox!.height).toBeGreaterThanOrEqual(44);
  });

  test('touch targets are at least 44x44px', async ({ page }) => {
    await page.waitForSelector('.nav-bar');
    // Check hamburger button
    const hamburgerBox = await page.locator('.nav-hamburger').boundingBox();
    expect(hamburgerBox).not.toBeNull();
    expect(hamburgerBox!.width).toBeGreaterThanOrEqual(44);
    expect(hamburgerBox!.height).toBeGreaterThanOrEqual(44);

    // Check dark mode toggle if visible
    const darkToggle = page.locator('.dark-mode-toggle');
    if (await darkToggle.isVisible()) {
      const toggleBox = await darkToggle.boundingBox();
      expect(toggleBox).not.toBeNull();
      expect(toggleBox!.width).toBeGreaterThanOrEqual(44);
      expect(toggleBox!.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('hero section adapts to mobile', async ({ page }) => {
    await page.waitForSelector('.hero h1');
    const h1FontSize = await page.locator('.hero h1').evaluate((el) =>
      parseFloat(window.getComputedStyle(el).fontSize),
    );
    // Mobile hero should be smaller than desktop 48px
    expect(h1FontSize).toBeLessThanOrEqual(32);
    expect(h1FontSize).toBeGreaterThanOrEqual(20);
  });

  test('no elements overflow viewport width', async ({ page }) => {
    await page.waitForSelector('.hero');
    const hasOverflow = await page.evaluate(() => {
      const vw = window.innerWidth;
      const elements = document.querySelectorAll('*');
      let overflow = false;
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.right > vw + 2 && rect.width > 0) {
          overflow = true;
        }
      });
      return overflow;
    });
    expect(hasOverflow).toBe(false);
  });
});
