import { test } from "./fixtures";

test.describe("Seed", () => {
  test("seed", async ({ page }) => {
    await page.goto("/");
  });
});
