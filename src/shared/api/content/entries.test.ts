import { describe, expect, it } from "vite-plus/test";

import {
  entryLocale,
  entrySlug,
  foreignLocale,
  newestFirst,
  readingTime,
  type Note,
  type Post,
} from "./entries";
import { groupNotesByMonth, groupPostsByYear, pinnedNotes } from "./groups";

function post(id: string, date: string, body = ""): Post {
  return {
    id,
    body,
    collection: "posts",
    data: {
      title: id,
      summary: "",
      date: new Date(`${date}T00:00:00Z`),
      updated: [],
      topic: "cloudflare",
      draft: false,
    },
  };
}

function note(id: string, date: string, pinned = false): Note {
  return {
    id,
    collection: "notes",
    data: {
      title: id,
      summary: "",
      date: new Date(`${date}T00:00:00Z`),
      updated: [],
      topic: "api",
      draft: false,
      icon: "lightbulb",
      tags: [],
      pinned,
    },
  };
}

const ids = (entries: ReadonlyArray<Post | Note>) => entries.map((entry) => entry.id);

describe("entry ids", () => {
  it("reads the locale and the slug from the id", () => {
    expect(entryLocale("en/retry")).toBe("en");
    expect(entrySlug("id/tulisan/bagian")).toBe("tulisan/bagian");
  });

  it("rejects an entry outside a locale folder", () => {
    expect(() => entryLocale("retry")).toThrow(/must sit in a locale folder/);
  });

  it("marks an Indonesian fallback in an English listing", () => {
    expect(foreignLocale(post("id/contoh", "2026-10-01"), "en")).toBe("id");
    expect(foreignLocale(post("en/contoh", "2026-10-01"), "en")).toBeUndefined();
  });
});

describe("readingTime", () => {
  it("counts 200 words a minute, rounded up", () => {
    expect(readingTime(post("id/a", "2026-10-01", "kata ".repeat(201)))).toBe(2);
  });

  it("never drops below a minute", () => {
    expect(readingTime(post("id/a", "2026-10-01"))).toBe(1);
  });

  it("treats a missing body as empty", () => {
    expect(readingTime(note("id/a", "2026-10-01"))).toBe(1);
  });

  it("prefers the frontmatter value", () => {
    const entry = post("id/a", "2026-10-01", "kata ".repeat(2000));

    entry.data.readingTime = 4;

    expect(readingTime(entry)).toBe(4);
  });
});

describe("newestFirst", () => {
  it("sorts by date, then by id", () => {
    const entries = [
      post("id/b", "2026-10-01"),
      post("id/c", "2026-11-01"),
      post("id/a", "2026-10-01"),
    ];

    expect(ids(newestFirst(entries))).toEqual(["id/c", "id/a", "id/b"]);
  });

  it("leaves the input in place", () => {
    const entries = [post("id/old", "2026-10-01"), post("id/new", "2026-11-01")];

    newestFirst(entries);

    expect(ids(entries)).toEqual(["id/old", "id/new"]);
  });
});

describe("groupPostsByYear", () => {
  it("groups by UTC year, newest first", () => {
    const groups = groupPostsByYear([
      post("id/old", "2025-12-31"),
      post("id/new", "2026-01-01"),
      post("id/mid", "2026-06-15"),
    ]);

    expect(groups.map(({ year, posts }) => [year, ids(posts)])).toEqual([
      [2026, ["id/mid", "id/new"]],
      [2025, ["id/old"]],
    ]);
  });

  it("returns no groups for no posts", () => {
    expect(groupPostsByYear([])).toEqual([]);
  });
});

describe("groupNotesByMonth and pinnedNotes", () => {
  const notes = [
    note("id/nov-a", "2026-11-12"),
    note("id/oct", "2026-10-30"),
    note("id/pinned", "2026-11-20", true),
    note("id/nov-b", "2026-11-01"),
    note("id/last-year", "2025-11-12"),
  ];

  it("groups unpinned notes by month, newest first", () => {
    const groups = groupNotesByMonth(notes);

    expect(groups.map(({ year, month, notes: entries }) => [year, month, ids(entries)])).toEqual([
      [2026, 11, ["id/nov-a", "id/nov-b"]],
      [2026, 10, ["id/oct"]],
      [2025, 11, ["id/last-year"]],
    ]);
  });

  it("keeps the pinned notes apart", () => {
    expect(ids(pinnedNotes(notes))).toEqual(["id/pinned"]);
  });

  it("returns no groups when every note is pinned", () => {
    expect(groupNotesByMonth([note("id/pinned", "2026-11-20", true)])).toEqual([]);
    expect(pinnedNotes([])).toEqual([]);
  });
});
