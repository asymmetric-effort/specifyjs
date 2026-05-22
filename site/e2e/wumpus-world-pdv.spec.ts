import { test, expect } from '@playwright/test';

test.describe('Wumpus World — PDV', () => {
  test('/#/wumpus route is accessible without JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('./#/wumpus');
    await expect(page.locator('.dialog-title')).toContainText('Wumpus World');
    expect(errors).toEqual([]);
  });

  test('dialog title renders correctly', async ({ page }) => {
    await page.goto('./#/wumpus');
    const title = page.locator('.dialog-title');
    await expect(title).toBeVisible();
    await expect(title).toHaveText('Wumpus World');
  });

  test('grid SVG renders with non-zero dimensions', async ({ page }) => {
    await page.goto('./#/wumpus');
    const svg = page.locator('.dialog-body svg');
    await expect(svg).toBeVisible();
    const box = await svg.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(0);
    expect(box!.height).toBeGreaterThan(0);
  });

  test('control buttons are present', async ({ page }) => {
    await page.goto('./#/wumpus');
    await expect(page.locator('.dialog-body')).toBeVisible();
    const buttons = ['Forward', 'Turn Left', 'Turn Right', 'Shoot', 'Grab', 'Climb', 'New Game'];
    for (const label of buttons) {
      await expect(page.getByRole('button', { name: label })).toBeVisible();
    }
  });

  test('mode toggle works', async ({ page }) => {
    await page.goto('./#/wumpus');
    await expect(page.locator('.dialog-body')).toBeVisible();
    const modeBtn = page.getByRole('button', { name: 'Mode: Human' });
    await expect(modeBtn).toBeVisible();
    await modeBtn.click();
    await expect(page.getByRole('button', { name: 'Mode: AI' })).toBeVisible();
  });

  test('AI mode controls appear after toggle', async ({ page }) => {
    await page.goto('./#/wumpus');
    await expect(page.locator('.dialog-body')).toBeVisible();
    await page.getByRole('button', { name: 'Mode: Human' }).click();
    await expect(page.getByRole('button', { name: 'Start AI' })).toBeVisible();
    await expect(page.locator('.dialog-body')).toContainText('AI Reasoning');
    await expect(page.locator('.dialog-body')).toContainText('Knowledge Base');
  });

  test('key text content renders — About section', async ({ page }) => {
    await page.goto('./#/wumpus');
    await expect(page.locator('.dialog-body')).toBeVisible();
    const body = page.locator('.dialog-body');
    await expect(body).toContainText('About Wumpus World');
    await expect(body).toContainText('Hunt the Wumpus');
    await expect(body).toContainText('Gregory Yob');
  });

  test('key text content renders — Percepts display', async ({ page }) => {
    await page.goto('./#/wumpus');
    await expect(page.locator('.dialog-body')).toBeVisible();
    await expect(page.locator('.dialog-body')).toContainText('Percepts:');
  });

  test('key text content renders — Action Log', async ({ page }) => {
    await page.goto('./#/wumpus');
    await expect(page.locator('.dialog-body')).toBeVisible();
    await expect(page.locator('.dialog-body')).toContainText('Action Log');
    await expect(page.locator('.dialog-body')).toContainText('Entered the cave');
  });

  test('no broken layout — dialog body has non-zero dimensions', async ({ page }) => {
    await page.goto('./#/wumpus');
    const body = page.locator('.dialog-body');
    await expect(body).toBeVisible();
    const box = await body.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(100);
    expect(box!.height).toBeGreaterThan(100);
  });

  test('no broken layout — mode button has non-zero dimensions', async ({ page }) => {
    await page.goto('./#/wumpus');
    const modeBtn = page.getByRole('button', { name: 'Mode: Human' });
    await expect(modeBtn).toBeVisible();
    const box = await modeBtn.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(0);
    expect(box!.height).toBeGreaterThan(0);
  });

  test('status bar renders with game information', async ({ page }) => {
    await page.goto('./#/wumpus');
    await expect(page.locator('.dialog-body')).toBeVisible();
    const body = page.locator('.dialog-body');
    await expect(body).toContainText('Score:');
    await expect(body).toContainText('Facing:');
    await expect(body).toContainText('Pos:');
    await expect(body).toContainText('Arrow:');
    await expect(body).toContainText('Gold:');
  });

  test('legend color entries render', async ({ page }) => {
    await page.goto('./#/wumpus');
    await expect(page.locator('.dialog-body')).toBeVisible();
    const body = page.locator('.dialog-body');
    for (const label of ['Agent', 'Unknown', 'Safe', 'Stench', 'Breeze', 'Pit', 'Wumpus', 'Gold']) {
      await expect(body).toContainText(label);
    }
  });
});
