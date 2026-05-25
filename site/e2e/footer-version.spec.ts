import { test, expect } from "@playwright/test";
import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { waitForDeployedVersion } from "./helpers/wait-for-deploy";

/**
 * Post-Deployment Verification: Footer Version Accuracy
 *
 * Verifies that the version displayed in the site footer matches
 * the version in core/package.json.
 *
 * Uses the shared waitForDeployedVersion utility to handle CDN
 * propagation delays (#65).
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

test.describe("Footer Version", () => {
  test("footer displays the correct package version", async ({ page }) => {
    const pkgPath = resolve(__dirname, "../../core/package.json");
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
    const expectedVersion = pkg.version as string;

    // Wait for the deployed version to match (handles CDN propagation)
    await waitForDeployedVersion(page, expectedVersion);

    // Verify footer contains the expected version
    const footerText = await page.locator("footer").innerText();
    expect(
      footerText,
      `Footer should contain version v${expectedVersion}`,
    ).toContain(`v${expectedVersion}`);
  });
});
