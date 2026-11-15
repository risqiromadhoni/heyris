import { afterEach, beforeEach, expect } from "vite-plus/test";
import { page } from "vite-plus/test/browser";

import { mountTablesOfContents } from "./toc";

// Each section is taller than the viewport, so scrolling to one leaves the others off screen.
const section = (id: string, title: string) =>
  `<h2 id="${id}" style="scroll-margin-top: 96px; margin: 0">${title}</h2><div style="height: 1500px"></div>`;

const FIXTURE = `
  <button type="button" aria-expanded="false" aria-controls="table-of-contents" aria-label="Daftar isi" data-toc-toggle>T</button>
  <nav id="table-of-contents" hidden data-toc style="position: fixed; top: 0; right: 0; width: 200px">
    <button type="button" aria-label="Tutup daftar isi" data-toc-close>X</button>
    <div data-toc-scroller style="max-height: 200px; overflow-y: auto">
      <div data-toc-list style="position: relative">
        <span data-toc-indicator></span>
        <ol>
          <li><a href="#satu" data-toc-link>Satu</a></li>
          <li><a href="#dua" data-toc-link>Dua</a></li>
          <li><a href="#tiga" data-toc-link>Tiga</a></li>
        </ol>
      </div>
    </div>
  </nav>
  <p>Pembuka</p>
  <div style="height: 300px"></div>
  ${section("satu", "Satu")}
  ${section("dua", "Dua")}
  ${section("tiga", "Tiga")}
`;

export const toggle = () => page.getByRole("button", { name: "Daftar isi" });
export const panelHidden = () => document.querySelector("[data-toc]")?.hasAttribute("hidden");
export const link = (name: string) => page.getByRole("link", { name });

export async function open(): Promise<void> {
  await toggle().click();
  await expect.element(toggle()).toHaveAttribute("aria-expanded", "true");
}

export function heading(id: string): HTMLElement {
  const element = document.getElementById(id);

  if (element === null) throw new Error(`No heading #${id}`);

  return element;
}

/** Give each test a fresh fixture at the top of the page, in the default viewport. */
export function useTableOfContentsFixture(): void {
  beforeEach(() => {
    document.body.innerHTML = FIXTURE;
    window.scrollTo(0, 0);
    mountTablesOfContents();
  });

  afterEach(async () => {
    window.scrollTo(0, 0);
    history.replaceState(null, "", `${location.pathname}${location.search}`);
    await page.viewport(414, 896);
  });
}

/** Mount again as a page would load, with `hash` already in the URL. */
export function loadWithHash(hash: string): void {
  history.replaceState(null, "", hash);
  document.body.innerHTML = FIXTURE;
  mountTablesOfContents();
}
