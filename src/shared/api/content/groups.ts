import { newestFirst, type Note, type Post } from "./entries";

/** The posts of one calendar year (UTC). */
export type PostYear = { year: number; posts: Post[] };

/** The unpinned notes of one calendar month (UTC). `month` runs from 1 to 12. */
export type NoteMonth = { year: number; month: number; notes: Note[] };

/** Posts grouped by year, newest year first; posts inside a year stay newest first. */
export function groupPostsByYear(posts: readonly Post[]): PostYear[] {
  const groups: PostYear[] = [];

  for (const post of newestFirst(posts)) {
    const year = post.data.date.getUTCFullYear();
    const last = groups.at(-1);

    if (last?.year === year) {
      last.posts.push(post);
    } else {
      groups.push({ year, posts: [post] });
    }
  }

  return groups;
}

/** Notes that are not pinned, grouped by year and month (UTC), newest month first. */
export function groupNotesByMonth(notes: readonly Note[]): NoteMonth[] {
  const groups: NoteMonth[] = [];

  for (const note of newestFirst(notes)) {
    if (note.data.pinned) continue;

    const year = note.data.date.getUTCFullYear();
    const month = note.data.date.getUTCMonth() + 1;
    const last = groups.at(-1);

    if (last?.year === year && last.month === month) {
      last.notes.push(note);
    } else {
      groups.push({ year, month, notes: [note] });
    }
  }

  return groups;
}

/** The pinned notes, newest first. They are kept out of the month groups. */
export function pinnedNotes(notes: readonly Note[]): Note[] {
  return newestFirst(notes).filter((note) => note.data.pinned);
}
