import rss from "@astrojs/rss";
import { entrySlug, getPublishedNotes, getPublishedPosts } from "@/shared/api/content";
import { dictionaryFor, INTL_TAG, localizedPath } from "@/shared/i18n";
import type { Locale } from "@/shared/i18n";

/**
 * RSS 2.0 feed of one locale's published posts and notes, newest first, with absolute links. A
 * locale with no entries gets an empty channel.
 */
export async function rssFeed(locale: Locale, site: URL): Promise<Response> {
  const strings = dictionaryFor(locale);
  const posts = await getPublishedPosts(locale);
  const notes = await getPublishedNotes(locale);

  const entries = [
    ...posts.map((post) => ({
      title: post.data.title,
      description: post.data.summary,
      date: post.data.date,
      link: new URL(localizedPath(locale, "post", entrySlug(post.id)), site).href,
    })),
    ...notes.map((note) => ({
      title: note.data.title,
      description: note.data.summary,
      date: note.data.date,
      link: new URL(localizedPath(locale, "note", entrySlug(note.id)), site).href,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return rss({
    title: strings.meta.siteTitle,
    description: strings.meta.homeDescription,
    site,
    trailingSlash: false,
    items: entries.map(({ date, ...item }) => ({ ...item, pubDate: date })),
    customData: `<language>${INTL_TAG[locale]}</language>`,
  });
}
