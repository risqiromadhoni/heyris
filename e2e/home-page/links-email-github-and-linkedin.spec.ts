// spec: specs/home-page.md
// seed: e2e/seed.spec.ts

import { expect, test } from "../fixtures";

test.describe("Home page", () => {
  test("Links to email, GitHub and LinkedIn under the title", async ({ page }) => {
    // 1. Open the home page at / and find the contact list
    await page.goto("/");
    const contact = page.getByRole("list", { name: "Kontak Risqi" });
    await expect(contact.getByRole("link")).toHaveCount(3);

    // 2. Check the email link
    await expect(contact.getByRole("link", { name: "Email" })).toHaveAttribute(
      "href",
      /^mailto:risqi\.romadhoni96@gmail\.com\?subject=Halo%20Risqi/,
    );

    // 3. Check the GitHub and LinkedIn links
    const github = contact.getByRole("link", { name: "GitHub" });
    await expect(github).toHaveAttribute("href", "https://github.com/risqiromadhoni");
    await expect(github).toHaveAttribute("target", "_blank");
    await expect(github).toHaveAttribute("rel", /noopener/);
    const linkedin = contact.getByRole("link", { name: "LinkedIn" });
    await expect(linkedin).toHaveAttribute("href", "https://www.linkedin.com/in/risqir");
    await expect(linkedin).toHaveAttribute("target", "_blank");
    await expect(linkedin).toHaveAttribute("rel", /noopener/);
  });
});
