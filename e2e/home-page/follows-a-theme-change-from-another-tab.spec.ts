// spec: specs/home-page.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

test.describe("Home page", () => {
  test("Follows a theme change made in another tab", async ({ context, page }) => {
    // 1. Open the home page at / in two tabs of one browser context
    await page.goto("/");
    const other = await context.newPage();
    await other.goto("/");
    await expect(page.locator("html")).not.toHaveClass(/\bdark\b/);
    await expect(other.locator("html")).not.toHaveClass(/\bdark\b/);

    // 2. Click the theme toggle in the first tab
    await page.getByRole("button", { name: "Beralih ke mode gelap" }).click();
    await expect(other.locator("html")).toHaveClass(/\bdark\b/);

    // 3. Click the theme toggle in the first tab again
    await page.getByRole("button", { name: "Beralih ke mode terang" }).click();
    await expect(other.locator("html")).not.toHaveClass(/\bdark\b/);
  });
});
