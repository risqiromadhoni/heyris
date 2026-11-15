// spec: specs/home-page.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

test.describe("Home page", () => {
  test("Selects the long bio with the arrow keys and shows its text", async ({ page }) => {
    // 1. Open the home page at /
    await page.goto("/");
    const short = page.getByRole("radio", { name: "Singkat" });
    const long = page.getByRole("radio", { name: "Panjang" });

    // 2. Focus "Singkat" and press ArrowRight
    await short.focus();
    await page.keyboard.press("ArrowRight");

    // 3. Check "Panjang" is focused and checked, and its text is visible
    await expect(long).toBeFocused();
    await expect(long).toBeChecked();
    await expect(page.getByText("Situs ini tidak memasang cookie pelacak")).toBeVisible();
    await expect(page.getByText("menulis di blog ini sejak 2024")).toBeHidden();
  });
});
