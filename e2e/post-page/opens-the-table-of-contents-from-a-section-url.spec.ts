// spec: specs/post-page.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

test.describe("Post page", () => {
  test("A section URL opens the table of contents beside the text", async ({ page }) => {
    const toggle = page.getByRole("button", { name: "Daftar isi", exact: true });
    const toc = page.getByRole("navigation", { name: "Daftar isi", exact: true });

    // 1. Open /tulisan/what-is-monorepo#workflow-github-actions in a 1440 x 900 viewport
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/tulisan/what-is-monorepo#workflow-github-actions");
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(toc.getByRole("link", { name: "Workflow GitHub Actions" })).toHaveAttribute(
      "aria-current",
      "location",
    );

    // 2. Open /tulisan/what-is-monorepo#workflow-github-actions in a 390 x 800 viewport
    await page.setViewportSize({ width: 390, height: 800 });
    // Leave first: the same URL again would only move to the fragment, not load the page.
    await page.goto("about:blank");
    await page.goto("/tulisan/what-is-monorepo#workflow-github-actions");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
  });
});
