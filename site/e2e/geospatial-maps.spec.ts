import { test, expect } from "@playwright/test";

test.describe("Geospatial Maps — Feature-Gated Gallery Section", () => {
  test("component gallery page loads without JavaScript errors", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/#/components");
    await expect(page.locator(".dialog-title")).toContainText(
      "Component Gallery",
    );
    expect(errors).toEqual([]);
  });

  test("geospatial section is NOT visible when flag is disabled", async ({
    page,
  }) => {
    // The "geospatial-maps" flag is disabled by default in features.json,
    // so the FeatureGate should hide the entire accordion section.
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/#/components");
    await expect(page.locator(".dialog-title")).toContainText(
      "Component Gallery",
    );

    // The "Geospatial Maps" accordion header text should not be present
    const geospatialHeader = page.locator(
      '.accordion-header:has-text("Geospatial Maps")',
    );
    await expect(geospatialHeader).toHaveCount(0);

    // No US State Map or Earth Globe previews should be visible
    const usMapPreview = page.locator('text="US State Map"');
    await expect(usMapPreview).toHaveCount(0);

    const globePreview = page.locator('text="Earth Globe"');
    await expect(globePreview).toHaveCount(0);

    expect(errors).toEqual([]);
  });

  test("other accordion sections still render when geospatial is hidden", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/#/components");
    await expect(page.locator(".dialog-title")).toContainText(
      "Component Gallery",
    );

    // Verify that non-gated sections are still present
    const chartsHeader = page.locator(
      '.accordion-header:has-text("Charts & Graphs")',
    );
    await expect(chartsHeader).toHaveCount(1);

    const mathHeader = page.locator(
      '.accordion-header:has-text("Mathematical")',
    );
    await expect(mathHeader).toHaveCount(1);

    expect(errors).toEqual([]);
  });

  // NOTE: The "geospatial-maps" feature flag is loaded from /features.json at
  // build time by the FeatureFlagProvider. In the deployed site, there is no
  // URL parameter or runtime mechanism to toggle feature flags from the
  // outside. Therefore, we cannot programmatically enable the flag in a PDV
  // test. The flag would need to be set to true in features.json and
  // redeployed to test the enabled state.
  //
  // The E2E tests in core/tests/e2e/geospatial.spec.ts test the actual
  // component rendering in a local dev server context where the components
  // are rendered directly (not behind a feature gate).
});
