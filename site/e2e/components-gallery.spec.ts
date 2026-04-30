import { test, expect } from '@playwright/test';

test.describe('Components Gallery', () => {
  test.beforeEach(async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/#/components');
    expect(errors).toEqual([]);
  });

  test('renders gallery heading', async ({ page }) => {
    await expect(page.locator('.dialog-title')).toContainText('Component Gallery');
  });

  test('displays all accordion sections', async ({ page }) => {
    const sections = page.locator('.dialog-body .accordion-section');
    await expect(sections).toHaveCount(11);
  });

  test('toggle component responds to clicks', async ({ page }) => {
    // Toggle component renders a div[role="switch"] with label text
    const toggle = page.locator('.dialog-body .preview-body').first().locator('[role="switch"]').first();
    await expect(toggle).toContainText('Off');
    await toggle.click();
    await expect(toggle).toContainText('On');
  });

  test('Charts & Graphs section renders SVG', async ({ page }) => {
    const body = page.locator('.dialog-body');
    await body.locator('.accordion-header:has-text("Charts & Graphs")').click();
    await expect(body.locator('.accordion-body svg').first()).toBeVisible({ timeout: 5000 });
  });

  test('Data & Analytics section renders content', async ({ page }) => {
    const body = page.locator('.dialog-body');
    await body.locator('.accordion-header:has-text("Data & Analytics")').click();
    await expect(body.locator('.accordion-body').last()).not.toBeEmpty();
  });

  test('Hierarchical & Relational section renders SVG', async ({ page }) => {
    const body = page.locator('.dialog-body');
    await body.locator('.accordion-header:has-text("Hierarchical")').click();
    await expect(body.locator('.accordion-body svg').first()).toBeVisible({ timeout: 5000 });
  });
});
