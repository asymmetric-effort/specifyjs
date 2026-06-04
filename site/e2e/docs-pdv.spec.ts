import { test, expect } from '@playwright/test';

/**
 * Post-Deployment Verification: Documentation Pages
 *
 * Verifies the docs section at /#/docs loads with actual content,
 * internal doc links navigate correctly, and all sidebar entries
 * render real documentation (not empty or error states).
 */

const BASE_URL = process.env.SITE_URL || 'https://specifyjs.asymmetric-effort.com';

test.describe('Docs PDV — Page loads with content', () => {
  test('docs home renders welcome content with meaningful text', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/docs`);
    await expect(page.locator('text=Documentation').first()).toBeVisible({ timeout: 15000 });

    // The main content area should have substantial text (not just a header)
    const article = page.locator('article').first();
    await expect(article).toBeVisible({ timeout: 10000 });
    const text = await article.innerText();
    expect(text.length).toBeGreaterThan(200);
    expect(text).toContain('SpecifyJS');
  });

  test('docs home has sidebar with all 6 sections', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/docs`);
    await expect(page.locator('text=Documentation').first()).toBeVisible({ timeout: 15000 });

    await expect(page.locator('button:has-text("OVERVIEW")').first()).toBeVisible();
    await expect(page.locator('button:has-text("GUIDES")').first()).toBeVisible();
    await expect(page.locator('button:has-text("API REFERENCE")').first()).toBeVisible();
    await expect(page.locator('button:has-text("ARCHITECTURE")').first()).toBeVisible();
    await expect(page.locator('button:has-text("COMPONENTS")').first()).toBeVisible();
    await expect(page.locator('button:has-text("CONTRIBUTING")').first()).toBeVisible();
  });

  test('docs home shows document count', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/docs`);
    await expect(page.locator('text=Documentation').first()).toBeVisible({ timeout: 15000 });

    // Should display something like "111 documents"
    const countText = page.locator('text=/\\d+ documents/');
    await expect(countText).toBeVisible({ timeout: 5000 });
    const text = await countText.innerText();
    const count = parseInt(text.match(/(\d+)/)?.[1] || '0', 10);
    expect(count).toBeGreaterThan(50);
  });

  test('search bar is visible and functional', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/docs`);
    await expect(page.locator('text=Documentation').first()).toBeVisible({ timeout: 15000 });

    const searchInput = page.locator('input[aria-label="Search documentation"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('routing');
    await page.waitForTimeout(300);

    // Search results should appear
    const results = page.locator('button:has-text("Routing")');
    await expect(results.first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Docs PDV — Guide pages render actual content', () => {
  const guides = [
    { path: 'guides/getting-started', title: 'Getting Started', minLength: 500 },
    { path: 'guides/core-concepts', title: 'Core Concepts', minLength: 500 },
    { path: 'guides/routing', title: 'Routing', minLength: 300 },
    { path: 'guides/state-management', title: 'State Management', minLength: 300 },
    { path: 'guides/forms-and-validation', title: 'Forms', minLength: 300 },
    { path: 'guides/typescript', title: 'TypeScript', minLength: 300 },
    { path: 'guides/styling', title: 'Styling', minLength: 300 },
    { path: 'guides/performance', title: 'Performance', minLength: 300 },
    { path: 'guides/error-handling', title: 'Error Handling', minLength: 300 },
    { path: 'guides/accessibility', title: 'Accessibility', minLength: 300 },
    { path: 'guides/custom-hooks', title: 'Custom Hooks', minLength: 300 },
    { path: 'guides/testing', title: 'Testing', minLength: 300 },
    { path: 'guides/deployment', title: 'Deployment', minLength: 200 },
    { path: 'guides/concurrent-rendering', title: 'Concurrent', minLength: 200 },
    { path: 'guides/code-splitting', title: 'Code Splitting', minLength: 200 },
    { path: 'guides/browser-support', title: 'Browser', minLength: 200 },
    { path: 'guides/troubleshooting', title: 'Troubleshooting', minLength: 200 },
    { path: 'guides/meta-tags', title: 'Meta', minLength: 200 },
    { path: 'guides/feature-flags', title: 'Feature Flags', minLength: 200 },
    { path: 'guides/migrating-from-react', title: 'Migrating', minLength: 200 },
    { path: 'guides/production-builds', title: 'Production', minLength: 200 },
    { path: 'guides/building-spas', title: 'SPA', minLength: 200 },
    { path: 'guides/render-safety', title: 'Render Safety', minLength: 200 },
    { path: 'guides/seo', title: 'SEO', minLength: 200 },
    { path: 'guides/async-computation', title: 'Async', minLength: 200 },
  ];

  for (const guide of guides) {
    test(`${guide.path} renders with real content`, async ({ page }) => {
      await page.goto(`${BASE_URL}/#/docs/${guide.path}`);
      const heading = page.locator('.dialog-body h1, article h1').first();
      await expect(heading).toBeVisible({ timeout: 10000 });
      const headingText = await heading.innerText();
      expect(headingText.toLowerCase()).toContain(guide.title.toLowerCase());

      // Verify actual content (not just a heading)
      const article = page.locator('article').first();
      const text = await article.innerText();
      expect(text.length).toBeGreaterThan(guide.minLength);
    });
  }
});

