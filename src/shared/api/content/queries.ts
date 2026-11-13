import { getCollection } from "astro:content";
import { DEFAULT_LOCALE, type Locale } from "@/shared/i18n";
import { entryLocale, entrySlug, newestFirst, type Note, type Post } from "./entries";

/** Drafts are listed in `pnpm dev` only; production output leaves them out. */
const isListed = (entry: Post | Note): boolean => import.meta.env.DEV || entry.data.draft !== true;

/**
 * What a locale's listings show, newest first: its own entry for each slug, and the default
 * locale's entry where the slug has no translation. Expects drafts to be filtered already.
 */
function withFallback<T extends Post | Note>(entries: readonly T[], locale: Locale): T[] {
  const translated = new Set(
    entries.flatMap((entry) => (entryLocale(entry.id) === locale ? [entrySlug(entry.id)] : [])),
  );

  return newestFirst(
    entries.filter((entry) => {
      const own = entryLocale(entry.id);

      return own === locale || (own === DEFAULT_LOCALE && !translated.has(entrySlug(entry.id)));
    }),
  );
}

/** The posts of a locale only, newest first. Drafts appear in `pnpm dev` only. */
export async function getPosts(locale: Locale): Promise<Post[]> {
  const posts = await getCollection(
    "posts",
    (entry) => entryLocale(entry.id) === locale && isListed(entry),
  );

  return newestFirst(posts);
}

/** The notes of a locale only, newest first. Drafts appear in `pnpm dev` only. */
export async function getNotes(locale: Locale): Promise<Note[]> {
  const notes = await getCollection(
    "notes",
    (entry) => entryLocale(entry.id) === locale && isListed(entry),
  );

  return newestFirst(notes);
}

/**
 * The posts an index, the home page or a related-note list shows in a locale: every post, with the
 * Indonesian entry where there is no translation. Drafts appear in `pnpm dev` only.
 */
export async function getPostListing(locale: Locale): Promise<Post[]> {
  return withFallback(await getCollection("posts", isListed), locale);
}

/**
 * The notes an index, the home page or a note's neighbours show in a locale, with the Indonesian
 * entry where there is no translation. Drafts appear in `pnpm dev` only.
 */
export async function getNoteListing(locale: Locale): Promise<Note[]> {
  return withFallback(await getCollection("notes", isListed), locale);
}

/**
 * One post by locale and slug, or `undefined` when it is missing or a draft outside `pnpm dev`.
 * It filters the collection rather than calling `getEntry`, which logs a warning for a missing id.
 */
export async function getPost(locale: Locale, slug: string): Promise<Post | undefined> {
  const id = `${locale}/${slug}`;

  const [entry] = await getCollection(
    "posts",
    (candidate) => candidate.id === id && isListed(candidate),
  );

  return entry;
}

/**
 * One note by locale and slug, or `undefined` when it is missing or a draft outside `pnpm dev`.
 * It filters the collection rather than calling `getEntry`, which logs a warning for a missing id.
 */
export async function getNote(locale: Locale, slug: string): Promise<Note | undefined> {
  const id = `${locale}/${slug}`;

  const [entry] = await getCollection(
    "notes",
    (candidate) => candidate.id === id && isListed(candidate),
  );

  return entry;
}

/** Whether a post exists in a locale: the same slug under that locale's folder. */
export async function hasPostIn(locale: Locale, slug: string): Promise<boolean> {
  return (await getPost(locale, slug)) !== undefined;
}

/** Whether a note exists in a locale: the same slug under that locale's folder. */
export async function hasNoteIn(locale: Locale, slug: string): Promise<boolean> {
  return (await getNote(locale, slug)) !== undefined;
}

/**
 * The newest published post a locale lists, for the "Terbaru" badge. Drafts never count, even in
 * `pnpm dev`.
 */
export async function getNewestPost(locale: Locale): Promise<Post | undefined> {
  const posts = await getCollection("posts", (entry) => entry.data.draft !== true);

  return withFallback(posts, locale)[0];
}

/** The published posts of a locale, newest first. Unlike `getPosts`, drafts never appear, even in `pnpm dev`. */
export async function getPublishedPosts(locale: Locale): Promise<Post[]> {
  const posts = await getCollection(
    "posts",
    (entry) => entryLocale(entry.id) === locale && entry.data.draft !== true,
  );

  return newestFirst(posts);
}

/** The published notes of a locale, newest first. Unlike `getNotes`, drafts never appear, even in `pnpm dev`. */
export async function getPublishedNotes(locale: Locale): Promise<Note[]> {
  const notes = await getCollection(
    "notes",
    (entry) => entryLocale(entry.id) === locale && entry.data.draft !== true,
  );

  return newestFirst(notes);
}
