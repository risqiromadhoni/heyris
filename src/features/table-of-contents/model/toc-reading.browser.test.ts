import { describe, expect, it } from "vite-plus/test";
import { page } from "vite-plus/test/browser";

import {
  heading,
  link,
  loadWithHash,
  open,
  panelHidden,
  toggle,
  useTableOfContentsFixture,
} from "./toc.fixture";

useTableOfContentsFixture();

describe("table of contents reading position", () => {
  it("beside the text, marks a chosen link at once without passing the sections between", async () => {
    await page.viewport(1440, 900);
    await open();

    const marked = new Set<string>();

    const observer = new MutationObserver(() => {
      const current = document.querySelector("[data-toc-link][aria-current]");

      if (current?.textContent) marked.add(current.textContent);
    });

    observer.observe(document.querySelector("[data-toc]") ?? document.body, {
      attributes: true,
      attributeFilter: ["aria-current"],
      subtree: true,
    });

    link("Tiga")
      .element()
      .dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    // Stop at "Dua" for a few frames, as a smooth scroll passes it on the way.
    heading("dua").scrollIntoView();
    await new Promise((resolve) => setTimeout(resolve, 80));
    heading("tiga").scrollIntoView();

    await expect.element(link("Tiga")).toHaveAttribute("aria-current", "location");
    await new Promise((resolve) => setTimeout(resolve, 300));
    observer.disconnect();

    expect([...marked]).toEqual(["Tiga"]);
    await expect.element(toggle()).toHaveAttribute("aria-expanded", "true");
  });
  it("marks no section above the first heading", async () => {
    await open();

    for (const name of ["Satu", "Dua", "Tiga"]) {
      await expect.element(link(name)).not.toHaveAttribute("aria-current");
    }
  });
  it("marks the section being read and moves the indicator to it", async () => {
    // Open first: clicking the toggle scrolls it into view, back to the top.
    await open();
    heading("dua").scrollIntoView();

    await expect.element(link("Dua")).toHaveAttribute("aria-current", "location");
    await expect.element(link("Satu")).not.toHaveAttribute("aria-current");

    const indicator = document.querySelector<HTMLElement>("[data-toc-indicator]");
    const target = link("Dua").element();

    expect(target).toBeInstanceOf(HTMLElement);
    await expect
      .poll(() => indicator?.style.getPropertyValue("--toc-y"))
      .toBe(`${target instanceof HTMLElement ? target.offsetTop : -1}px`);

    heading("tiga").scrollIntoView();
    await expect.element(link("Tiga")).toHaveAttribute("aria-current", "location");
    await expect.element(link("Dua")).not.toHaveAttribute("aria-current");
  });
  it("beside the text, opens on arrival at a section's URL with that section marked", async () => {
    await page.viewport(1440, 900);
    loadWithHash("#dua");

    await expect.element(toggle()).toHaveAttribute("aria-expanded", "true");
    await expect.element(link("Dua")).toHaveAttribute("aria-current", "location");
  });
  it("beside the text, opens when the fragment changes to a section", async () => {
    await page.viewport(1440, 900);
    location.hash = "#tiga";

    await expect.element(toggle()).toHaveAttribute("aria-expanded", "true");
    await expect.element(link("Tiga")).toHaveAttribute("aria-current", "location");
  });
  it("stays closed for a fragment that is not a section, or over the text", async () => {
    await page.viewport(1440, 900);
    loadWithHash("#lain");
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(panelHidden()).toBe(true);

    await page.viewport(414, 896);
    loadWithHash("#dua");
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(panelHidden()).toBe(true);
  });
});
