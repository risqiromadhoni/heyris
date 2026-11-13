// spec: specs/writing-index.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

test.describe("Writing index", () => {
  test("Loads with the right heading, title and language", async ({ page }) => {
    // 1. Open the writing index at /tulisan
    await page.goto("/tulisan");
    await expect(page).toHaveTitle("Tulisan · Risqi Romadhoni");
    await expect(page.locator("html")).toHaveAttribute("lang", "id");
    const heading = page.getByRole("main").getByRole("heading", { level: 1 });
    await expect(heading).toHaveCount(1);
    await expect(heading).toHaveAccessibleName("Tulisan");
  });
});
