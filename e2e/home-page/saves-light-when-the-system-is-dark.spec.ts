// spec: specs/home-page.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

test.describe("Home page", () => {
  test.use({ colorScheme: "dark" });

  test("Saves light when the system is dark, and clears it on switching back", async ({ page }) => {
    // 1. Open the home page at / with the system in dark mode
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).toHaveClass(/\bdark\b/);

    // 2. Click the theme toggle to switch to light mode
    await page.getByRole("button", { name: "Beralih ke mode terang" }).click();
    expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe("light");
    await expect(html).not.toHaveClass(/\bdark\b/);

    // 3. Click the theme toggle again to switch back to dark mode
    await page.getByRole("button", { name: "Beralih ke mode gelap" }).click();
    expect(await page.evaluate(() => localStorage.getItem("theme"))).toBeNull();
    await expect(html).toHaveClass(/\bdark\b/);
  });
});
