// spec: specs/seo.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";
import { APP_SITE } from "../site";

test.describe("Robots file", () => {
  test("Lists the sitemap in robots.txt", async ({ request }) => {
    // 1. Request /robots.txt
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);

    // 2. Check that every crawler is allowed and the sitemap is named
    const body = await response.text();
    expect(body).toContain("User-agent: *");
    expect(body).toContain("Allow: /");
    expect(body).toContain(`Sitemap: ${new URL("/sitemap-index.xml", APP_SITE).href}`);
  });
});
