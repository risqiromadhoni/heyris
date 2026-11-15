import { describe, expect, it } from "vite-plus/test";

import { tocItems } from "./items";

describe("tocItems", () => {
  it("keeps sections and subsections in reading order without the anchor's #", () => {
    const items = tocItems([
      { depth: 2, slug: "satu-kode", text: "Satu kode#" },
      { depth: 3, slug: "dua", text: "Dua#" },
      { depth: 2, slug: "tiga", text: "Tiga #" },
    ]);

    expect(items).toEqual([
      { depth: 2, slug: "satu-kode", text: "Satu kode" },
      { depth: 3, slug: "dua", text: "Dua" },
      { depth: 2, slug: "tiga", text: "Tiga" },
    ]);
  });

  it("nests three levels, from sections down to h4", () => {
    const items = tocItems([
      { depth: 2, slug: "contoh", text: "Contoh#" },
      { depth: 3, slug: "history-api", text: "History API#" },
      { depth: 4, slug: "push-state", text: "pushState" },
    ]);

    expect(items.map((item) => [item.depth, item.text])).toEqual([
      [2, "Contoh"],
      [3, "History API"],
      [4, "pushState"],
    ]);
  });

  it("keeps a trailing # on an h4, which has no anchor link", () => {
    expect(tocItems([{ depth: 4, slug: "c", text: "C#" }])).toEqual([
      { depth: 4, slug: "c", text: "C#" },
    ]);
  });

  it("leaves out the footnotes heading, the title and deeper levels", () => {
    const items = tocItems([
      { depth: 1, slug: "judul", text: "Judul" },
      { depth: 2, slug: "isi", text: "Isi#" },
      { depth: 5, slug: "rinci", text: "Rinci" },
      { depth: 2, slug: "footnote-label", text: "Catatan kaki" },
    ]);

    expect(items).toEqual([{ depth: 2, slug: "isi", text: "Isi" }]);
  });

  it("keeps a # that belongs to the title", () => {
    expect(tocItems([{ depth: 2, slug: "c", text: "C##" }])).toEqual([
      { depth: 2, slug: "c", text: "C#" },
    ]);
  });

  it("returns nothing for an article without headings", () => {
    expect(tocItems([])).toEqual([]);
    expect(tocItems([{ depth: 2, slug: "kosong", text: "#" }])).toEqual([]);
  });
});
