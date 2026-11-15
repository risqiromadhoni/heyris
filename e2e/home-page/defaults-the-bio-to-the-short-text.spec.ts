// spec: specs/home-page.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

test.describe("Home page", () => {
  test("Selects the short bio by default and shows only its text", async ({ page }) => {
    // 1. Open the home page at /
    await page.goto("/");

    // 2. Check "Singkat" is checked and "Panjang" is not
    await expect(page.getByRole("radio", { name: "Singkat" })).toBeChecked();
    await expect(page.getByRole("radio", { name: "Panjang" })).not.toBeChecked();

    // 3. Check the short text is visible and the text only the long bio has is hidden
    await expect(page.getByText("menulis di blog ini sejak 2024")).toBeVisible();
    await expect(page.getByText("Situs ini tidak memasang cookie pelacak")).toBeHidden();
  });
});
