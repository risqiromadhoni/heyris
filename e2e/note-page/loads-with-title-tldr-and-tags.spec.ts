// spec: specs/note-page.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

test.describe("Note page", () => {
  test("Loads with a heading, a TL;DR, its tags and the Indonesian language", async ({ page }) => {
    // 1. Open the note at /catatan/google-places-session-token
    await page.goto("/catatan/google-places-session-token");
    await expect(page.locator("html")).toHaveAttribute("lang", "id");
    await expect(page).toHaveTitle(
      "Token sesi Google Places: satu token untuk satu pencarian · Risqi Romadhoni",
    );
    const heading = page.getByRole("main").getByRole("heading", { level: 1 });
    await expect(heading).toHaveText("Token sesi Google Places: satu token untuk satu pencarian");
    // 2. Check the TL;DR box and its one tag
    await expect(page.getByRole("complementary", { name: "Singkatnya" })).toContainText(
      "Pakai satu token untuk satu pencarian",
    );
    await expect(page.locator("article > header > ul > li")).toHaveCount(1);
    await expect(page.locator("article > header > ul > li")).toHaveText("Google Places");
    // 3. Check the feedback line and the related notes heading
    await expect(page.getByRole("link", { name: "Kabari saya" })).toHaveAttribute(
      "href",
      /^mailto:risqi\.romadhoni96@gmail\.com\?subject=/,
    );
    await expect(page.getByRole("heading", { name: "Catatan lainnya" })).toBeVisible();
  });
});
