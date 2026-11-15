import { beforeEach, describe, expect, it } from "vite-plus/test";
import { page, userEvent } from "vite-plus/test/browser";

import { mountUpdateHistories } from "./update-history";

const FIXTURE = `
  <p>Sebelum</p>
  <span data-update-history>
    <button type="button" aria-expanded="false" aria-controls="update-history" aria-label="Riwayat pembaruan" data-history-trigger>R</button>
    <span id="update-history" hidden data-history-panel>
      <ol>
        <li>Diperbarui <time datetime="2026-11-14">14 November 2026</time></li>
        <li>Terbit <time datetime="2024-12-01">1 Desember 2024</time></li>
      </ol>
    </span>
  </span>
  <button type="button">Di luar</button>
`;

const trigger = () => page.getByRole("button", { name: "Riwayat pembaruan" });
const updated = () => page.getByText("14 November 2026");

beforeEach(() => {
  document.body.innerHTML = FIXTURE;
  mountUpdateHistories();
});

describe("update history", () => {
  it("starts closed", async () => {
    await expect.element(trigger()).toHaveAttribute("aria-expanded", "false");
    await expect.element(updated()).not.toBeVisible();
  });

  it("opens on hover and closes when the pointer leaves", async () => {
    await userEvent.hover(trigger());
    await expect.element(updated()).toBeVisible();
    await expect.element(trigger()).toHaveAttribute("aria-expanded", "true");

    await userEvent.hover(page.getByText("Sebelum"));
    await expect.element(updated()).not.toBeVisible();
    await expect.element(trigger()).toHaveAttribute("aria-expanded", "false");
  });

  it("stays open while the pointer is over the panel", async () => {
    await userEvent.hover(trigger());
    await userEvent.hover(updated());

    await expect.element(updated()).toBeVisible();
  });

  it("opens on keyboard focus and closes on Escape", async () => {
    await userEvent.click(page.getByText("Sebelum"));
    await userEvent.tab();
    await expect.element(trigger()).toHaveFocus();
    await expect.element(updated()).toBeVisible();

    await userEvent.keyboard("{Escape}");
    await expect.element(updated()).not.toBeVisible();
    await expect.element(trigger()).toHaveFocus();
  });

  it("closes when focus moves on", async () => {
    await trigger().click();
    await expect.element(updated()).toBeVisible();

    await userEvent.tab();
    await expect.element(page.getByRole("button", { name: "Di luar" })).toHaveFocus();
    await expect.element(updated()).not.toBeVisible();
  });

  it("closes on a press outside", async () => {
    await trigger().click();
    await expect.element(updated()).toBeVisible();

    await page.getByRole("button", { name: "Di luar" }).click();
    await expect.element(updated()).not.toBeVisible();
  });
});
