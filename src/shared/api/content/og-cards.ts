import { SITE } from "@/shared/config";
import {
  LOCALES,
  dictionaryFor,
  formatFullDate,
  formatMonthYear,
  localizedPath,
  type Locale,
} from "@/shared/i18n";
import type { OgCardContent } from "@/shared/lib/og-image";
import { entrySlug } from "./entries";
import { getNotes, getPosts } from "./queries";

/** A page that has an Open Graph card: its path in its locale, and the text printed on the card. */
interface OgCard {
  path: string;
  content: OgCardContent;
}

/**
 * Every page that has an Open Graph card, in both locales: the home page, both indexes, and each
 * post and note in its own locale. An English card exists only for an English entry, the same rule
 * the pages follow. Drafts follow the page rule too.
 */
export async function ogCards(): Promise<Array<OgCard>> {
  const perLocale = await Promise.all(LOCALES.map(cardsOf));

  return perLocale.flat();
}

const card = (path: string, title: string, meta: string): OgCard => ({
  path,
  content: { title, siteName: SITE.name, meta },
});

async function cardsOf(locale: Locale): Promise<Array<OgCard>> {
  const strings = dictionaryFor(locale);
  const [posts, notes] = await Promise.all([getPosts(locale), getNotes(locale)]);

  return [
    card(localizedPath(locale, "home"), strings.meta.siteTitle, new URL(SITE.url).host),
    card(localizedPath(locale, "writing"), strings.writing.title, strings.nav.writing),
    card(localizedPath(locale, "notes"), strings.notes.title, strings.nav.notes),
    ...posts.map((post) =>
      card(
        localizedPath(locale, "post", entrySlug(post.id)),
        post.data.title,
        `${formatMonthYear(post.data.date, locale)} · ${strings.nav.writing}`,
      ),
    ),
    ...notes.map((note) =>
      card(
        localizedPath(locale, "note", entrySlug(note.id)),
        note.data.title,
        `${formatFullDate(note.data.date, locale)} · ${strings.nav.notes}`,
      ),
    ),
  ];
}
