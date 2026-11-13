// spec: specs/notes-index.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

test.describe("Notes index", () => {
  test("Loads with the right heading, title and language", async ({ page }) => {
    // 1. Open the notes index at /catatan
    await page.goto("/catatan");
    await expect(page).toHaveTitle("Catatan · Risqi Romadhoni");
    await expect(page.locator("html")).toHaveAttribute("lang", "id");
    const heading = page.getByRole("main").getByRole("heading", { level: 1 });
    await expect(heading).toHaveCount(1);
    await expect(heading).toHaveAccessibleName("Catatan");
  });
});
