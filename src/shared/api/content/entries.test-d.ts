import { describe, expectTypeOf, it } from "vite-plus/test";

import { newestFirst, readingTime, type Note, type Post } from "./entries";
import { groupNotesByMonth, groupPostsByYear, type NoteMonth, type PostYear } from "./groups";
import type { NoteIcon, Topic } from "./topics";

// These pin the output of the schemas in `src/content.config.ts`, as Astro generates it.
describe("content schema", () => {
  it("parses both date forms into a Date", () => {
    expectTypeOf<Post["data"]["date"]>().toEqualTypeOf<Date>();
    expectTypeOf<Note["data"]["date"]>().toEqualTypeOf<Date>();
  });

  it("makes defaulted fields required", () => {
    expectTypeOf<Post["data"]["draft"]>().toEqualTypeOf<boolean>();
    expectTypeOf<Note["data"]["tags"]>().toEqualTypeOf<string[]>();
    expectTypeOf<Note["data"]["pinned"]>().toEqualTypeOf<boolean>();
  });

  it("keeps the optional fields optional", () => {
    expectTypeOf<Post["data"]["readingTime"]>().toEqualTypeOf<number | undefined>();
    expectTypeOf<Note["data"]["label"]>().toEqualTypeOf<string | undefined>();
    expectTypeOf<Note["data"]["tldr"]>().toEqualTypeOf<string | undefined>();
  });

  it("limits topics and icons to the known keys", () => {
    expectTypeOf<Post["data"]["topic"]>().toEqualTypeOf<Topic>();
    expectTypeOf<Note["data"]["icon"]>().toEqualTypeOf<NoteIcon>();
  });

  it("gives only notes the note fields", () => {
    expectTypeOf<Post["data"]>().not.toHaveProperty("tags");
    expectTypeOf<Post["data"]>().not.toHaveProperty("icon");
  });
});

describe("entry helpers", () => {
  it("keep the entry type", () => {
    expectTypeOf(newestFirst<Note>).returns.toEqualTypeOf<Note[]>();
    expectTypeOf(groupPostsByYear).returns.toEqualTypeOf<PostYear[]>();
    expectTypeOf(groupNotesByMonth).returns.toEqualTypeOf<NoteMonth[]>();
    expectTypeOf<PostYear["posts"]>().toEqualTypeOf<Post[]>();
  });

  it("accept only posts and notes", () => {
    expectTypeOf(readingTime).parameter(0).toEqualTypeOf<Post | Note>();
  });
});
