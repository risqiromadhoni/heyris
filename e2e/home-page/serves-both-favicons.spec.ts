// spec: specs/home-page.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

test.describe("Home page", () => {
  test("Serves both favicons", async ({ page }) => {
    // 1. Open the home page at /
    await page.goto("/");
    await expect(page.locator('link[rel="icon"][type="image/svg+xml"]')).toHaveAttribute(
      "href",
      "/favicon.svg",
    );
    await expect(page.locator('link[rel="icon"]:not([type])')).toHaveAttribute(
      "href",
      "/favicon.ico",
    );

    // 2. Request /favicon.svg
    const svgResponse = await page.request.get("/favicon.svg");
    expect(svgResponse.status()).toBe(200);
    expect(svgResponse.headers()["content-type"]).toContain("image/svg+xml");

    // 3. Request /favicon.ico
    const icoResponse = await page.request.get("/favicon.ico");
    expect(icoResponse.status()).toBe(200);
  });
});
