import type { APIRoute } from "astro";
import { entrySlug, getNote, getNotes } from "@/shared/api/content";
import type { Locale } from "@/shared/i18n";
import { noteDocument } from "./document";

/**
 * The static paths and `GET` handler of a note's `.md` route in one locale. A route file re-exports
 * both. A locale with no entries gets no paths, so its route builds to nothing until one is added.
 */
export function noteMarkdownEndpoint(locale: Locale) {
  const getStaticPaths = async () => {
    const notes = await getNotes(locale);

    return notes.map((entry) => ({ params: { slug: entrySlug(entry.id) } }));
  };

  const GET: APIRoute = async ({ params }) => {
    const slug = params.slug;
    const entry = slug === undefined ? undefined : await getNote(locale, slug);

    if (entry === undefined) return new Response("Not found", { status: 404 });

    return new Response(noteDocument(entry), {
      headers: { "Content-Type": "text/markdown; charset=utf-8" },
    });
  };

  return { getStaticPaths, GET };
}
