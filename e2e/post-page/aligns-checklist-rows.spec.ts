// spec: specs/post-page.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

const CHECKLIST_POST = "/tulisan/how-transfer-domain-to-cloudflare";

test.describe("Post page", () => {
  test("Aligns checklist rows at every width", async ({ page, makeAxeBuilder }) => {
    for (const width of [1280, 375]) {
      // 1. Open the post with a long checklist at this width
      await page.setViewportSize({ width, height: 812 });
      await page.goto(CHECKLIST_POST);
      const labels = page.locator(".md-checklist").first().locator(".md-checklist__label");
      await expect(labels.first()).toBeVisible();

      // 2. Every label in the list starts at the same left edge
      const lefts = await labels.evaluateAll((nodes) =>
        nodes.map((node) => Math.round(node.getBoundingClientRect().left)),
      );

      expect(lefts.length).toBeGreaterThan(1);
      expect(new Set(lefts).size).toBe(1);
    }

    // 3. Scan the page in light and dark mode
    for (const theme of ["light", "dark"]) {
      await page.evaluate((value) => {
        document.documentElement.classList.toggle("dark", value === "dark");
      }, theme);
      expect((await makeAxeBuilder().analyze()).violations).toEqual([]);
    }
  });
});
