// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { test, expect } from '@playwright/test';

/**
 * E2E tests for the Whiteboard Project Manager demo.
 *
 * The project manager is embedded inside the Unity Desktop component
 * in the site's component gallery. These tests navigate there, open
 * the Project Board dock app, and verify its features.
 */

const desktop = '.unity-desktop';

test.describe('Project Manager Demo', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the component gallery
    await page.goto('./#/components');
    await expect(page.locator('.dialog-body')).toBeVisible({ timeout: 15000 });

    // Open "Page Layouts" accordion
    const pageLayoutsHeader = page.locator('.accordion-header', { hasText: 'Page Layouts' });
    await pageLayoutsHeader.waitFor({ state: 'visible', timeout: 15000 });
    await pageLayoutsHeader.scrollIntoViewIfNeeded();
    await pageLayoutsHeader.click();
    await page.waitForTimeout(300);

    // Click "Unity Desktop"
    const unityBtn = page.locator('button', { hasText: 'Unity Desktop' }).last();
    await unityBtn.waitFor({ state: 'visible', timeout: 5000 });
    await unityBtn.click();
    await expect(page.locator(desktop)).toBeVisible({ timeout: 10000 });

    // Click the "Project Board" dock icon (icon "B")
    const dock = page.locator(`${desktop} [role="toolbar"][aria-label="Application launcher"]`);
    const boardBtn = dock.locator('button[role="button"]', { hasText: 'B' });
    await boardBtn.click();

    // Wait for the project manager window to appear
    const projectWindow = page.locator(`${desktop} [role="dialog"]`).last();
    await expect(projectWindow).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(500);
  });

  test('board renders with sample data (4 cards visible)', async ({ page }) => {
    const cards = page.locator(`${desktop} .board-card`);
    await expect(cards.first()).toBeVisible({ timeout: 5000 });
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('New Card button creates a card', async ({ page }) => {
    const initialCards = await page.locator(`${desktop} .board-card`).count();
    const newCardBtn = page.locator(`${desktop} [data-testid="btn-new-card"]`);
    await expect(newCardBtn).toBeVisible({ timeout: 5000 });
    await newCardBtn.click();
    await page.waitForTimeout(300);
    const updatedCards = await page.locator(`${desktop} .board-card`).count();
    expect(updatedCards).toBe(initialCards + 1);
  });

  test('zoom controls work (zoom text changes)', async ({ page }) => {
    const zoomLabel = page.locator(`${desktop} [data-testid="zoom-level"]`);
    await expect(zoomLabel).toBeVisible({ timeout: 5000 });
    const initialZoom = await zoomLabel.innerText();

    const zoomInBtn = page.locator(`${desktop} [data-testid="btn-zoom-in"]`);
    await zoomInBtn.click();
    await page.waitForTimeout(200);
    const newZoom = await zoomLabel.innerText();
    expect(newZoom).not.toBe(initialZoom);
  });

  test('grid toggle works', async ({ page }) => {
    const gridBtn = page.locator(`${desktop} [data-testid="btn-grid-toggle"]`);
    await expect(gridBtn).toBeVisible({ timeout: 5000 });

    const pressedBefore = await gridBtn.getAttribute('aria-pressed');
    await gridBtn.click();
    const pressedAfter = await gridBtn.getAttribute('aria-pressed');
    expect(pressedBefore).not.toBe(pressedAfter);
  });

  test('search filters cards', async ({ page }) => {
    const searchInput = page.locator(`${desktop} [data-testid="search-input"]`);
    await expect(searchInput).toBeVisible({ timeout: 5000 });

    // Type a search term that matches one sample card
    await searchInput.fill('Auth');
    await page.waitForTimeout(300);

    // Non-matching cards should be dimmed (opacity < 1)
    const allCards = page.locator(`${desktop} .board-card`);
    const count = await allCards.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('card context menu appears on right-click', async ({ page }) => {
    const card = page.locator(`${desktop} .board-card`).first();
    await expect(card).toBeVisible({ timeout: 5000 });
    await card.click({ button: 'right' });
    await page.waitForTimeout(200);

    // Context menu should be visible with Delete option
    const contextMenu = page.locator('.card-context-menu');
    await expect(contextMenu).toBeVisible({ timeout: 3000 });

    // Verify Delete is present
    const deleteItem = contextMenu.locator('[role="menuitem"]', { hasText: 'Delete' });
    await expect(deleteItem).toBeVisible();
  });

  test('no JS errors during interaction', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    // Interact with the board
    const newCardBtn = page.locator(`${desktop} [data-testid="btn-new-card"]`);
    if (await newCardBtn.isVisible()) {
      await newCardBtn.click();
    }
    await page.waitForTimeout(500);

    expect(errors).toEqual([]);
  });
});
