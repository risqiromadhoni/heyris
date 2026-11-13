// spec: specs/post-page.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

test.describe("Post page", () => {
  test("Links its Markdown alternate and serves it as text/markdown", async ({ page, request }) => {
    // 1. Open the post at /tulisan/situs-ini-astro-void-cloudflare-workers
    await page.goto("/tulisan/situs-ini-astro-void-cloudflare-workers");
    // 2. Read the text/markdown alternate link in the head
    const alternate = page.locator('link[rel="alternate"][type="text/markdown"]');
    await expect(alternate).toHaveAttribute(
      "href",
      "/tulisan/situs-ini-astro-void-cloudflare-workers.md",
    );
    // 3. Request the linked Markdown
    const response = await request.get("/tulisan/situs-ini-astro-void-cloudflare-workers.md");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe("text/markdown; charset=utf-8");
    // 4. Check its frontmatter carries the post title
    expect(await response.text()).toContain(
      'title: "Astro dan Void di Cloudflare Workers: cara situs ini dibangun"',
    );
  });
});
