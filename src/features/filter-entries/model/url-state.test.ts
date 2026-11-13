import { describe, expect, it } from "vite-plus/test";

import { normalizeText } from "./text";
import { filterUrl, readFilterUrl } from "./url-state";

const PAGE = "https://heyris.me/catatan";

describe("readFilterUrl", () => {
  it("defaults to every topic and no search", () => {
    expect(readFilterUrl(new URL(PAGE), "topik")).toEqual({ topic: "all", query: "" });
  });

  it("reads the topic and the search", () => {
    const url = new URL(`${PAGE}?topik=effect&q=retry&topic=css`);

    expect(readFilterUrl(url, "topik")).toEqual({ topic: "effect", query: "retry" });
  });
});

describe("filterUrl", () => {
  it("writes the topic and the search", () => {
    const url = filterUrl(new URL(PAGE), "topik", "effect", "retry");

    expect(url.search).toBe("?topik=effect&q=retry");
  });

  it("drops default values", () => {
    const url = filterUrl(new URL(`${PAGE}?topik=effect&q=retry`), "topik", "all", "   ");

    expect(url.href).toBe(PAGE);
  });

  it("keeps parameters it does not own", () => {
    const url = filterUrl(new URL(`${PAGE}?ref=rss`), "topic", "css", "");

    expect(url.search).toBe("?ref=rss&topic=css");
  });

  it("round-trips through readFilterUrl", () => {
    const url = filterUrl(new URL(PAGE), "topic", "ai", "agen");

    expect(readFilterUrl(url, "topic")).toEqual({ topic: "ai", query: "agen" });
  });
});

describe("normalizeText", () => {
  it("lowercases, strips accents and trims", () => {
    expect(normalizeText("  Aksésibilitas ")).toBe("aksesibilitas");
    expect(normalizeText("Ångström")).toBe("angstrom");
  });
});
