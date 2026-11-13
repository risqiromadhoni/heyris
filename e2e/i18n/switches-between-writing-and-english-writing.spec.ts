// spec: specs/i18n.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

test.describe("i18n", () => {
  test("Switches between Tulisan and English Writing", async ({ page }) => {
    // 1. Open the writing index at /tulisan
    await page.goto("/tulisan");
    await expect(page.locator("html")).toHaveAttribute("lang", "id");
    // 2. Press EN in the top bar
    await page.getByRole("link", { name: "EN", exact: true }).click();
    await expect(page).toHaveURL(/\/en\/writing$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("heading", { level: 1, name: "Writing" })).toBeVisible();
    // 3. Press ID in the top bar to go back to Tulisan
    await page.getByRole("link", { name: "ID", exact: true }).click();
    await expect(page).toHaveURL(/\/tulisan$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "id");
  });
});
