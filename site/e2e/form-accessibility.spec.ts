import { test, expect } from "@playwright/test";

/**
 * Post-Deployment Verification: Form Component Accessibility
 *
 * Verifies that all form components in the gallery have proper
 * label-to-input associations (id/htmlFor) and no orphaned labels.
 */

test.describe("Form Component Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    const baseURL =
      process.env.SITE_URL || "https://specifyjs.asymmetric-effort.com";
    await page.goto(`${baseURL}/#/components`);
    await page.waitForTimeout(2000);
  });

  test("all form inputs have id or name attributes", async ({ page }) => {
    // Open the Form Controls section
    const formHeader = page.locator(
      '.accordion-header:has-text("Form Components")',
    );
    await formHeader.click();
    await page.waitForTimeout(1000);

    // Find all input, select, and textarea elements in the gallery
    const formFields = await page
      .locator(
        ".dialog-body input:not([type=hidden]), .dialog-body select, .dialog-body textarea",
      )
      .all();

    const violations: string[] = [];
    for (const field of formFields) {
      const id = await field.getAttribute("id");
      const name = await field.getAttribute("name");
      const type = await field.getAttribute("type");
      const tagName = await field.evaluate((el) => el.tagName.toLowerCase());

      if (!id && !name) {
        const ariaLabel = await field.getAttribute("aria-label");
        const ariaLabelledBy = await field.getAttribute("aria-labelledby");
        // Skip if it has ARIA labeling
        if (!ariaLabel && !ariaLabelledBy) {
          violations.push(
            `<${tagName}${type ? ` type="${type}"` : ""}> missing id, name, and aria-label`,
          );
        }
      }
    }

    expect(
      violations,
      `Form fields without proper identification:\n${violations.join("\n")}`,
    ).toHaveLength(0);
  });

  test("all labels with for attribute point to existing elements", async ({
    page,
  }) => {
    // Open the Form Controls section
    const formHeader = page.locator(
      '.accordion-header:has-text("Form Components")',
    );
    await formHeader.click();
    await page.waitForTimeout(1000);

    // Find all label elements with a for attribute
    const labels = await page
      .locator(".dialog-body label[for]")
      .all();

    const violations: string[] = [];
    for (const label of labels) {
      const forAttr = await label.getAttribute("for");
      if (!forAttr) continue;

      // Verify label for values are valid HTML IDs (no colons)
      if (forAttr && /[^a-zA-Z0-9_-]/.test(forAttr)) {
        violations.push(`<label for="${forAttr}"> contains invalid ID characters`);
      }

      // Check that an element with this id exists
      const target = page.locator(`#${CSS.escape(forAttr)}`);
      const count = await target.count();
      if (count === 0) {
        const labelText = await label.innerText().catch(() => "(empty)");
        violations.push(
          `<label for="${forAttr}"> ("${labelText.trim()}") points to non-existent element`,
        );
      }
    }

    expect(
      violations,
      `Labels with broken for associations:\n${violations.join("\n")}`,
    ).toHaveLength(0);
  });
});
