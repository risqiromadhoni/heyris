// spec: specs/home-page.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

test.describe("Home page", () => {
  test("Keeps the chosen theme across reloads, with the class set before the document is parsed", async ({
    page,
  }) => {
    // 1. Open the home page at / and switch to dark mode
    await page.goto("/");
    await page.getByRole("button", { name: "Beralih ke mode gelap" }).click();

    // 2. Record the html class when the document reaches DOMContentLoaded, on every load.
    // The theme script is an inline script in the head, so it has run before the body is parsed.
    await page.addInitScript(() => {
      document.addEventListener("DOMContentLoaded", () => {
        sessionStorage.setItem("classAtDomContentLoaded", document.documentElement.className);
      });
    });

    // 3. Reload the page. Playwright's default colour scheme is light, so only the saved theme can make it dark.
    await page.reload();
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);
    expect(await page.evaluate(() => sessionStorage.getItem("classAtDomContentLoaded"))).toMatch(
      /\bdark\b/,
    );
    await expect(page.getByRole("button", { name: "Beralih ke mode terang" })).toBeVisible();
  });
});
