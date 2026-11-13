// spec: specs/seo.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";
import { APP_SITE } from "../site";
import { pngSize } from "./png-size";

const IMAGE_PATH = "/og/tulisan/situs-pribadi-cloudflare-workers-vinext.png";

test.describe("Post page", () => {
  test("Serves the Open Graph image as a 1200 by 630 PNG", async ({ page, request }) => {
    // 1. Open the post at /tulisan/situs-pribadi-cloudflare-workers-vinext
    await page.goto("/tulisan/situs-pribadi-cloudflare-workers-vinext");
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      new URL(IMAGE_PATH, APP_SITE).href,
    );

    // 2. Request the image path
    const response = await request.get(IMAGE_PATH);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe("image/png");
    expect(pngSize(await response.body())).toEqual({ width: 1200, height: 630 });
  });
});
