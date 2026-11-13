// spec: specs/redirects.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

const REDIRECTS = [
  ["/posts/how-internet-work", "/en/writing/how-internet-work"],
  ["/id/posts/how-internet-work", "/tulisan/how-internet-work"],
  ["/posts", "/en/writing"],
  ["/id/posts", "/tulisan"],
  ["/about", "/en"],
  ["/id/about", "/"],
  ["/projects", "/en"],
  ["/id/resources", "/"],
  ["/tags", "/en/writing"],
] as const;

test.describe("Old site URLs", () => {
  for (const [from, to] of REDIRECTS) {
    test(`Redirects ${from} to ${to} with a 301`, async ({ request }) => {
      // 1. Request the old URL without following redirects
      const response = await request.get(from, { maxRedirects: 0 });
      expect(response.status()).toBe(301);
      expect(new URL(response.headers()["location"] ?? "", "http://localhost").pathname).toBe(to);
    });
  }
});
