// spec: specs/home-page.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

test.describe("Home page", () => {
  test("Swaps the title to the greeting while the contact link is hovered or focused, and keeps the heading name", async ({
    page,
  }) => {
    // 1. Open the home page at /
    await page.goto("/");
    const heading = page.getByRole("heading", { level: 1 });
    const contact = page.getByRole("link", { name: "GitHub" });

    // 2. Hover the contact link and check the greeting is shown
    await contact.hover();
    await expect(heading).toHaveAttribute("data-state", "greeting");
    await expect(page.locator(".part-greeting")).toHaveCSS("opacity", "1");
    await expect(heading).toHaveAccessibleName("@risqiromadhoni");

    // 3. Move the pointer away and check the farewell is shown
    await page.mouse.move(0, 0);
    await expect(heading).toHaveAttribute("data-state", "farewell");

    // 4. Focus the contact link from the keyboard and check the greeting is shown again
    await contact.focus();
    await expect(heading).toHaveAttribute("data-state", "greeting");
    await expect(heading).toHaveAccessibleName("@risqiromadhoni");
  });
});
