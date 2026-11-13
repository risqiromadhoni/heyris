// spec: specs/i18n.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

test.describe("i18n", () => {
  test("Switches between the home and the English home", async ({ page }) => {
    // 1. Open the home page at /
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "id");
    await expect(page.locator('[aria-current="true"]')).toHaveText(/^ID/);
    // 2. Press EN next to the contact links
    await page.getByRole("link", { name: "EN", exact: true }).click();
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("heading", { level: 2, name: "Writing" })).toBeVisible();
    // 3. Press ID next to the contact links
    await page.getByRole("link", { name: "ID", exact: true }).click();
    await expect(page).toHaveURL((url) => url.pathname === "/");
    await expect(page.locator("html")).toHaveAttribute("lang", "id");
  });
});
