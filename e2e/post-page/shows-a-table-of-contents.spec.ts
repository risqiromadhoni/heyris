// spec: specs/post-page.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

test.describe("Post page", () => {
  test("Table of contents opens beside the text, follows the reading position and scans clean", async ({
    page,
    makeAxeBuilder,
  }) => {
    const toggle = page.getByRole("button", { name: "Daftar isi", exact: true });
    const toc = page.getByRole("navigation", { name: "Daftar isi", exact: true });
    const links = toc.getByRole("link");

    // 1. Open the post at /tulisan/what-is-monorepo in a 1440 x 900 viewport
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/tulisan/what-is-monorepo");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");

    // 2. Click the "Daftar isi" button
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(links.first()).toHaveText("Manfaat monorepo");
    await expect(links.last()).toHaveText("Kapan memakai monorepo");

    // The text column is the article header's width; wide figures in the body may extend past it.
    const text = await page.locator("article > header").boundingBox();

    await expect
      .poll(async () => {
        const box = await toc.boundingBox();

        return box === null || text === null ? null : box.x >= text.x + text.width;
      })
      .toBe(true);

    // 3. Run an axe scan limited to WCAG 2.2 Level A and AA rules with the panel open
    expect((await makeAxeBuilder().analyze()).violations).toEqual([]);

    // 4. Click the "Contoh struktur folder" link in the panel
    const target = toc.getByRole("link", { name: "Contoh struktur folder" });

    await target.click();
    await expect(page).toHaveURL(/#contoh-struktur-folder$/);
    await expect(target).toHaveAttribute("aria-current", "location");
    await expect(toc).toBeVisible();

    // 5. Resize the viewport to 390 x 800 and press Escape with focus in the panel
    await page.setViewportSize({ width: 390, height: 800 });
    await target.focus();
    await page.keyboard.press("Escape");
    await expect(toc).toBeHidden();
    await expect(toggle).toBeFocused();

    // 6. Open the panel again
    await toggle.click();
    await expect(toc).toBeVisible();
    await expect
      .poll(async () => {
        const box = await toc.boundingBox();

        return box === null
          ? null
          : [Math.round(box.y), Math.round(box.x + box.width), Math.round(box.height)];
      })
      .toEqual([0, 390, 800]);

    // 7. Run an axe scan with the side sheet open
    expect((await makeAxeBuilder().analyze()).violations).toEqual([]);
  });
});
