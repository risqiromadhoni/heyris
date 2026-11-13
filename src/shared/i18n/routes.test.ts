import { describe, expect, it } from "vite-plus/test";

import { counterpartPath, localizedPath, ogImagePath } from "./routes";

describe("localizedPath", () => {
  it("leaves the Indonesian paths unprefixed", () => {
    expect(localizedPath("id", "home")).toBe("/");
    expect(localizedPath("id", "writing")).toBe("/tulisan");
    expect(localizedPath("id", "note", "retry")).toBe("/catatan/retry");
    expect(localizedPath("id", "postMarkdown", "situs-ini-astro-void-cloudflare-workers")).toBe(
      "/tulisan/situs-ini-astro-void-cloudflare-workers.md",
    );
    expect(localizedPath("id", "rss")).toBe("/rss.xml");
  });

  it("prefixes English paths with /en", () => {
    expect(localizedPath("en", "home")).toBe("/en");
    expect(localizedPath("en", "writing")).toBe("/en/writing");
    expect(localizedPath("en", "post", "situs-ini-astro-void-cloudflare-workers")).toBe(
      "/en/writing/situs-ini-astro-void-cloudflare-workers",
    );
    expect(localizedPath("en", "noteMarkdown", "retry")).toBe("/en/notes/retry.md");
    expect(localizedPath("en", "rss")).toBe("/en/rss.xml");
  });

  it("keeps /llms.txt the same in both locales", () => {
    expect(localizedPath("id", "llms")).toBe("/llms.txt");
    expect(localizedPath("en", "llms")).toBe("/llms.txt");
  });
});

describe("counterpartPath", () => {
  it.for([
    ["/", "/en"],
    ["/en", "/"],
    ["/en/", "/"],
    ["/tulisan", "/en/writing"],
    ["/en/writing", "/tulisan"],
    ["/catatan/google-places-session-token", "/en/notes/google-places-session-token"],
    ["/en/notes/google-places-session-token", "/catatan/google-places-session-token"],
    ["/rss.xml", "/en/rss.xml"],
    ["/en/rss.xml", "/rss.xml"],
  ] as const)("maps %s to %s", ([path, counterpart]) => {
    expect(counterpartPath(path)).toBe(counterpart);
  });

  it("returns undefined for unlocalized routes", () => {
    expect(counterpartPath("/llms.txt")).toBeUndefined();
    expect(
      counterpartPath("/og/tulisan/situs-ini-astro-void-cloudflare-workers.png"),
    ).toBeUndefined();
  });

  it("keeps segments it does not know", () => {
    expect(counterpartPath("/about")).toBe("/en/about");
    expect(counterpartPath("/en/about")).toBe("/about");
  });

  it("is its own inverse on localized routes", () => {
    const path = localizedPath("id", "post", "situs-ini-astro-void-cloudflare-workers");

    expect(counterpartPath(counterpartPath(path) ?? "")).toBe(path);
  });
});

describe("ogImagePath", () => {
  it("names the home pages index.png", () => {
    expect(ogImagePath("/")).toBe("/og/index.png");
    expect(ogImagePath("/en")).toBe("/og/en/index.png");
  });

  it("mirrors any other page path", () => {
    expect(ogImagePath("/tulisan/situs-ini-astro-void-cloudflare-workers")).toBe(
      "/og/tulisan/situs-ini-astro-void-cloudflare-workers.png",
    );
    expect(ogImagePath("/en/notes")).toBe("/og/en/notes.png");
  });
});
