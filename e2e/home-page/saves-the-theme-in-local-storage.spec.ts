// spec: specs/home-page.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

test.describe("Home page", () => {
  test("Saves the chosen theme in localStorage under the theme key", async ({ page }) => {
    // 1. Open the home page at /
    await page.goto("/");

    // 2. Click the theme toggle to switch to dark mode
    await page.getByRole("button", { name: "Beralih ke mode gelap" }).click();
    expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe("dark");

    // 3. Click it again to switch back to light mode
    await page.getByRole("button", { name: "Beralih ke mode terang" }).click();
    expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe("light");
  });
});
