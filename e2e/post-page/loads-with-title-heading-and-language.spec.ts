// spec: specs/post-page.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

test.describe("Post page", () => {
  test("Loads with a heading, a title and the Indonesian language", async ({ page }) => {
    // 1. Open the post at /tulisan/situs-ini-astro-void-cloudflare-workers
    await page.goto("/tulisan/situs-ini-astro-void-cloudflare-workers");
    await expect(page.locator("html")).toHaveAttribute("lang", "id");
    await expect(page).toHaveTitle(
      "Astro dan Void di Cloudflare Workers: cara situs ini dibangun · Risqi Romadhoni",
    );
    const heading = page.getByRole("main").getByRole("heading", { level: 1 });
    await expect(heading).toHaveCount(1);
    await expect(heading).toHaveText(
      "Astro dan Void di Cloudflare Workers: cara situs ini dibangun",
    );
    // 2. Check the feedback line links to a correction mail
    await expect(page.getByRole("link", { name: "Kabari saya" })).toHaveAttribute(
      "href",
      "mailto:risqi@heyris.me?subject=Koreksi%3A%20Astro%20dan%20Void%20di%20Cloudflare%20Workers%3A%20cara%20situs%20ini%20dibangun",
    );
  });
});
