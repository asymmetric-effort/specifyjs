import { test, expect } from '@playwright/test';

test.describe('Accessibility Warnings', () => {
  test('no SpecifyJS accessibility warnings on home page', async ({ page }) => {
    const warnings: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'warning' && msg.text().includes('[SpecifyJS]')) {
        warnings.push(msg.text());
      }
    });
    await page.goto('/');
    await page.waitForTimeout(2000);
    expect(warnings, `Found ${warnings.length} warnings:\n${warnings.join('\n')}`).toHaveLength(0);
  });

  test('no SpecifyJS accessibility warnings on home page with feature dialog open', async ({ page }) => {
    const warnings: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'warning' && msg.text().includes('[SpecifyJS]')) {
        warnings.push(msg.text());
      }
    });
    await page.goto('/');
    // Click a feature card to open the dialog (triggers backdrop rendering)
    const featureCard = page.locator('.feature-card').first();
    await featureCard.click();
    await page.waitForTimeout(1000);
    expect(warnings, `Found ${warnings.length} warnings:\n${warnings.join('\n')}`).toHaveLength(0);
  });

  test('no SpecifyJS accessibility warnings on component gallery', async ({ page }) => {
    const warnings: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'warning' && msg.text().includes('[SpecifyJS]')) {
        warnings.push(msg.text());
      }
    });
    await page.goto('/#/components');
    await page.waitForTimeout(2000);

    // Open each accordion section to trigger rendering of all components
    const accordionHeaders = page.locator('.accordion-header');
    const count = await accordionHeaders.count();
    for (let i = 0; i < count; i++) {
      await accordionHeaders.nth(i).click();
      await page.waitForTimeout(500);
    }
    await page.waitForTimeout(1000);

    expect(warnings, `Found ${warnings.length} warnings:\n${warnings.join('\n')}`).toHaveLength(0);
  });

  test('no SpecifyJS accessibility warnings on 404 page', async ({ page }) => {
    const warnings: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'warning' && msg.text().includes('[SpecifyJS]')) {
        warnings.push(msg.text());
      }
    });
    await page.goto('/#/nonexistent');
    await page.waitForTimeout(2000);
    expect(warnings, `Found ${warnings.length} warnings:\n${warnings.join('\n')}`).toHaveLength(0);
  });

  test('no SpecifyJS accessibility warnings on interactive forms', async ({ page }) => {
    const warnings: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'warning' && msg.text().includes('[SpecifyJS]')) {
        warnings.push(msg.text());
      }
    });
    await page.goto('/#/components');
    await page.waitForTimeout(2000);
    expect(warnings, `Found ${warnings.length} warnings:\n${warnings.join('\n')}`).toHaveLength(0);
  });

  test('no SpecifyJS accessibility warnings on feature flags demo', async ({ page }) => {
    const warnings: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'warning' && msg.text().includes('[SpecifyJS]')) {
        warnings.push(msg.text());
      }
    });
    await page.goto('/#/featureflags');
    await page.waitForTimeout(2000);
    expect(warnings, `Found ${warnings.length} warnings:\n${warnings.join('\n')}`).toHaveLength(0);
  });
});
