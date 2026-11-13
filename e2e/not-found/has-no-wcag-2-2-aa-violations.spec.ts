// spec: specs/not-found.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

test.describe("Not found page", () => {
  test("Has no WCAG 2.2 AA violations", async ({ page, makeAxeBuilder }) => {
    // 1. Request a path that does not exist at /does-not-exist
    await page.goto("/does-not-exist");
    await expect(
      page.getByRole("heading", { level: 1, name: "Halaman tidak ditemukan" }),
    ).toBeVisible();

    // 2. Run an axe scan limited to WCAG 2.2 Level A and AA rules
    const results = await makeAxeBuilder().analyze();
    expect(results.violations).toEqual([]);
  });
});
