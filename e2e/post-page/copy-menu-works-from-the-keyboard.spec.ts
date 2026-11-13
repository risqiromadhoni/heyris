// spec: specs/post-page.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

test.describe("Post page", () => {
  test("Copy menu opens, moves between items and closes on Escape with focus returned", async ({
    page,
  }) => {
    // 1. Open the post at /tulisan/situs-ini-astro-void-cloudflare-workers
    await page.goto("/tulisan/situs-ini-astro-void-cloudflare-workers");
    // 2. Focus the menu caret and open the menu with Enter
    const caret = page.getByRole("button", { name: "Opsi lain" });
    await caret.focus();
    await page.keyboard.press("Enter");
    await expect(caret).toHaveAttribute("aria-expanded", "true");
    // 3. Move to the first item with ArrowDown, then to the next with ArrowDown
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("link", { name: "Lihat sebagai Markdown" })).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("link", { name: "Buka di ChatGPT" })).toBeFocused();
    // 4. Press Escape: the menu closes and focus returns to the caret
    await page.keyboard.press("Escape");
    await expect(page.getByRole("link", { name: "Lihat sebagai Markdown" })).toBeHidden();
    await expect(caret).toBeFocused();
    await expect(caret).toHaveAttribute("aria-expanded", "false");
  });
});