test.describe('Docs PDV — API Reference pages render actual content', () => {
  const apiPages = [
    { path: 'api/hooks', title: 'Hooks' },
    { path: 'api/components', title: 'Components' },
    { path: 'api/dom', title: 'DOM' },
    { path: 'api/server', title: 'Pre-rendering' },
    { path: 'api/types', title: 'Types' },
    { path: 'api/compute', title: 'Compute' },
    { path: 'api/math', title: 'Math' },
  ];

  for (const api of apiPages) {
    test(`${api.path} renders with real content`, async ({ page }) => {
      await page.goto(`${BASE_URL}/#/docs/${api.path}`);
      const heading = page.locator('.dialog-body h1, article h1').first();
      await expect(heading).toBeVisible({ timeout: 10000 });

      const article = page.locator('article').first();
      const text = await article.innerText();
      expect(text.length).toBeGreaterThan(200);
    });
  }
});

test.describe('Docs PDV — Architecture pages render actual content', () => {
  const archPages = [
    { path: 'architecture/README', title: 'Architecture' },
    { path: 'architecture/virtual-dom', title: 'Virtual DOM' },
    { path: 'architecture/fiber-reconciler', title: 'Fiber' },
    { path: 'architecture/hooks-internals', title: 'Hooks' },
    { path: 'architecture/event-system', title: 'Event' },
  ];

  for (const arch of archPages) {
    test(`${arch.path} renders with real content`, async ({ page }) => {
      await page.goto(`${BASE_URL}/#/docs/${arch.path}`);
      const heading = page.locator('.dialog-body h1, article h1').first();
      await expect(heading).toBeVisible({ timeout: 10000 });

      const article = page.locator('article').first();
      const text = await article.innerText();
      expect(text.length).toBeGreaterThan(200);
    });
  }
});

test.describe('Docs PDV — Internal doc links navigate correctly', () => {
  test('README table links navigate to guide pages', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/docs`);
    await expect(page.locator('article').first()).toBeVisible({ timeout: 15000 });

    // The README has links like [Getting Started](guides/getting-started.md)
    // After fix, these should be rendered as href="#/docs/guides/getting-started"
    const gettingStartedLink = page.locator('a[href*="docs/guides/getting-started"]').first();
    await expect(gettingStartedLink).toBeVisible({ timeout: 5000 });
    await gettingStartedLink.click();
    await page.waitForTimeout(1000);

    // Should navigate to the Getting Started page with real content
    const heading = page.locator('.dialog-body h1, article h1').first();
    await expect(heading).toContainText('Getting Started', { timeout: 10000 });
    const article = page.locator('article').first();
    const text = await article.innerText();
    expect(text.length).toBeGreaterThan(500);
  });

  test('internal doc links use hash routes not raw file paths', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/docs`);
    await expect(page.locator('article').first()).toBeVisible({ timeout: 15000 });

    // All internal doc links should point to #/docs/... not raw .md paths
    const docLinks = await page.locator('article a[href]').all();
    for (const link of docLinks) {
      const href = await link.getAttribute('href');
      if (!href) continue;
      // External links are fine
      if (href.startsWith('http') || href.startsWith('//')) continue;
      // Internal links must use hash routing
      expect(href, `Link "${await link.innerText()}" has broken href: ${href}`)
        .toMatch(/^#\//);
    }
  });

  test('clicking internal link from a guide page works', async ({ page }) => {
    // Navigate to Core Concepts which references other guides
    await page.goto(`${BASE_URL}/#/docs/guides/core-concepts`);
    await expect(page.locator('article').first()).toBeVisible({ timeout: 10000 });

    // Check that any internal link in the content uses hash routing
    const internalLinks = await page.locator('article a[href^="#/docs/"]').all();
    if (internalLinks.length > 0) {
      const firstLink = internalLinks[0];
      const href = await firstLink.getAttribute('href');
      await firstLink.click();
      await page.waitForTimeout(1000);

      // Should show new content, not an error page
      const article = page.locator('article').first();
      await expect(article).toBeVisible({ timeout: 10000 });
      const text = await article.innerText();
      expect(text.length).toBeGreaterThan(100);
      // Should NOT show "Document Not Found"
      expect(text).not.toContain('Document Not Found');
    }
  });
});

