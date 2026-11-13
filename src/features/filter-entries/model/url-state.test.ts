import { describe, expect, it } from "vite-plus/test";

import { normalizeText } from "./text";
import { filterUrl, readFilterUrl } from "./url-state";

const PAGE = "https://example.com/catatan";

describe("readFilterUrl", () => {
  it("defaults to every topic and no search", () => {
    expect(readFilterUrl(new URL(PAGE), "topik")).toEqual({ topic: "all", query: "" });
  });

  it("reads the topic and the search", () => {
    const url = new URL(`${PAGE}?topik=api&q=retry&topic=react`);

    expect(readFilterUrl(url, "topik")).toEqual({ topic: "api", query: "retry" });
  });
});

describe("filterUrl", () => {
  it("writes the topic and the search", () => {
    const url = filterUrl(new URL(PAGE), "topik", "api", "retry");

    expect(url.search).toBe("?topik=api&q=retry");
  });

  it("drops default values", () => {
    const url = filterUrl(new URL(`${PAGE}?topik=api&q=retry`), "topik", "all", "   ");

    expect(url.href).toBe(PAGE);
  });

  it("keeps parameters it does not own", () => {
    const url = filterUrl(new URL(`${PAGE}?ref=rss`), "topic", "react", "");

    expect(url.search).toBe("?ref=rss&topic=react");
  });

  it("round-trips through readFilterUrl", () => {
    const url = filterUrl(new URL(PAGE), "topic", "ruby", "agen");

    expect(readFilterUrl(url, "topic")).toEqual({ topic: "ruby", query: "agen" });
  });
});

describe("normalizeText", () => {
  it("lowercases, strips accents and trims", () => {
    expect(normalizeText("  Aksésibilitas ")).toBe("aksesibilitas");
    expect(normalizeText("Ångström")).toBe("angstrom");
  });
});
