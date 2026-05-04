import { test, expect } from '@playwright/test';

test.describe('Geospatial Maps', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/geospatial-app/');
    await page.waitForSelector('#geospatial-app');
  });

  // ==========================================================================
  // 1. US State Map
  // ==========================================================================
  test.describe('US State Map', () => {
    test('renders SVG with role and accessible title', async ({ page }) => {
      const section = page.getByTestId('us-map-section');
      const svg = section.locator('svg[role="img"]');
      await expect(svg).toBeVisible();
      await expect(svg).toHaveAttribute('aria-label', 'US States Test Map');
    });

    test('renders SVG with correct viewBox', async ({ page }) => {
      const section = page.getByTestId('us-map-section');
      const svg = section.locator('svg[role="img"]');
      const viewBox = await svg.getAttribute('viewBox');
      expect(viewBox).toBe('0 0 959 593');
    });

    test('renders state paths with data-state attribute', async ({ page }) => {
      const section = page.getByTestId('us-map-section');
      const statePaths = section.locator('svg path[data-state]');
      // The US State Map should render paths for all states/territories
      const count = await statePaths.count();
      expect(count).toBeGreaterThanOrEqual(50);
    });

    test('state paths have correct fill colors', async ({ page }) => {
      const section = page.getByTestId('us-map-section');
      // CA is set to #3b82f6
      const caPath = section.locator('svg path[data-state="CA"]');
      await expect(caPath).toHaveAttribute('fill', '#3b82f6');
      // TX is set to #f97316
      const txPath = section.locator('svg path[data-state="TX"]');
      await expect(txPath).toHaveAttribute('fill', '#f97316');
      // NY is set to #a855f7
      const nyPath = section.locator('svg path[data-state="NY"]');
      await expect(nyPath).toHaveAttribute('fill', '#a855f7');
    });

    test('un-colored states get default fill', async ({ page }) => {
      const section = page.getByTestId('us-map-section');
      // OH has no custom color, should use defaultColor #D0D0D0
      const ohPath = section.locator('svg path[data-state="OH"]');
      await expect(ohPath).toHaveAttribute('fill', '#D0D0D0');
    });

    test('state paths have ARIA labels', async ({ page }) => {
      const section = page.getByTestId('us-map-section');
      const caPath = section.locator('svg path[data-state="CA"]');
      await expect(caPath).toHaveAttribute('aria-label', 'California');
    });

    test('shows initial hover status', async ({ page }) => {
      await expect(page.getByTestId('hovered-state')).toHaveText('No state hovered');
    });

    test('shows initial click status', async ({ page }) => {
      await expect(page.getByTestId('clicked-state')).toHaveText('No state clicked');
    });

    test('hover over state updates hover status', async ({ page }) => {
      const section = page.getByTestId('us-map-section');
      const txPath = section.locator('svg path[data-state="TX"]');
      await txPath.hover();
      await expect(page.getByTestId('hovered-state')).toHaveText('Hovered: TX');
    });

    test('hover changes state fill to hoverColor', async ({ page }) => {
      const section = page.getByTestId('us-map-section');
      const txPath = section.locator('svg path[data-state="TX"]');
      await txPath.hover();
      // Wait for the hover handler to update the fill attribute
      await expect(txPath).toHaveAttribute('fill', '#FFD700', { timeout: 3000 });
    });

    test('mouse leave restores original fill', async ({ page }) => {
      const section = page.getByTestId('us-map-section');
      const txPath = section.locator('svg path[data-state="TX"]');
      // Hover on TX
      await txPath.hover();
      // Move away to the section heading
      await section.locator('h2').hover();
      // Fill should be restored
      const fill = await txPath.getAttribute('fill');
      expect(fill).toBe('#f97316');
    });

    test('click on state updates click status', async ({ page }) => {
      const section = page.getByTestId('us-map-section');
      const caPath = section.locator('svg path[data-state="CA"]');
      await caPath.click();
      await expect(page.getByTestId('clicked-state')).toHaveText('Clicked: CA');
    });

    test('clickable states have pointer cursor', async ({ page }) => {
      const section = page.getByTestId('us-map-section');
      const caPath = section.locator('svg path[data-state="CA"]');
      const cursor = await caPath.evaluate((el) => getComputedStyle(el).cursor);
      expect(cursor).toBe('pointer');
    });

    test('clickable states have role=button and tabIndex', async ({ page }) => {
      const section = page.getByTestId('us-map-section');
      const caPath = section.locator('svg path[data-state="CA"]');
      await expect(caPath).toHaveAttribute('role', 'button');
      const tabindex = await caPath.getAttribute('tabindex');
      expect(tabindex).toBe('0');
    });

    test('state paths have white stroke borders', async ({ page }) => {
      const section = page.getByTestId('us-map-section');
      const caPath = section.locator('svg path[data-state="CA"]');
      await expect(caPath).toHaveAttribute('stroke', '#FFFFFF');
      await expect(caPath).toHaveAttribute('stroke-width', '1');
    });
  });

  // ==========================================================================
  // 2. Earth Globe
  // ==========================================================================
  test.describe('Earth Globe', () => {
    test('renders SVG with role and accessible title', async ({ page }) => {
      const section = page.getByTestId('globe-section');
      const svg = section.locator('svg[role="img"]');
      await expect(svg).toBeVisible();
      await expect(svg).toHaveAttribute('aria-label', 'Earth Globe Test');
    });

    test('renders SVG with correct viewBox', async ({ page }) => {
      const section = page.getByTestId('globe-section');
      const svg = section.locator('svg[role="img"]');
      const viewBox = await svg.getAttribute('viewBox');
      expect(viewBox).toBe('0 0 350 350');
    });

    test('renders ocean circle background', async ({ page }) => {
      const section = page.getByTestId('globe-section');
      // The ocean is a circle with fill=oceanColor
      const ocean = section.locator('svg circle[fill="#3b82f6"]');
      await expect(ocean.first()).toBeVisible();
    });

    test('renders country paths', async ({ page }) => {
      const section = page.getByTestId('globe-section');
      // Country paths are in a <g> clipped group with role="button"
      const countryPaths = section.locator('svg path[role="button"]');
      const count = await countryPaths.count();
      // At least some countries should be visible on the front of the globe
      expect(count).toBeGreaterThan(0);
    });

    test('country paths have ARIA labels', async ({ page }) => {
      const section = page.getByTestId('globe-section');
      const countryPaths = section.locator('svg path[role="button"]');
      const firstPath = countryPaths.first();
      const label = await firstPath.getAttribute('aria-label');
      expect(label).toBeTruthy();
      expect(label!.length).toBeGreaterThan(0);
    });

    test('renders graticule grid lines', async ({ page }) => {
      const section = page.getByTestId('globe-section');
      // Graticule paths have fill="none" and the graticule stroke color
      const graticulePaths = section.locator(
        'svg path[fill="none"][stroke="rgba(255,255,255,0.2)"]',
      );
      const count = await graticulePaths.count();
      expect(count).toBeGreaterThan(0);
    });

    test('renders globe outline ring', async ({ page }) => {
      const section = page.getByTestId('globe-section');
      // The outline circle has fill="none" and opacity="0.4"
      const outline = section.locator('svg circle[fill="none"][opacity="0.4"]');
      await expect(outline).toBeVisible();
    });

    test('shows initial hover status', async ({ page }) => {
      await expect(page.getByTestId('hovered-country')).toHaveText('No country hovered');
    });

    test('shows initial click status', async ({ page }) => {
      await expect(page.getByTestId('clicked-country')).toHaveText('No country clicked');
    });

    test('renders defs with clipPath', async ({ page }) => {
      const section = page.getByTestId('globe-section');
      const clipPath = section.locator('svg defs clipPath');
      await expect(clipPath).toHaveCount(1);
    });

    test('interactive layer circle is present for drag', async ({ page }) => {
      const section = page.getByTestId('globe-section');
      // The interaction layer is a transparent circle with cursor: grab
      const interactionCircle = section.locator('svg circle[fill="transparent"]');
      await expect(interactionCircle).toHaveCount(1);
    });
  });

  // ==========================================================================
  // 3. Individual State Components
  // ==========================================================================
  test.describe('Individual State Components', () => {
    test('renders California SVG', async ({ page }) => {
      const ca = page.getByTestId('state-ca');
      const svg = ca.locator('svg[role="img"]');
      await expect(svg).toBeVisible();
      await expect(svg).toHaveAttribute('aria-label', 'California');
    });

    test('renders Texas SVG', async ({ page }) => {
      const tx = page.getByTestId('state-tx');
      const svg = tx.locator('svg[role="img"]');
      await expect(svg).toBeVisible();
      await expect(svg).toHaveAttribute('aria-label', 'Texas');
    });

    test('renders New York SVG', async ({ page }) => {
      const ny = page.getByTestId('state-ny');
      const svg = ny.locator('svg[role="img"]');
      await expect(svg).toBeVisible();
      await expect(svg).toHaveAttribute('aria-label', 'New York');
    });

    test('individual state SVGs contain path elements', async ({ page }) => {
      const ca = page.getByTestId('state-ca');
      const caPath = ca.locator('svg path');
      await expect(caPath).toHaveCount(1);

      const tx = page.getByTestId('state-tx');
      const txPath = tx.locator('svg path');
      await expect(txPath).toHaveCount(1);

      const ny = page.getByTestId('state-ny');
      const nyPath = ny.locator('svg path');
      await expect(nyPath).toHaveCount(1);
    });

    test('individual states have correct fill colors', async ({ page }) => {
      const caPath = page.getByTestId('state-ca').locator('svg path');
      await expect(caPath).toHaveAttribute('fill', '#3b82f6');

      const txPath = page.getByTestId('state-tx').locator('svg path');
      await expect(txPath).toHaveAttribute('fill', '#f97316');

      const nyPath = page.getByTestId('state-ny').locator('svg path');
      await expect(nyPath).toHaveAttribute('fill', '#a855f7');
    });

    test('individual state SVGs have title elements', async ({ page }) => {
      const ca = page.getByTestId('state-ca');
      const caTitle = ca.locator('svg title');
      await expect(caTitle).toHaveText('California');

      const tx = page.getByTestId('state-tx');
      const txTitle = tx.locator('svg title');
      await expect(txTitle).toHaveText('Texas');
    });

    test('individual state SVGs have viewBox attribute', async ({ page }) => {
      const ca = page.getByTestId('state-ca');
      const svg = ca.locator('svg');
      const viewBox = await svg.getAttribute('viewBox');
      expect(viewBox).toBeTruthy();
      // viewBox should have 4 numeric values
      const parts = viewBox!.split(' ');
      expect(parts).toHaveLength(4);
    });

    test('individual state SVGs have correct width', async ({ page }) => {
      const ca = page.getByTestId('state-ca');
      const svg = ca.locator('svg');
      await expect(svg).toHaveAttribute('width', '150');
    });
  });

  // ==========================================================================
  // 4. No JavaScript errors
  // ==========================================================================
  test('page loads without JavaScript errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/examples/geospatial-app/');
    await page.waitForSelector('#geospatial-app');

    expect(errors).toEqual([]);
  });
});
