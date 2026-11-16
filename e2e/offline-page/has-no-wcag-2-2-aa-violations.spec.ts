// spec: specs/offline-page.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

test.describe("Offline page", () => {
  test("Has no WCAG 2.2 AA violations", async ({ page, makeAxeBuilder }) => {
    // 1. Open /offline
    await page.goto("/offline");
    await expect(
      page.getByRole("heading", { level: 1, name: "Anda sedang offline" }),
    ).toBeVisible();

    // 2. Run an axe scan limited to WCAG 2.2 Level A and AA rules
    expect((await makeAxeBuilder().analyze()).violations).toEqual([]);

    // 3. Open /en/offline
    await page.goto("/en/offline");
    await expect(page.getByRole("heading", { level: 1, name: "You're offline" })).toBeVisible();

    // 4. Run an axe scan limited to WCAG 2.2 Level A and AA rules
    expect((await makeAxeBuilder().analyze()).violations).toEqual([]);
  });
});
