// spec: specs/post-page.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

const TABLE_POST = "/tulisan/backdrop-webgl-renderer-software";

test.describe("Post page", () => {
  test("Frames a wide table in a scrollable region", async ({ page, makeAxeBuilder }) => {
    // 1. Open the post with a four-column table in a 375 x 812 viewport
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(TABLE_POST);
    const frame = page.locator(".md-table").first();
    await expect(frame).toBeVisible();

    // 2. Check that the frame, not the page, scrolls sideways
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      await page.evaluate(() => window.innerWidth),
    );
    await expect(frame).toHaveAttribute("role", "region");
    await expect(frame).toHaveAttribute("tabindex", "0");
    expect(await frame.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);

    // 3. Focus the frame and scroll it with the arrow key
    await page.bringToFront();
    await frame.focus();
    await expect(frame).toBeFocused();
    await expect(async () => {
      await page.keyboard.press("ArrowRight");
      expect(await frame.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
    }).toPass();

    // 4. Scan the page in light and dark mode
    for (const theme of ["light", "dark"]) {
      await page.evaluate((value) => {
        localStorage.setItem("theme", value);
        document.documentElement.classList.toggle("dark", value === "dark");
      }, theme);
      expect((await makeAxeBuilder().analyze()).violations).toEqual([]);
    }
  });
});
