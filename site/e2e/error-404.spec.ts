import { test, expect } from '@playwright/test';

test.describe('404 Error Handling', () => {
  test('shows 404 for non-existent hash route', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/#/this-route-does-not-exist');
    await expect(page.locator('.dialog-title')).toContainText('Not Found');
    await expect(page.locator('.dialog-body')).toContainText('404');
    expect(errors).toEqual([]);
  });

  test('404 page has go home action', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/#/this-route-does-not-exist');
    await expect(page.locator('.dialog-title')).toContainText('Not Found');

    // Find and click the "Go Home" button
    const goHomeButton = page.locator('button', { hasText: /go home/i });
    await expect(goHomeButton).toBeVisible();
    await goHomeButton.click();

    // Verify navigation back to home
    await expect(page.locator('.dialog-backdrop')).toHaveCount(0);
    await expect(page.locator('h1')).toContainText('SpecifyJS');
    expect(errors).toEqual([]);
  });

  test('valid routes still work', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/#/docs');
    await expect(page.locator('.dialog-title')).toContainText('Documentation');
    // Ensure it does not show 404
    await expect(page.locator('.dialog-title')).not.toContainText('Not Found');
    expect(errors).toEqual([]);
  });

  test('404.html is generated in build output', async ({ request }) => {
    // Verify that /404.html is served (GitHub Pages uses this for SPA fallback)
    const baseURL = process.env.SITE_URL || 'https://specifyjs.asymmetric-effort.com';
    const resp = await request.head(`${baseURL}/404.html`, {
      timeout: 10_000,
      ignoreHTTPSErrors: true,
    });
    // Should return 200 — GitHub Pages serves the custom 404.html
    expect(resp.status()).toBeLessThan(400);
  });
});
