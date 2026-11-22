import type { CollectionEntry } from "astro:content";
import { LOCALES, type Locale } from "@/shared/i18n";

/** An entry of the `posts` collection. */
export type Post = CollectionEntry<"posts">;

/** An entry of the `notes` collection. */
export type Note = CollectionEntry<"notes">;

/** The locale of an entry, from the first segment of its id (`id/<slug>` or `en/<slug>`). */
export function entryLocale(id: string): Locale {
  const [segment] = id.split("/");
  const locale = LOCALES.find((candidate) => candidate === segment);

  if (locale === undefined) {
    throw new Error(`Content entry "${id}" must sit in a locale folder (id/ or en/).`);
  }

  return locale;
}

/** The slug of an entry: everything after the locale segment of its id. */
export function entrySlug(id: string): string {
  return id.split("/").slice(1).join("/");
}

/**
 * The entry's own locale when a listing in `locale` shows it as an Indonesian fallback, so the row
 * can mark its language. `undefined` when the entry is already in `locale`.
 */
export function foreignLocale(entry: Post | Note, locale: Locale): Locale | undefined {
  const own = entryLocale(entry.id);

  return own === locale ? undefined : own;
}

/**
 * Minutes to read an entry: its `readingTime` when set, otherwise its body's words at 200 per
 * minute, rounded up, and never below 1.
 */
export function readingTime(entry: Post | Note): number {
  if (entry.data.readingTime !== undefined) return entry.data.readingTime;

  const words = (entry.body ?? "").split(/\s+/).filter((word) => word.length > 0).length;

  return Math.max(1, Math.ceil(words / 200));
}

/** A copy of the entries, newest first by date. Entries on the same date keep id order. */
export function newestFirst<T extends Post | Note>(entries: ReadonlyArray<T>): Array<T> {
  return [...entries].sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime() || a.id.localeCompare(b.id),
  );
}
