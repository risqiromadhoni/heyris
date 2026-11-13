import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { page, userEvent } from "vite-plus/test/browser";

import { mountCopyPages } from "./menu";

const MARKDOWN = "---\ntitle: Contoh\n---\n\n# Contoh\n";

function fixture(markdownUrl: string): string {
  return `
    <div data-copy-page>
      <button type="button" data-copy-main data-copy-url="${markdownUrl}" data-copied="Tersalin" data-failed="Gagal menyalin">
        <span aria-live="polite" data-copy-label>Salin Halaman</span>
      </button>
      <button type="button" aria-expanded="false" aria-label="Opsi lain" data-copy-caret></button>
      <div hidden data-copy-menu>
        <ul>
          <li><a href="#markdown">Lihat sebagai Markdown</a></li>
          <li><a href="#chatgpt">Buka di ChatGPT</a></li>
          <li><a href="#claude">Buka di Claude</a></li>
        </ul>
      </div>
    </div>
    <button type="button">Di luar</button>
  `;
}

let markdownUrl = "";

const caret = () => page.getByRole("button", { name: "Opsi lain" });
const menuItem = (name: string) => page.getByRole("link", { name });

async function openMenu(): Promise<void> {
  await caret().click();
  await expect.element(caret()).toHaveAttribute("aria-expanded", "true");
}

beforeEach(() => {
  markdownUrl = URL.createObjectURL(new Blob([MARKDOWN], { type: "text/markdown" }));
  document.body.innerHTML = fixture(markdownUrl);
  mountCopyPages();
});

afterEach(() => {
  vi.useRealTimers();
  URL.revokeObjectURL(markdownUrl);
});

describe("copy page menu", () => {
  it("opens and closes from the caret", async () => {
    await openMenu();
    await expect.element(menuItem("Buka di Claude")).toBeVisible();

    await caret().click();
    await expect.element(caret()).toHaveAttribute("aria-expanded", "false");
    await expect.element(menuItem("Buka di Claude")).not.toBeInTheDocument();
  });

  it("moves through items with arrows, Home and End", async () => {
    await openMenu();

    await userEvent.keyboard("{ArrowDown}");
    await expect.element(menuItem("Lihat sebagai Markdown")).toHaveFocus();

    await userEvent.keyboard("{ArrowUp}");
    await expect.element(menuItem("Buka di Claude")).toHaveFocus();

    await userEvent.keyboard("{ArrowDown}");
    await expect.element(menuItem("Lihat sebagai Markdown")).toHaveFocus();

    await userEvent.keyboard("{End}");
    await expect.element(menuItem("Buka di Claude")).toHaveFocus();

    await userEvent.keyboard("{Home}");
    await expect.element(menuItem("Lihat sebagai Markdown")).toHaveFocus();
  });

  it("closes on Escape and returns focus to the caret", async () => {
    await openMenu();
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{Escape}");

    await expect.element(caret()).toHaveAttribute("aria-expanded", "false");
    await expect.element(caret()).toHaveFocus();
  });

  it("closes on a click outside", async () => {
    await openMenu();
    await page.getByRole("button", { name: "Di luar" }).click();

    await expect.element(caret()).toHaveAttribute("aria-expanded", "false");
  });

  it("closes when focus leaves it", async () => {
    await openMenu();
    await userEvent.keyboard("{End}");
    await userEvent.tab();

    await expect.element(page.getByRole("button", { name: "Di luar" })).toHaveFocus();
    await expect.element(caret()).toHaveAttribute("aria-expanded", "false");
  });

  it("closes after an item is chosen", async () => {
    await openMenu();
    await menuItem("Lihat sebagai Markdown").click();

    await expect.element(caret()).toHaveAttribute("aria-expanded", "false");
  });

  it("ignores the arrow keys while closed", async () => {
    await caret().click();
    await caret().click();
    await userEvent.keyboard("{ArrowDown}");

    await expect.element(caret()).toHaveFocus();
  });
});

describe("copy page button", () => {
  it("copies the Markdown, then resets after 2 s", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    await page.getByRole("button", { name: "Salin Halaman" }).click();

    await expect.element(page.getByText("Tersalin")).toBeInTheDocument();
    expect(await navigator.clipboard.readText()).toBe(MARKDOWN);

    vi.advanceTimersByTime(2000);
    await expect.element(page.getByText("Salin Halaman")).toBeInTheDocument();
  });

  it("reports a network failure", async () => {
    URL.revokeObjectURL(markdownUrl);
    await page.getByRole("button", { name: "Salin Halaman" }).click();

    await expect.element(page.getByText("Gagal menyalin")).toBeInTheDocument();
    expect(document.querySelector<HTMLElement>("[data-copy-page]")?.dataset.state).toBe("failed");
  });

  it("reports an HTTP error instead of copying the error page", async () => {
    await navigator.clipboard.writeText("sebelumnya");
    document
      .querySelector<HTMLElement>("[data-copy-main]")
      ?.setAttribute("data-copy-url", "/__missing-page__.md");
    await page.getByRole("button", { name: "Salin Halaman" }).click();

    await expect.element(page.getByText("Gagal menyalin")).toBeInTheDocument();
    expect(await navigator.clipboard.readText()).toBe("sebelumnya");
  });
});
