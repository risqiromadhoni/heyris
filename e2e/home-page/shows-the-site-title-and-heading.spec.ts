// spec: specs/home-page.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

test.describe("Home page", () => {
  test("Shows the site title and heading", async ({ page }) => {
    // 1. Open the home page at /
    await page.goto("/");
    await expect(page).toHaveTitle("Astro");
    const heading = page.getByRole("main").getByRole("heading", { level: 1 });
    await expect(heading).toHaveCount(1);
    await expect(heading).toHaveText("Astro");
  });
});
