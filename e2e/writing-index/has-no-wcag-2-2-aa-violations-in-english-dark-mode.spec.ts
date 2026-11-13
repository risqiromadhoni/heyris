// spec: specs/writing-index.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

test.describe("Writing index", () => {
  test("Has no WCAG 2.2 AA violations in English and dark mode", async ({
    page,
    makeAxeBuilder,
  }) => {
    // 1. Set the saved theme to dark before the page loads, then open the English writing index at /en/writing
    await page.addInitScript(() => localStorage.setItem("theme", "dark"));
    await page.goto("/en/writing");
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);
    await expect(page.getByRole("heading", { level: 1, name: "Writing" })).toBeVisible();

    // 2. Run an axe scan limited to WCAG 2.2 Level A and AA rules
    const results = await makeAxeBuilder().analyze();
    expect(results.violations).toEqual([]);
  });
});
