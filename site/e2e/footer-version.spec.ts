import { test, expect } from "@playwright/test";
import { readFileSync } from "fs";
import { resolve } from "path";

/**
 * Post-Deployment Verification: Footer Version Accuracy
 *
 * Verifies that the version displayed in the site footer matches
 * the version in core/package.json.
 */

test.describe("Footer Version", () => {
  test("footer displays the correct package version", async ({ page }) => {
    const baseURL =
      process.env.SITE_URL || "https://specifyjs.asymmetric-effort.com";

    // Read the expected version from package.json
    const pkgPath = resolve(__dirname, "../../core/package.json");
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
    const expectedVersion = pkg.version as string;

    // Navigate to the site
    await page.goto(baseURL, {
      waitUntil: "domcontentloaded",
      timeout: 15_000,
    });
    await page.waitForTimeout(2000);

    // Find the footer text containing the version
    const footerText = await page.locator("footer").innerText();

    expect(
      footerText,
      `Footer should contain version v${expectedVersion}`,
    ).toContain(`v${expectedVersion}`);
  });
});
