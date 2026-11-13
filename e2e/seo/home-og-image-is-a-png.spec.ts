// spec: specs/seo.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";
import { pngSize } from "./png-size";

test.describe("Home page", () => {
  test("Serves the Open Graph image as a 1200 by 630 PNG", async ({ page, request }) => {
    // 1. Open the home page at /
    await page.goto("/");
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      "https://heyris.me/og/index.png",
    );
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute(
      "content",
      "1200",
    );
    await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute(
      "content",
      "630",
    );
    await expect(page.locator('meta[property="og:image:type"]')).toHaveAttribute(
      "content",
      "image/png",
    );

    // 2. Request the image path /og/index.png
    const response = await request.get("/og/index.png");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe("image/png");
    expect(pngSize(await response.body())).toEqual({ width: 1200, height: 630 });
  });
});
