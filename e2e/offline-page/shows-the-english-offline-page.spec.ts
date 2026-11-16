// spec: specs/offline-page.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

test.describe("Offline page", () => {
  test("Shows the English offline page", async ({ page }) => {
    // 1. Open the English offline page at /en/offline
    await page.goto("/en/offline");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("heading", { level: 1, name: "You're offline" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Try again" })).toHaveAttribute("href", "");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex");
  });
});
