import { test, expect } from '@playwright/test';

test.describe('Rendering Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/edge-cases-app/');
    await page.waitForSelector('#edge-cases-app');
  });

  // ==========================================================================
  // 1. Keyed List Reorder
  // ==========================================================================
  test.describe('Keyed List Reorder', () => {
    test('renders initial list order', async ({ page }) => {
      await expect(page.getByTestId('list-order')).toHaveText('Alpha,Beta,Gamma,Delta,Epsilon');
      await expect(page.locator('[data-testid="keyed-list"] li')).toHaveCount(5);
    });

    test('reverses list and preserves all items', async ({ page }) => {
      await page.getByTestId('reverse-btn').click();
      await expect(page.getByTestId('list-order')).toHaveText('Epsilon,Delta,Gamma,Beta,Alpha');

      // All original items still present
      await expect(page.getByTestId('item-alpha')).toBeVisible();
      await expect(page.getByTestId('item-epsilon')).toBeVisible();
    });

    test('double reverse restores original order', async ({ page }) => {
      await page.getByTestId('reverse-btn').click();
      await page.getByTestId('reverse-btn').click();
      await expect(page.getByTestId('list-order')).toHaveText('Alpha,Beta,Gamma,Delta,Epsilon');
    });

    test('keyed items maintain identity across reorder', async ({ page }) => {
      // Get the text content of the first list item before and after reverse
      const firstItemBefore = await page
        .locator('[data-testid="keyed-list"] li')
        .first()
        .textContent();
      expect(firstItemBefore).toBe('Alpha');

      await page.getByTestId('reverse-btn').click();

      const firstItemAfter = await page
        .locator('[data-testid="keyed-list"] li')
        .first()
        .textContent();
      expect(firstItemAfter).toBe('Epsilon');

      // The last item should now be Alpha
      const lastItemAfter = await page
        .locator('[data-testid="keyed-list"] li')
        .last()
        .textContent();
      expect(lastItemAfter).toBe('Alpha');
    });

    test('list count stays the same after shuffle', async ({ page }) => {
      await page.getByTestId('shuffle-btn').click();
      await expect(page.locator('[data-testid="keyed-list"] li')).toHaveCount(5);

      // All items still present (order may vary)
      await expect(page.getByTestId('item-alpha')).toBeVisible();
      await expect(page.getByTestId('item-beta')).toBeVisible();
      await expect(page.getByTestId('item-gamma')).toBeVisible();
      await expect(page.getByTestId('item-delta')).toBeVisible();
      await expect(page.getByTestId('item-epsilon')).toBeVisible();
    });
  });

  // ==========================================================================
  // 2. Fragment Nesting
  // ==========================================================================
  test.describe('Fragment Nesting', () => {
    test('renders fragment children without wrapper elements', async ({ page }) => {
      const section = page.getByTestId('fragment-section');

      // All fragment children should be direct children of the section (no wrapper divs)
      await expect(section.getByTestId('frag-outer-1')).toHaveText('Outer A');
      await expect(section.getByTestId('frag-inner-1')).toHaveText('Inner A');
      await expect(section.getByTestId('frag-inner-2')).toHaveText('Inner B');
      await expect(section.getByTestId('frag-outer-2')).toHaveText('Outer B');
    });

    test('fragment children appear in correct order', async ({ page }) => {
      const section = page.getByTestId('fragment-section');
      const spans = section.locator('span[data-testid^="frag-"]');
      await expect(spans).toHaveCount(4);

      const texts = await spans.allTextContents();
      expect(texts).toEqual(['Outer A', 'Inner A', 'Inner B', 'Outer B']);
    });

    test('no extra wrapper elements from fragments', async ({ page }) => {
      const section = page.getByTestId('fragment-section');

      // The fragment children (spans) should be direct children of the section,
      // not wrapped in an intermediate div or other element
      const directSpans = section.locator(':scope > span[data-testid^="frag-"]');
      const count = await directSpans.count();

      // At least the outer fragments should be direct children
      // (inner fragments flatten into the parent)
      expect(count).toBeGreaterThanOrEqual(4);
    });
  });

  // ==========================================================================
  // 3. Conditional Rendering
  // ==========================================================================
  test.describe('Conditional Rendering', () => {
    test('renders initial conditional state (A visible, B hidden)', async ({ page }) => {
      await expect(page.getByTestId('panel-a')).toBeVisible();
      await expect(page.getByTestId('panel-b')).not.toBeVisible();
    });

    test('toggles panel A off and shows empty state', async ({ page }) => {
      await page.getByTestId('toggle-a').click();

      await expect(page.getByTestId('panel-a')).not.toBeVisible();
      await expect(page.getByTestId('empty-state')).toBeVisible();
      await expect(page.getByTestId('empty-state')).toHaveText('Nothing to show');
    });

    test('toggles panel B on alongside panel A', async ({ page }) => {
      await page.getByTestId('toggle-b').click();

      await expect(page.getByTestId('panel-a')).toBeVisible();
      await expect(page.getByTestId('panel-b')).toBeVisible();
      await expect(page.getByTestId('panel-b')).toHaveText('Panel B is visible');
    });

    test('hides both panels and shows empty state', async ({ page }) => {
      await page.getByTestId('toggle-a').click();
      await expect(page.getByTestId('empty-state')).toBeVisible();

      // Toggle A back on, then B on, then both off
      await page.getByTestId('toggle-a').click();
      await page.getByTestId('toggle-b').click();
      await expect(page.getByTestId('panel-a')).toBeVisible();
      await expect(page.getByTestId('panel-b')).toBeVisible();

      await page.getByTestId('toggle-a').click();
      await page.getByTestId('toggle-b').click();
      await expect(page.getByTestId('empty-state')).toBeVisible();
    });

    test('toggled-off elements are fully removed from DOM', async ({ page }) => {
      await page.getByTestId('toggle-a').click();

      // panel-a should not exist in the DOM at all (not just hidden)
      const panelA = page.getByTestId('panel-a');
      await expect(panelA).toHaveCount(0);
    });

    test('rapid toggle does not corrupt state', async ({ page }) => {
      // Toggle A off and on rapidly
      for (let i = 0; i < 6; i++) {
        await page.getByTestId('toggle-a').click();
      }
      // After even number of toggles, should be back to original state
      await expect(page.getByTestId('panel-a')).toBeVisible();
    });
  });

  // ==========================================================================
  // 4. Rapid State Updates
  // ==========================================================================
  test.describe('Rapid State Updates', () => {
    test('renders initial count of 0', async ({ page }) => {
      await expect(page.getByTestId('rapid-count')).toHaveText('0');
    });

    test('10 rapid clicks produce correct final count', async ({ page }) => {
      const btn = page.getByTestId('rapid-inc');
      for (let i = 0; i < 10; i++) {
        await btn.click();
      }
      await expect(page.getByTestId('rapid-count')).toHaveText('10');
    });

    test('batched state updates apply correctly', async ({ page }) => {
      await page.getByTestId('rapid-inc5').click();
      await expect(page.getByTestId('rapid-count')).toHaveText('5');
    });

    test('multiple batched updates accumulate', async ({ page }) => {
      await page.getByTestId('rapid-inc5').click();
      await page.getByTestId('rapid-inc5').click();
      await expect(page.getByTestId('rapid-count')).toHaveText('10');
    });

    test('reset after rapid updates works', async ({ page }) => {
      for (let i = 0; i < 5; i++) {
        await page.getByTestId('rapid-inc').click();
      }
      await expect(page.getByTestId('rapid-count')).toHaveText('5');

      await page.getByTestId('rapid-reset').click();
      await expect(page.getByTestId('rapid-count')).toHaveText('0');
    });

    test('mixed rapid and batch updates', async ({ page }) => {
      await page.getByTestId('rapid-inc').click();
      await page.getByTestId('rapid-inc').click();
      await page.getByTestId('rapid-inc5').click();
      await page.getByTestId('rapid-inc').click();
      await expect(page.getByTestId('rapid-count')).toHaveText('8');
    });
  });

  // ==========================================================================
  // 5. Error Boundary
  // ==========================================================================
  test.describe('Error Boundary', () => {
    test('renders child normally when no error', async ({ page }) => {
      await expect(page.getByTestId('working-child')).toBeVisible();
      await expect(page.getByTestId('working-child')).toContainText('Child is working');
      await expect(page.getByTestId('error-status')).toHaveText('no-error');
    });

    test('error boundary section is present in DOM', async ({ page }) => {
      await expect(page.getByTestId('error-boundary-section')).toBeVisible();
    });

    test('recover button is present and clickable', async ({ page }) => {
      const recoverBtn = page.getByTestId('recover-error');
      await expect(recoverBtn).toBeVisible();
      await recoverBtn.click();
      // Child should still be visible after recover (no error to recover from)
      await expect(page.getByTestId('working-child')).toBeVisible();
    });
  });

  // ==========================================================================
  // 6. Ref Attachment
  // ==========================================================================
  test.describe('Ref Attachment', () => {
    test('forwarded ref input is rendered', async ({ page }) => {
      await expect(page.getByTestId('fancy-input')).toBeVisible();
    });

    test('focus button moves focus to the ref input', async ({ page }) => {
      await page.getByTestId('focus-btn').click();

      // The fancy-input should be the focused element
      const isFocused = await page
        .getByTestId('fancy-input')
        .evaluate((el) => document.activeElement === el);
      expect(isFocused).toBe(true);
    });

    test('read ref button captures input value', async ({ page }) => {
      await page.getByTestId('fancy-input').fill('hello from ref');
      await page.getByTestId('read-ref-btn').click();

      await expect(page.getByTestId('ref-readout')).toHaveText('hello from ref');
    });

    test('ref value updates when input changes', async ({ page }) => {
      await page.getByTestId('fancy-input').fill('first');
      await page.getByTestId('read-ref-btn').click();
      await expect(page.getByTestId('ref-readout')).toHaveText('first');

      await page.getByTestId('fancy-input').fill('second');
      await page.getByTestId('read-ref-btn').click();
      await expect(page.getByTestId('ref-readout')).toHaveText('second');
    });
  });

  // ==========================================================================
  // 7. Event Delegation
  // ==========================================================================
  test.describe('Event Delegation', () => {
    test('click on child bubbles to container handler', async ({ page }) => {
      await page.getByTestId('bubble-btn').click();

      await expect(page.getByTestId('event-log')).toContainText('container:bubble-btn');
    });

    test('stopPropagation prevents container handler', async ({ page }) => {
      await page.getByTestId('stop-btn').click();

      const log = await page.getByTestId('event-log').textContent();
      expect(log).toContain('inner-stopped');
      expect(log).not.toContain('container:stop-btn');
    });

    test('click on deeply nested element bubbles up', async ({ page }) => {
      await page.getByTestId('deep-child').click();

      await expect(page.getByTestId('event-log')).toContainText('container:');
    });

    test('multiple events logged in order', async ({ page }) => {
      await page.getByTestId('bubble-btn').click();
      await page.getByTestId('bubble-btn').click();

      const log = await page.getByTestId('event-log').textContent();
      const parts = log!.split(' | ');
      expect(parts.length).toBe(2);
      expect(parts[0]).toBe('container:bubble-btn');
      expect(parts[1]).toBe('container:bubble-btn');
    });

    test('clear log empties the event log', async ({ page }) => {
      await page.getByTestId('bubble-btn').click();
      await expect(page.getByTestId('event-log')).not.toHaveText('');

      await page.getByTestId('clear-log').click();
      await expect(page.getByTestId('event-log')).toHaveText('');
    });
  });

  // ==========================================================================
  // 8. SVG Rendering
  // ==========================================================================
  test.describe('SVG Rendering', () => {
    test('renders SVG element with correct namespace', async ({ page }) => {
      const svg = page.getByTestId('svg-element');
      await expect(svg).toBeVisible();

      const namespaceURI = await svg.evaluate((el) => el.namespaceURI);
      expect(namespaceURI).toBe('http://www.w3.org/2000/svg');
    });

    test('SVG circle element has correct namespace', async ({ page }) => {
      const circle = page.getByTestId('svg-circle');
      const namespaceURI = await circle.evaluate((el) => el.namespaceURI);
      expect(namespaceURI).toBe('http://www.w3.org/2000/svg');
    });

    test('SVG text element has correct namespace', async ({ page }) => {
      const text = page.getByTestId('svg-text');
      const namespaceURI = await text.evaluate((el) => el.namespaceURI);
      expect(namespaceURI).toBe('http://www.w3.org/2000/svg');
    });

    test('renders initial circle radius', async ({ page }) => {
      await expect(page.getByTestId('svg-radius')).toHaveText('40');
      await expect(page.getByTestId('svg-text')).toHaveText('r=40');

      const r = await page.getByTestId('svg-circle').getAttribute('r');
      expect(r).toBe('40');
    });

    test('grow button increases radius', async ({ page }) => {
      await page.getByTestId('svg-grow').click();
      await expect(page.getByTestId('svg-radius')).toHaveText('50');

      const r = await page.getByTestId('svg-circle').getAttribute('r');
      expect(r).toBe('50');
    });

    test('shrink button decreases radius', async ({ page }) => {
      await page.getByTestId('svg-shrink').click();
      await expect(page.getByTestId('svg-radius')).toHaveText('30');

      const r = await page.getByTestId('svg-circle').getAttribute('r');
      expect(r).toBe('30');
    });

    test('radius clamps at maximum', async ({ page }) => {
      // Click grow enough times to hit the max (80)
      for (let i = 0; i < 10; i++) {
        await page.getByTestId('svg-grow').click();
      }
      await expect(page.getByTestId('svg-radius')).toHaveText('80');
    });

    test('radius clamps at minimum', async ({ page }) => {
      // Click shrink enough times to hit the min (10)
      for (let i = 0; i < 10; i++) {
        await page.getByTestId('svg-shrink').click();
      }
      await expect(page.getByTestId('svg-radius')).toHaveText('10');
    });

    test('SVG circle and text update together', async ({ page }) => {
      await page.getByTestId('svg-grow').click();
      await page.getByTestId('svg-grow').click();

      const r = await page.getByTestId('svg-circle').getAttribute('r');
      const text = await page.getByTestId('svg-text').textContent();
      expect(r).toBe('60');
      expect(text).toBe('r=60');
    });
  });
});
