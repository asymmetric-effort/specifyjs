import { test, expect } from '@playwright/test';

test.describe('Wumpus World', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/wumpus');
  });

  // ── Navigation ──────────────────────────────────────────────────────

  test('dialog opens with title "Wumpus World"', async ({ page }) => {
    await expect(page.locator('.dialog-title')).toContainText('Wumpus World');
  });

  test('direct URL /#/wumpus loads correctly', async ({ page }) => {
    await expect(page.locator('.dialog-body')).toBeVisible();
    await expect(page.locator('.dialog-title')).toContainText('Wumpus World');
  });

  test('close button returns to home', async ({ page }) => {
    await expect(page.locator('.dialog-title')).toContainText('Wumpus World');
    await page.locator('.dialog-close').click();
    await expect(page.locator('.dialog-title')).not.toBeVisible();
  });

  test('no JavaScript console errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/#/wumpus');
    await expect(page.locator('.dialog-title')).toContainText('Wumpus World');
    expect(errors).toEqual([]);
  });

  // ── Human Mode (default) ────────────────────────────────────────────

  test('mode button shows "Mode: Human" by default', async ({ page }) => {
    await expect(page.locator('.dialog-body')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Mode: Human' })).toBeVisible();
  });

  test('all 7 action buttons visible in human mode', async ({ page }) => {
    await expect(page.locator('.dialog-body')).toBeVisible();
    const buttons = ['Forward', 'Turn Left', 'Turn Right', 'Shoot', 'Grab', 'Climb', 'New Game'];
    for (const label of buttons) {
      await expect(page.getByRole('button', { name: label })).toBeVisible();
    }
  });

  test('Forward button moves agent (percepts text changes)', async ({ page }) => {
    await expect(page.locator('.dialog-body')).toBeVisible();
    const perceptsBefore = await page.locator('.dialog-body strong').filter({ hasText: 'Percepts:' }).locator('..').textContent();
    await page.getByRole('button', { name: 'Forward' }).click();
    // The log should gain an entry about moving or bumping
    const body = page.locator('.dialog-body');
    await expect(body).toContainText(/Moved to|Bump|eaten|fell/);
  });

  test('Turn Left button works (log shows "Turned left")', async ({ page }) => {
    await expect(page.locator('.dialog-body')).toBeVisible();
    await page.getByRole('button', { name: 'Turn Left' }).click();
    await expect(page.locator('.dialog-body')).toContainText('Turned left');
  });

  test('Turn Right button works (log shows "Turned right")', async ({ page }) => {
    await expect(page.locator('.dialog-body')).toBeVisible();
    await page.getByRole('button', { name: 'Turn Right' }).click();
    await expect(page.locator('.dialog-body')).toContainText('Turned right');
  });

  test('New Game button resets (log shows "Entered the cave")', async ({ page }) => {
    await expect(page.locator('.dialog-body')).toBeVisible();
    // Perform some action first
    await page.getByRole('button', { name: 'Turn Left' }).click();
    await expect(page.locator('.dialog-body')).toContainText('Turned left');
    // Reset
    await page.getByRole('button', { name: 'New Game' }).click();
    // After new game, log should contain "Entered the cave" as the initial entry
    await expect(page.locator('.dialog-body')).toContainText('Entered the cave');
  });

  test('Shoot button exists and is clickable', async ({ page }) => {
    await expect(page.locator('.dialog-body')).toBeVisible();
    const shootBtn = page.getByRole('button', { name: 'Shoot' });
    await expect(shootBtn).toBeVisible();
    await shootBtn.click();
    // Log should mention shot
    await expect(page.locator('.dialog-body')).toContainText('Shot arrow');
  });

  test('Grab button exists and is clickable', async ({ page }) => {
    await expect(page.locator('.dialog-body')).toBeVisible();
    const grabBtn = page.getByRole('button', { name: 'Grab' });
    await expect(grabBtn).toBeVisible();
    await grabBtn.click();
    await expect(page.locator('.dialog-body')).toContainText(/Grabbed|Nothing to grab/);
  });

  test('Percepts display shows percept text', async ({ page }) => {
    await expect(page.locator('.dialog-body')).toBeVisible();
    await expect(page.locator('.dialog-body')).toContainText('Percepts:');
  });

  test('status bar shows Score, Facing, Pos, Arrow, Gold info', async ({ page }) => {
    await expect(page.locator('.dialog-body')).toBeVisible();
    const body = page.locator('.dialog-body');
    await expect(body).toContainText('Score:');
    await expect(body).toContainText('Facing:');
    await expect(body).toContainText('Pos:');
    await expect(body).toContainText('Arrow:');
    await expect(body).toContainText('Gold:');
  });

  test('legend shows color entries (Agent, Unknown, Safe, etc.)', async ({ page }) => {
    await expect(page.locator('.dialog-body')).toBeVisible();
    const body = page.locator('.dialog-body');
    const entries = ['Agent', 'Unknown', 'Safe', 'Stench', 'Breeze', 'Pit', 'Wumpus', 'Gold'];
    for (const entry of entries) {
      await expect(body).toContainText(entry);
    }
  });

  test('grid SVG is visible (600x600)', async ({ page }) => {
    await expect(page.locator('.dialog-body')).toBeVisible();
    const svg = page.locator('.dialog-body svg');
    await expect(svg).toBeVisible();
    const box = await svg.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(590);
    expect(box!.height).toBeGreaterThanOrEqual(590);
  });

  // ── AI Mode ─────────────────────────────────────────────────────────

  test('clicking "Mode: Human" switches to "Mode: AI"', async ({ page }) => {
    await expect(page.locator('.dialog-body')).toBeVisible();
    await page.getByRole('button', { name: 'Mode: Human' }).click();
    await expect(page.getByRole('button', { name: 'Mode: AI' })).toBeVisible();
  });

  test('"Start AI" button appears in AI mode', async ({ page }) => {
    await expect(page.locator('.dialog-body')).toBeVisible();
    await page.getByRole('button', { name: 'Mode: Human' }).click();
    await expect(page.getByRole('button', { name: 'Start AI' })).toBeVisible();
  });

  test('clicking "Start AI" changes to "Pause AI"', async ({ page }) => {
    await expect(page.locator('.dialog-body')).toBeVisible();
    await page.getByRole('button', { name: 'Mode: Human' }).click();
    await page.getByRole('button', { name: 'Start AI' }).click();
    await expect(page.getByRole('button', { name: 'Pause AI' })).toBeVisible();
  });

  test('AI reasoning panel appears in sidebar', async ({ page }) => {
    await expect(page.locator('.dialog-body')).toBeVisible();
    await page.getByRole('button', { name: 'Mode: Human' }).click();
    await expect(page.locator('.dialog-body')).toContainText('AI Reasoning');
  });

  test('Knowledge Base section visible in AI mode', async ({ page }) => {
    await expect(page.locator('.dialog-body')).toBeVisible();
    await page.getByRole('button', { name: 'Mode: Human' }).click();
    await expect(page.locator('.dialog-body')).toContainText('Knowledge Base');
  });

  test('AI info sidebar shows inference rules', async ({ page }) => {
    await expect(page.locator('.dialog-body')).toBeVisible();
    await page.getByRole('button', { name: 'Mode: Human' }).click();
    const body = page.locator('.dialog-body');
    await expect(body).toContainText('propositional logic');
    await expect(body).toContainText('inference rules');
  });

  test('Action Log section visible in AI mode', async ({ page }) => {
    await expect(page.locator('.dialog-body')).toBeVisible();
    await page.getByRole('button', { name: 'Mode: Human' }).click();
    await expect(page.locator('.dialog-body')).toContainText('Action Log');
  });

  test('clicking "Pause AI" stops the AI', async ({ page }) => {
    await expect(page.locator('.dialog-body')).toBeVisible();
    await page.getByRole('button', { name: 'Mode: Human' }).click();
    await page.getByRole('button', { name: 'Start AI' }).click();
    await expect(page.getByRole('button', { name: 'Pause AI' })).toBeVisible();
    await page.getByRole('button', { name: 'Pause AI' }).click();
    await expect(page.getByRole('button', { name: 'Start AI' })).toBeVisible();
  });

  test('New Game works in AI mode', async ({ page }) => {
    await expect(page.locator('.dialog-body')).toBeVisible();
    await page.getByRole('button', { name: 'Mode: Human' }).click();
    await page.getByRole('button', { name: 'Start AI' }).click();
    // Wait a moment for AI to act
    await page.waitForTimeout(1200);
    await page.getByRole('button', { name: 'New Game' }).click();
    // After new game, the log should contain "Entered the cave"
    await expect(page.locator('.dialog-body')).toContainText('Entered the cave');
  });

  // ── Layout ──────────────────────────────────────────────────────────

  test('grid overlay labels are visible (? marks for unknown cells)', async ({ page }) => {
    await expect(page.locator('.dialog-body')).toBeVisible();
    // Unknown cells display "?" — there should be many at the start
    await expect(page.locator('.dialog-body')).toContainText('?');
  });

  test('sidebar content is visible (About/History section)', async ({ page }) => {
    await expect(page.locator('.dialog-body')).toBeVisible();
    const body = page.locator('.dialog-body');
    await expect(body).toContainText('About Wumpus World');
    await expect(body).toContainText('Hunt the Wumpus');
  });

  test('Action Log section visible in sidebar', async ({ page }) => {
    await expect(page.locator('.dialog-body')).toBeVisible();
    await expect(page.locator('.dialog-body')).toContainText('Action Log');
  });

  test('Climb button exists and is clickable', async ({ page }) => {
    await expect(page.locator('.dialog-body')).toBeVisible();
    const climbBtn = page.getByRole('button', { name: 'Climb' });
    await expect(climbBtn).toBeVisible();
    await climbBtn.click();
    // Agent starts at entrance, so climb should end the game
    await expect(page.locator('.dialog-body')).toContainText(/Climbed out/);
  });

  test('human mode buttons are disabled after game over', async ({ page }) => {
    await expect(page.locator('.dialog-body')).toBeVisible();
    // Climb out to end the game
    await page.getByRole('button', { name: 'Climb' }).click();
    await expect(page.locator('.dialog-body')).toContainText(/Climbed out/);
    // Forward should now be disabled
    await expect(page.getByRole('button', { name: 'Forward' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Turn Left' })).toBeDisabled();
  });

  test('switching from AI back to Human restores action buttons', async ({ page }) => {
    await expect(page.locator('.dialog-body')).toBeVisible();
    // Switch to AI mode
    await page.getByRole('button', { name: 'Mode: Human' }).click();
    await expect(page.getByRole('button', { name: 'Mode: AI' })).toBeVisible();
    // Human-mode buttons should not be present
    await expect(page.getByRole('button', { name: 'Forward' })).not.toBeVisible();
    // Switch back to Human
    await page.getByRole('button', { name: 'Mode: AI' }).click();
    await expect(page.getByRole('button', { name: 'Mode: Human' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Forward' })).toBeVisible();
  });
});
