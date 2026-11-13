// spec: specs/i18n.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

test.describe("i18n", () => {
  test("Links the article's EN toggle to the English writing index", async ({ page }) => {
    // 1. Open the post at /tulisan/situs-pribadi-cloudflare-workers-vinext
    await page.goto("/tulisan/situs-pribadi-cloudflare-workers-vinext");
    await expect(page.locator("html")).toHaveAttribute("lang", "id");
    // 2. Check the EN link in the top bar goes to the English writing index
    const english = page.getByRole("link", { name: "EN", exact: true });
    await expect(english).toHaveAttribute("href", "/en/writing");
    await expect(english).toHaveAttribute("hreflang", "en");
    // 3. Follow the link
    await english.click();
    await expect(page).toHaveURL(/\/en\/writing$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });
});
