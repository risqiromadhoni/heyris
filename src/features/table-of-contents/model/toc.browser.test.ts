import { describe, expect, it } from "vite-plus/test";
import { page, userEvent } from "vite-plus/test/browser";

import { heading, link, open, panelHidden, toggle, useTableOfContentsFixture } from "./toc.fixture";

useTableOfContentsFixture();

describe("table of contents panel", () => {
  it("opens and closes from the toggle", async () => {
    expect(panelHidden()).toBe(true);

    await open();
    await expect.element(link("Dua")).toBeVisible();

    await toggle().click();
    await expect.element(toggle()).toHaveAttribute("aria-expanded", "false");
    await expect.poll(panelHidden).toBe(true);
  });
  it("closes from its close button and returns focus to the toggle", async () => {
    await open();
    await page.getByRole("button", { name: "Tutup daftar isi" }).click();

    await expect.element(toggle()).toHaveAttribute("aria-expanded", "false");
    await expect.element(toggle()).toHaveFocus();
  });
  it("closes without scrolling back to the toggle", async () => {
    await open();
    heading("tiga").scrollIntoView();

    const scrolled = window.scrollY;

    // A real click focuses the close button first, which is what made returning focus scroll.
    const closeButton = page.getByRole("button", { name: "Tutup daftar isi" }).element();

    if (closeButton instanceof HTMLElement) {
      closeButton.focus();
      closeButton.click();
    }

    await expect.element(toggle()).toHaveFocus();
    expect(window.scrollY).toBe(scrolled);
  });
  it("closes on Escape from inside the panel", async () => {
    await open();
    link("Satu").element().focus();
    await userEvent.keyboard("{Escape}");

    await expect.element(toggle()).toHaveAttribute("aria-expanded", "false");
    await expect.element(toggle()).toHaveFocus();
  });
  it("over the text, closes on an outside press and after a link is chosen", async () => {
    await open();
    await page.getByText("Pembuka").click();
    await expect.poll(panelHidden).toBe(true);
    await expect.element(toggle()).toHaveAttribute("aria-expanded", "false");

    await open();
    await link("Tiga").click();
    await expect.element(toggle()).toHaveAttribute("aria-expanded", "false");
    await expect.poll(() => location.hash).toBe("#tiga");
  });
});
