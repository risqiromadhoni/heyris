// spec: specs/post-page.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

test.describe("Post page", () => {
  test("Update history opens from the clock button, scans clean and closes on Escape", async ({
    page,
    makeAxeBuilder,
  }) => {
    const history = page.getByRole("button", { name: "Riwayat pembaruan" });
    const items = page.locator("#update-history li");

    // 1. Open the updated post at /tulisan/typescript-monorepo-setup-guide
    await page.goto("/tulisan/typescript-monorepo-setup-guide");
    await expect(page.getByText("Terbit pertama kali")).toHaveCount(0);
    await expect(history).toHaveAttribute("aria-expanded", "false");

    // 2. Hover the "Riwayat pembaruan" button
    await history.hover();
    await expect(history).toHaveAttribute("aria-expanded", "true");
    await expect(items).toHaveText([/Diperbarui\s*14 November 2026/, /Terbit\s*1 Desember 2024/]);

    // 3. Run an axe scan limited to WCAG 2.2 Level A and AA rules with the panel open
    expect((await makeAxeBuilder().analyze()).violations).toEqual([]);

    // 4. Focus the button and press Escape
    await history.focus();
    await page.keyboard.press("Escape");
    await expect(items.first()).toBeHidden();
    await expect(history).toHaveAttribute("aria-expanded", "false");

    // 5. Open the post at /tulisan/rilis-1-0-0-github-actions, which has no updates
    await page.goto("/tulisan/rilis-1-0-0-github-actions");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(history).toHaveCount(0);
  });
});
