// spec: specs/home-page.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

test.describe("Home page", () => {
  test("Sets data-moved on the theme toggle only after the first click", async ({ page }) => {
    // 1. Open the home page at /
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Beralih ke mode gelap" });

    // 2. Check the toggle has no data-moved attribute, so the sky shows its resting state
    expect(await toggle.getAttribute("data-moved")).toBeNull();

    // 3. Click the toggle and check data-moved is now set
    await toggle.click();
    await expect(page.getByRole("button", { name: "Beralih ke mode terang" })).toHaveAttribute(
      "data-moved",
      "",
    );
  });
});
