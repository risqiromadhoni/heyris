// spec: specs/not-found.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

test.describe("Not found page", () => {
  test("Shows the heading with status 404", async ({ page }) => {
    // 1. Request a path that does not exist at /does-not-exist
    const response = await page.goto("/does-not-exist");
    expect(response?.status()).toBe(404);

    // 2. Check the Indonesian heading, the English block and the noindex directive
    await expect(
      page.getByRole("heading", { level: 1, name: "Halaman tidak ditemukan" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Page not found" })).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex");
  });
});
