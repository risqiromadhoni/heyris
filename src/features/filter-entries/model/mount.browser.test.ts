import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";
import { page } from "vite-plus/test/browser";

import { dictionaryFor } from "@/shared/i18n";

import { mountFilterEntries } from "./mount";

const STRINGS = dictionaryFor("id");

// The test runner's own address. Each test restores it, since the script rewrites the query.
const RUNNER_URL = location.href;

const FIXTURE = `
  <div data-filter-root data-locale="id" data-kind="notes">
    <div data-filter-control>
      <input type="search" aria-label="Cari" data-filter-search />
      <p aria-live="polite" data-filter-status></p>
    </div>
    <button type="button" data-filter-topic="all">Semua</button>
    <button type="button" data-filter-topic="effect">Effect</button>
    <button type="button" data-filter-topic="css">CSS</button>
    <section data-filter-group data-month="november">
      <p data-count></p>
      <a href="#a" data-filter-item data-topic="effect" data-search="Retry dengan Schedule">Retry dengan Schedule</a>
      <a href="#b" data-filter-item data-topic="css" data-search="Aksésibilitas warna">Aksesibilitas warna</a>
    </section>
    <section data-filter-group data-month="oktober">
      <p data-count></p>
      <a href="#c" data-filter-item data-topic="css" data-search="Container queries">Container queries</a>
    </section>
  </div>
`;

function element(selector: string): HTMLElement {
  const node = document.querySelector(selector);

  if (!(node instanceof HTMLElement)) throw new Error(`Missing ${selector} in the fixture`);

  return node;
}

const visibleRows = () =>
  Array.from(
    document.querySelectorAll("[data-filter-item]:not([hidden])"),
    (row) => row.textContent,
  );

function openWith(topic: string, query: string): void {
  const url = new URL(RUNNER_URL);

  url.searchParams.set("topik", topic);
  url.searchParams.set("q", query);
  history.replaceState(null, "", url);
}

beforeEach(() => {
  document.body.innerHTML = FIXTURE;
});

afterEach(() => {
  history.replaceState(null, "", RUNNER_URL);
});

describe("mountFilterEntries", () => {
  it("starts with every entry shown, silently", async () => {
    mountFilterEntries();

    expect(element("[data-filter-root]").dataset.ready).toBe("");
    expect(visibleRows()).toHaveLength(3);
    expect(element("[data-month=november] [data-count]").textContent).toBe(STRINGS.notes.count(2));
    expect(element("[data-filter-status]").textContent).toBe("");
    await expect
      .element(page.getByRole("button", { name: "Semua" }))
      .toHaveAttribute("aria-pressed", "true");
  });

  it("filters by topic", async () => {
    mountFilterEntries();
    await page.getByRole("button", { name: "Effect" }).click();

    expect(visibleRows()).toEqual(["Retry dengan Schedule"]);
    expect(element("[data-month=oktober]").hidden).toBe(true);
    expect(element("[data-month=november] [data-count]").textContent).toBe(STRINGS.notes.count(1));
    await expect
      .element(page.getByRole("button", { name: "Effect" }))
      .toHaveAttribute("aria-pressed", "true");
    await expect
      .element(page.getByRole("button", { name: "Semua" }))
      .toHaveAttribute("aria-pressed", "false");
    await expect.element(page.getByText(STRINGS.filter.results.notes(1))).toBeInTheDocument();
    expect(new URL(location.href).searchParams.get("topik")).toBe("effect");
  });

  it("clears the topic from the address on Semua", async () => {
    mountFilterEntries();
    await page.getByRole("button", { name: "CSS" }).click();
    await page.getByRole("button", { name: "Semua" }).click();

    expect(visibleRows()).toHaveLength(3);
    expect(new URL(location.href).searchParams.has("topik")).toBe(false);
  });

  it("searches without regard to case or accents", async () => {
    mountFilterEntries();
    await page.getByRole("searchbox", { name: "Cari" }).fill("AKSESIBILITAS");

    expect(visibleRows()).toEqual(["Aksesibilitas warna"]);
    expect(new URL(location.href).searchParams.get("q")).toBe("AKSESIBILITAS");
  });

  it("announces zero results and hides every group when nothing matches", async () => {
    mountFilterEntries();
    await page.getByRole("searchbox", { name: "Cari" }).fill("tidak ada");

    expect(visibleRows()).toEqual([]);
    expect(document.querySelectorAll("[data-filter-group]:not([hidden])")).toHaveLength(0);
    expect(element("[data-filter-status]").textContent).toBe(STRINGS.filter.results.notes(0));
  });

  it("ignores a search of only spaces", async () => {
    mountFilterEntries();
    await page.getByRole("searchbox", { name: "Cari" }).fill("   ");

    expect(visibleRows()).toHaveLength(3);
    expect(new URL(location.href).searchParams.has("q")).toBe(false);
  });

  it("stays inactive on a page with an unknown locale", () => {
    element("[data-filter-root]").dataset.locale = "fr";
    mountFilterEntries();

    expect(element("[data-filter-root]").dataset.ready).toBeUndefined();
  });

  it("restores the topic and the search from the address", async () => {
    openWith("css", "container");
    mountFilterEntries();

    expect(visibleRows()).toEqual(["Container queries"]);
    expect(element("[data-month=november]").hidden).toBe(true);
    await expect.element(page.getByRole("searchbox", { name: "Cari" })).toHaveValue("container");
  });

  it("ignores a topic the page has no button for", () => {
    openWith("rust", "");
    mountFilterEntries();

    expect(visibleRows()).toHaveLength(3);
  });
});
