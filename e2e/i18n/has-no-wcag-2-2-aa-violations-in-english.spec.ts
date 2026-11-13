// spec: specs/i18n.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

test.describe("i18n", () => {
  test("Has no WCAG 2.2 AA violations on the English home", async ({ page, makeAxeBuilder }) => {
    // 1. Open the English home at /en
    await page.goto("/en");
    await expect(page.getByRole("heading", { level: 2, name: "Writing" })).toBeVisible();

    // 2. Run an axe scan limited to WCAG 2.2 Level A and AA rules
    const results = await makeAxeBuilder().analyze();
    expect(results.violations).toEqual([]);
  });
});
