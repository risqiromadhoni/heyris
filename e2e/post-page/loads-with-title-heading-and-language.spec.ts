// spec: specs/post-page.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

test.describe("Post page", () => {
  test("Loads with a heading, a title and the Indonesian language", async ({ page }) => {
    // 1. Open the post at /tulisan/situs-pribadi-cloudflare-workers-vinext
    await page.goto("/tulisan/situs-pribadi-cloudflare-workers-vinext");
    await expect(page.locator("html")).toHaveAttribute("lang", "id");
    await expect(page).toHaveTitle(
      "Situs pribadi di Cloudflare Workers dengan vinext · Risqi Romadhoni",
    );
    const heading = page.getByRole("main").getByRole("heading", { level: 1 });
    await expect(heading).toHaveCount(1);
    await expect(heading).toHaveText("Situs pribadi di Cloudflare Workers dengan vinext");
    // 2. Check the feedback line links to a correction mail
    await expect(page.getByRole("link", { name: "Kabari saya" })).toHaveAttribute(
      "href",
      "mailto:halo@heyris.me?subject=Koreksi%3A%20Situs%20pribadi%20di%20Cloudflare%20Workers%20dengan%20vinext",
    );
  });
});
