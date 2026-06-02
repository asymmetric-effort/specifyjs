// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { test, expect } from '@playwright/test';

/**
 * Post-Deployment Verification: Project Manager (Whiteboard)
 *
 * Verifies the Project Manager app inside the Unity Desktop component
 * gallery demo renders correctly with sample data and interactive toolbar.
 */

const desktop = '.unity-desktop';

test.describe('Project Manager PDV', () => {
  test.beforeEach(async ({ page }) => {
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

    // Click "Project Board" dock icon
    const dock = page.locator(`${desktop} [role="toolbar"][aria-label="Application launcher"]`);
    const boardBtn = dock.locator('button[role="button"]', { hasText: 'B' });
    await boardBtn.click();

    // Wait for the project manager window and board to initialize
    const projectWindow = page.locator(`${desktop} [role="dialog"]`).last();
    await expect(projectWindow).toBeVisible({ timeout: 10000 });
    // Wait for board toolbar to render (appears before cards)
    await expect(page.locator(`${desktop} [data-testid="board-toolbar"]`)).toBeVisible({ timeout: 10000 });
    // Extra settle time for sample data useEffect → dispatch → re-render
    await page.waitForTimeout(2000);
  });

  test('board app container renders', async ({ page }) => {
    // Verify the project manager app container is present inside the window
    const app = page.locator(`${desktop} [data-testid="project-manager-app"]`);
    await expect(app).toBeVisible({ timeout: 15000 });
  });

  test('toolbar is visible with controls', async ({ page }) => {
    const toolbar = page.locator(`${desktop} [data-testid="board-toolbar"]`);
    await expect(toolbar).toBeVisible({ timeout: 5000 });

    // Verify key controls exist
    await expect(page.locator(`${desktop} [data-testid="btn-new-card"]`)).toBeVisible();
    await expect(page.locator(`${desktop} [data-testid="btn-zoom-in"]`)).toBeVisible();
    await expect(page.locator(`${desktop} [data-testid="btn-zoom-out"]`)).toBeVisible();
    await expect(page.locator(`${desktop} [data-testid="zoom-level"]`)).toBeVisible();
    await expect(page.locator(`${desktop} [data-testid="btn-grid-toggle"]`)).toBeVisible();
    await expect(page.locator(`${desktop} [data-testid="search-input"]`)).toBeVisible();
  });

  test('board canvas is interactive', async ({ page }) => {
    const canvas = page.locator(`${desktop} [data-testid="board-canvas"]`);
    await expect(canvas).toBeVisible({ timeout: 5000 });

    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(50);
    expect(box!.height).toBeGreaterThan(50);
  });

  test('no JavaScript errors during board interaction', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    // Click new card
    const newCardBtn = page.locator(`${desktop} [data-testid="btn-new-card"]`);
    if (await newCardBtn.isVisible()) {
      await newCardBtn.click();
    }

    // Click zoom
    const zoomIn = page.locator(`${desktop} [data-testid="btn-zoom-in"]`);
    if (await zoomIn.isVisible()) {
      await zoomIn.click();
    }

    await page.waitForTimeout(500);
    expect(errors).toEqual([]);
  });
});
