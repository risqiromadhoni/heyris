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
    <button type="button" data-filter-topic="api">API</button>
    <button type="button" data-filter-topic="react">React</button>
    <section data-filter-group data-month="november">
      <p data-count></p>
      <a href="#a" data-filter-item data-topic="api" data-search="Token sesi Google Places">Token sesi Google Places</a>
      <a href="#b" data-filter-item data-topic="react" data-search="Aksésibilitas warna">Aksesibilitas warna</a>
    </section>
    <section data-filter-group data-month="oktober">
      <p data-count></p>
      <a href="#c" data-filter-item data-topic="react" data-search="Ringkasan sesi">Ringkasan sesi</a>
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
    await page.getByRole("button", { name: "API" }).click();

    expect(visibleRows()).toEqual(["Token sesi Google Places"]);
    expect(element("[data-month=oktober]").hidden).toBe(true);
    expect(element("[data-month=november] [data-count]").textContent).toBe(STRINGS.notes.count(1));
    await expect
      .element(page.getByRole("button", { name: "API" }))
      .toHaveAttribute("aria-pressed", "true");
    await expect
      .element(page.getByRole("button", { name: "Semua" }))
      .toHaveAttribute("aria-pressed", "false");
    await expect.element(page.getByText(STRINGS.filter.results.notes(1))).toBeInTheDocument();
    expect(new URL(location.href).searchParams.get("topik")).toBe("api");
  });

  it("clears the topic from the address on Semua", async () => {
    mountFilterEntries();
    await page.getByRole("button", { name: "React" }).click();
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
    openWith("react", "ringkasan");
    mountFilterEntries();

    expect(visibleRows()).toEqual(["Ringkasan sesi"]);
    expect(element("[data-month=november]").hidden).toBe(true);
    await expect.element(page.getByRole("searchbox", { name: "Cari" })).toHaveValue("ringkasan");
  });

  it("ignores a topic the page has no button for", () => {
    openWith("rust", "");
    mountFilterEntries();

    expect(visibleRows()).toHaveLength(3);
  });
});
