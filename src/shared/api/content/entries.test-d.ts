import { describe, expectTypeOf, it } from "vite-plus/test";

import { newestFirst, readingTime } from "./entries";
import type { Note, Post } from "./entries";
import { groupNotesByMonth, groupPostsByYear } from "./groups";
import type { NoteMonth, PostYear } from "./groups";
import type { NoteIcon, Topic } from "./topics";

// These pin the output of the schemas in `src/content.config.ts`, as Astro generates it.
describe("content schema", () => {
  it("parses both date forms into a Date", () => {
    expectTypeOf<Post["data"]["date"]>().toEqualTypeOf<Date>();
    expectTypeOf<Note["data"]["date"]>().toEqualTypeOf<Date>();
  });

  it("turns `updated` into a list of dates, empty when missing", () => {
    expectTypeOf<Post["data"]["updated"]>().toEqualTypeOf<Array<Date>>();
    expectTypeOf<Note["data"]["updated"]>().toEqualTypeOf<Array<Date>>();
  });

  it("makes defaulted fields required", () => {
    expectTypeOf<Post["data"]["draft"]>().toEqualTypeOf<boolean>();
    expectTypeOf<Note["data"]["tags"]>().toEqualTypeOf<Array<string>>();
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
    expectTypeOf(newestFirst<Note>).returns.toEqualTypeOf<Array<Note>>();
    expectTypeOf(groupPostsByYear).returns.toEqualTypeOf<Array<PostYear>>();
    expectTypeOf(groupNotesByMonth).returns.toEqualTypeOf<Array<NoteMonth>>();
    expectTypeOf<PostYear["posts"]>().toEqualTypeOf<Array<Post>>();
  });

  it("accept only posts and notes", () => {
    expectTypeOf(readingTime).parameter(0).toEqualTypeOf<Post | Note>();
  });
});
