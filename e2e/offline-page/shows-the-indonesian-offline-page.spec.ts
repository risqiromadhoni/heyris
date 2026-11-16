// spec: specs/offline-page.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

test.describe("Offline page", () => {
  test("Shows the Indonesian offline page", async ({ page }) => {
    // 1. Open the Indonesian offline page at /offline
    await page.goto("/offline");
    await expect(page.locator("html")).toHaveAttribute("lang", "id");
    await expect(
      page.getByRole("heading", { level: 1, name: "Anda sedang offline" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Coba lagi" })).toHaveAttribute("href", "");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex");
  });
});
