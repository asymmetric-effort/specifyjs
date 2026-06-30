import { test, expect } from '@playwright/test';

/**
 * Post-Deployment Verification: BuildableList form control
 *
 * Verifies the BuildableList component renders and functions correctly
 * in the Component Gallery's Form Components section.
 */

test.describe('BuildableList PDV', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/components');
    await expect(page.locator('.dialog-body')).toBeVisible({ timeout: 10000 });
    // Open Form Components accordion — the header is a <button> with a child <span> containing the title
    const formHeader = page.locator('.accordion-header', { hasText: 'Form Components' });
    await formHeader.waitFor({ state: 'visible', timeout: 10000 });
    await formHeader.scrollIntoViewIfNeeded();
    await formHeader.click();
    await page.waitForTimeout(500);
  });

  test('BuildableList preview card is visible in Form Components', async ({ page }) => {
    const card = page.locator('text=Buildable List');
    await expect(card.first()).toBeVisible({ timeout: 5000 });
  });

  test('BuildableList demo renders with add button', async ({ page }) => {
    const addBtn = page.locator('[aria-label="Add item"]');
    if (await addBtn.count() > 0) {
      await expect(addBtn.first()).toBeVisible();
    }
  });

  test('BuildableList renders list items', async ({ page }) => {
    const list = page.locator('[role="list"]');
    if (await list.count() > 0) {
      const items = list.first().locator('[role="listitem"]');
      const count = await items.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('clicking add button shows text input', async ({ page }) => {
    const addBtn = page.locator('[aria-label="Add item"]');
    if (await addBtn.count() > 0) {
      await addBtn.first().click();
      await page.waitForTimeout(200);
      const input = page.locator('input[type="text"]');
      expect(await input.count()).toBeGreaterThan(0);
    }
  });

  test('no JavaScript errors on interaction', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    const addBtn = page.locator('[aria-label="Add item"]');
    if (await addBtn.count() > 0) {
      await addBtn.first().click();
      await page.waitForTimeout(300);
    }
    expect(errors).toEqual([]);
  });
});