test.describe('Docs PDV — Sidebar navigation renders content', () => {
  test('clicking sidebar entries loads actual documentation', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto(`${BASE_URL}/#/docs`);
    await expect(page.locator('text=Documentation').first()).toBeVisible({ timeout: 15000 });

    const sidebar = page.locator('nav.docs-sidebar');

    // Expand GUIDES section
    const guidesBtn = sidebar.locator('button:has-text("GUIDES")').first();
    await guidesBtn.click();
    await page.waitForTimeout(300);

    // Click first guide entry
    const firstGuide = sidebar.locator(':scope > div > div > button').first();
    await expect(firstGuide).toBeVisible({ timeout: 5000 });
    await firstGuide.click();
    await page.waitForTimeout(500);

    // Content should render with actual documentation
    const article = page.locator('article').first();
    await expect(article).toBeVisible({ timeout: 10000 });
    const text = await article.innerText();
    expect(text.length).toBeGreaterThan(200);
    expect(text).not.toContain('Document Not Found');
  });

  test('expanding all sections shows entries for each', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/docs`);
    await expect(page.locator('text=Documentation').first()).toBeVisible({ timeout: 15000 });

    const sidebar = page.locator('nav.docs-sidebar');
    const sections = ['OVERVIEW', 'GUIDES', 'API REFERENCE', 'ARCHITECTURE', 'COMPONENTS', 'CONTRIBUTING'];

    for (const section of sections) {
      const btn = sidebar.locator(`button:has-text("${section}")`).first();
      await btn.click();
      await page.waitForTimeout(200);
    }

    // After expanding all, there should be many doc entries
    const entries = await sidebar.locator(':scope > div > div > button').all();
    expect(entries.length).toBeGreaterThan(30);
  });
});

test.describe('Docs PDV — Error handling', () => {
  test('nonexistent doc path shows friendly error', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/docs/nonexistent/path`);
    await page.waitForTimeout(2000);

    await expect(page.locator('text=Document Not Found')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button:has-text("Go to Documentation Home")')).toBeVisible();
  });

  test('error page "Go to Documentation Home" button works', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/docs/nonexistent/path`);
    await expect(page.locator('text=Document Not Found')).toBeVisible({ timeout: 10000 });

    await page.locator('button:has-text("Go to Documentation Home")').click();
    await page.waitForTimeout(1000);

    const article = page.locator('article').first();
    await expect(article).toBeVisible({ timeout: 10000 });
    const text = await article.innerText();
    expect(text).toContain('SpecifyJS');
    expect(text).not.toContain('Document Not Found');
  });

  test('no JavaScript errors on docs page', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto(`${BASE_URL}/#/docs`);
    await expect(page.locator('article').first()).toBeVisible({ timeout: 15000 });

    // Navigate to a guide
    await page.goto(`${BASE_URL}/#/docs/guides/getting-started`);
    await expect(page.locator('article').first()).toBeVisible({ timeout: 10000 });

    // Navigate to API reference
    await page.goto(`${BASE_URL}/#/docs/api/hooks`);
    await expect(page.locator('article').first()).toBeVisible({ timeout: 10000 });

    expect(errors).toEqual([]);
  });
});
