// spec: specs/i18n.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

test.describe("i18n", () => {
  test("Links an untranslated English row to its Indonesian post", async ({ page }) => {
    // 1. Open the English writing index at /en/writing
    await page.goto("/en/writing");
    // 2. Find the row for the post that has no English version
    const row = page.locator('a[href="/tulisan/contoh-tanpa-terjemahan"]');
    await expect(row).toHaveCount(1);
    // 3. Check the link is marked hreflang="id" and its title is lang="id"
    await expect(row).toHaveAttribute("hreflang", "id");
    await expect(row.getByText("Contoh entri tanpa terjemahan")).toHaveAttribute("lang", "id");
    // 4. Follow the row to the Indonesian post
    await row.click();
    await expect(page).toHaveURL(/\/tulisan\/contoh-tanpa-terjemahan$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "id");
  });
});
