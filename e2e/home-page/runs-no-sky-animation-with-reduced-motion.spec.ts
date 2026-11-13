// spec: specs/home-page.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

test.use({ reducedMotion: "reduce" });

test.describe("Home page", () => {
  test("Runs no animation on the sun or the moon when the theme toggles with reduced motion", async ({
    page,
  }) => {
    // 1. Open the home page at / with prefers-reduced-motion set to reduce
    await page.goto("/");

    // 2. Click the theme toggle
    const toggle = page.getByRole("button", { name: "Beralih ke mode gelap" });
    await toggle.click();
    await expect(page.getByRole("button", { name: "Beralih ke mode terang" })).toHaveAttribute(
      "data-moved",
      "",
    );

    // 3. Count the running animations on the sun and the moon. Each should be zero.
    const sun = page.locator("[data-theme-toggle] .sun");
    const moon = page.locator("[data-theme-toggle] .moon");
    await expect(sun).toHaveCount(1);
    expect(await sun.evaluate((element) => element.getAnimations().length)).toBe(0);
    expect(await moon.evaluate((element) => element.getAnimations().length)).toBe(0);
  });
});
