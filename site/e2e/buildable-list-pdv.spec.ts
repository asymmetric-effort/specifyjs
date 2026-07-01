import { test, expect } from '@playwright/test';

/**
 * Post-Deployment Verification: BuildableList form control
 *
 * Verifies the BuildableList component renders in the Component Gallery.
 * Tests are gracefully skipped if the accordion content hasn't propagated.
 */

test.describe('BuildableList PDV', () => {
  test('BuildableList is accessible in the Component Gallery', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/#/components');
    await expect(page.locator('.dialog-body')).toBeVisible({ timeout: 10000 });

    // Click Form Components accordion header
    const formHeader = page.locator('.accordion-header', { hasText: 'Form Components' });
    await formHeader.waitFor({ state: 'visible', timeout: 10000 });
    await formHeader.scrollIntoViewIfNeeded();
    await formHeader.click();
    await page.waitForTimeout(1500);

    // Check if accordion expanded and BuildableList is present
    const dialogBody = page.locator('.dialog-body');
    const bodyText = await dialogBody.innerText();
    expect(bodyText).toContain('Buildable List');

    // Verify no JS errors
    expect(errors).toEqual([]);
  });

  test('BuildableList add button is rendered', async ({ page }) => {
    await page.goto('/#/components');
    await expect(page.locator('.dialog-body')).toBeVisible({ timeout: 10000 });

    const formHeader = page.locator('.accordion-header', { hasText: 'Form Components' });
    await formHeader.waitFor({ state: 'visible', timeout: 10000 });
    await formHeader.scrollIntoViewIfNeeded();
    await formHeader.click();
    await page.waitForTimeout(1500);

    // Look for the add button within the dialog
    const addBtn = page.locator('[aria-label="Add item"]');
    const count = await addBtn.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});
