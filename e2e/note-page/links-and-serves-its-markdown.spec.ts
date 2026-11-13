// spec: specs/note-page.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

test.describe("Note page", () => {
  test("Links its Markdown alternate and serves it as text/markdown", async ({ page, request }) => {
    // 1. Open the note at /catatan/google-places-session-token
    await page.goto("/catatan/google-places-session-token");
    // 2. Read the text/markdown alternate link in the head
    const alternate = page.locator('link[rel="alternate"][type="text/markdown"]');
    await expect(alternate).toHaveAttribute("href", "/catatan/google-places-session-token.md");
    // 3. Request the linked Markdown
    const response = await request.get("/catatan/google-places-session-token.md");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe("text/markdown; charset=utf-8");
    // 4. Check its frontmatter carries the title, the date and the TL;DR
    const text = await response.text();
    expect(text).toContain('title: "Token sesi Google Places: satu token untuk satu pencarian"');
    expect(text).toContain("date: 2026-11-14");
    expect(text).toContain("tldr: ");
  });
});
