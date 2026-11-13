// spec: specs/note-page.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

test.describe("Note page", () => {
  test("Loads with a heading, a TL;DR, its tags and the Indonesian language", async ({ page }) => {
    // 1. Open the note at /catatan/retry-dengan-schedule
    await page.goto("/catatan/retry-dengan-schedule");
    await expect(page.locator("html")).toHaveAttribute("lang", "id");
    await expect(page).toHaveTitle("Retry dengan Schedule di Effect v4 · Risqi Romadhoni");
    const heading = page.getByRole("main").getByRole("heading", { level: 1 });
    await expect(heading).toHaveText("Retry dengan Schedule di Effect v4");
    // 2. Check the TL;DR box and its three tags
    await expect(page.getByRole("complementary", { name: "Singkatnya" })).toContainText(
      "Gabungkan Schedule.exponential",
    );
    await expect(page.locator("article > header > ul > li")).toHaveCount(3);
    // 3. Check the feedback line and the related notes heading
    await expect(page.getByRole("link", { name: "Kabari saya" })).toHaveAttribute(
      "href",
      /^mailto:risqi\.romadhoni96@gmail\.com\?subject=/,
    );
    await expect(page.getByRole("heading", { name: "Catatan lainnya" })).toBeVisible();
  });
});
