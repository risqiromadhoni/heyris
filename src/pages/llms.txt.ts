import type { APIContext } from "astro";
import { entrySlug, getPublishedNotes, getPublishedPosts } from "@/shared/api/content";
import { SITE } from "@/shared/config";
import { dictionaryFor, localizedPath, type Locale } from "@/shared/i18n";

export const prerender = true;

/** One llmstxt.org list item: a link to an entry's Markdown, then its summary. */
const itemLine = (site: URL, title: string, path: string, summary: string) =>
  `- [${title}](${new URL(path, site).href}): ${summary}`;

async function postLines(site: URL, locale: Locale): Promise<Array<string>> {
  const posts = await getPublishedPosts(locale);

  return posts.map((post) =>
    itemLine(
      site,
      post.data.title,
      localizedPath(locale, "postMarkdown", entrySlug(post.id)),
      post.data.summary,
    ),
  );
}

async function noteLines(site: URL, locale: Locale): Promise<Array<string>> {
  const notes = await getPublishedNotes(locale);

  return notes.map((note) =>
    itemLine(
      site,
      note.data.title,
      localizedPath(locale, "noteMarkdown", entrySlug(note.id)),
      note.data.summary,
    ),
  );
}

/** The llms.txt directory of every published Markdown URL, in the llmstxt.org format. Drafts never appear. */
export async function GET(context: APIContext) {
  const site = context.site ?? new URL(SITE.url);
  const writing = await postLines(site, "id");
  const notes = await noteLines(site, "id");
  const english = [...(await postLines(site, "en")), ...(await noteLines(site, "en"))];

  const lines = [
    "# heyris",
    "",
    `> ${dictionaryFor("id").meta.homeDescription}`,
    "",
    "## Tulisan",
    "",
    ...writing,
    "",
    "## Catatan",
    "",
    ...notes,
    "",
  ];

  if (english.length > 0) lines.push("## English", "", ...english, "");

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
