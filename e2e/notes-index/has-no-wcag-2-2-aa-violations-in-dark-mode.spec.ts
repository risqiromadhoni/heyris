// spec: specs/notes-index.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

test.describe("Notes index", () => {
  test("Has no WCAG 2.2 AA violations in dark mode, with and without a topic filter", async ({
    page,
    makeAxeBuilder,
  }) => {
    // 1. Set the saved theme to dark before the page loads, then open the notes index at /catatan
    await page.addInitScript(() => localStorage.setItem("theme", "dark"));
    await page.goto("/catatan");
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);
    await expect(page.getByRole("heading", { level: 1, name: "Catatan" })).toBeVisible();

    // 2. Run an axe scan limited to WCAG 2.2 Level A and AA rules with no filter applied
    expect((await makeAxeBuilder().analyze()).violations).toEqual([]);

    // 3. Press the "Cloudflare" pill and scan again with the topic filter applied
    await page.getByRole("button", { name: /^Cloudflare/ }).click();
    await expect(page).toHaveURL(/[?&]topik=cloudflare/);
    expect((await makeAxeBuilder().analyze()).violations).toEqual([]);
  });
});
