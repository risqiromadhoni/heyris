// spec: specs/notes-index.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

test.describe("Notes index", () => {
  test("Filters by topic and keeps it in the URL", async ({ page }) => {
    // 1. Open the notes index at /catatan
    await page.goto("/catatan");
    await expect(page.getByRole("button", { name: /^Semua/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    // 2. Press the "Cloudflare" pill
    const cloudflare = page.getByRole("button", { name: /^Cloudflare/ });
    const expected = await page.locator('[data-filter-item][data-topic="cloudflare"]').count();
    await cloudflare.click();
    await expect(page).toHaveURL(/[?&]topik=cloudflare/);
    await expect(cloudflare).toHaveAttribute("aria-pressed", "true");

    // 3. Check that only the Cloudflare notes are listed
    await expect(page.locator("[data-filter-item]:visible")).toHaveCount(expected);
    await expect(page.locator("[data-filter-item]:visible").first()).toHaveAttribute(
      "data-topic",
      "cloudflare",
    );
  });
});
