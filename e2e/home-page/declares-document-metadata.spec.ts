// spec: specs/home-page.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

test.describe("Home page", () => {
  test("Declares document metadata", async ({ page }) => {
    // 1. Open the home page at /
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "id");
    await expect(page.locator("meta[charset]")).toHaveAttribute("charset", /^utf-8$/i);
    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute(
      "content",
      "width=device-width",
    );
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      "Situs pribadi @risqiromadhoni, software engineer sejak 2016. Berisi tulisan teknis tentang Git, TypeScript, dan cara kerja internet, serta catatan singkat.",
    );
  });
});
