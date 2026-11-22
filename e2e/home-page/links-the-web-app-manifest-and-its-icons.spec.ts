// spec: specs/home-page.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

interface WebManifest {
  name: string;
  start_url: string;
  icons: Array<{ src: string; sizes: string; purpose: string }>;
}

test.describe("Home page", () => {
  test("Links the web app manifest and its icons", async ({ page }) => {
    // 1. Open the home page at /
    await page.goto("/");
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
      "href",
      "/manifest.webmanifest",
    );
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute(
      "href",
      "/apple-touch-icon.png",
    );
    await expect(page.locator('meta[name="theme-color"]')).toHaveCount(2);
    await expect(
      page.locator('meta[name="theme-color"][media="(prefers-color-scheme: light)"]'),
    ).toHaveCount(1);
    await expect(
      page.locator('meta[name="theme-color"][media="(prefers-color-scheme: dark)"]'),
    ).toHaveCount(1);

    // 2. Request /manifest.webmanifest
    const response = await page.request.get("/manifest.webmanifest");
    expect(response.status()).toBe(200);
    const manifest: WebManifest = await response.json();
    expect(manifest).toMatchObject({ name: "Risqi Romadhoni", start_url: "/" });
    expect(manifest.icons).toEqual([
      expect.objectContaining({ sizes: "192x192", purpose: "any" }),
      expect.objectContaining({ sizes: "512x512", purpose: "any" }),
      expect.objectContaining({ sizes: "512x512", purpose: "maskable" }),
    ]);

    // 3. Request every icon the manifest lists, and /apple-touch-icon.png
    const iconPaths = [
      ...manifest.icons.map((icon: { src: string }) => icon.src),
      "/apple-touch-icon.png",
    ];

    for (const iconPath of iconPaths) {
      const iconResponse = await page.request.get(iconPath);
      expect(iconResponse.status()).toBe(200);
      expect(iconResponse.headers()["content-type"]).toContain("image/png");
    }
  });
});
