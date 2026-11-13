// spec: specs/notes-index.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

test.describe("Notes index", () => {
  test("Has no WCAG 2.2 AA violations", async ({ page, makeAxeBuilder }) => {
    // 1. Open the notes index at /catatan
    await page.goto("/catatan");
    await expect(page.getByRole("heading", { level: 1, name: "Catatan" })).toBeVisible();

    // 2. Run an axe scan limited to WCAG 2.2 Level A and AA rules
    const results = await makeAxeBuilder().analyze();
    expect(results.violations).toEqual([]);
  });
});
