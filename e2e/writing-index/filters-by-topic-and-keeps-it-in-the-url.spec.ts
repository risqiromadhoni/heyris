// spec: specs/writing-index.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

test.describe("Writing index", () => {
  test("Filters by topic and keeps it in the URL", async ({ page }) => {
    // 1. Open the writing index at /tulisan
    await page.goto("/tulisan");
    await expect(page.getByRole("button", { name: "Semua" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    // 2. Press the "Cloudflare" tab
    const cloudflare = page.getByRole("button", { name: "Cloudflare" });
    await cloudflare.click();
    await expect(page).toHaveURL(/[?&]topik=cloudflare/);
    await expect(cloudflare).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: "Semua" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );

    // 3. Check that only the Cloudflare post is listed
    const rows = page.locator("[data-filter-item]:visible");
    await expect(rows).toHaveCount(1);
    await expect(rows).toContainText("Memindahkan domain ke Cloudflare Registrar");
  });
});
