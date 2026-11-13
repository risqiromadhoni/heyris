// spec: specs/i18n.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

test.describe("i18n", () => {
  test("Loads the English home in English", async ({ page }) => {
    // 1. Open the English home at /en
    await page.goto("/en");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page).toHaveTitle("Risqi Romadhoni");
    // 2. Check the English bio options and the Writing and Notes headings
    await expect(page.getByRole("radio", { name: "Short" })).toHaveCount(1);
    await expect(page.getByRole("radio", { name: "Long" })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 2, name: "Writing" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Notes" })).toBeVisible();
  });
});
