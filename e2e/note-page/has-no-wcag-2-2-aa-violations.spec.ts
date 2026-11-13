// spec: specs/note-page.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

test.describe("Note page", () => {
  test("Has no WCAG 2.2 AA violations with the copy menu closed and open", async ({
    page,
    makeAxeBuilder,
  }) => {
    // 1. Open the note at /catatan/google-places-session-token
    await page.goto("/catatan/google-places-session-token");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // 2. Run an axe scan limited to WCAG 2.2 Level A and AA rules with the copy menu closed
    expect((await makeAxeBuilder().analyze()).violations).toEqual([]);
    // 3. Open the copy menu and scan again
    await page.getByRole("button", { name: "Opsi lain" }).click();
    await expect(page.getByRole("link", { name: "Lihat sebagai Markdown" })).toBeVisible();
    expect((await makeAxeBuilder().analyze()).violations).toEqual([]);
  });
});
