// spec: specs/i18n.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

test.describe("i18n", () => {
  test("Has no WCAG 2.2 AA violations on the English home in dark mode", async ({
    page,
    makeAxeBuilder,
  }) => {
    // 1. Set the saved theme to dark before the page loads, then open the English home at /en
    await page.addInitScript(() => localStorage.setItem("theme", "dark"));
    await page.goto("/en");
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);
    await expect(page.getByRole("heading", { level: 2, name: "Writing" })).toBeVisible();

    // 2. Run an axe scan limited to WCAG 2.2 Level A and AA rules
    const results = await makeAxeBuilder().analyze();
    expect(results.violations).toEqual([]);
  });
});
