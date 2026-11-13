// spec: specs/note-page.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

test.describe("Note page", () => {
  test("Has no WCAG 2.2 AA violations in dark mode", async ({ page, makeAxeBuilder }) => {
    // 1. Set the saved theme to dark before the page loads, then open the note at /catatan/google-places-session-token
    await page.addInitScript(() => localStorage.setItem("theme", "dark"));
    await page.goto("/catatan/google-places-session-token");
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // 2. Run an axe scan limited to WCAG 2.2 Level A and AA rules
    const results = await makeAxeBuilder().analyze();
    expect(results.violations).toEqual([]);
  });
});
