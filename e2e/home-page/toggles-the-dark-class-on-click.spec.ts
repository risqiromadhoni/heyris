// spec: specs/home-page.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

test.describe("Home page", () => {
  test("Toggles the dark class on the html element when the theme button is clicked", async ({
    page,
  }) => {
    // 1. Open the home page at / in light mode
    await page.goto("/");
    await expect(page.locator("html")).not.toHaveClass(/\bdark\b/);

    // 2. Click the theme toggle
    await page.getByRole("button", { name: "Beralih ke mode gelap" }).click();
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);

    // 3. Click it again
    await page.getByRole("button", { name: "Beralih ke mode terang" }).click();
    await expect(page.locator("html")).not.toHaveClass(/\bdark\b/);
  });
});
