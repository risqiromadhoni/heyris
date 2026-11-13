// spec: specs/home-page.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

test.describe("Home page", () => {
  test("Flips the theme button's accessible name between dark and light mode", async ({ page }) => {
    // 1. Open the home page at / in light mode
    await page.goto("/");
    const toggle = page.getByRole("button", { name: /^Beralih ke mode/ });
    await expect(toggle).toHaveAccessibleName("Beralih ke mode gelap");

    // 2. Click the toggle
    await toggle.click();

    // 3. The name now offers light mode
    await expect(toggle).toHaveAccessibleName("Beralih ke mode terang");
  });
});
