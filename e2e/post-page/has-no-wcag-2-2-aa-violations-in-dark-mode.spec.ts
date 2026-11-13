// spec: specs/post-page.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

test.describe("Post page", () => {
  test("Has no WCAG 2.2 AA violations in dark mode, with the copy menu closed and open", async ({
    page,
    makeAxeBuilder,
  }) => {
    // 1. Set the saved theme to dark before the page loads, then open the post at /tulisan/situs-pribadi-cloudflare-workers-vinext
    await page.addInitScript(() => localStorage.setItem("theme", "dark"));
    await page.goto("/tulisan/situs-pribadi-cloudflare-workers-vinext");
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // 2. Run an axe scan limited to WCAG 2.2 Level A and AA rules with the copy menu closed
    expect((await makeAxeBuilder().analyze()).violations).toEqual([]);

    // 3. Open the copy menu and scan again
    await page.getByRole("button", { name: "Opsi lain" }).click();
    await expect(page.getByRole("link", { name: "Lihat sebagai Markdown" })).toBeVisible();
    expect((await makeAxeBuilder().analyze()).violations).toEqual([]);
  });
});
